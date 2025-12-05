-- Create table to track ad view sessions
CREATE TABLE public.ad_view_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, ad_id)
);

-- Enable RLS
ALTER TABLE public.ad_view_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own sessions" ON public.ad_view_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.ad_view_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.ad_view_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to start viewing an ad (records the start time)
CREATE OR REPLACE FUNCTION public.start_ad_view(p_ad_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ad RECORD;
  v_already_viewed BOOLEAN;
  v_existing_session RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get ad info
  SELECT * INTO v_ad FROM ads WHERE id = p_ad_id AND is_active = true AND remaining_views > 0;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ad not found or not active');
  END IF;
  
  -- Cannot view own ads
  IF v_ad.user_id = v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot view your own ads');
  END IF;
  
  -- Check if already completed this ad
  SELECT EXISTS (
    SELECT 1 FROM ad_views WHERE ad_id = p_ad_id AND user_id = v_user_id
  ) INTO v_already_viewed;
  
  IF v_already_viewed THEN
    RETURN json_build_object('success', false, 'error', 'Already viewed this ad');
  END IF;
  
  -- Check for existing incomplete session
  SELECT * INTO v_existing_session FROM ad_view_sessions 
  WHERE user_id = v_user_id AND ad_id = p_ad_id AND completed_at IS NULL;
  
  IF FOUND THEN
    -- Return existing session start time
    RETURN json_build_object('success', true, 'started_at', v_existing_session.started_at, 'resumed', true);
  END IF;
  
  -- Create new session
  INSERT INTO ad_view_sessions (user_id, ad_id)
  VALUES (v_user_id, p_ad_id)
  ON CONFLICT (user_id, ad_id) DO UPDATE SET started_at = now(), completed_at = NULL;
  
  RETURN json_build_object('success', true, 'started_at', now(), 'resumed', false);
END;
$$;

-- Update claim_ad_view_reward to verify time elapsed
CREATE OR REPLACE FUNCTION public.claim_ad_view_reward(p_ad_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ad RECORD;
  v_session RECORD;
  v_already_viewed BOOLEAN;
  v_reward_amount NUMERIC;
  v_new_balance NUMERIC;
  v_elapsed_seconds NUMERIC;
  v_min_view_time_seconds INTEGER := 10; -- Minimum 10 seconds required
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get ad info
  SELECT * INTO v_ad FROM ads WHERE id = p_ad_id AND is_active = true AND remaining_views > 0;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ad not found or not active');
  END IF;
  
  -- Cannot view own ads
  IF v_ad.user_id = v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot view your own ads');
  END IF;
  
  -- Check if already viewed
  SELECT EXISTS (
    SELECT 1 FROM ad_views WHERE ad_id = p_ad_id AND user_id = v_user_id
  ) INTO v_already_viewed;
  
  IF v_already_viewed THEN
    RETURN json_build_object('success', false, 'error', 'Already viewed this ad');
  END IF;
  
  -- Get the view session to verify time elapsed
  SELECT * INTO v_session FROM ad_view_sessions 
  WHERE user_id = v_user_id AND ad_id = p_ad_id AND completed_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active view session. Start viewing the ad first.');
  END IF;
  
  -- Calculate elapsed time
  v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_session.started_at));
  
  -- Verify minimum view time (server-side check)
  IF v_elapsed_seconds < v_min_view_time_seconds THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'View time too short', 
      'elapsed', v_elapsed_seconds,
      'required', v_min_view_time_seconds
    );
  END IF;
  
  v_reward_amount := v_ad.reward_per_view;
  
  -- Mark session as completed
  UPDATE ad_view_sessions SET completed_at = now() WHERE id = v_session.id;
  
  -- Record the view
  INSERT INTO ad_views (ad_id, user_id, reward_amount)
  VALUES (p_ad_id, v_user_id, v_reward_amount);
  
  -- Update ad remaining views
  UPDATE ads SET remaining_views = remaining_views - 1 WHERE id = p_ad_id;
  
  -- Add reward to user
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_reward_amount,
      total_earned = COALESCE(total_earned, 0) + v_reward_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'reward', v_reward_amount);
END;
$$;