-- Create roulette spins table to track history
CREATE TABLE public.roulette_spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roulette_spins ENABLE ROW LEVEL SECURITY;

-- Users can view their own spins
CREATE POLICY "Users can view their own roulette spins"
ON public.roulette_spins
FOR SELECT
USING (auth.uid() = user_id);

-- Create the spin roulette function
CREATE OR REPLACE FUNCTION public.spin_roulette()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_deposit_balance NUMERIC;
  v_random NUMERIC;
  v_prize_type TEXT;
  v_prize_value TEXT;
  v_doge_reward NUMERIC := 0;
  v_box_type TEXT := NULL;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current deposit balance
  SELECT COALESCE(deposit_balance, 0) INTO v_deposit_balance
  FROM profiles
  WHERE id = v_user_id;

  -- Check if user has enough balance (3 DOGE)
  IF v_deposit_balance < 3 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance. Need 3 DOGE.');
  END IF;

  -- Subtract 3 DOGE from deposit balance
  UPDATE profiles
  SET deposit_balance = deposit_balance - 3,
      updated_at = now()
  WHERE id = v_user_id;

  -- Generate random number between 0 and 100
  v_random := random() * 100;

  -- Determine prize based on probabilities:
  -- Common Box: 30% (0-30)
  -- Rare Box: 10% (30-40)
  -- 1 DOGE: 30% (40-70)
  -- Legendary Box: 1% (70-71)
  -- 2 DOGE: 15% (71-86)
  -- 3 DOGE: 10% (86-96)
  -- No prize: 4% (96-100)

  IF v_random < 30 THEN
    v_prize_type := 'box';
    v_prize_value := 'common';
    v_box_type := 'common';
  ELSIF v_random < 40 THEN
    v_prize_type := 'box';
    v_prize_value := 'rare';
    v_box_type := 'rare';
  ELSIF v_random < 70 THEN
    v_prize_type := 'doge';
    v_prize_value := '1';
    v_doge_reward := 1;
  ELSIF v_random < 71 THEN
    v_prize_type := 'box';
    v_prize_value := 'legendary';
    v_box_type := 'legendary';
  ELSIF v_random < 86 THEN
    v_prize_type := 'doge';
    v_prize_value := '2';
    v_doge_reward := 2;
  ELSIF v_random < 96 THEN
    v_prize_type := 'doge';
    v_prize_value := '3';
    v_doge_reward := 3;
  ELSE
    v_prize_type := 'none';
    v_prize_value := '0';
  END IF;

  -- Award DOGE if applicable
  IF v_doge_reward > 0 THEN
    UPDATE profiles
    SET mining_balance = COALESCE(mining_balance, 0) + v_doge_reward,
        total_earned = COALESCE(total_earned, 0) + v_doge_reward,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Record the spin
  INSERT INTO roulette_spins (user_id, prize_type, prize_value)
  VALUES (v_user_id, v_prize_type, v_prize_value);

  RETURN json_build_object(
    'success', true,
    'prize_type', v_prize_type,
    'prize_value', v_prize_value,
    'box_type', v_box_type,
    'doge_amount', v_doge_reward
  );
END;
$$;