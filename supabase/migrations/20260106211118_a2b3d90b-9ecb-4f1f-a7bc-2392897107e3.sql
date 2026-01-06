
-- Update convert_eggs_to_doge function to add DOGE to mining_balance instead of balance
CREATE OR REPLACE FUNCTION public.convert_eggs_to_doge(eggs_amount integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_current_eggs integer;
  v_doge_amount numeric;
  v_conversion_rate numeric := 45000; -- eggs per 0.0075 DOGE
  v_doge_per_batch numeric := 0.0075;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current eggs
  SELECT eggs INTO v_current_eggs
  FROM user_barn
  WHERE user_id = v_user_id;

  IF v_current_eggs IS NULL OR v_current_eggs < eggs_amount THEN
    RETURN json_build_object('success', false, 'error', 'Not enough eggs');
  END IF;

  IF eggs_amount < v_conversion_rate THEN
    RETURN json_build_object('success', false, 'error', 'Minimum 45000 eggs required');
  END IF;

  -- Calculate DOGE amount
  v_doge_amount := (eggs_amount / v_conversion_rate) * v_doge_per_batch;

  -- Subtract eggs from barn
  UPDATE user_barn
  SET eggs = eggs - eggs_amount,
      last_collected_at = now()
  WHERE user_id = v_user_id;

  -- Add DOGE to mining_balance instead of balance
  UPDATE profiles
  SET mining_balance = COALESCE(mining_balance, 0) + v_doge_amount,
      total_earned = COALESCE(total_earned, 0) + v_doge_amount,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'eggs_converted', eggs_amount,
    'doge_earned', v_doge_amount
  );
END;
$$;
