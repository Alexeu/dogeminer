-- Add level column to user_characters
ALTER TABLE public.user_characters 
ADD COLUMN level integer NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5);

-- Create function to level up a character
CREATE OR REPLACE FUNCTION public.level_up_character(p_character_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_char RECORD;
  v_level_cost NUMERIC;
  v_user_balance NUMERIC;
  v_new_level INTEGER;
  v_bonus_percent NUMERIC;
  v_new_mining_rate NUMERIC;
  v_base_mining_rate NUMERIC;
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
  
  -- Check if already max level
  IF v_user_char.level >= 5 THEN
    RETURN json_build_object('success', false, 'error', 'Character is already at max level');
  END IF;
  
  -- Determine cost based on rarity
  CASE v_user_char.character_rarity
    WHEN 'common' THEN v_level_cost := 2;
    WHEN 'rare' THEN v_level_cost := 3;
    WHEN 'epic' THEN v_level_cost := 4;
    WHEN 'legendary' THEN v_level_cost := 5;
    ELSE v_level_cost := 2; -- starter treated as common
  END CASE;
  
  -- Check balance
  SELECT COALESCE(balance, 0) INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < v_level_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance', 'required', v_level_cost, 'current', v_user_balance);
  END IF;
  
  -- Calculate new level and bonus
  v_new_level := v_user_char.level + 1;
  
  -- Bonus percentages: level 2 = 20%, level 3 = 21%, level 4 = 22%, level 5 = 23%, cumulative would be complex
  -- So we calculate total bonus from level 1 to new level
  -- Level 1 = base (0% bonus)
  -- Level 2 = +20%
  -- Level 3 = +20% + 21% = +41%
  -- Level 4 = +20% + 21% + 22% = +63%
  -- Level 5 = +20% + 21% + 22% + 23% = +86%
  CASE v_new_level
    WHEN 2 THEN v_bonus_percent := 0.20;
    WHEN 3 THEN v_bonus_percent := 0.41;
    WHEN 4 THEN v_bonus_percent := 0.63;
    WHEN 5 THEN v_bonus_percent := 0.86;
    ELSE v_bonus_percent := 0;
  END CASE;
  
  -- Get base mining rate (we need to store or calculate it)
  -- For simplicity, we'll calculate base from current rate and current level bonus
  CASE v_user_char.level
    WHEN 1 THEN v_base_mining_rate := v_user_char.mining_rate;
    WHEN 2 THEN v_base_mining_rate := v_user_char.mining_rate / 1.20;
    WHEN 3 THEN v_base_mining_rate := v_user_char.mining_rate / 1.41;
    WHEN 4 THEN v_base_mining_rate := v_user_char.mining_rate / 1.63;
    WHEN 5 THEN v_base_mining_rate := v_user_char.mining_rate / 1.86;
    ELSE v_base_mining_rate := v_user_char.mining_rate;
  END CASE;
  
  v_new_mining_rate := v_base_mining_rate * (1 + v_bonus_percent);
  
  -- Deduct balance
  UPDATE profiles 
  SET balance = balance - v_level_cost, updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Update character level and mining rate
  UPDATE user_characters 
  SET level = v_new_level, 
      mining_rate = v_new_mining_rate,
      updated_at = now()
  WHERE user_id = v_user_id AND character_id = p_character_id;
  
  RETURN json_build_object(
    'success', true, 
    'new_level', v_new_level,
    'new_mining_rate', v_new_mining_rate,
    'new_balance', v_new_balance,
    'cost', v_level_cost
  );
END;
$$;