-- Create the internal_open_box_for_roulette function
CREATE OR REPLACE FUNCTION public.internal_open_box_for_roulette(p_box_type text, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_random numeric;
  v_character_id text;
  v_character_name text;
  v_character_rarity text;
  v_mining_rate numeric;
  v_existing_character record;
BEGIN
  -- Generate random number for character selection
  v_random := random() * 100;

  -- Select character based on box type
  IF p_box_type = 'common' THEN
    -- Common box: mostly common characters
    IF v_random < 70 THEN
      v_character_rarity := 'Common';
      v_character_id := 'doge-starter';
      v_character_name := 'Doge Starter';
      v_mining_rate := 0.0001;
    ELSIF v_random < 90 THEN
      v_character_rarity := 'Common';
      v_character_id := 'doge-farmer';
      v_character_name := 'Doge Farmer';
      v_mining_rate := 0.00015;
    ELSE
      v_character_rarity := 'Uncommon';
      v_character_id := 'doge-builder';
      v_character_name := 'Doge Builder';
      v_mining_rate := 0.0002;
    END IF;
  ELSIF p_box_type = 'rare' THEN
    -- Rare box: uncommon and rare characters
    IF v_random < 40 THEN
      v_character_rarity := 'Uncommon';
      v_character_id := 'doge-builder';
      v_character_name := 'Doge Builder';
      v_mining_rate := 0.0002;
    ELSIF v_random < 70 THEN
      v_character_rarity := 'Uncommon';
      v_character_id := 'doge-explorer';
      v_character_name := 'Doge Explorer';
      v_mining_rate := 0.00025;
    ELSIF v_random < 90 THEN
      v_character_rarity := 'Rare';
      v_character_id := 'doge-knight';
      v_character_name := 'Doge Knight';
      v_mining_rate := 0.0003;
    ELSE
      v_character_rarity := 'Rare';
      v_character_id := 'doge-ninja';
      v_character_name := 'Doge Ninja';
      v_mining_rate := 0.00035;
    END IF;
  ELSIF p_box_type = 'legendary' THEN
    -- Legendary box: rare and legendary characters
    IF v_random < 30 THEN
      v_character_rarity := 'Rare';
      v_character_id := 'doge-samurai';
      v_character_name := 'Doge Samurai';
      v_mining_rate := 0.0004;
    ELSIF v_random < 55 THEN
      v_character_rarity := 'Epic';
      v_character_id := 'doge-wizard';
      v_character_name := 'Doge Wizard';
      v_mining_rate := 0.0005;
    ELSIF v_random < 75 THEN
      v_character_rarity := 'Epic';
      v_character_id := 'doge-king';
      v_character_name := 'Doge King';
      v_mining_rate := 0.0006;
    ELSIF v_random < 90 THEN
      v_character_rarity := 'Legendary';
      v_character_id := 'doge-dragon';
      v_character_name := 'Doge Dragon';
      v_mining_rate := 0.0008;
    ELSE
      v_character_rarity := 'Legendary';
      v_character_id := 'doge-supreme';
      v_character_name := 'Doge Supreme';
      v_mining_rate := 0.001;
    END IF;
  ELSE
    -- Default to common
    v_character_rarity := 'Common';
    v_character_id := 'doge-starter';
    v_character_name := 'Doge Starter';
    v_mining_rate := 0.0001;
  END IF;

  -- Check if user already has this character
  SELECT * INTO v_existing_character
  FROM user_characters
  WHERE user_id = p_user_id AND character_id = v_character_id;

  IF v_existing_character.id IS NOT NULL THEN
    -- Increment quantity
    UPDATE user_characters
    SET quantity = quantity + 1, updated_at = now()
    WHERE id = v_existing_character.id;
  ELSE
    -- Insert new character
    INSERT INTO user_characters (user_id, character_id, character_name, character_rarity, mining_rate)
    VALUES (p_user_id, v_character_id, v_character_name, v_character_rarity, v_mining_rate);
  END IF;

  RETURN json_build_object(
    'success', true,
    'character_id', v_character_id,
    'character_name', v_character_name,
    'character_rarity', v_character_rarity,
    'mining_rate', v_mining_rate
  );
END;
$$;