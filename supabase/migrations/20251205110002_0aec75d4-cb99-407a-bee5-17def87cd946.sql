-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.device_fingerprints CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.check_fingerprint_banned(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_users_by_fingerprint(text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ==========================================
-- RECREATE DATABASE SCHEMA
-- ==========================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USER ROLES TABLE
-- ==========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  faucetpay_address TEXT,
  tx_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- DEVICE FINGERPRINTS TABLE
-- ==========================================
CREATE TABLE public.device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, fingerprint)
);

ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_device_fingerprints_fingerprint ON public.device_fingerprints(fingerprint);
CREATE INDEX idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if fingerprint is banned
CREATE OR REPLACE FUNCTION public.check_fingerprint_banned(fp TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.device_fingerprints df
    JOIN public.profiles p ON df.user_id = p.id
    WHERE df.fingerprint = fp
    AND p.is_banned = TRUE
  )
$$;

-- Function to get users by fingerprint
CREATE OR REPLACE FUNCTION public.get_users_by_fingerprint(fp TEXT)
RETURNS TABLE(user_id UUID, email TEXT, is_banned BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.id, p.email, p.is_banned
  FROM public.device_fingerprints df
  JOIN public.profiles p ON df.user_id = p.id
  WHERE df.fingerprint = fp
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    'BONK' || UPPER(SUBSTR(MD5(NEW.id::TEXT), 1, 6))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- RLS POLICIES - PROFILES
-- ==========================================
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES - USER ROLES
-- ==========================================
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES - TRANSACTIONS
-- ==========================================
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES - DEVICE FINGERPRINTS
-- ==========================================
CREATE POLICY "Users can view own fingerprints"
ON public.device_fingerprints FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fingerprints"
ON public.device_fingerprints FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all fingerprints"
ON public.device_fingerprints FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fingerprints"
ON public.device_fingerprints FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));