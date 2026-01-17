-- Update admin_modify_balance function to support total_deposited
CREATE OR REPLACE FUNCTION public.admin_modify_balance(
  p_user_id UUID,
  p_balance_type TEXT,
  p_operation TEXT,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF NOT has_role(v_caller_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  IF p_balance_type NOT IN ('mining_balance', 'deposit_balance', 'total_deposited') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid balance type');
  END IF;
  
  IF p_operation NOT IN ('add', 'subtract') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid operation');
  END IF;
  
  -- Get current balance based on type
  IF p_balance_type = 'mining_balance' THEN
    SELECT COALESCE(mining_balance, 0) INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  ELSIF p_balance_type = 'deposit_balance' THEN
    SELECT COALESCE(deposit_balance, 0) INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  ELSE
    SELECT COALESCE(total_deposited, 0) INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  END IF;
  
  IF v_current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Calculate new balance
  IF p_operation = 'add' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSE
    v_new_balance := v_current_balance - p_amount;
    IF v_new_balance < 0 THEN
      v_new_balance := 0;
    END IF;
  END IF;
  
  -- Update the appropriate balance
  IF p_balance_type = 'mining_balance' THEN
    UPDATE profiles 
    SET mining_balance = v_new_balance, updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_balance_type = 'deposit_balance' THEN
    UPDATE profiles 
    SET deposit_balance = v_new_balance, updated_at = now()
    WHERE id = p_user_id;
  ELSE
    UPDATE profiles 
    SET total_deposited = v_new_balance, updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'balance_type', p_balance_type,
    'operation', p_operation,
    'amount', p_amount
  );
END;
$$;