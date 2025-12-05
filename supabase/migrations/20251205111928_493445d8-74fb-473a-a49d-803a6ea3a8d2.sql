-- Create ads table for PTC system
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 1000,
  remaining_views INTEGER NOT NULL DEFAULT 1000,
  cost_per_view NUMERIC NOT NULL DEFAULT 55,
  reward_per_view NUMERIC NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_views table to track which users viewed which ads
CREATE TABLE public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_amount NUMERIC NOT NULL DEFAULT 20,
  UNIQUE(ad_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ads table
CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
USING (is_active = true AND remaining_views > 0);

CREATE POLICY "Users can view own ads"
ON public.ads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ads"
ON public.ads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads"
ON public.ads
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for ad_views table
CREATE POLICY "Users can view own ad views"
ON public.ad_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create ad views"
ON public.ad_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all ads"
ON public.ads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all ad views"
ON public.ad_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();