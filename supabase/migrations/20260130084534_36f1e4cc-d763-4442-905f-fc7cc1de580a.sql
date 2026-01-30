-- Fix the internal_open_box_for_roulette function to use correct rarity names (lowercase)
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

  -- Select character based on box type (using lowercase rarity names to match frontend)
  IF p_box_type = 'common' THEN
    -- Common box: common characters
    IF v_random < 50 THEN
      v_character_rarity := 'common';
      v_character_id := 'builder';
      v_character_name := 'Doge Builder';
      v_mining_rate := 0.00195;
    ELSIF v_random < 70 THEN
      v_character_rarity := 'common';
      v_character_id := 'farmer';
      v_character_name := 'Doge Farmer';
      v_mining_rate := 0.00195;
    ELSIF v_random < 85 THEN
      v_character_rarity := 'common';
      v_character_id := 'chef';
      v_character_name := 'Doge Chef';
      v_mining_rate := 0.00195;
    ELSE
      v_character_rarity := 'common';
      v_character_id := 'mechanic';
      v_character_name := 'Doge Mechanic';
      v_mining_rate := 0.00195;
    END IF;
  ELSIF p_box_type = 'rare' THEN
    -- Rare box: common, rare, epic characters
    IF v_random < 40 THEN
      v_character_rarity := 'common';
      v_character_id := 'explorer';
      v_character_name := 'Doge Explorer';
      v_mining_rate := 0.00195;
    ELSIF v_random < 80 THEN
      -- Rare characters
      IF v_random < 55 THEN
        v_character_rarity := 'rare';
        v_character_id := 'pirate';
        v_character_name := 'Doge Pirate';
        v_mining_rate := 0.00455;
      ELSIF v_random < 70 THEN
        v_character_rarity := 'rare';
        v_character_id := 'ninja';
        v_character_name := 'Doge Ninja';
        v_mining_rate := 0.00455;
      ELSE
        v_character_rarity := 'rare';
        v_character_id := 'knight';
        v_character_name := 'Doge Knight';
        v_mining_rate := 0.00455;
      END IF;
    ELSE
      -- Epic characters
      v_character_rarity := 'epic';
      v_character_id := 'wizard';
      v_character_name := 'Doge Wizard';
      v_mining_rate := 0.00975;
    END IF;
  ELSIF p_box_type = 'legendary' THEN
    -- Legendary box: rare, epic, legendary characters
    IF v_random < 40 THEN
      -- Rare characters
      IF v_random < 20 THEN
        v_character_rarity := 'rare';
        v_character_id := 'samurai';
        v_character_name := 'Doge Samurai';
        v_mining_rate := 0.00455;
      ELSE
        v_character_rarity := 'rare';
        v_character_id := 'viking';
        v_character_name := 'Doge Viking';
        v_mining_rate := 0.00455;
      END IF;
    ELSIF v_random < 80 THEN
      -- Epic characters
      IF v_random < 55 THEN
        v_character_rarity := 'epic';
        v_character_id := 'wizard';
        v_character_name := 'Doge Wizard';
        v_mining_rate := 0.00975;
      ELSIF v_random < 70 THEN
        v_character_rarity := 'epic';
        v_character_id := 'cyberpunk';
        v_character_name := 'Doge Cyberpunk';
        v_mining_rate := 0.00975;
      ELSE
        v_character_rarity := 'epic';
        v_character_id := 'vampire';
        v_character_name := 'Doge Vampire';
        v_mining_rate := 0.00975;
      END IF;
    ELSE
      -- Legendary characters
      IF v_random < 90 THEN
        v_character_rarity := 'legendary';
        v_character_id := 'king';
        v_character_name := 'Doge King';
        v_mining_rate := 0.013;
      ELSE
        v_character_rarity := 'legendary';
        v_character_id := 'dragon';
        v_character_name := 'Doge Dragon';
        v_mining_rate := 0.013;
      END IF;
    END IF;
  ELSE
    -- Default to common
    v_character_rarity := 'common';
    v_character_id := 'builder';
    v_character_name := 'Doge Builder';
    v_mining_rate := 0.00195;
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