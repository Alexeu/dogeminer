-- Function to modify referrals for a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_modify_referrals(
  p_user_id UUID,
  p_amount INTEGER,
  p_operation TEXT -- 'add' or 'subtract'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count BIGINT;
  new_count INTEGER;
  i INTEGER;
  dummy_user_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;

  -- Get current referral count
  SELECT COUNT(*) INTO current_count
  FROM referral_entries
  WHERE referrer_id = p_user_id;

  IF p_operation = 'add' THEN
    -- Add dummy referral entries
    FOR i IN 1..p_amount LOOP
      -- Generate a unique dummy UUID for each fake referred user
      dummy_user_id := gen_random_uuid();
      
      INSERT INTO referral_entries (referrer_id, referred_id, contest_id, created_at)
      VALUES (p_user_id, dummy_user_id, NULL, now());
    END LOOP;
    
    new_count := current_count + p_amount;
  ELSIF p_operation = 'subtract' THEN
    -- Remove the most recent referral entries (up to p_amount)
    DELETE FROM referral_entries
    WHERE id IN (
      SELECT id FROM referral_entries
      WHERE referrer_id = p_user_id
      ORDER BY created_at DESC
      LIMIT p_amount
    );
    
    new_count := GREATEST(0, current_count - p_amount);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid operation');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'previous_count', current_count,
    'new_count', new_count,
    'modified', p_amount
  );
END;
$$;

-- Allow admins to delete referral entries
CREATE POLICY "Admins can delete referrals" 
ON public.referral_entries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));