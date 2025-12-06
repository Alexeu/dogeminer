-- Create deposits table for tracking pending FaucetPay deposits
CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  faucetpay_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'rejected')),
  verification_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 minutes')
);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view own deposits" ON public.deposits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own deposits
CREATE POLICY "Users can create own deposits" ON public.deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_deposits_verification_code ON public.deposits(verification_code);

-- Function to create a deposit request
CREATE OR REPLACE FUNCTION public.create_deposit_request(p_amount NUMERIC, p_faucetpay_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_verification_code TEXT;
  v_deposit_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF p_amount < 0.1 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum deposit is 0.1 DOGE');
  END IF;
  
  IF p_amount > 100 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum deposit is 100 DOGE');
  END IF;
  
  -- Check for existing pending deposit
  IF EXISTS (SELECT 1 FROM deposits WHERE user_id = v_user_id AND status = 'pending' AND expires_at > now()) THEN
    RETURN json_build_object('success', false, 'error', 'You already have a pending deposit. Wait for it to expire or complete it.');
  END IF;
  
  -- Generate unique verification code (6 chars)
  v_verification_code := 'DEP' || UPPER(SUBSTR(MD5(v_user_id::TEXT || now()::TEXT || random()::TEXT), 1, 6));
  
  INSERT INTO deposits (user_id, amount, faucetpay_email, verification_code)
  VALUES (v_user_id, p_amount, p_faucetpay_email, v_verification_code)
  RETURNING id INTO v_deposit_id;
  
  RETURN json_build_object(
    'success', true, 
    'deposit_id', v_deposit_id,
    'verification_code', v_verification_code,
    'amount', p_amount,
    'expires_in_minutes', 30
  );
END;
$$;

-- Function to verify and complete a deposit (called by edge function)
CREATE OR REPLACE FUNCTION public.complete_deposit(p_deposit_id UUID, p_tx_hash TEXT DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit RECORD;
  v_new_balance NUMERIC;
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
  
  -- Mark deposit as completed
  UPDATE deposits SET status = 'completed', verified_at = now() WHERE id = p_deposit_id;
  
  -- Add balance to user
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_deposit.amount,
      total_earned = COALESCE(total_earned, 0) + v_deposit.amount,
      updated_at = now()
  WHERE id = v_deposit.user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, status, notes, faucetpay_address)
  VALUES (v_deposit.user_id, 'deposit', v_deposit.amount, 'completed', 'FaucetPay deposit', v_deposit.faucetpay_email);
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'amount', v_deposit.amount);
END;
$$;