-- Drop the old restrictive insert policy
DROP POLICY IF EXISTS "Only system can create notifications" ON public.notifications;

-- Create a new policy that allows service role (edge functions) to insert
CREATE POLICY "Service role can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Revoke direct insert from anon and authenticated (only service role can insert)
REVOKE INSERT ON public.notifications FROM anon, authenticated;
GRANT INSERT ON public.notifications TO service_role;