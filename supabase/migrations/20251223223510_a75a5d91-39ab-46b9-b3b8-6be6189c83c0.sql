-- Update web mining reward rate to 0.01 DOGE per 1 billion hashes
CREATE OR REPLACE FUNCTION public.submit_web_mining_hashes(p_hashes bigint)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_session_record RECORD;
  v_new_pending BIGINT;
  v_rewards_to_claim NUMERIC;
  v_hashes_to_claim BIGINT;
  v_hashes_per_reward BIGINT := 1000000000; -- 1 billion hashes
  v_reward_per_billion NUMERIC := 0.01; -- 0.01 DOGE per 1 billion hashes
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get or create session
  SELECT * INTO v_session_record 
  FROM web_mining_sessions 
  WHERE user_id = v_user_id;
  
  IF v_session_record IS NULL THEN
    INSERT INTO web_mining_sessions (user_id, total_hashes, hashes_pending, is_active, last_hash_at)
    VALUES (v_user_id, p_hashes, p_hashes, true, now())
    RETURNING * INTO v_session_record;
    
    v_new_pending := p_hashes;
  ELSE
    v_new_pending := v_session_record.hashes_pending + p_hashes;
    
    UPDATE web_mining_sessions 
    SET 
      total_hashes = total_hashes + p_hashes,
      hashes_pending = v_new_pending,
      is_active = true,
      last_hash_at = now(),
      updated_at = now()
    WHERE id = v_session_record.id;
  END IF;
  
  -- Calculate rewards (1,000,000,000 hashes = 0.01 DOGE)
  v_hashes_to_claim := (v_new_pending / v_hashes_per_reward) * v_hashes_per_reward;
  v_rewards_to_claim := (v_hashes_to_claim / v_hashes_per_reward) * v_reward_per_billion;
  
  IF v_rewards_to_claim > 0 THEN
    -- Add to mining balance
    UPDATE profiles 
    SET 
      mining_balance = COALESCE(mining_balance, 0) + v_rewards_to_claim,
      total_earned = COALESCE(total_earned, 0) + v_rewards_to_claim,
      updated_at = now()
    WHERE id = v_user_id;
    
    -- Update session with claimed hashes
    UPDATE web_mining_sessions 
    SET 
      hashes_pending = v_new_pending - v_hashes_to_claim,
      total_rewards = total_rewards + v_rewards_to_claim,
      updated_at = now()
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
      'success', true,
      'hashes_submitted', p_hashes,
      'total_hashes', v_session_record.total_hashes + p_hashes,
      'hashes_pending', v_new_pending - v_hashes_to_claim,
      'reward_claimed', v_rewards_to_claim
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'hashes_submitted', p_hashes,
    'total_hashes', COALESCE(v_session_record.total_hashes, 0) + p_hashes,
    'hashes_pending', v_new_pending,
    'reward_claimed', 0
  );
END;
$function$;

-- Update get_web_mining_stats to use 1 billion hashes
CREATE OR REPLACE FUNCTION public.get_web_mining_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_stats RECORD;
  v_hashes_per_reward BIGINT := 1000000000; -- 1 billion hashes
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_stats 
  FROM web_mining_sessions 
  WHERE user_id = v_user_id;
  
  IF v_stats IS NULL THEN
    RETURN json_build_object(
      'success', true,
      'total_hashes', 0,
      'hashes_pending', 0,
      'total_rewards', 0,
      'hashes_until_reward', v_hashes_per_reward
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'total_hashes', v_stats.total_hashes,
    'hashes_pending', v_stats.hashes_pending,
    'total_rewards', v_stats.total_rewards,
    'hashes_until_reward', v_hashes_per_reward - (v_stats.hashes_pending % v_hashes_per_reward)
  );
END;
$function$;