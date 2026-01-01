-- Update complete_deposit function with correct promo date for 2026
CREATE OR REPLACE FUNCTION public.complete_deposit(p_deposit_id uuid, p_tx_hash text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_deposit RECORD;
  v_new_balance NUMERIC;
  v_promo_end_date TIMESTAMP WITH TIME ZONE := '2026-01-07 00:00:00+00'::timestamptz;
  v_promo_min_deposit NUMERIC := 3;
  v_promo_bonus_percent NUMERIC := 25;
  v_bonus NUMERIC := 0;
  v_total_amount NUMERIC;
BEGIN
  SELECT * INTO v_deposit FROM deposits WHERE id = p_deposit_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Deposit not found');
  END IF;
  
  IF v_deposit.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Deposit already processed');
  END IF;
  
  IF v_deposit.expires_at < now() THEN
    UPDATE deposits SET status = 'expired' WHERE id = p_deposit_id;
    RETURN json_build_object('success', false, 'error', 'Deposit request expired');
  END IF;
  
  -- Calculate promo bonus if applicable
  IF now() < v_promo_end_date AND v_deposit.amount >= v_promo_min_deposit THEN
    v_bonus := v_deposit.amount * (v_promo_bonus_percent / 100);
  END IF;
  
  v_total_amount := v_deposit.amount + v_bonus;
  
  UPDATE deposits SET status = 'completed', verified_at = now() WHERE id = p_deposit_id;
  
  -- Add to deposit_balance and track total_deposited (including bonus)
  UPDATE profiles 
  SET deposit_balance = COALESCE(deposit_balance, 0) + v_total_amount,
      total_deposited = COALESCE(total_deposited, 0) + v_total_amount,
      updated_at = now()
  WHERE id = v_deposit.user_id
  RETURNING deposit_balance INTO v_new_balance;
  
  -- Create transaction record with bonus info in notes
  INSERT INTO transactions (user_id, type, amount, status, notes, faucetpay_address)
  VALUES (
    v_deposit.user_id, 
    'deposit', 
    v_total_amount, 
    'completed', 
    CASE WHEN v_bonus > 0 
      THEN 'FaucetPay deposit + ' || v_bonus || ' DOGE promo bonus (25%)'
      ELSE 'FaucetPay deposit'
    END,
    v_deposit.faucetpay_email
  );
  
  -- If bonus was applied, create a notification
  IF v_bonus > 0 THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_deposit.user_id,
      'promo_bonus',
      '🎉 ¡Bonus de Fin de Año!',
      'Recibiste +' || ROUND(v_bonus, 4) || ' DOGE extra por la promoción de fin de año.',
      json_build_object('bonus', v_bonus, 'original_amount', v_deposit.amount, 'total', v_total_amount)
    );
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance, 
    'amount', v_deposit.amount,
    'bonus', v_bonus,
    'total_credited', v_total_amount
  );
END;
$function$;