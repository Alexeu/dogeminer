CREATE OR REPLACE FUNCTION public.claim_mining_investment_reward(p_investment_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_investment RECORD;
  v_hours_elapsed NUMERIC;
  v_reward NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get investment
  SELECT * INTO v_investment FROM mining_investments 
  WHERE id = p_investment_id AND user_id = v_user_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Investment not found');
  END IF;
  
  -- Calculate hours elapsed since last claim
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_investment.last_claim_at)) / 3600;
  
  IF v_hours_elapsed < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Must wait at least 1 hour between claims', 'hours_remaining', 1 - v_hours_elapsed);
  END IF;
  
  -- Calculate reward: (invested_amount * daily_rate_percent) / 24 * hours
  -- daily_rate is stored as decimal (0.04 = 4%), so we need to use it directly
  -- Formula: invested * rate / 24 hours * hours elapsed
  v_reward := (v_investment.invested_amount * v_investment.daily_rate / 24) * v_hours_elapsed;
  v_reward := ROUND(v_reward, 8);
  
  -- Update investment
  UPDATE mining_investments 
  SET last_claim_at = now(), 
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = p_investment_id;
  
  -- Add balance
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_reward,
      total_earned = COALESCE(total_earned, 0) + v_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object(
    'success', true, 
    'reward', v_reward,
    'new_balance', v_new_balance,
    'hours_elapsed', v_hours_elapsed
  );
END;
$function$