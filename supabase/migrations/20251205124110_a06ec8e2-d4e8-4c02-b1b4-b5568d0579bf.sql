-- Create user_characters table to track character ownership
CREATE TABLE public.user_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  character_rarity TEXT NOT NULL,
  mining_rate NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);

-- Create mining_sessions table to track active mining
CREATE TABLE public.mining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_character_id UUID NOT NULL REFERENCES public.user_characters(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  mining_duration_ms INTEGER NOT NULL DEFAULT 3600000, -- 1 hour
  expected_reward NUMERIC NOT NULL,
  actual_reward NUMERIC,
  UNIQUE(user_character_id, started_at)
);

-- Track starter gift and bonuses in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS starter_gift_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS collection_reward_claimed_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.user_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_characters
CREATE POLICY "Users can view own characters" ON public.user_characters
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters" ON public.user_characters
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON public.user_characters
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all characters" ON public.user_characters
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for mining_sessions
CREATE POLICY "Users can view own mining sessions" ON public.mining_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mining sessions" ON public.mining_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mining sessions" ON public.mining_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mining sessions" ON public.mining_sessions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create secure function to add character (used when purchasing mystery boxes)
CREATE OR REPLACE FUNCTION public.add_user_character(
  p_character_id TEXT,
  p_character_name TEXT,
  p_character_rarity TEXT,
  p_mining_rate NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_char_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Insert or update character quantity
  INSERT INTO public.user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, p_character_id, p_character_name, p_character_rarity, p_mining_rate, 1)
  ON CONFLICT (user_id, character_id) 
  DO UPDATE SET quantity = user_characters.quantity + 1, updated_at = now()
  RETURNING id INTO v_char_id;
  
  RETURN json_build_object('success', true, 'character_id', v_char_id);
END;
$$;

-- Create secure function to claim starter gift (once per user)
CREATE OR REPLACE FUNCTION public.claim_starter_gift(
  p_character_id TEXT,
  p_character_name TEXT,
  p_mining_rate NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_claimed TIMESTAMP WITH TIME ZONE;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already claimed
  SELECT starter_gift_received_at INTO v_already_claimed FROM profiles WHERE id = v_user_id;
  
  IF v_already_claimed IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Starter gift already claimed');
  END IF;
  
  -- Add character
  INSERT INTO public.user_characters (user_id, character_id, character_name, character_rarity, mining_rate, quantity)
  VALUES (v_user_id, p_character_id, p_character_name, 'starter', p_mining_rate, 1)
  ON CONFLICT (user_id, character_id) DO NOTHING;
  
  -- Mark as claimed
  UPDATE profiles SET starter_gift_received_at = now() WHERE id = v_user_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Create secure function to start mining
CREATE OR REPLACE FUNCTION public.start_mining(p_character_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_active_session RECORD;
  v_expected_reward NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get user's character
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  -- Check for active mining session
  SELECT * INTO v_active_session FROM mining_sessions 
  WHERE user_character_id = v_user_char.id AND claimed_at IS NULL;
  
  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Mining already in progress');
  END IF;
  
  -- Calculate expected reward (mining_rate * quantity * 1 hour)
  v_expected_reward := v_user_char.mining_rate * v_user_char.quantity;
  
  -- Create mining session
  INSERT INTO mining_sessions (user_id, user_character_id, expected_reward)
  VALUES (v_user_id, v_user_char.id, v_expected_reward);
  
  RETURN json_build_object('success', true, 'expected_reward', v_expected_reward);
END;
$$;

-- Replace claim_mining_reward with secure version
CREATE OR REPLACE FUNCTION public.claim_mining_reward(p_amount NUMERIC, p_character_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_session RECORD;
  v_elapsed_ms NUMERIC;
  v_progress NUMERIC;
  v_actual_reward NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get user's character
  SELECT * INTO v_user_char FROM user_characters 
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Character not owned');
  END IF;
  
  -- Get active mining session
  SELECT * INTO v_session FROM mining_sessions 
  WHERE user_character_id = v_user_char.id AND claimed_at IS NULL
  ORDER BY started_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active mining session');
  END IF;
  
  -- Calculate elapsed time and reward
  v_elapsed_ms := EXTRACT(EPOCH FROM (now() - v_session.started_at)) * 1000;
  v_progress := LEAST(v_elapsed_ms / v_session.mining_duration_ms, 1);
  v_actual_reward := FLOOR(v_session.expected_reward * v_progress);
  
  IF v_actual_reward <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No rewards to claim yet');
  END IF;
  
  -- Mark session as claimed
  UPDATE mining_sessions 
  SET claimed_at = now(), actual_reward = v_actual_reward
  WHERE id = v_session.id;
  
  -- Add balance and update total earned
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + v_actual_reward,
      total_earned = COALESCE(total_earned, 0) + v_actual_reward,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'claimed_amount', v_actual_reward);
END;
$$;

-- Remove public add_balance function (replace with admin-only version)
DROP FUNCTION IF EXISTS public.add_balance(NUMERIC);

-- Create admin-only add_balance function
CREATE OR REPLACE FUNCTION public.admin_add_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if caller is admin
  IF NOT has_role(v_caller_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + p_amount,
      total_earned = COALESCE(total_earned, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Create function for internal balance additions (used by other secure functions)
CREATE OR REPLACE FUNCTION public.internal_add_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount <= 0 THEN
    RETURN false;
  END IF;
  
  UPDATE profiles 
  SET balance = COALESCE(balance, 0) + p_amount,
      total_earned = COALESCE(total_earned, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- Update trigger for timestamps
CREATE TRIGGER update_user_characters_updated_at
BEFORE UPDATE ON public.user_characters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();