-- Create referral contests table
CREATE TABLE public.referral_contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  first_prize NUMERIC NOT NULL DEFAULT 15,
  second_prize NUMERIC NOT NULL DEFAULT 10,
  third_prize NUMERIC NOT NULL DEFAULT 6,
  min_referrals INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  winner_first_id UUID REFERENCES auth.users(id),
  winner_second_id UUID REFERENCES auth.users(id),
  winner_third_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referral_contests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active/completed contests
CREATE POLICY "Anyone can view contests"
ON public.referral_contests
FOR SELECT
USING (status IN ('active', 'completed'));

-- Admins can manage contests
CREATE POLICY "Admins can manage contests"
ON public.referral_contests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create referral tracking table to track when referrals were made
CREATE TABLE public.referral_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_id UUID NOT NULL REFERENCES auth.users(id),
  contest_id UUID REFERENCES public.referral_contests(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Enable RLS
ALTER TABLE public.referral_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral entries
CREATE POLICY "Users can view own referrals"
ON public.referral_entries
FOR SELECT
USING (auth.uid() = referrer_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referral_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert referrals
CREATE POLICY "Service can insert referrals"
ON public.referral_entries
FOR INSERT
WITH CHECK (true);

-- Function to get referral leaderboard for active contest
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  referral_count BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_contest_id UUID;
  contest_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get active contest
  SELECT id, start_date INTO active_contest_id, contest_start
  FROM referral_contests
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF active_contest_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    re.referrer_id as user_id,
    p.username,
    COUNT(*)::BIGINT as referral_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC)::BIGINT as rank
  FROM referral_entries re
  JOIN profiles p ON p.id = re.referrer_id
  WHERE re.created_at >= contest_start
  GROUP BY re.referrer_id, p.username
  ORDER BY referral_count DESC
  LIMIT 10;
END;
$$;

-- Function to get all users referral stats for admin
CREATE OR REPLACE FUNCTION public.get_all_referral_stats()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  username TEXT,
  referral_code TEXT,
  total_referrals BIGINT,
  contest_referrals BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_contest_id UUID;
  contest_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get active contest
  SELECT id, start_date INTO active_contest_id, contest_start
  FROM referral_contests
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.username,
    p.referral_code,
    (SELECT COUNT(*) FROM referral_entries WHERE referrer_id = p.id)::BIGINT as total_referrals,
    CASE 
      WHEN contest_start IS NOT NULL THEN
        (SELECT COUNT(*) FROM referral_entries WHERE referrer_id = p.id AND created_at >= contest_start)::BIGINT
      ELSE 0::BIGINT
    END as contest_referrals
  FROM profiles p
  WHERE p.referral_code IS NOT NULL
  ORDER BY contest_referrals DESC, total_referrals DESC;
END;
$$;

-- Function to get active contest info
CREATE OR REPLACE FUNCTION public.get_active_contest()
RETURNS TABLE (
  id UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  first_prize NUMERIC,
  second_prize NUMERIC,
  third_prize NUMERIC,
  min_referrals INTEGER,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.start_date,
    rc.end_date,
    rc.first_prize,
    rc.second_prize,
    rc.third_prize,
    rc.min_referrals,
    GREATEST(0, EXTRACT(DAY FROM rc.end_date - now())::INTEGER) as days_remaining
  FROM referral_contests rc
  WHERE rc.status = 'active'
  ORDER BY rc.created_at DESC
  LIMIT 1;
END;
$$;

-- Create the first monthly contest starting today
INSERT INTO public.referral_contests (start_date, end_date, first_prize, second_prize, third_prize, min_referrals)
VALUES (
  now(),
  now() + INTERVAL '1 month',
  15,
  10,
  6,
  10
);