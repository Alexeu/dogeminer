-- Add username column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create function to extract username from email
CREATE OR REPLACE FUNCTION public.extract_username_from_email(email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(SPLIT_PART(email, '@', 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-set username on insert if not provided
CREATE OR REPLACE FUNCTION public.set_username_from_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username := public.extract_username_from_email(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS set_username_trigger ON public.profiles;
CREATE TRIGGER set_username_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_username_from_email();