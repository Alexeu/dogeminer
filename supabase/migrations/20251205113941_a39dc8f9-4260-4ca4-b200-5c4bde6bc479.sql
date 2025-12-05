-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Update draw_lottery_winner function to create notification
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
  
  -- Create notification for winner
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_winner_id,
    'lottery_win',
    '🎉 ¡Has ganado la lotería!',
    'Felicidades, has ganado el personaje ' || v_pool.character_name || ' en la lotería.',
    json_build_object(
      'pool_id', p_pool_id,
      'character_id', v_pool.character_id,
      'character_name', v_pool.character_name,
      'character_rarity', v_pool.character_rarity
    )
  );
  
  RETURN json_build_object('success', true, 'winner_id', v_winner_id);
END;
$$;