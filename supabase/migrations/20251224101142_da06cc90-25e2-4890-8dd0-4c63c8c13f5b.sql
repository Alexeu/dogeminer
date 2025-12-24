-- Enable realtime for deposits table
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;

-- Enable realtime for web_mining_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.web_mining_sessions;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;