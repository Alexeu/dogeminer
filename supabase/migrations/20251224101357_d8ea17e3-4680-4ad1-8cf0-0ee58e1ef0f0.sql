-- Allow admins to view all deposits
CREATE POLICY "Admins can view all deposits" 
ON public.deposits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update deposits
CREATE POLICY "Admins can update deposits" 
ON public.deposits 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));