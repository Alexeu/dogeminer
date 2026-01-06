-- Drop and recreate the convert_eggs_to_doge function with new rate: 45000 eggs = 0.0075 DOGE
DROP FUNCTION IF EXISTS public.convert_eggs_to_doge(BIGINT);

CREATE FUNCTION public.convert_eggs_to_doge(eggs_amount BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_eggs BIGINT;
  v_doge_received NUMERIC;
  v_eggs_to_convert BIGINT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current eggs
  SELECT eggs INTO v_current_eggs
  FROM user_barn
  WHERE user_id = v_user_id;
  
  IF v_current_eggs IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No barn found');
  END IF;
  
  -- Calculate eggs to convert (must be multiple of 45000)
  v_eggs_to_convert := (eggs_amount / 45000) * 45000;
  
  IF v_eggs_to_convert < 45000 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum 45000 eggs required');
  END IF;
  
  IF v_eggs_to_convert > v_current_eggs THEN
    RETURN json_build_object('success', false, 'error', 'Not enough eggs');
  END IF;
  
  -- Calculate DOGE: 45000 eggs = 0.0075 DOGE
  v_doge_received := (v_eggs_to_convert::NUMERIC / 45000) * 0.0075;
  
  -- Deduct eggs
  UPDATE user_barn
  SET eggs = eggs - v_eggs_to_convert
  WHERE user_id = v_user_id;
  
  -- Add DOGE to mining balance
  UPDATE profiles
  SET mining_balance = COALESCE(mining_balance, 0) + v_doge_received,
      updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'eggs_converted', v_eggs_to_convert,
    'doge_received', v_doge_received
  );
END;
$$;