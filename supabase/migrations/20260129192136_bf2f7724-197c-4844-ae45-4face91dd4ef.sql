-- Update spin_roulette to open mystery boxes directly when won
CREATE OR REPLACE FUNCTION public.spin_roulette()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_deposit_balance NUMERIC;
  v_random NUMERIC;
  v_prize_type TEXT;
  v_prize_value TEXT;
  v_doge_reward NUMERIC := 0;
  v_box_type TEXT := NULL;
  v_character_result JSON;
  v_won_character_name TEXT;
  v_won_character_rarity TEXT;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current deposit balance
  SELECT COALESCE(deposit_balance, 0) INTO v_deposit_balance
  FROM profiles
  WHERE id = v_user_id;

  -- Check if user has enough balance (3 DOGE)
  IF v_deposit_balance < 3 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient deposit balance. Need 3 DOGE.');
  END IF;

  -- Subtract 3 DOGE from deposit balance
  UPDATE profiles
  SET deposit_balance = deposit_balance - 3,
      updated_at = now()
  WHERE id = v_user_id;

  -- Generate random number between 0 and 100
  v_random := random() * 100;

  -- Determine prize based on probabilities:
  -- Common Box: 30% (0-30)
  -- Rare Box: 10% (30-40)
  -- 1 DOGE: 30% (40-70)
  -- Legendary Box: 1% (70-71)
  -- 2 DOGE: 15% (71-86)
  -- 3 DOGE: 10% (86-96)
  -- No prize: 4% (96-100)

  IF v_random < 30 THEN
    v_prize_type := 'box';
    v_prize_value := 'common';
    v_box_type := 'common';
  ELSIF v_random < 40 THEN
    v_prize_type := 'box';
    v_prize_value := 'rare';
    v_box_type := 'rare';
  ELSIF v_random < 70 THEN
    v_prize_type := 'doge';
    v_prize_value := '1';
    v_doge_reward := 1;
  ELSIF v_random < 71 THEN
    v_prize_type := 'box';
    v_prize_value := 'legendary';
    v_box_type := 'legendary';
  ELSIF v_random < 86 THEN
    v_prize_type := 'doge';
    v_prize_value := '2';
    v_doge_reward := 2;
  ELSIF v_random < 96 THEN
    v_prize_type := 'doge';
    v_prize_value := '3';
    v_doge_reward := 3;
  ELSE
    v_prize_type := 'none';
    v_prize_value := '0';
  END IF;

  -- Award DOGE if applicable
  IF v_doge_reward > 0 THEN
    UPDATE profiles
    SET mining_balance = COALESCE(mining_balance, 0) + v_doge_reward,
        total_earned = COALESCE(total_earned, 0) + v_doge_reward,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- If won a box, open it immediately (free, since they already paid for the spin)
  IF v_box_type IS NOT NULL THEN
    -- Get a random character from the box
    v_character_result := internal_open_box_for_roulette(v_user_id, v_box_type);
    v_won_character_name := v_character_result->>'character_name';
    v_won_character_rarity := v_character_result->>'character_rarity';
  END IF;

  -- Record the spin
  INSERT INTO roulette_spins (user_id, prize_type, prize_value)
  VALUES (v_user_id, v_prize_type, v_prize_value);

  RETURN json_build_object(
    'success', true,
    'prize_type', v_prize_type,
    'prize_value', v_prize_value,
    'box_type', v_box_type,
    'doge_amount', v_doge_reward,
    'character_name', v_won_character_name,
    'character_rarity', v_won_character_rarity
  );
END;
$$;

-- Internal function to open a box for roulette prizes (no payment required)
CREATE OR REPLACE FUNCTION internal_open_box_for_roulette(p_user_id UUID, p_box_type TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_characters JSON;
  v_selected_character JSON;
  v_random NUMERIC;
  v_cumulative NUMERIC := 0;
  v_character_id TEXT;
  v_character_name TEXT;
  v_character_rarity TEXT;
  v_mining_rate NUMERIC;
  v_existing_quantity INT;
BEGIN
  -- Define characters based on box type
  IF p_box_type = 'common' THEN
    v_characters := '[
      {"id": "starter", "name": "Doge Starter", "rarity": "Common", "mining_rate": 0.0002, "probability": 50},
      {"id": "farmer", "name": "Doge Farmer", "rarity": "Common", "mining_rate": 0.00026, "probability": 30},
      {"id": "builder", "name": "Doge Builder", "rarity": "Rare", "mining_rate": 0.00052, "probability": 15},
      {"id": "artist", "name": "Doge Artist", "rarity": "Rare", "mining_rate": 0.00078, "probability": 5}
    ]'::JSON;
  ELSIF p_box_type = 'rare' THEN
    v_characters := '[
      {"id": "farmer", "name": "Doge Farmer", "rarity": "Common", "mining_rate": 0.00026, "probability": 20},
      {"id": "builder", "name": "Doge Builder", "rarity": "Rare", "mining_rate": 0.00052, "probability": 20},
      {"id": "artist", "name": "Doge Artist", "rarity": "Rare", "mining_rate": 0.00078, "probability": 20},
      {"id": "chef", "name": "Doge Chef", "rarity": "Epic", "mining_rate": 0.0013, "probability": 10},
      {"id": "mechanic", "name": "Doge Mechanic", "rarity": "Epic", "mining_rate": 0.0013, "probability": 10},
      {"id": "explorer", "name": "Doge Explorer", "rarity": "Epic", "mining_rate": 0.0013, "probability": 10},
      {"id": "ninja", "name": "Doge Ninja", "rarity": "Epic", "mining_rate": 0.0013, "probability": 10}
    ]'::JSON;
  ELSE -- legendary
    v_characters := '[
      {"id": "chef", "name": "Doge Chef", "rarity": "Epic", "mining_rate": 0.0013, "probability": 15},
      {"id": "mechanic", "name": "Doge Mechanic", "rarity": "Epic", "mining_rate": 0.0013, "probability": 15},
      {"id": "explorer", "name": "Doge Explorer", "rarity": "Epic", "mining_rate": 0.0013, "probability": 15},
      {"id": "ninja", "name": "Doge Ninja", "rarity": "Epic", "mining_rate": 0.0013, "probability": 15},
      {"id": "samurai", "name": "Doge Samurai", "rarity": "Legendary", "mining_rate": 0.0026, "probability": 8},
      {"id": "viking", "name": "Doge Viking", "rarity": "Legendary", "mining_rate": 0.0026, "probability": 8},
      {"id": "knight", "name": "Doge Knight", "rarity": "Legendary", "mining_rate": 0.0026, "probability": 8},
      {"id": "wizard", "name": "Doge Wizard", "rarity": "Legendary", "mining_rate": 0.0026, "probability": 8},
      {"id": "pirate", "name": "Doge Pirate", "rarity": "Legendary", "mining_rate": 0.0026, "probability": 8}
    ]'::JSON;
  END IF;

  -- Select random character based on probability
  v_random := random() * 100;
  
  FOR i IN 0..json_array_length(v_characters) - 1 LOOP
    v_selected_character := v_characters->i;
    v_cumulative := v_cumulative + (v_selected_character->>'probability')::NUMERIC;
    
    IF v_random <= v_cumulative THEN
      EXIT;
    END IF;
  END LOOP;

  v_character_id := v_selected_character->>'id';
  v_character_name := v_selected_character->>'name';
  v_character_rarity := v_selected_character->>'rarity';
  v_mining_rate := (v_selected_character->>'mining_rate')::NUMERIC;

  -- Check if user already has this character
  SELECT quantity INTO v_existing_quantity
  FROM user_characters
  WHERE user_id = p_user_id AND character_id = v_character_id;

  IF v_existing_quantity IS NOT NULL THEN
    -- Increase quantity
    UPDATE user_characters
    SET quantity = quantity + 1,
        updated_at = now()
    WHERE user_id = p_user_id AND character_id = v_character_id;
  ELSE
    -- Add new character with 30 days mining
    INSERT INTO user_characters (
      user_id,
      character_id,
      character_name,
      character_rarity,
      mining_rate,
      level,
      quantity,
      mining_expires_at
    ) VALUES (
      p_user_id,
      v_character_id,
      v_character_name,
      v_character_rarity,
      v_mining_rate,
      1,
      1,
      now() + interval '30 days'
    );
  END IF;

  RETURN json_build_object(
    'character_id', v_character_id,
    'character_name', v_character_name,
    'character_rarity', v_character_rarity,
    'mining_rate', v_mining_rate
  );
END;
$$;