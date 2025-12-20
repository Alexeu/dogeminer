-- Fix claim_mining_reward to handle small mining rates properly
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_amount numeric, p_character_id text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_session RECORD;
  v_elapsed_ms NUMERIC;
  v_progress NUMERIC;
  v_actual_reward NUMERIC;
  v_new_balance NUMERIC;
  v_last_claim TIMESTAMP WITH TIME ZONE;
  v_min_interval INTERVAL := '5 seconds'; -- Minimum time between claims
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Rate limiting: Check last claim time for this user
  SELECT MAX(claimed_at) INTO v_last_claim 
  FROM mining_sessions 
  WHERE user_id = v_user_id AND claimed_at IS NOT NULL;
  
  IF v_last_claim IS NOT NULL AND (now() - v_last_claim) < v_min_interval THEN
    RETURN json_build_object('success', false, 'error', 'Please wait before claiming again');
  END IF;
  
  -- Get user's character
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  -- Get active mining session
  SELECT * INTO v_session FROM mining_sessions 
  WHERE user_character_id = v_user_char.id AND claimed_at IS NULL
  ORDER BY started_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active mining session');
  END IF;
  
  -- Calculate elapsed time and reward
  v_elapsed_ms := EXTRACT(EPOCH FROM (now() - v_session.started_at)) * 1000;
  v_progress := LEAST(v_elapsed_ms / v_session.mining_duration_ms, 1);
  
  -- Use ROUND with 8 decimal places instead of FLOOR to preserve small values
  v_actual_reward := ROUND(v_session.expected_reward * v_progress, 8);
  
  IF v_actual_reward <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No rewards to claim yet');
  END IF;
  
  -- Mark session as claimed
  UPDATE mining_sessions 
  SET claimed_at = now(), actual_reward = v_actual_reward
  WHERE id = v_session.id;
  
  -- Add balance and update total earned
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_actual_reward,
      total_earned = COALESCE(total_earned, 0) + v_actual_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'claimed_amount', v_actual_reward);
END;
$function$;