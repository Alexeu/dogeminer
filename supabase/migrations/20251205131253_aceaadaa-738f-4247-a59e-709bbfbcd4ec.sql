-- Create a public view for lottery_pools that excludes winner_user_id
CREATE VIEW public.lottery_pools_public AS
SELECT 
  id, 
  character_id, 
  character_name, 
  character_rarity, 
  ticket_price, 
  total_tickets, 
  sold_tickets, 
  status, 
  created_at, 
  completed_at
FROM public.lottery_pools
WHERE status IN ('active', 'completed');

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.lottery_pools_public TO authenticated;
GRANT SELECT ON public.lottery_pools_public TO anon;