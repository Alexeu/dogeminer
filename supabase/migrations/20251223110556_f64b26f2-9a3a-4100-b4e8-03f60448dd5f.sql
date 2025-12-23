-- Drop the restrictive update policy and create a proper one that allows deactivation
DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;

CREATE POLICY "Users can update own ads" 
ON public.ads 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);