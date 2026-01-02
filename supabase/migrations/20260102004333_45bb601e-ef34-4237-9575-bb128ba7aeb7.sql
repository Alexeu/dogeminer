-- RPC to deactivate (soft-delete) an ad using POST (avoids PATCH fetch issues)
CREATE OR REPLACE FUNCTION public.deactivate_ad(p_ad_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.ads
  SET is_active = false,
      updated_at = now()
  WHERE id = p_ad_id
    AND user_id = auth.uid();

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Ad not found or not owned by user');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.deactivate_ad(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deactivate_ad(uuid) TO authenticated;