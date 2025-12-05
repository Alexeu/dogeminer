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
  
  -- Character definitions by rarity (with proper IDs, names, and mining rates)
  v_common_chars TEXT[][] := ARRAY[
    ['builder', 'Doge Builder', '0.0015'],
    ['astronaut', 'Doge Astronaut', '0.0015'],
    ['farmer', 'Doge Farmer', '0.0015'],
    ['chef', 'Doge Chef', '0.0015'],
    ['mechanic', 'Doge Mechanic', '0.0015'],
    ['artist', 'Doge Artist', '0.0015'],
    ['explorer', 'Doge Explorer', '0.0015']
  ];
  v_rare_chars TEXT[][] := ARRAY[
    ['pirate', 'Doge Pirate', '0.0035'],
    ['ninja', 'Doge Ninja', '0.0035'],
    ['samurai', 'Doge Samurai', '0.0035'],
    ['knight', 'Doge Knight', '0.0035'],
    ['viking', 'Doge Viking', '0.0035'],
    ['gladiator', 'Doge Gladiator', '0.0035']
  ];
  v_epic_chars TEXT[][] := ARRAY[
    ['wizard', 'Doge Wizard', '0.0075'],
    ['cyberpunk', 'Doge Cyberpunk', '0.0075'],
    ['vampire', 'Doge Vampire', '0.0075'],
    ['phoenix', 'Doge Phoenix', '0.0075']
  ];
  v_legendary_chars TEXT[][] := ARRAY[
    ['king', 'Doge King', '0.01'],
    ['gold', 'Doge Gold', '0.01'],
    ['dragon', 'Doge Dragon', '0.01']
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
  
  -- Validate box type and get price/drop rates
  CASE p_box_id
    WHEN 'common' THEN
      v_box_price := 0.975;
      v_drop_rates := '{"common": 100, "rare": 0, "epic": 0, "legendary": 0}'::jsonb;
    WHEN 'rare' THEN
      v_box_price := 4.225;
      v_drop_rates := '{"common": 40, "rare": 40, "epic": 0, "legendary": 20}'::jsonb;
    WHEN 'legendary' THEN
      v_box_price := 9.75;
      v_drop_rates := '{"common": 0, "rare": 40, "epic": 40, "legendary": 20}'::jsonb;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid box type');
  END CASE;
  
  -- Get user balance with lock
  SELECT COALESCE(balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < v_box_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance', 'required', v_box_price, 'current', v_user_balance);
  END IF;
  
  -- Deduct balance
  UPDATE profiles 
  SET balance = balance - v_box_price, updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Determine rarity via RNG
  v_random_roll := random() * 100;
  v_cumulative := 0;
  
  -- Check each rarity in order
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
  
  -- Select random character from that rarity
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
  
  -- Add character to inventory
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