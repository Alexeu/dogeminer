-- Drop all existing convert_eggs_to_doge functions to resolve overloading
DROP FUNCTION IF EXISTS public.convert_eggs_to_doge(int8);
DROP FUNCTION IF EXISTS public.convert_eggs_to_doge(int4);
DROP FUNCTION IF EXISTS public.convert_eggs_to_doge(integer);

-- Recreate with single signature: 42000 eggs = 0.01 DOGE
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
  v_conversion_rate numeric := 42000; -- eggs per 0.01 DOGE
  v_doge_per_batch numeric := 0.01;
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

  -- Calculate DOGE amount (floor to ensure exact conversion)
  v_doge_amount := floor(eggs_amount / v_conversion_rate) * v_doge_per_batch;

  -- Deduct eggs (only the exact amount that converts)
  UPDATE user_barn
  SET eggs = eggs - (floor(eggs_amount / v_conversion_rate) * v_conversion_rate)::integer,
      last_collected_at = now()
  WHERE user_id = v_user_id;

  -- Add DOGE to balance
  UPDATE profiles
  SET balance = COALESCE(balance, 0) + v_doge_amount
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'eggs_converted', (floor(eggs_amount / v_conversion_rate) * v_conversion_rate)::integer,
    'doge_earned', v_doge_amount
  );
END;
$$;