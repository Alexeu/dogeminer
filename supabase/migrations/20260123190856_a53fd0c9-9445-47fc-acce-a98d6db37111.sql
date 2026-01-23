CREATE OR REPLACE FUNCTION public.create_deposit_request(p_amount numeric, p_faucetpay_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_deposit_id uuid;
  v_verification_code text;
BEGIN
  -- Get user ID from auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount
  IF p_amount < 0.1 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum deposit is 0.1 DOGE');
  END IF;
  
  IF p_amount > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum deposit is 1000 DOGE');
  END IF;
  
  -- Check for existing pending deposit
  IF EXISTS (SELECT 1 FROM deposits WHERE user_id = v_user_id AND status = 'pending' AND expires_at > now()) THEN
    RETURN json_build_object('success', false, 'error', 'You already have a pending deposit');
  END IF;
  
  -- Generate verification code
  v_verification_code := encode(gen_random_bytes(8), 'hex');
  
  -- Create deposit record
  INSERT INTO deposits (user_id, amount, faucetpay_email, verification_code, status, expires_at)
  VALUES (v_user_id, p_amount, p_faucetpay_email, v_verification_code, 'pending', now() + interval '30 minutes')
  RETURNING id INTO v_deposit_id;
  
  RETURN json_build_object(
    'success', true,
    'deposit_id', v_deposit_id,
    'verification_code', v_verification_code,
    'amount', p_amount
  );
END;
$$;