-- Update apply_referral_code to remove welcome bonus, only link the referral
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_referrer_id UUID;
  v_already_referred TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT referred_by INTO v_already_referred FROM profiles WHERE id = v_user_id;
  
  IF v_already_referred IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = p_code AND id != v_user_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Only link the referral, no welcome bonus
  UPDATE profiles 
  SET referred_by = p_code,
      updated_at = now()
  WHERE id = v_user_id;
  
  RETURN json_build_object('success', true, 'message', 'Referral code applied successfully');
END;
$function$;