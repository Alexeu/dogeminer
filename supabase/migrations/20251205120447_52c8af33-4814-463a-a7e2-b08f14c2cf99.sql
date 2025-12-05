-- Add RLS policies to deny anonymous/public access to sensitive tables

-- Profiles: Deny anonymous SELECT, keep existing authenticated user policies
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Device fingerprints: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to device_fingerprints"
ON public.device_fingerprints
FOR SELECT
TO anon
USING (false);

-- Transactions: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to transactions"
ON public.transactions
FOR SELECT
TO anon
USING (false);

-- Notifications: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to notifications"
ON public.notifications
FOR SELECT
TO anon
USING (false);

-- Ad views: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to ad_views"
ON public.ad_views
FOR SELECT
TO anon
USING (false);

-- Lottery tickets: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to lottery_tickets"
ON public.lottery_tickets
FOR SELECT
TO anon
USING (false);

-- User roles: Deny anonymous SELECT
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);