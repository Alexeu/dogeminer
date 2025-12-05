-- Fix SECURITY DEFINER warning by setting view to SECURITY INVOKER
ALTER VIEW public.lottery_pools_public SET (security_invoker = on);