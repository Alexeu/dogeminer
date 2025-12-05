-- Create RPC function to add balance (for mining, rewards, etc.)
CREATE OR REPLACE FUNCTION public.add_balance(p_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + p_amount,
      total_earned = COALESCE(total_earned, 0) + p_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Create RPC function to subtract balance (for purchases)
CREATE OR REPLACE FUNCTION public.subtract_balance(p_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  SELECT COALESCE(balance, 0) INTO v_current_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  UPDATE profiles 
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Create RPC function to get user balance
CREATE OR REPLACE FUNCTION public.get_balance()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_referral_code TEXT;
  v_total_earned NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT COALESCE(balance, 0), referral_code, COALESCE(total_earned, 0) 
  INTO v_balance, v_referral_code, v_total_earned
  FROM profiles WHERE id = v_user_id;
  
  RETURN json_build_object(
    'success', true, 
    'balance', v_balance, 
    'referral_code', v_referral_code,
    'total_earned', v_total_earned
  );
END;
$$;

-- Create RPC function for claiming mining rewards
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_amount numeric, p_character_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Add balance and update total earned
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + p_amount,
      total_earned = COALESCE(total_earned, 0) + p_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'claimed_amount', p_amount);
END;
$$;

-- Create RPC function for applying referral code
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_referrer_id UUID;
  v_already_referred TEXT;
  v_new_balance NUMERIC;
  v_bonus_amount NUMERIC := 500;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if user already has a referrer
  SELECT referred_by INTO v_already_referred FROM profiles WHERE id = v_user_id;
  
  IF v_already_referred IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  -- Find the referrer by code
  SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = p_code AND id != v_user_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Update the user with referrer and bonus
  UPDATE profiles 
  SET referred_by = p_code,
      balance = COALESCE(balance, 0) + v_bonus_amount,
      total_earned = COALESCE(total_earned, 0) + v_bonus_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'bonus', v_bonus_amount);
END;
$$;