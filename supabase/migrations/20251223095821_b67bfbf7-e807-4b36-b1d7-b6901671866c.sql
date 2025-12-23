-- Create shortlink completions table
CREATE TABLE public.shortlink_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL DEFAULT 0.055,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shortlink_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own shortlink completions" 
ON public.shortlink_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shortlink completions" 
ON public.shortlink_completions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to complete shortlink
CREATE OR REPLACE FUNCTION public.complete_shortlink(p_provider TEXT, p_reward NUMERIC DEFAULT 0.055)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Insert completion record
  INSERT INTO shortlink_completions (user_id, provider, reward_amount)
  VALUES (v_user_id, p_provider, p_reward);
  
  -- Add reward to mining balance
  UPDATE profiles 
  SET mining_balance = COALESCE(mining_balance, 0) + p_reward,
      total_earned = COALESCE(total_earned, 0) + p_reward,
      updated_at = now()
  WHERE id = v_user_id;
  
  RETURN json_build_object('success', true, 'reward', p_reward);
END;
$$;