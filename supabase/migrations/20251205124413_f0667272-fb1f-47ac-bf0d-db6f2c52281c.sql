-- Secure function for collection reward (validates user has all characters)
CREATE OR REPLACE FUNCTION public.claim_collection_reward()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_character_count INTEGER;
  v_required_count INTEGER := 11; -- Total unique characters in the game
  v_reward_amount NUMERIC := 45.5; -- 700000 BONK * 0.000065
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already claimed
  SELECT collection_reward_claimed_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Collection reward already claimed');
  END IF;
  
  -- Count unique characters owned by user
  SELECT COUNT(DISTINCT character_id) INTO v_character_count 
  FROM user_characters WHERE user_id = v_user_id;
  
  IF v_character_count < v_required_count THEN
    RETURN json_build_object('success', false, 'error', 'Collection not complete', 'have', v_character_count, 'need', v_required_count);
  END IF;
  
  -- Add reward and mark as claimed
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_reward_amount,
      total_earned = COALESCE(total_earned, 0) + v_reward_amount,
      collection_reward_claimed_at = now(),
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'reward', v_reward_amount);
END;
$$;

-- Secure function for FaucetPay welcome bonus (one-time per user)
CREATE OR REPLACE FUNCTION public.claim_faucetpay_bonus()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_bonus_amount NUMERIC := 0.1; -- 0.1 DOGE welcome bonus
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

-- Add faucetpay_linked_at column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS faucetpay_linked_at TIMESTAMP WITH TIME ZONE;

-- Secure function for ad view rewards (validates ad exists and not already viewed)
CREATE OR REPLACE FUNCTION public.claim_ad_view_reward(p_ad_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ad RECORD;
  v_already_viewed BOOLEAN;
  v_reward_amount NUMERIC;
  v_new_balance NUMERIC;
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
  
  v_reward_amount := v_ad.reward_per_view;
  
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