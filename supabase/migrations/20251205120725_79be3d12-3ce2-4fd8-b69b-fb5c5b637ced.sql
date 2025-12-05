-- Drop overly permissive notifications INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create restrictive policy - only allow system (via service role) to create notifications
-- Service role bypasses RLS, so we deny direct user inserts
CREATE POLICY "Only system can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Note: Notifications are created by database functions (draw_lottery_winner) 
-- which use SECURITY DEFINER and bypass RLS