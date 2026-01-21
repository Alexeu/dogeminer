-- Create survey_responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('yes_pepe', 'yes_other', 'no')),
  other_coin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own response (one per user)
CREATE POLICY "Users can insert own survey response"
ON public.survey_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own response
CREATE POLICY "Users can view own survey response"
ON public.survey_responses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own response
CREATE POLICY "Users can update own survey response"
ON public.survey_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all responses
CREATE POLICY "Admins can view all survey responses"
ON public.survey_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create unique constraint to allow only one response per user
CREATE UNIQUE INDEX survey_responses_user_unique ON public.survey_responses(user_id);