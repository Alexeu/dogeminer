
CREATE OR REPLACE FUNCTION public.claim_mining_investment_reward(p_investment_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  SELECT * INTO v_investment FROM mining_investments 
  WHERE id = p_investment_id::uuid AND user_id = v_user_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Investment not found');
  END IF;
  
  -- CHECK EXPIRATION
  IF v_investment.expires_at < now() THEN
    UPDATE mining_investments 
    SET is_active = false, updated_at = now()
    WHERE id = p_investment_id::uuid;
    
    RETURN json_build_object('success', false, 'error', 'Investment has expired');
  END IF;
  
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_investment.last_claim_at)) / 3600;
  
  -- Minimum reward threshold instead of time-based restriction
  v_reward := (v_investment.invested_amount * v_investment.daily_rate / 24) * v_hours_elapsed;
  v_reward := ROUND(v_reward, 8);
  
  IF v_reward < 0.1 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum 0.1 DOGE required to claim', 'pending', v_reward);
  END IF;
  
  UPDATE mining_investments 
  SET last_claim_at = now(), 
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = p_investment_id::uuid;
  
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_reward,
      total_earned = COALESCE(total_earned, 0) + v_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object(
    'success', true, 
    'reward', v_reward,
    'new_balance', v_new_balance,
    'hours_elapsed', v_hours_elapsed
  );
END;
$$;
