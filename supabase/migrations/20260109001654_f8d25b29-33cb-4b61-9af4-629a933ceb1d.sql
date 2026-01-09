-- Create table for user RPGDOGE token balances
CREATE TABLE public.user_rdoge_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  total_purchased NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_rdoge_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own RDOGE tokens" 
ON public.user_rdoge_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all RDOGE tokens" 
ON public.user_rdoge_tokens 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert RDOGE tokens" 
ON public.user_rdoge_tokens 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update RDOGE tokens" 
ON public.user_rdoge_tokens 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete RDOGE tokens" 
ON public.user_rdoge_tokens 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_rdoge_tokens_updated_at
BEFORE UPDATE ON public.user_rdoge_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for admin to modify RDOGE tokens
CREATE OR REPLACE FUNCTION public.admin_modify_rdoge_tokens(
  p_user_id UUID,
  p_amount NUMERIC,
  p_operation TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Get or create token record
  INSERT INTO user_rdoge_tokens (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM user_rdoge_tokens
  WHERE user_id = p_user_id;

  -- Calculate new balance
  IF p_operation = 'add' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSIF p_operation = 'subtract' THEN
    v_new_balance := GREATEST(0, v_current_balance - p_amount);
  ELSIF p_operation = 'set' THEN
    v_new_balance := p_amount;
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid operation');
  END IF;

  -- Update balance
  UPDATE user_rdoge_tokens
  SET balance = v_new_balance,
      total_purchased = CASE WHEN p_operation = 'add' THEN total_purchased + p_amount ELSE total_purchased END,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'operation', p_operation,
    'amount', p_amount
  );
END;
$$;

-- Create function to get user RDOGE balance
CREATE OR REPLACE FUNCTION public.get_rdoge_balance()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance
  FROM user_rdoge_tokens
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(v_balance, 0);
END;
$$;