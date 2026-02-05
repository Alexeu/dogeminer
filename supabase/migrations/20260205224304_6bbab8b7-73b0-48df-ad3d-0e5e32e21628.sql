-- Update open_mystery_box to pay 5% of mining_rate to referrer
CREATE OR REPLACE FUNCTION public.open_mystery_box(p_box_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_referrer_code TEXT;
  v_referrer_id UUID;
  v_referral_commission NUMERIC;
  
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
  v_christmas_chars TEXT[][] := ARRAY[
    ['santa-doge', 'Santa Doge', '0.019500'],
    ['elf-doge', 'Elf Doge', '0.019500'],
    ['snowman-doge', 'Snowman Doge', '0.019500'],
    ['reindeer-doge', 'Reindeer Doge', '0.019500']
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
      v_drop_rates := '{"common": 100, "rare": 0, "epic": 0, "legendary": 0, "christmas": 0}'::jsonb;
    WHEN 'rare' THEN
      v_box_price := 4;
      v_drop_rates := '{"common": 40, "rare": 40, "epic": 20, "legendary": 0, "christmas": 0}'::jsonb;
    WHEN 'legendary' THEN
      v_box_price := 9;
      v_drop_rates := '{"common": 0, "rare": 40, "epic": 40, "legendary": 20, "christmas": 0}'::jsonb;
    WHEN 'christmas' THEN
      v_box_price := 15;
      v_drop_rates := '{"common": 0, "rare": 0, "epic": 30, "legendary": 40, "christmas": 30}'::jsonb;
    WHEN 'supreme' THEN
      v_box_price := 20;
      v_drop_rates := '{"common": 0, "rare": 20, "epic": 50, "legendary": 30, "christmas": 0}'::jsonb;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid box type');
  END CASE;
  
  -- Use deposit_balance for purchases
  SELECT COALESCE(deposit_balance, 0), referred_by 
  INTO v_user_balance, v_referrer_code 
  FROM profiles WHERE id = v_user_id FOR UPDATE;
  
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
        v_cumulative := v_cumulative + COALESCE((v_drop_rates->>'legendary')::numeric, 0);
        IF v_random_roll <= v_cumulative THEN
          v_selected_rarity := 'legendary';
        ELSE
          v_selected_rarity := 'christmas';
        END IF;
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
    WHEN 'christmas' THEN
      v_character_roll := 1 + floor(random() * array_length(v_christmas_chars, 1))::integer;
      v_char_id_out := v_christmas_chars[v_character_roll][1];
      v_char_name_out := v_christmas_chars[v_character_roll][2];
      v_char_mining_rate := v_christmas_chars[v_character_roll][3]::numeric;
      v_char_rarity_out := 'christmas';
  END CASE;
  
  -- Add character to inventory using existing function
  INSERT INTO user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, v_char_id_out, v_char_name_out, v_char_rarity_out, v_char_mining_rate, 1)
  ON CONFLICT (user_id, character_id) 
  DO UPDATE SET quantity = user_characters.quantity + 1, updated_at = now()
  RETURNING id INTO v_char_id;
  
  -- Pay 5% of mining_rate to referrer
  IF v_referrer_code IS NOT NULL THEN
    SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = v_referrer_code;
    
    IF v_referrer_id IS NOT NULL THEN
      v_referral_commission := v_char_mining_rate * 0.05;
      
      UPDATE profiles
      SET referral_earnings = COALESCE(referral_earnings, 0) + v_referral_commission,
          updated_at = now()
      WHERE id = v_referrer_id;
    END IF;
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, notes)
  VALUES (v_user_id, 'box_purchase', -v_box_price, 'Opened ' || p_box_id || ' box');
  
  RETURN json_build_object(
    'success', true,
    'character', json_build_object(
      'id', v_char_id_out,
      'name', v_char_name_out,
      'rarity', v_char_rarity_out,
      'miningRate', v_char_mining_rate
    ),
    'newBalance', v_new_balance
  );
END;
$$;