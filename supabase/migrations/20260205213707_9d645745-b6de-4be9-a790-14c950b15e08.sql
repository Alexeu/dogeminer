CREATE OR REPLACE FUNCTION public.convert_eggs_to_doge(eggs_amount integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_current_eggs integer;
  v_doge_amount numeric;
  v_conversion_rate numeric := 42000; -- eggs per 0.01 DOGE
  v_doge_per_batch numeric := 0.01;
  v_eggs_to_convert integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check minimum eggs
  IF eggs_amount < v_conversion_rate THEN
    RETURN json_build_object('success', false, 'error', 'Minimum eggs required: ' || v_conversion_rate);
  END IF;

  -- Get current eggs
  SELECT eggs INTO v_current_eggs
  FROM user_barn
  WHERE user_id = v_user_id;

  IF v_current_eggs IS NULL OR v_current_eggs < eggs_amount THEN
    RETURN json_build_object('success', false, 'error', 'Not enough eggs');
  END IF;

  -- Calculate exact eggs to convert and DOGE amount
  v_eggs_to_convert := (floor(eggs_amount / v_conversion_rate) * v_conversion_rate)::integer;
  v_doge_amount := floor(eggs_amount / v_conversion_rate) * v_doge_per_batch;

  -- Deduct eggs
  UPDATE user_barn
  SET eggs = eggs - v_eggs_to_convert,
      last_collected_at = now()
  WHERE user_id = v_user_id;

  -- Add DOGE to mining_balance (not the obsolete balance column)
  UPDATE profiles
  SET mining_balance = COALESCE(mining_balance, 0) + v_doge_amount,
      total_earned = COALESCE(total_earned, 0) + v_doge_amount,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'eggs_converted', v_eggs_to_convert,
    'doge_received', v_doge_amount
  );
END;
$function$;