-- Update the spin_roulette function with new probabilities
CREATE OR REPLACE FUNCTION public.spin_roulette()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_deposit_balance numeric;
  v_spin_cost numeric := 3;
  v_random numeric;
  v_prize_type text;
  v_prize_value text;
  v_doge_amount numeric := 0;
  v_box_result json;
  v_character_name text;
  v_character_rarity text;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get deposit balance
  SELECT COALESCE(deposit_balance, 0) INTO v_deposit_balance
  FROM profiles WHERE id = v_user_id;

  -- Check if user has enough balance
  IF v_deposit_balance < v_spin_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Deduct spin cost
  UPDATE profiles 
  SET deposit_balance = deposit_balance - v_spin_cost
  WHERE id = v_user_id;

  -- Generate random number (0-100)
  v_random := random() * 100;

  -- Determine prize based on new probabilities:
  -- Common Box: 50%
  -- Rare Box: 15%
  -- 3 DOGE: 10%
  -- 5 DOGE: 5%
  -- 8 DOGE: 2%
  -- Legendary Box: 0.5%
  -- No prize: 17.5%
  
  IF v_random < 50 THEN
    v_prize_type := 'box';
    v_prize_value := 'common';
  ELSIF v_random < 65 THEN
    v_prize_type := 'box';
    v_prize_value := 'rare';
  ELSIF v_random < 75 THEN
    v_prize_type := 'doge';
    v_prize_value := '3';
    v_doge_amount := 3;
  ELSIF v_random < 80 THEN
    v_prize_type := 'doge';
    v_prize_value := '5';
    v_doge_amount := 5;
  ELSIF v_random < 82 THEN
    v_prize_type := 'doge';
    v_prize_value := '8';
    v_doge_amount := 8;
  ELSIF v_random < 82.5 THEN
    v_prize_type := 'box';
    v_prize_value := 'legendary';
  ELSE
    v_prize_type := 'none';
    v_prize_value := '0';
  END IF;

  -- Record the spin
  INSERT INTO roulette_spins (user_id, prize_type, prize_value)
  VALUES (v_user_id, v_prize_type, v_prize_value);

  -- Award prize
  IF v_prize_type = 'doge' THEN
    UPDATE profiles 
    SET deposit_balance = deposit_balance + v_doge_amount
    WHERE id = v_user_id;
  ELSIF v_prize_type = 'box' THEN
    -- Open box and get character
    v_box_result := internal_open_box_for_roulette(v_prize_value, v_user_id);
    v_character_name := v_box_result->>'character_name';
    v_character_rarity := v_box_result->>'character_rarity';
  END IF;

  RETURN json_build_object(
    'success', true,
    'prize_type', v_prize_type,
    'prize_value', v_prize_value,
    'box_type', CASE WHEN v_prize_type = 'box' THEN v_prize_value ELSE NULL END,
    'doge_amount', v_doge_amount,
    'character_name', v_character_name,
    'character_rarity', v_character_rarity
  );
END;
$$;