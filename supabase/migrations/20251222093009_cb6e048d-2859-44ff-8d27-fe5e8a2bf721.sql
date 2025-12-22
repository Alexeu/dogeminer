
-- Add new balance columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mining_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deposited numeric DEFAULT 0;

-- Migrate existing balance to mining_balance (assuming all current balance is from mining)
UPDATE public.profiles
SET mining_balance = COALESCE(balance, 0),
    deposit_balance = 0,
    total_deposited = COALESCE(total_withdrawn, 0);

-- Update get_balance function to return both balances
CREATE OR REPLACE FUNCTION public.get_balance()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_mining_balance NUMERIC;
  v_deposit_balance NUMERIC;
  v_referral_code TEXT;
  v_total_earned NUMERIC;
  v_total_deposited NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT COALESCE(mining_balance, 0), COALESCE(deposit_balance, 0), referral_code, COALESCE(total_earned, 0), COALESCE(total_deposited, 0)
  INTO v_mining_balance, v_deposit_balance, v_referral_code, v_total_earned, v_total_deposited
  FROM profiles WHERE id = v_user_id;
  
  RETURN json_build_object(
    'success', true, 
    'balance', v_mining_balance + v_deposit_balance,
    'mining_balance', v_mining_balance,
    'deposit_balance', v_deposit_balance,
    'referral_code', v_referral_code,
    'total_earned', v_total_earned,
    'total_deposited', v_total_deposited
  );
END;
$function$;

-- Update subtract_balance to only use deposit_balance (for purchases)
CREATE OR REPLACE FUNCTION public.subtract_balance(p_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  SELECT COALESCE(deposit_balance, 0) INTO v_current_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance');
  END IF;
  
  UPDATE profiles 
  SET deposit_balance = deposit_balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$function$;

-- Update claim_mining_reward to add to mining_balance
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
  
  -- Add to mining_balance instead of balance
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_actual_reward,
      total_earned = COALESCE(total_earned, 0) + v_actual_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'claimed_amount', v_actual_reward);
END;
$function$;

-- Update claim_mining_investment_reward to add to mining_balance
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
  
  SELECT * INTO v_investment FROM mining_investments 
  WHERE id = p_investment_id AND user_id = v_user_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Investment not found');
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
  
  -- Add to mining_balance
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
$function$;

-- Update claim_ad_view_reward to add to mining_balance
CREATE OR REPLACE FUNCTION public.claim_ad_view_reward(p_ad_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_ad RECORD;
  v_session RECORD;
  v_already_viewed BOOLEAN;
  v_reward_amount NUMERIC;
  v_new_balance NUMERIC;
  v_elapsed_seconds NUMERIC;
  v_min_view_time_seconds INTEGER := 10;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_ad FROM ads WHERE id = p_ad_id AND is_active = true AND remaining_views > 0;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ad not found or not active');
  END IF;
  
  IF v_ad.user_id = v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot view your own ads');
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM ad_views WHERE ad_id = p_ad_id AND user_id = v_user_id
  ) INTO v_already_viewed;
  
  IF v_already_viewed THEN
    RETURN json_build_object('success', false, 'error', 'Already viewed this ad');
  END IF;
  
  SELECT * INTO v_session FROM ad_view_sessions 
  WHERE user_id = v_user_id AND ad_id = p_ad_id AND completed_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active view session. Start viewing the ad first.');
  END IF;
  
  v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_session.started_at));
  
  IF v_elapsed_seconds < v_min_view_time_seconds THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'View time too short', 
      'elapsed', v_elapsed_seconds,
      'required', v_min_view_time_seconds
    );
  END IF;
  
  v_reward_amount := v_ad.reward_per_view;
  
  UPDATE ad_view_sessions SET completed_at = now() WHERE id = v_session.id;
  
  INSERT INTO ad_views (ad_id, user_id, reward_amount)
  VALUES (p_ad_id, v_user_id, v_reward_amount);
  
  UPDATE ads SET remaining_views = remaining_views - 1 WHERE id = p_ad_id;
  
  -- Add to mining_balance
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_reward_amount,
      total_earned = COALESCE(total_earned, 0) + v_reward_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'reward', v_reward_amount);
END;
$function$;

-- Update complete_deposit to add to deposit_balance and track total_deposited
CREATE OR REPLACE FUNCTION public.complete_deposit(p_deposit_id uuid, p_tx_hash text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_deposit RECORD;
  v_new_balance NUMERIC;
BEGIN
  SELECT * INTO v_deposit FROM deposits WHERE id = p_deposit_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Deposit not found');
  END IF;
  
  IF v_deposit.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Deposit already processed');
  END IF;
  
  IF v_deposit.expires_at < now() THEN
    UPDATE deposits SET status = 'expired' WHERE id = p_deposit_id;
    RETURN json_build_object('success', false, 'error', 'Deposit request expired');
  END IF;
  
  UPDATE deposits SET status = 'completed', verified_at = now() WHERE id = p_deposit_id;
  
  -- Add to deposit_balance and track total_deposited
  UPDATE profiles 
  SET deposit_balance = COALESCE(deposit_balance, 0) + v_deposit.amount,
      total_deposited = COALESCE(total_deposited, 0) + v_deposit.amount,
      updated_at = now()
  WHERE id = v_deposit.user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  INSERT INTO transactions (user_id, type, amount, status, notes, faucetpay_address)
  VALUES (v_deposit.user_id, 'deposit', v_deposit.amount, 'completed', 'FaucetPay deposit', v_deposit.faucetpay_email);
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'amount', v_deposit.amount);
END;
$function$;

-- Update open_mystery_box to use deposit_balance
CREATE OR REPLACE FUNCTION public.open_mystery_box(p_box_id text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_user_balance NUMERIC;
  v_box_price NUMERIC;
  v_drop_rates JSONB;
  v_random_roll NUMERIC;
  v_cumulative NUMERIC := 0;
  v_selected_rarity TEXT;
  v_character_roll INTEGER;
  v_character_count INTEGER;
  v_selected_character RECORD;
  v_char_id UUID;
  v_new_balance NUMERIC;
  
  -- Mining rates +30% boost
  v_common_chars TEXT[][] := ARRAY[
    ['builder', 'Doge Builder', '0.001950'],
    ['astronaut', 'Doge Astronaut', '0.001950'],
    ['farmer', 'Doge Farmer', '0.001950'],
    ['chef', 'Doge Chef', '0.001950'],
    ['mechanic', 'Doge Mechanic', '0.001950'],
    ['artist', 'Doge Artist', '0.001950'],
    ['explorer', 'Doge Explorer', '0.001950']
  ];
  v_rare_chars TEXT[][] := ARRAY[
    ['pirate', 'Doge Pirate', '0.004550'],
    ['ninja', 'Doge Ninja', '0.004550'],
    ['samurai', 'Doge Samurai', '0.004550'],
    ['knight', 'Doge Knight', '0.004550'],
    ['viking', 'Doge Viking', '0.004550'],
    ['gladiator', 'Doge Gladiator', '0.004550']
  ];
  v_epic_chars TEXT[][] := ARRAY[
    ['wizard', 'Doge Wizard', '0.009750'],
    ['cyberpunk', 'Doge Cyberpunk', '0.009750'],
    ['vampire', 'Doge Vampire', '0.009750'],
    ['phoenix', 'Doge Phoenix', '0.009750']
  ];
  v_legendary_chars TEXT[][] := ARRAY[
    ['king', 'Doge King', '0.013000'],
    ['gold', 'Doge Gold', '0.013000'],
    ['dragon', 'Doge Dragon', '0.013000']
  ];
  
  v_char_id_out TEXT;
  v_char_name_out TEXT;
  v_char_rarity_out TEXT;
  v_char_mining_rate NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  CASE p_box_id
    WHEN 'common' THEN
      v_box_price := 1;
      v_drop_rates := '{"common": 100, "rare": 0, "epic": 0, "legendary": 0}'::jsonb;
    WHEN 'rare' THEN
      v_box_price := 4;
      v_drop_rates := '{"common": 40, "rare": 40, "epic": 20, "legendary": 0}'::jsonb;
    WHEN 'legendary' THEN
      v_box_price := 9;
      v_drop_rates := '{"common": 0, "rare": 40, "epic": 40, "legendary": 20}'::jsonb;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid box type');
  END CASE;
  
  -- Use deposit_balance for purchases
  SELECT COALESCE(deposit_balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < v_box_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance', 'required', v_box_price, 'current', v_user_balance);
  END IF;
  
  UPDATE profiles 
  SET deposit_balance = deposit_balance - v_box_price, updated_at = now()
  WHERE id = v_user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  v_random_roll := random() * 100;
  v_cumulative := 0;
  
  v_cumulative := v_cumulative + COALESCE((v_drop_rates->>'common')::numeric, 0);
  IF v_random_roll <= v_cumulative THEN
    v_selected_rarity := 'common';
  ELSE
    v_cumulative := v_cumulative + COALESCE((v_drop_rates->>'rare')::numeric, 0);
    IF v_random_roll <= v_cumulative THEN
      v_selected_rarity := 'rare';
    ELSE
      v_cumulative := v_cumulative + COALESCE((v_drop_rates->>'epic')::numeric, 0);
      IF v_random_roll <= v_cumulative THEN
        v_selected_rarity := 'epic';
      ELSE
        v_selected_rarity := 'legendary';
      END IF;
    END IF;
  END IF;
  
  CASE v_selected_rarity
    WHEN 'common' THEN
      v_character_roll := 1 + floor(random() * array_length(v_common_chars, 1))::integer;
      v_char_id_out := v_common_chars[v_character_roll][1];
      v_char_name_out := v_common_chars[v_character_roll][2];
      v_char_mining_rate := v_common_chars[v_character_roll][3]::numeric;
      v_char_rarity_out := 'common';
    WHEN 'rare' THEN
      v_character_roll := 1 + floor(random() * array_length(v_rare_chars, 1))::integer;
      v_char_id_out := v_rare_chars[v_character_roll][1];
      v_char_name_out := v_rare_chars[v_character_roll][2];
      v_char_mining_rate := v_rare_chars[v_character_roll][3]::numeric;
      v_char_rarity_out := 'rare';
    WHEN 'epic' THEN
      v_character_roll := 1 + floor(random() * array_length(v_epic_chars, 1))::integer;
      v_char_id_out := v_epic_chars[v_character_roll][1];
      v_char_name_out := v_epic_chars[v_character_roll][2];
      v_char_mining_rate := v_epic_chars[v_character_roll][3]::numeric;
      v_char_rarity_out := 'epic';
    WHEN 'legendary' THEN
      v_character_roll := 1 + floor(random() * array_length(v_legendary_chars, 1))::integer;
      v_char_id_out := v_legendary_chars[v_character_roll][1];
      v_char_name_out := v_legendary_chars[v_character_roll][2];
      v_char_mining_rate := v_legendary_chars[v_character_roll][3]::numeric;
      v_char_rarity_out := 'legendary';
  END CASE;
  
  INSERT INTO public.user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, v_char_id_out, v_char_name_out, v_char_rarity_out, v_char_mining_rate, 1)
  ON CONFLICT (user_id, character_id) 
  DO UPDATE SET quantity = user_characters.quantity + 1, updated_at = now()
  RETURNING id INTO v_char_id;
  
  RETURN json_build_object(
    'success', true, 
    'character', json_build_object(
      'id', v_char_id_out,
      'name', v_char_name_out,
      'rarity', v_char_rarity_out,
      'miningRate', v_char_mining_rate
    ),
    'new_balance', v_new_balance,
    'box_price', v_box_price
  );
END;
$function$;

-- Update level_up_character to use deposit_balance
CREATE OR REPLACE FUNCTION public.level_up_character(p_character_id text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_level_cost NUMERIC;
  v_user_balance NUMERIC;
  v_new_level INTEGER;
  v_bonus_percent NUMERIC;
  v_new_mining_rate NUMERIC;
  v_base_mining_rate NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  IF v_user_char.level >= 5 THEN
    RETURN json_build_object('success', false, 'error', 'Character is already at max level');
  END IF;
  
  CASE v_user_char.character_rarity
    WHEN 'common' THEN v_level_cost := 2;
    WHEN 'rare' THEN v_level_cost := 3;
    WHEN 'epic' THEN v_level_cost := 4;
    WHEN 'legendary' THEN v_level_cost := 5;
    ELSE v_level_cost := 2;
  END CASE;
  
  -- Use deposit_balance
  SELECT COALESCE(deposit_balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < v_level_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance', 'required', v_level_cost, 'current', v_user_balance);
  END IF;
  
  v_new_level := v_user_char.level + 1;
  
  CASE v_new_level
    WHEN 2 THEN v_bonus_percent := 0.20;
    WHEN 3 THEN v_bonus_percent := 0.41;
    WHEN 4 THEN v_bonus_percent := 0.63;
    WHEN 5 THEN v_bonus_percent := 0.86;
    ELSE v_bonus_percent := 0;
  END CASE;
  
  CASE v_user_char.level
    WHEN 1 THEN v_base_mining_rate := v_user_char.mining_rate;
    WHEN 2 THEN v_base_mining_rate := v_user_char.mining_rate / 1.20;
    WHEN 3 THEN v_base_mining_rate := v_user_char.mining_rate / 1.41;
    WHEN 4 THEN v_base_mining_rate := v_user_char.mining_rate / 1.63;
    WHEN 5 THEN v_base_mining_rate := v_user_char.mining_rate / 1.86;
    ELSE v_base_mining_rate := v_user_char.mining_rate;
  END CASE;
  
  v_new_mining_rate := v_base_mining_rate * (1 + v_bonus_percent);
  
  UPDATE profiles 
  SET deposit_balance = deposit_balance - v_level_cost, updated_at = now()
  WHERE id = v_user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  UPDATE user_characters 
  SET level = v_new_level, 
      mining_rate = v_new_mining_rate,
      updated_at = now()
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  RETURN json_build_object(
    'success', true, 
    'new_level', v_new_level,
    'new_mining_rate', v_new_mining_rate,
    'new_balance', v_new_balance,
    'cost', v_level_cost
  );
END;
$function$;

-- Update create_mining_investment to use deposit_balance
CREATE OR REPLACE FUNCTION public.create_mining_investment(p_plan_type text, p_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid plan type');
  END CASE;
  
  IF p_amount < v_min_amount OR p_amount > v_max_amount THEN
    RETURN json_build_object('success', false, 'error', 'Amount out of range', 'min', v_min_amount, 'max', v_max_amount);
  END IF;
  
  -- Use deposit_balance
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
$function$;

-- Update claim_starter_gift with new mining rate (0.0025 DOGE/hour, no bonus)
CREATE OR REPLACE FUNCTION public.claim_starter_gift(p_character_id text, p_character_name text, p_mining_rate numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_actual_mining_rate NUMERIC := 0.0025; -- Fixed mining rate without bonus
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT starter_gift_received_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Starter gift already claimed');
  END IF;
  
  -- Use fixed mining rate of 0.0025 DOGE/hour (no bonus)
  INSERT INTO public.user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, p_character_id, p_character_name, 'starter', v_actual_mining_rate, 1)
  ON CONFLICT (user_id, character_id) DO NOTHING;
  
  UPDATE profiles SET starter_gift_received_at = now() WHERE id = v_user_id;
  
  RETURN json_build_object('success', true);
END;
$function$;

-- Update claim_collection_reward to add to mining_balance
CREATE OR REPLACE FUNCTION public.claim_collection_reward()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_character_count INTEGER;
  v_required_count INTEGER := 11;
  v_reward_amount NUMERIC := 45.5;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT collection_reward_claimed_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Collection reward already claimed');
  END IF;
  
  SELECT COUNT(DISTINCT character_id) INTO v_character_count 
  FROM user_characters WHERE user_id = v_user_id;
  
  IF v_character_count < v_required_count THEN
    RETURN json_build_object('success', false, 'error', 'Collection not complete', 'have', v_character_count, 'need', v_required_count);
  END IF;
  
  -- Add to mining_balance
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_reward_amount,
      total_earned = COALESCE(total_earned, 0) + v_reward_amount,
      collection_reward_claimed_at = now(),
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'reward', v_reward_amount);
END;
$function$;

-- Update apply_referral_code to add to mining_balance
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  SELECT referred_by INTO v_already_referred FROM profiles WHERE id = v_user_id;
  
  IF v_already_referred IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = p_code AND id != v_user_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Add to mining_balance
  UPDATE profiles 
  SET referred_by = p_code,
      mining_balance = COALESCE(mining_balance, 0) + v_bonus_amount,
      total_earned = COALESCE(total_earned, 0) + v_bonus_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'bonus', v_bonus_amount);
END;
$function$;

-- Update claim_faucetpay_bonus to add to mining_balance
CREATE OR REPLACE FUNCTION public.claim_faucetpay_bonus()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
  v_bonus_amount NUMERIC := 0.05;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT faucetpay_linked_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Welcome bonus already claimed');
  END IF;
  
  -- Add to mining_balance
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + v_bonus_amount,
      total_earned = COALESCE(total_earned, 0) + v_bonus_amount,
      faucetpay_linked_at = now(),
      updated_at = now()
  WHERE id = v_user_id
  RETURNING mining_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'bonus', v_bonus_amount);
END;
$function$;

-- Update internal_add_balance to add to deposit_balance (used by deposits)
CREATE OR REPLACE FUNCTION public.internal_add_balance(p_user_id uuid, p_amount numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_amount <= 0 THEN
    RETURN false;
  END IF;
  
  UPDATE profiles 
  SET deposit_balance = COALESCE(deposit_balance, 0) + p_amount,
      total_deposited = COALESCE(total_deposited, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$function$;

-- Update admin_add_balance to add to deposit_balance
CREATE OR REPLACE FUNCTION public.admin_add_balance(p_user_id uuid, p_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF NOT has_role(v_caller_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Admin adds to deposit_balance
  UPDATE profiles 
  SET deposit_balance = COALESCE(deposit_balance, 0) + p_amount,
      total_deposited = COALESCE(total_deposited, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$function$;
