-- Create staking table
CREATE TABLE public.staking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  duration_days integer NOT NULL CHECK (duration_days IN (30, 90, 180)),
  bonus_rate numeric NOT NULL CHECK (bonus_rate IN (0.10, 0.15, 0.20)),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  reward_amount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own staking" ON public.staking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own staking" ON public.staking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own staking" ON public.staking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all staking" ON public.staking
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create a stake
CREATE OR REPLACE FUNCTION public.create_stake(
  p_amount numeric,
  p_duration_days integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_bonus_rate numeric;
  v_ends_at timestamp with time zone;
  v_current_deposit_balance numeric;
  v_stake_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Determine bonus rate based on duration
  CASE p_duration_days
    WHEN 30 THEN v_bonus_rate := 0.10;
    WHEN 90 THEN v_bonus_rate := 0.15;
    WHEN 180 THEN v_bonus_rate := 0.20;
    ELSE RETURN jsonb_build_object('success', false, 'error', 'Invalid duration');
  END CASE;

  -- Check deposit balance
  SELECT deposit_balance INTO v_current_deposit_balance
  FROM profiles WHERE id = v_user_id;

  IF v_current_deposit_balance IS NULL OR v_current_deposit_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient deposit balance');
  END IF;

  -- Calculate end date
  v_ends_at := now() + (p_duration_days || ' days')::interval;

  -- Subtract from deposit balance
  UPDATE profiles
  SET deposit_balance = deposit_balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id;

  -- Create stake
  INSERT INTO staking (user_id, amount, duration_days, bonus_rate, ends_at)
  VALUES (v_user_id, p_amount, p_duration_days, v_bonus_rate, v_ends_at)
  RETURNING id INTO v_stake_id;

  RETURN jsonb_build_object(
    'success', true,
    'stake_id', v_stake_id,
    'amount', p_amount,
    'duration_days', p_duration_days,
    'bonus_rate', v_bonus_rate,
    'ends_at', v_ends_at
  );
END;
$$;

-- Function to claim completed stake
CREATE OR REPLACE FUNCTION public.claim_stake(p_stake_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_stake RECORD;
  v_reward numeric;
  v_total_return numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get stake
  SELECT * INTO v_stake FROM staking
  WHERE id = p_stake_id AND user_id = v_user_id AND status = 'active';

  IF v_stake IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stake not found or already claimed');
  END IF;

  -- Check if stake period has ended
  IF v_stake.ends_at > now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stake period has not ended yet');
  END IF;

  -- Calculate reward
  v_reward := v_stake.amount * v_stake.bonus_rate;
  v_total_return := v_stake.amount + v_reward;

  -- Update stake status
  UPDATE staking
  SET status = 'completed',
      completed_at = now(),
      reward_amount = v_reward,
      updated_at = now()
  WHERE id = p_stake_id;

  -- Return funds + reward to deposit balance
  UPDATE profiles
  SET deposit_balance = deposit_balance + v_total_return,
      total_earned = total_earned + v_reward,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'amount_returned', v_stake.amount,
    'reward', v_reward,
    'total_return', v_total_return
  );
END;
$$;

-- Function to get user's total staked amount (for withdrawal checks)
CREATE OR REPLACE FUNCTION public.get_total_staked()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM staking
  WHERE user_id = auth.uid() AND status = 'active';
$$;