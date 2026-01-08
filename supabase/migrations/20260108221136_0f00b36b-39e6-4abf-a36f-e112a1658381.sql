-- Create a table to track online presence
CREATE TABLE public.online_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  fingerprint TEXT,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.online_presence ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read online count (public stat)
CREATE POLICY "Anyone can view online count" 
ON public.online_presence 
FOR SELECT 
USING (true);

-- Allow insert/update for tracking presence
CREATE POLICY "Anyone can track presence" 
ON public.online_presence 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their presence" 
ON public.online_presence 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete their presence" 
ON public.online_presence 
FOR DELETE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_online_presence_last_seen ON public.online_presence(last_seen);

-- Function to clean old presence records (older than 2 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_old_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.online_presence WHERE last_seen < now() - interval '2 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for online_presence table
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_presence;