-- Create web_mining_sessions table for tracking browser-based mining
CREATE TABLE public.web_mining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_hashes BIGINT NOT NULL DEFAULT 0,
  hashes_pending BIGINT NOT NULL DEFAULT 0,
  total_rewards NUMERIC NOT NULL DEFAULT 0,
  last_hash_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web_mining_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own web mining sessions"
ON public.web_mining_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own web mining sessions"
ON public.web_mining_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own web mining sessions"
ON public.web_mining_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_web_mining_sessions_user_id ON public.web_mining_sessions(user_id);

-- Create function to submit hashes and get rewards
CREATE OR REPLACE FUNCTION public.submit_web_mining_hashes(p_hashes BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_session_record RECORD;
  v_new_pending BIGINT;
  v_rewards_to_claim NUMERIC;
  v_hashes_to_claim BIGINT;
  v_reward_per_100k NUMERIC := 0.01; -- 0.01 DOGE per 100,000 hashes
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
  
  -- Calculate rewards (100,000 hashes = 0.01 DOGE)
  v_hashes_to_claim := (v_new_pending / 100000) * 100000;
  v_rewards_to_claim := (v_hashes_to_claim / 100000) * v_reward_per_100k;
  
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
$$;

-- Create function to get web mining stats
CREATE OR REPLACE FUNCTION public.get_web_mining_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_stats RECORD;
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
      'hashes_until_reward', 100000
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'total_hashes', v_stats.total_hashes,
    'hashes_pending', v_stats.hashes_pending,
    'total_rewards', v_stats.total_rewards,
    'hashes_until_reward', 100000 - (v_stats.hashes_pending % 100000)
  );
END;
$$;