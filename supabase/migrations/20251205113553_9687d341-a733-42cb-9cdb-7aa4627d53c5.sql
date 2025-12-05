-- Create lottery pools table
CREATE TABLE public.lottery_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  character_rarity TEXT NOT NULL,
  ticket_price NUMERIC NOT NULL,
  total_tickets INTEGER NOT NULL DEFAULT 5000,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  winner_user_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create lottery tickets table
CREATE TABLE public.lottery_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.lottery_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  ticket_count INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lottery_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for lottery_pools
CREATE POLICY "Anyone can view active lottery pools"
ON public.lottery_pools FOR SELECT
USING (status = 'active' OR status = 'completed');

CREATE POLICY "Admins can manage lottery pools"
ON public.lottery_pools FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for lottery_tickets
CREATE POLICY "Users can view own tickets"
ON public.lottery_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can buy tickets"
ON public.lottery_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
ON public.lottery_tickets FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to buy lottery tickets
CREATE OR REPLACE FUNCTION public.buy_lottery_tickets(
  p_pool_id UUID,
  p_ticket_count INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_pool RECORD;
  v_total_cost NUMERIC;
  v_user_balance NUMERIC;
  v_available_tickets INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get pool info
  SELECT * INTO v_pool FROM lottery_pools WHERE id = p_pool_id AND status = 'active' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Lottery pool not found or not active');
  END IF;
  
  v_available_tickets := v_pool.total_tickets - v_pool.sold_tickets;
  
  IF p_ticket_count > v_available_tickets THEN
    RETURN json_build_object('success', false, 'error', 'Not enough tickets available');
  END IF;
  
  v_total_cost := v_pool.ticket_price * p_ticket_count;
  
  -- Get user balance
  SELECT balance INTO v_user_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
  
  IF v_user_balance < v_total_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct balance
  UPDATE profiles SET balance = balance - v_total_cost WHERE id = v_user_id;
  
  -- Add tickets
  INSERT INTO lottery_tickets (pool_id, user_id, ticket_count)
  VALUES (p_pool_id, v_user_id, p_ticket_count)
  ON CONFLICT DO NOTHING;
  
  -- If user already has tickets, update count
  UPDATE lottery_tickets 
  SET ticket_count = ticket_count + p_ticket_count 
  WHERE pool_id = p_pool_id AND user_id = v_user_id;
  
  -- Update sold tickets
  UPDATE lottery_pools SET sold_tickets = sold_tickets + p_ticket_count WHERE id = p_pool_id;
  
  RETURN json_build_object('success', true, 'tickets_bought', p_ticket_count, 'total_cost', v_total_cost);
END;
$$;

-- Function to draw lottery winner
CREATE OR REPLACE FUNCTION public.draw_lottery_winner(p_pool_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool RECORD;
  v_winner_id UUID;
  v_total_tickets INTEGER;
  v_random_ticket INTEGER;
  v_cumulative INTEGER := 0;
  v_ticket RECORD;
BEGIN
  -- Get pool
  SELECT * INTO v_pool FROM lottery_pools WHERE id = p_pool_id FOR UPDATE;
  
  IF NOT FOUND OR v_pool.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Pool not found or not active');
  END IF;
  
  IF v_pool.sold_tickets < v_pool.total_tickets THEN
    RETURN json_build_object('success', false, 'error', 'Not all tickets sold yet');
  END IF;
  
  -- Random number between 1 and total tickets
  v_random_ticket := floor(random() * v_pool.sold_tickets) + 1;
  
  -- Find winner based on weighted tickets
  FOR v_ticket IN SELECT user_id, ticket_count FROM lottery_tickets WHERE pool_id = p_pool_id ORDER BY purchased_at LOOP
    v_cumulative := v_cumulative + v_ticket.ticket_count;
    IF v_cumulative >= v_random_ticket THEN
      v_winner_id := v_ticket.user_id;
      EXIT;
    END IF;
  END LOOP;
  
  -- Update pool with winner
  UPDATE lottery_pools 
  SET winner_user_id = v_winner_id, status = 'completed', completed_at = now()
  WHERE id = p_pool_id;
  
  RETURN json_build_object('success', true, 'winner_id', v_winner_id);
END;
$$;