
CREATE OR REPLACE FUNCTION public.create_mining_investment(p_plan_type text, p_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_balance NUMERIC;
  v_daily_rate NUMERIC;
  v_min_amount NUMERIC;
  v_max_amount NUMERIC;
  v_investment_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  CASE p_plan_type
    WHEN 'standard' THEN
      v_daily_rate := 0.04;
      v_min_amount := 2;
      v_max_amount := 10;
    WHEN 'medium' THEN
      v_daily_rate := 0.045;
      v_min_amount := 15;
      v_max_amount := 50;
    WHEN 'premium' THEN
      v_daily_rate := 0.05;
      v_min_amount := 60;
      v_max_amount := 100;
    WHEN 'vip' THEN
      v_daily_rate := 0.06;
      v_min_amount := 150;
      v_max_amount := 1000;
    WHEN 'mega_vip' THEN
      v_daily_rate := 0.15;
      v_min_amount := 1500;
      v_max_amount := 5000;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid plan type');
  END CASE;
  
  IF p_amount < v_min_amount OR p_amount > v_max_amount THEN
    RETURN json_build_object('success', false, 'error', 'Amount out of range', 'min', v_min_amount, 'max', v_max_amount);
  END IF;
  
  SELECT COALESCE(deposit_balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance');
  END IF;
  
  UPDATE profiles 
  SET deposit_balance = deposit_balance - p_amount, updated_at = now()
  WHERE id = v_user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  INSERT INTO mining_investments (user_id, plan_type, invested_amount, daily_rate)
  VALUES (v_user_id, p_plan_type, p_amount, v_daily_rate)
  RETURNING id INTO v_investment_id;
  
  RETURN json_build_object(
    'success', true, 
    'investment_id', v_investment_id,
    'new_balance', v_new_balance,
    'daily_rate', v_daily_rate
  );
END;
$$;
