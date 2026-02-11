
CREATE OR REPLACE FUNCTION public.open_mystery_box(p_box_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_box_price numeric;
  v_current_balance numeric;
  v_drop_rates jsonb;
  v_random numeric;
  v_cumulative numeric := 0;
  v_selected_rarity text;
  v_rarity_key text;
  v_rarity_rate numeric;
  v_character_id text;
  v_character_name text;
  v_mining_rate numeric;
  v_char_index int;
  v_christmas_chars text[] := ARRAY['santa-doge', 'elf-doge', 'snowman-doge', 'reindeer-doge'];
  v_christmas_names text[] := ARRAY['Santa Doge', 'Elf Doge', 'Snowman Doge', 'Reindeer Doge'];
  v_valentine_chars text[] := ARRAY['cupid-doge', 'romeo-doge', 'lovefairy-doge', 'heartknight-doge', 'lovequeen-doge'];
  v_valentine_names text[] := ARRAY['Cupid Doge', 'Romeo Doge', 'Love Fairy Doge', 'Heart Knight Doge', 'Love Queen Doge'];
  v_common_chars text[] := ARRAY['builder', 'astronaut', 'farmer', 'chef', 'mechanic', 'artist', 'explorer'];
  v_common_names text[] := ARRAY['Doge Builder', 'Doge Astronaut', 'Doge Farmer', 'Doge Chef', 'Doge Mechanic', 'Doge Artist', 'Doge Explorer'];
  v_rare_chars text[] := ARRAY['pirate', 'ninja', 'samurai', 'knight', 'viking', 'gladiator'];
  v_rare_names text[] := ARRAY['Doge Pirate', 'Doge Ninja', 'Doge Samurai', 'Doge Knight', 'Doge Viking', 'Doge Gladiator'];
  v_epic_chars text[] := ARRAY['wizard', 'cyberpunk', 'vampire', 'phoenix'];
  v_epic_names text[] := ARRAY['Doge Wizard', 'Doge Cyberpunk', 'Doge Vampire', 'Doge Phoenix'];
  v_legendary_chars text[] := ARRAY['king', 'gold', 'dragon'];
  v_legendary_names text[] := ARRAY['Doge King', 'Doge Gold', 'Doge Dragon'];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Set box price and drop rates
  CASE p_box_id
    WHEN 'common' THEN
      v_box_price := 1;
      v_drop_rates := '{"common": 100}'::jsonb;
    WHEN 'rare' THEN
      v_box_price := 4;
      v_drop_rates := '{"common": 40, "rare": 40, "epic": 20}'::jsonb;
    WHEN 'legendary' THEN
      v_box_price := 9;
      v_drop_rates := '{"rare": 40, "epic": 40, "legendary": 20}'::jsonb;
    WHEN 'christmas' THEN
      v_box_price := 15;
      v_drop_rates := '{"epic": 30, "legendary": 40, "christmas": 30}'::jsonb;
    WHEN 'valentine' THEN
      v_box_price := 30;
      v_drop_rates := '{"valentine": 100}'::jsonb;
    WHEN 'supreme' THEN
      v_box_price := 20;
      v_drop_rates := '{"rare": 20, "epic": 50, "legendary": 30}'::jsonb;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid box type');
  END CASE;

  -- Check and deduct balance
  SELECT deposit_balance INTO v_current_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  IF v_current_balance IS NULL OR v_current_balance < v_box_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance. Need ' || v_box_price || ' DOGE');
  END IF;

  UPDATE profiles SET deposit_balance = deposit_balance - v_box_price, updated_at = now() WHERE id = v_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, status, notes)
  VALUES (v_user_id, 'box_purchase', -v_box_price, 'completed', 'Opened ' || p_box_id || ' box');

  -- Select rarity based on drop rates
  v_random := random() * 100;
  FOR v_rarity_key, v_rarity_rate IN SELECT key, value::numeric FROM jsonb_each_text(v_drop_rates)
  LOOP
    v_cumulative := v_cumulative + v_rarity_rate;
    IF v_random <= v_cumulative THEN
      v_selected_rarity := v_rarity_key;
      EXIT;
    END IF;
  END LOOP;

  IF v_selected_rarity IS NULL THEN
    v_selected_rarity := (SELECT key FROM jsonb_each_text(v_drop_rates) LIMIT 1);
  END IF;

  -- Select character based on rarity
  CASE v_selected_rarity
    WHEN 'common' THEN
      v_char_index := floor(random() * array_length(v_common_chars, 1)) + 1;
      v_character_id := v_common_chars[v_char_index];
      v_character_name := v_common_names[v_char_index];
      v_mining_rate := 0.001950;
    WHEN 'rare' THEN
      v_char_index := floor(random() * array_length(v_rare_chars, 1)) + 1;
      v_character_id := v_rare_chars[v_char_index];
      v_character_name := v_rare_names[v_char_index];
      v_mining_rate := 0.004550;
    WHEN 'epic' THEN
      v_char_index := floor(random() * array_length(v_epic_chars, 1)) + 1;
      v_character_id := v_epic_chars[v_char_index];
      v_character_name := v_epic_names[v_char_index];
      v_mining_rate := 0.009750;
    WHEN 'legendary' THEN
      v_char_index := floor(random() * array_length(v_legendary_chars, 1)) + 1;
      v_character_id := v_legendary_chars[v_char_index];
      v_character_name := v_legendary_names[v_char_index];
      v_mining_rate := 0.013000;
    WHEN 'christmas' THEN
      v_char_index := floor(random() * array_length(v_christmas_chars, 1)) + 1;
      v_character_id := v_christmas_chars[v_char_index];
      v_character_name := v_christmas_names[v_char_index];
      v_mining_rate := 0.019500;
    WHEN 'valentine' THEN
      v_char_index := floor(random() * array_length(v_valentine_chars, 1)) + 1;
      v_character_id := v_valentine_chars[v_char_index];
      v_character_name := v_valentine_names[v_char_index];
      v_mining_rate := 0.014950;
    ELSE
      v_char_index := floor(random() * array_length(v_common_chars, 1)) + 1;
      v_character_id := v_common_chars[v_char_index];
      v_character_name := v_common_names[v_char_index];
      v_mining_rate := 0.001950;
  END CASE;

  -- Add character to user inventory
  INSERT INTO user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, v_character_id, v_character_name, v_selected_rarity, v_mining_rate, 1)
  ON CONFLICT (user_id, character_id) DO UPDATE SET quantity = user_characters.quantity + 1, updated_at = now();

  RETURN json_build_object(
    'success', true,
    'character', json_build_object(
      'id', v_character_id,
      'name', v_character_name,
      'rarity', v_selected_rarity,
      'miningRate', v_mining_rate
    ),
    'new_balance', (SELECT deposit_balance FROM profiles WHERE id = v_user_id)
  );
END;
$$;
