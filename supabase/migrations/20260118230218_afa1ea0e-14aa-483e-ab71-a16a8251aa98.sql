-- Add expires_at column to mining_investments
ALTER TABLE public.mining_investments
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Update existing investments to expire 30 days after creation
UPDATE public.mining_investments
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- Make expires_at NOT NULL with default of 30 days from now for new investments
ALTER TABLE public.mining_investments
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 days'),
ALTER COLUMN expires_at SET NOT NULL;

-- Create function to check and expire old investments
CREATE OR REPLACE FUNCTION public.expire_mining_investments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark investments as inactive if they've expired
  UPDATE mining_investments
  SET is_active = false,
      updated_at = now()
  WHERE is_active = true
    AND expires_at < now();
END;
$$;

-- Update claim_mining_reward to check expiration
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_investment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investment mining_investments%ROWTYPE;
  v_time_elapsed interval;
  v_days_elapsed numeric;
  v_reward numeric;
  v_min_claim numeric := 0.1;
BEGIN
  -- Get investment
  SELECT * INTO v_investment
  FROM mining_investments
  WHERE id = p_investment_id
    AND user_id = auth.uid()
    AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Investment not found or inactive');
  END IF;
  
  -- Check if expired
  IF v_investment.expires_at < now() THEN
    -- Mark as inactive
    UPDATE mining_investments
    SET is_active = false, updated_at = now()
    WHERE id = p_investment_id;
    
    RETURN jsonb_build_object('success', false, 'error', 'Investment has expired after 30 days');
  END IF;
  
  -- Calculate time elapsed since last claim
  v_time_elapsed := now() - v_investment.last_claim_at;
  v_days_elapsed := EXTRACT(EPOCH FROM v_time_elapsed) / 86400.0;
  
  -- Calculate reward: (invested_amount * daily_rate / 100) * days_elapsed
  v_reward := (v_investment.invested_amount * (v_investment.daily_rate / 100.0)) * v_days_elapsed;
  
  -- Check minimum claim amount
  IF v_reward < v_min_claim THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Minimum claim is ' || v_min_claim || ' DOGE',
      'pending_reward', v_reward
    );
  END IF;
  
  -- Update investment
  UPDATE mining_investments
  SET last_claim_at = now(),
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = p_investment_id;
  
  -- Add reward to mining balance
  UPDATE profiles
  SET mining_balance = COALESCE(mining_balance, 0) + v_reward,
      total_earned = COALESCE(total_earned, 0) + v_reward,
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward,
    'total_earned', v_investment.total_earned + v_reward
  );
END;
$$;