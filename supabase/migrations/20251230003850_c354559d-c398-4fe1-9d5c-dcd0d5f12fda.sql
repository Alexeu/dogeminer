-- Add mining_expires_at column to user_characters
ALTER TABLE public.user_characters 
ADD COLUMN mining_expires_at timestamp with time zone DEFAULT (now() + interval '40 days');

-- Update existing characters to expire 40 days from their creation date
UPDATE public.user_characters 
SET mining_expires_at = created_at + interval '40 days';

-- Create function to renew character mining
CREATE OR REPLACE FUNCTION public.renew_character_mining(p_character_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_rarity text;
  v_cost numeric;
  v_balance numeric;
BEGIN
  -- Get the character info
  SELECT user_id, character_rarity INTO v_user_id, v_rarity
  FROM user_characters
  WHERE id = p_character_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Character not found');
  END IF;
  
  -- Verify ownership
  IF v_user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your character');
  END IF;
  
  -- Determine cost based on rarity
  v_cost := CASE v_rarity
    WHEN 'common' THEN 1
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 6
    WHEN 'legendary' THEN 9
    WHEN 'christmas' THEN 6
    ELSE 1
  END;
  
  -- Check balance
  SELECT COALESCE(mining_balance, 0) + COALESCE(deposit_balance, 0) INTO v_balance
  FROM profiles
  WHERE id = auth.uid();
  
  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'required', v_cost);
  END IF;
  
  -- Deduct from mining_balance first, then deposit_balance
  UPDATE profiles
  SET 
    mining_balance = CASE 
      WHEN mining_balance >= v_cost THEN mining_balance - v_cost
      ELSE 0
    END,
    deposit_balance = CASE 
      WHEN mining_balance >= v_cost THEN deposit_balance
      ELSE deposit_balance - (v_cost - COALESCE(mining_balance, 0))
    END,
    updated_at = now()
  WHERE id = auth.uid();
  
  -- Renew the character for 40 more days from now
  UPDATE user_characters
  SET mining_expires_at = now() + interval '40 days',
      updated_at = now()
  WHERE id = p_character_id;
  
  RETURN jsonb_build_object('success', true, 'cost', v_cost, 'new_expiration', now() + interval '40 days');
END;
$$;