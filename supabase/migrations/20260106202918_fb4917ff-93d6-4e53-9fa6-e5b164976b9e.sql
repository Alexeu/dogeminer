-- Create table for user birds
CREATE TABLE public.user_birds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bird_type TEXT NOT NULL CHECK (bird_type IN ('yellow', 'red', 'green', 'blue', 'black')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Create table for user barn (egg storage)
CREATE TABLE public.user_barn (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 4),
  eggs BIGINT NOT NULL DEFAULT 0,
  last_collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_barn ENABLE ROW LEVEL SECURITY;

-- Create policies for user_birds
CREATE POLICY "Users can view their own birds" 
ON public.user_birds 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own birds" 
ON public.user_birds 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birds" 
ON public.user_birds 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_barn
CREATE POLICY "Users can view their own barn" 
ON public.user_barn 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own barn" 
ON public.user_barn 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own barn" 
ON public.user_barn 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to get barn capacity by level
CREATE OR REPLACE FUNCTION public.get_barn_capacity(barn_level INTEGER)
RETURNS BIGINT AS $$
BEGIN
  RETURN CASE barn_level
    WHEN 1 THEN 60000
    WHEN 2 THEN 200000
    WHEN 3 THEN 550000
    WHEN 4 THEN 1500000
    ELSE 60000
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to buy a bird
CREATE OR REPLACE FUNCTION public.buy_bird(bird_type_param TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_price NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get bird price
  v_price := CASE bird_type_param
    WHEN 'yellow' THEN 4
    WHEN 'red' THEN 15
    WHEN 'green' THEN 45
    WHEN 'blue' THEN 85
    WHEN 'black' THEN 250
    ELSE NULL
  END;
  
  IF v_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid bird type');
  END IF;
  
  -- Get current deposit balance
  SELECT deposit_balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_current_balance < v_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct balance
  UPDATE profiles
  SET deposit_balance = deposit_balance - v_price
  WHERE id = v_user_id;
  
  -- Add or update bird
  INSERT INTO user_birds (user_id, bird_type, quantity)
  VALUES (v_user_id, bird_type_param, 1)
  ON CONFLICT (user_id, bird_type) DO UPDATE
  SET quantity = user_birds.quantity + 1;
  
  -- Create barn if not exists
  INSERT INTO user_barn (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'bird_type', bird_type_param, 'price', v_price);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add unique constraint for bird aggregation
ALTER TABLE public.user_birds ADD CONSTRAINT user_birds_user_bird_unique UNIQUE (user_id, bird_type);

-- Function to upgrade barn
CREATE OR REPLACE FUNCTION public.upgrade_barn()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_level INTEGER;
  v_price NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current barn level
  SELECT level INTO v_current_level
  FROM user_barn
  WHERE user_id = v_user_id;
  
  IF v_current_level IS NULL THEN
    v_current_level := 1;
    INSERT INTO user_barn (user_id) VALUES (v_user_id);
  END IF;
  
  IF v_current_level >= 4 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Barn already at max level');
  END IF;
  
  -- Get upgrade price
  v_price := CASE v_current_level
    WHEN 1 THEN 30
    WHEN 2 THEN 65
    WHEN 3 THEN 150
    ELSE 0
  END;
  
  -- Get current deposit balance
  SELECT deposit_balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_current_balance < v_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct balance
  UPDATE profiles
  SET deposit_balance = deposit_balance - v_price
  WHERE id = v_user_id;
  
  -- Upgrade barn
  UPDATE user_barn
  SET level = level + 1
  WHERE user_id = v_user_id;
  
  RETURN jsonb_build_object('success', true, 'new_level', v_current_level + 1, 'price', v_price);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to collect eggs and add to barn
CREATE OR REPLACE FUNCTION public.collect_eggs()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_eggs_per_hour BIGINT := 0;
  v_hours_elapsed NUMERIC;
  v_eggs_generated BIGINT;
  v_barn_capacity BIGINT;
  v_current_eggs BIGINT;
  v_barn_level INTEGER;
  v_last_collected TIMESTAMP WITH TIME ZONE;
  v_bird RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Calculate eggs per hour from all birds
  FOR v_bird IN SELECT bird_type, quantity FROM user_birds WHERE user_id = v_user_id LOOP
    v_eggs_per_hour := v_eggs_per_hour + (
      CASE v_bird.bird_type
        WHEN 'yellow' THEN 80
        WHEN 'red' THEN 380
        WHEN 'green' THEN 1900
        WHEN 'blue' THEN 6000
        WHEN 'black' THEN 28000
        ELSE 0
      END * v_bird.quantity
    );
  END LOOP;
  
  IF v_eggs_per_hour = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No birds to collect from');
  END IF;
  
  -- Get barn info
  SELECT level, eggs, last_collected_at INTO v_barn_level, v_current_eggs, v_last_collected
  FROM user_barn
  WHERE user_id = v_user_id;
  
  IF v_barn_level IS NULL THEN
    INSERT INTO user_barn (user_id) VALUES (v_user_id)
    RETURNING level, eggs, last_collected_at INTO v_barn_level, v_current_eggs, v_last_collected;
  END IF;
  
  v_barn_capacity := get_barn_capacity(v_barn_level);
  
  -- Calculate hours elapsed since last collection
  v_hours_elapsed := EXTRACT(EPOCH FROM (now() - v_last_collected)) / 3600.0;
  v_eggs_generated := FLOOR(v_eggs_per_hour * v_hours_elapsed);
  
  IF v_eggs_generated <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No eggs to collect yet');
  END IF;
  
  -- Add eggs up to capacity
  v_current_eggs := LEAST(v_current_eggs + v_eggs_generated, v_barn_capacity);
  
  UPDATE user_barn
  SET eggs = v_current_eggs, last_collected_at = now()
  WHERE user_id = v_user_id;
  
  RETURN jsonb_build_object('success', true, 'eggs_collected', v_eggs_generated, 'total_eggs', v_current_eggs, 'capacity', v_barn_capacity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to convert eggs to DOGE
CREATE OR REPLACE FUNCTION public.convert_eggs_to_doge(eggs_amount BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_eggs BIGINT;
  v_doge_amount NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Rate: 60000 eggs = 0.0060 DOGE
  IF eggs_amount < 60000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum 60000 eggs required');
  END IF;
  
  -- Get current eggs
  SELECT eggs INTO v_current_eggs
  FROM user_barn
  WHERE user_id = v_user_id;
  
  IF v_current_eggs IS NULL OR v_current_eggs < eggs_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough eggs');
  END IF;
  
  -- Calculate DOGE (60000 eggs = 0.0060 DOGE)
  v_doge_amount := (eggs_amount::NUMERIC / 60000.0) * 0.0060;
  
  -- Deduct eggs
  UPDATE user_barn
  SET eggs = eggs - eggs_amount
  WHERE user_id = v_user_id;
  
  -- Add to mining balance
  UPDATE profiles
  SET mining_balance = mining_balance + v_doge_amount
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object('success', true, 'eggs_converted', eggs_amount, 'doge_received', v_doge_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;