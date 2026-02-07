
-- 1. Fix claim_mining_investment_reward to check expiration
CREATE OR REPLACE FUNCTION public.claim_mining_investment_reward(p_investment_id UUID)
RETURNS JSON
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
  WHERE id = p_investment_id AND user_id = v_user_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Investment not found');
  END IF;
  
  -- CHECK EXPIRATION
  IF v_investment.expires_at < now() THEN
    UPDATE mining_investments 
    SET is_active = false, updated_at = now()
    WHERE id = p_investment_id;
    
    RETURN json_build_object('success', false, 'error', 'Investment has expired');
  END IF;
  
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_investment.last_claim_at)) / 3600;
  
  IF v_hours_elapsed < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Must wait at least 1 hour between claims', 'hours_remaining', 1 - v_hours_elapsed);
  END IF;
  
  v_reward := (v_investment.invested_amount * v_investment.daily_rate / 24) * v_hours_elapsed;
  v_reward := ROUND(v_reward, 8);
  
  UPDATE mining_investments 
  SET last_claim_at = now(), 
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = p_investment_id;
  
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

-- 2. Fix start_mining to check character mining_expires_at
CREATE OR REPLACE FUNCTION public.start_mining(p_character_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_active_session RECORD;
  v_expected_reward NUMERIC;
  v_last_start TIMESTAMP WITH TIME ZONE;
  v_min_interval INTERVAL := '3 seconds';
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT MAX(started_at) INTO v_last_start 
  FROM mining_sessions 
  WHERE user_id = v_user_id;
  
  IF v_last_start IS NOT NULL AND (now() - v_last_start) < v_min_interval THEN
    RETURN json_build_object('success', false, 'error', 'Please wait before starting mining');
  END IF;
  
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  -- CHECK CHARACTER MINING EXPIRATION
  IF v_user_char.mining_expires_at IS NOT NULL AND v_user_char.mining_expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'Character mining has expired. Please renew to continue mining.');
  END IF;
  
  SELECT * INTO v_active_session FROM mining_sessions 
  WHERE user_character_id = v_user_char.id AND claimed_at IS NULL;
  
  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Mining already in progress');
  END IF;
  
  v_expected_reward := v_user_char.mining_rate * v_user_char.quantity;
  
  INSERT INTO mining_sessions (user_id, user_character_id, expected_reward)
  VALUES (v_user_id, v_user_char.id, v_expected_reward);
  
  RETURN json_build_object('success', true, 'expected_reward', v_expected_reward);
END;
$$;

-- 3. Fix claim_mining_reward (character version) to check mining_expires_at
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_character_id TEXT, p_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_session RECORD;
  v_elapsed_ms NUMERIC;
  v_progress NUMERIC;
  v_actual_reward NUMERIC;
  v_new_balance NUMERIC;
  v_last_claim TIMESTAMP WITH TIME ZONE;
  v_min_interval INTERVAL := '5 seconds';
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT MAX(claimed_at) INTO v_last_claim 
  FROM mining_sessions 
  WHERE user_id = v_user_id AND claimed_at IS NOT NULL;
  
  IF v_last_claim IS NOT NULL AND (now() - v_last_claim) < v_min_interval THEN
    RETURN json_build_object('success', false, 'error', 'Please wait before claiming again');
  END IF;
  
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  -- CHECK CHARACTER MINING EXPIRATION
  IF v_user_char.mining_expires_at IS NOT NULL AND v_user_char.mining_expires_at < now() THEN
    -- Cancel active session without reward
    UPDATE mining_sessions 
    SET claimed_at = now(), actual_reward = 0
    WHERE user_character_id = v_user_char.id AND claimed_at IS NULL;
    
    RETURN json_build_object('success', false, 'error', 'Character mining has expired. Please renew to continue mining.');
  END IF;
  
  SELECT * INTO v_session FROM mining_sessions 
  WHERE user_character_id = v_user_char.id AND claimed_at IS NULL
  ORDER BY started_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active mining session');
  END IF;
  
  v_elapsed_ms := EXTRACT(EPOCH FROM (now() - v_session.started_at)) * 1000;
  v_progress := LEAST(v_elapsed_ms / v_session.mining_duration_ms, 1);
  v_actual_reward := ROUND(v_session.expected_reward * v_progress, 8);
  
  IF v_actual_reward <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No rewards to claim yet');
  END IF;
  
  UPDATE mining_sessions 
  SET claimed_at = now(), actual_reward = v_actual_reward
  WHERE id = v_session.id;
  
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_actual_reward,
      total_earned = COALESCE(total_earned, 0) + v_actual_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'claimed_amount', v_actual_reward);
END;
$$;

-- 4. Deactivate all currently expired mining investments
UPDATE mining_investments 
SET is_active = false, updated_at = now()
WHERE is_active = true AND expires_at < now();
