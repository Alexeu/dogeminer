-- Add referral_earnings column to track pending referral earnings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_earnings numeric DEFAULT 0;

-- Create function to claim referral earnings
CREATE OR REPLACE FUNCTION public.claim_referral_earnings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_referral_earnings NUMERIC;
  v_new_deposit_balance NUMERIC;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no autenticado');
  END IF;
  
  -- Get current referral earnings
  SELECT referral_earnings INTO v_referral_earnings
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_referral_earnings IS NULL OR v_referral_earnings <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No hay ganancias de referidos para reclamar');
  END IF;
  
  -- Update balances: add referral_earnings to deposit_balance and reset referral_earnings
  UPDATE profiles
  SET 
    deposit_balance = COALESCE(deposit_balance, 0) + v_referral_earnings,
    referral_earnings = 0,
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING deposit_balance INTO v_new_deposit_balance;
  
  RETURN json_build_object(
    'success', true, 
    'claimed_amount', v_referral_earnings,
    'new_deposit_balance', v_new_deposit_balance
  );
END;
$$;

-- Update get_balance function to include referral_earnings
CREATE OR REPLACE FUNCTION public.get_balance()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_mining_balance NUMERIC;
  v_deposit_balance NUMERIC;
  v_referral_code TEXT;
  v_total_earned NUMERIC;
  v_total_deposited NUMERIC;
  v_referral_earnings NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT 
    COALESCE(mining_balance, 0),
    COALESCE(deposit_balance, 0),
    referral_code,
    COALESCE(total_earned, 0),
    COALESCE(total_deposited, 0),
    COALESCE(referral_earnings, 0)
  INTO 
    v_mining_balance,
    v_deposit_balance,
    v_referral_code,
    v_total_earned,
    v_total_deposited,
    v_referral_earnings
  FROM profiles
  WHERE id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'balance', v_mining_balance + v_deposit_balance,
    'mining_balance', v_mining_balance,
    'deposit_balance', v_deposit_balance,
    'referral_code', v_referral_code,
    'total_earned', v_total_earned,
    'total_deposited', v_total_deposited,
    'referral_earnings', v_referral_earnings
  );
END;
$$;