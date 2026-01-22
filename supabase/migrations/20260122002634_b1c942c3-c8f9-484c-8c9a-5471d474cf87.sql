-- Update buy_bird function with correct fixed prices
CREATE OR REPLACE FUNCTION public.buy_bird(bird_type_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_price NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get bird price (FIXED PRICES - same as frontend)
  v_price := CASE bird_type_param
    WHEN 'yellow' THEN 2.6
    WHEN 'red' THEN 10
    WHEN 'green' THEN 29
    WHEN 'blue' THEN 55
    WHEN 'black' THEN 163
    ELSE NULL
  END;
  
  IF v_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid bird type');
  END IF;
  
  -- Get current deposit balance
  SELECT deposit_balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_current_balance < v_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct FIXED price (not multiplied by quantity!)
  UPDATE profiles
  SET deposit_balance = deposit_balance - v_price
  WHERE id = v_user_id;
  
  -- Add or update bird
  INSERT INTO user_birds (user_id, bird_type, quantity)
  VALUES (v_user_id, bird_type_param, 1)
  ON CONFLICT (user_id, bird_type) DO UPDATE
  SET quantity = user_birds.quantity + 1;
  
  -- Create barn if not exists
  INSERT INTO user_barn (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'bird_type', bird_type_param, 'price', v_price);
END;
$$;