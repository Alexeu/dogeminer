-- Sync referral_entries from profiles.referred_by
INSERT INTO referral_entries (referrer_id, referred_id, created_at)
SELECT 
  referrer.id as referrer_id,
  referred.id as referred_id,
  referred.created_at
FROM profiles referred
JOIN profiles referrer ON referrer.referral_code = referred.referred_by
WHERE referred.referred_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM referral_entries re 
    WHERE re.referred_id = referred.id
  )
ON CONFLICT (referred_id) DO NOTHING;