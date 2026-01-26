-- Calculate and update historical referral earnings for all users
-- Each referrer gets 5% of their referred users' total_earned

-- First, let's update all referrers with their historical referral earnings
UPDATE public.profiles AS referrer
SET referral_earnings = COALESCE(referral_earnings, 0) + calculated_earnings.total_referral_earnings
FROM (
  SELECT 
    referrer_profile.id AS referrer_id,
    COALESCE(SUM(referred_profile.total_earned * 0.05), 0) AS total_referral_earnings
  FROM public.profiles AS referrer_profile
  INNER JOIN public.profiles AS referred_profile 
    ON referred_profile.referred_by = referrer_profile.referral_code
  WHERE referrer_profile.referral_code IS NOT NULL
    AND referred_profile.total_earned > 0
  GROUP BY referrer_profile.id
) AS calculated_earnings
WHERE referrer.id = calculated_earnings.referrer_id
  AND calculated_earnings.total_referral_earnings > 0;