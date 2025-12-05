-- Drop and recreate claim_faucetpay_bonus function with bonus changed from 0.1 to 0.05 DOGE
DROP FUNCTION IF EXISTS public.claim_faucetpay_bonus();

CREATE OR REPLACE FUNCTION public.claim_faucetpay_bonus()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_bonus_amount NUMERIC := 0.05; -- Changed from 0.1 to 0.05
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already linked/claimed (using a dedicated column)
  SELECT faucetpay_linked_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Welcome bonus already claimed');
  END IF;
  
  -- Add bonus and mark as claimed
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_bonus_amount,
      total_earned = COALESCE(total_earned, 0) + v_bonus_amount,
      faucetpay_linked_at = now(),
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'bonus', v_bonus_amount);
END;
$$;