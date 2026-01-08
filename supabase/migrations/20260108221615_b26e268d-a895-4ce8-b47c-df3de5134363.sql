-- Create table for social tasks
CREATE TABLE public.social_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_amount DECIMAL(18,8) NOT NULL DEFAULT 0.25,
  UNIQUE(user_id, task_type)
);

-- Enable RLS
ALTER TABLE public.social_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.social_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.social_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_social_tasks_user_id ON public.social_tasks(user_id);

-- Function to complete a social task and add reward
CREATE OR REPLACE FUNCTION public.complete_social_task(p_task_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_reward DECIMAL(18,8) := 0.25;
  v_existing_task UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check if task already completed
  SELECT id INTO v_existing_task
  FROM public.social_tasks
  WHERE user_id = v_user_id AND task_type = p_task_type;
  
  IF v_existing_task IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_completed');
  END IF;
  
  -- Insert the completed task
  INSERT INTO public.social_tasks (user_id, task_type, reward_amount)
  VALUES (v_user_id, p_task_type, v_reward);
  
  -- Add reward to user's balance
  UPDATE public.profiles
  SET balance = COALESCE(balance, 0) + v_reward
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object('success', true, 'reward', v_reward);
END;
$$;