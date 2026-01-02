-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own ads" ON public.ads;

-- Create a new policy that allows users to see ALL their own ads (active and inactive)
CREATE POLICY "Users can view own ads"
ON public.ads
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure the update policy is correct
DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;
CREATE POLICY "Users can update own ads"
ON public.ads
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for completeness (even though we use soft delete)
DROP POLICY IF EXISTS "Users can delete own ads" ON public.ads;
CREATE POLICY "Users can delete own ads"
ON public.ads
FOR DELETE
USING (auth.uid() = user_id);