-- Add ban fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Create device fingerprints table for multi-account detection
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, fingerprint)
);

-- Enable RLS on device_fingerprints
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Users can insert their own fingerprints
CREATE POLICY "Users can insert own fingerprints"
ON public.device_fingerprints
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own fingerprints
CREATE POLICY "Users can view own fingerprints"
ON public.device_fingerprints
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all fingerprints (for detecting multi-accounts)
CREATE POLICY "Admins can view all fingerprints"
ON public.device_fingerprints
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete fingerprints
CREATE POLICY "Admins can delete fingerprints"
ON public.device_fingerprints
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON public.device_fingerprints(fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);

-- Function to check if fingerprint is associated with banned user
CREATE OR REPLACE FUNCTION public.check_fingerprint_banned(fp TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.device_fingerprints df
    JOIN public.profiles p ON df.user_id = p.id
    WHERE df.fingerprint = fp
    AND p.is_banned = TRUE
  )
$$;

-- Function to get users sharing same fingerprint
CREATE OR REPLACE FUNCTION public.get_users_by_fingerprint(fp TEXT)
RETURNS TABLE(user_id UUID, email TEXT, is_banned BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.id, p.email, p.is_banned
  FROM public.device_fingerprints df
  JOIN public.profiles p ON df.user_id = p.id
  WHERE df.fingerprint = fp
$$;