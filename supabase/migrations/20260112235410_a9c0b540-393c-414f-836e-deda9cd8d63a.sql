-- Create table for RDOGE purchase requests
CREATE TABLE public.rdoge_purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doge_amount NUMERIC NOT NULL,
  rdoge_amount NUMERIC NOT NULL,
  bonus_percent INTEGER NOT NULL DEFAULT 0,
  tx_hash TEXT,
  faucetpay_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.rdoge_purchase_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own purchase requests"
ON public.rdoge_purchase_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create purchase requests"
ON public.rdoge_purchase_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all purchase requests"
ON public.rdoge_purchase_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update purchase requests"
ON public.rdoge_purchase_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to approve RDOGE purchase and credit tokens
CREATE OR REPLACE FUNCTION public.admin_approve_rdoge_purchase(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_current_balance NUMERIC;
BEGIN
  -- Check admin role
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Get request
  SELECT * INTO v_request FROM rdoge_purchase_requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request already processed');
  END IF;

  -- Check if user has RDOGE tokens record
  SELECT balance INTO v_current_balance FROM user_rdoge_tokens WHERE user_id = v_request.user_id;
  
  IF NOT FOUND THEN
    -- Create new record
    INSERT INTO user_rdoge_tokens (user_id, balance, total_purchased)
    VALUES (v_request.user_id, v_request.rdoge_amount, v_request.rdoge_amount);
  ELSE
    -- Update existing record
    UPDATE user_rdoge_tokens
    SET balance = balance + v_request.rdoge_amount,
        total_purchased = total_purchased + v_request.rdoge_amount,
        updated_at = now()
    WHERE user_id = v_request.user_id;
  END IF;

  -- Update request status
  UPDATE rdoge_purchase_requests
  SET status = 'approved',
      processed_at = now()
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'rdoge_credited', v_request.rdoge_amount,
    'user_id', v_request.user_id
  );
END;
$$;

-- Create function to reject RDOGE purchase
CREATE OR REPLACE FUNCTION public.admin_reject_rdoge_purchase(p_request_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Check admin role
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Get request
  SELECT * INTO v_request FROM rdoge_purchase_requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request already processed');
  END IF;

  -- Update request status
  UPDATE rdoge_purchase_requests
  SET status = 'rejected',
      processed_at = now(),
      admin_notes = COALESCE(p_reason, admin_notes)
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true);
END;
$$;