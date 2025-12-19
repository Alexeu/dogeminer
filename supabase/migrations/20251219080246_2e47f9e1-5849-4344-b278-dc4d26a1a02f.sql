
-- Create table for mining investments
CREATE TABLE public.mining_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('standard', 'medium', 'premium', 'vip')),
  invested_amount NUMERIC NOT NULL,
  daily_rate NUMERIC NOT NULL,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  last_claim_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.mining_investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own investments" ON public.mining_investments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments" ON public.mining_investments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.mining_investments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments" ON public.mining_investments
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create mining investment
CREATE OR REPLACE FUNCTION public.create_mining_investment(
  p_plan_type TEXT,
  p_amount NUMERIC
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_balance NUMERIC;
  v_daily_rate NUMERIC;
  v_min_amount NUMERIC;
  v_max_amount NUMERIC;
  v_investment_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate plan and set rates
  CASE p_plan_type
    WHEN 'standard' THEN
      v_daily_rate := 0.04;
      v_min_amount := 2;
      v_max_amount := 10;
    WHEN 'medium' THEN
      v_daily_rate := 0.045;
      v_min_amount := 15;
      v_max_amount := 50;
    WHEN 'premium' THEN
      v_daily_rate := 0.05;
      v_min_amount := 60;
      v_max_amount := 100;
    WHEN 'vip' THEN
      v_daily_rate := 0.06;
      v_min_amount := 150;
      v_max_amount := 1000;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid plan type');
  END CASE;
  
  -- Validate amount
  IF p_amount < v_min_amount OR p_amount > v_max_amount THEN
    RETURN json_build_object('success', false, 'error', 'Amount out of range', 'min', v_min_amount, 'max', v_max_amount);
  END IF;
  
  -- Check balance
  SELECT COALESCE(balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct balance
  UPDATE profiles 
  SET balance = balance - p_amount, updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create investment
  INSERT INTO mining_investments (user_id, plan_type, invested_amount, daily_rate)
  VALUES (v_user_id, p_plan_type, p_amount, v_daily_rate)
  RETURNING id INTO v_investment_id;
  
  RETURN json_build_object(
    'success', true, 
    'investment_id', v_investment_id,
    'new_balance', v_new_balance,
    'daily_rate', v_daily_rate
  );
END;
$$;

-- Function to claim mining rewards
CREATE OR REPLACE FUNCTION public.claim_mining_investment_reward(p_investment_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_investment RECORD;
  v_hours_elapsed NUMERIC;
  v_reward NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get investment
  SELECT * INTO v_investment FROM mining_investments 
  WHERE id = p_investment_id AND user_id = v_user_id AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Investment not found');
  END IF;
  
  -- Calculate hours elapsed since last claim
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_investment.last_claim_at)) / 3600;
  
  IF v_hours_elapsed < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Must wait at least 1 hour between claims', 'hours_remaining', 1 - v_hours_elapsed);
  END IF;
  
  -- Calculate reward (daily rate / 24 hours * hours elapsed)
  v_reward := (v_investment.invested_amount * v_investment.daily_rate / 24) * v_hours_elapsed;
  v_reward := ROUND(v_reward, 8);
  
  -- Update investment
  UPDATE mining_investments 
  SET last_claim_at = now(), 
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = p_investment_id;
  
  -- Add balance
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_reward,
      total_earned = COALESCE(total_earned, 0) + v_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object(
    'success', true, 
    'reward', v_reward,
    'new_balance', v_new_balance,
    'hours_elapsed', v_hours_elapsed
  );
END;
$$;

-- Add updated_at column
ALTER TABLE public.mining_investments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
