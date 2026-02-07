
-- Drop the OLD duplicate claim_mining_reward function (parameters in original order)
-- Keep the NEW one (oid 104097) which has the expiration check
DROP FUNCTION IF EXISTS public.claim_mining_reward(p_amount numeric, p_character_id text);
