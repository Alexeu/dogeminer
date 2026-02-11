
ALTER TABLE public.mining_investments DROP CONSTRAINT mining_investments_plan_type_check;
ALTER TABLE public.mining_investments ADD CONSTRAINT mining_investments_plan_type_check CHECK (plan_type IN ('standard', 'medium', 'premium', 'vip', 'mega_vip'));
