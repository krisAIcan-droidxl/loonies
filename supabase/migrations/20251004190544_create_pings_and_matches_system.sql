/*
  # Opret Ping og Match System
  
  1. Nye Tabeller
    - `pings`
      - `id` (uuid, primary key)
      - `from_user` (uuid, references auth.users)
      - `to_user` (uuid, references auth.users)
      - `activity` (text, default 'coffee')
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, default now() + 15 min)
      - `status` (text, check: pending/accepted/ignored/expired)
    
    - `matches`
      - `id` (uuid, primary key)
      - `user_a` (uuid, references auth.users)
      - `user_b` (uuid, references auth.users)
      - `activity` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, default now() + 30 min)
  
  2. Security
    - Enable RLS på begge tabeller
    - Pings: Kun afsender og modtager kan se deres egne pings
    - Matches: Kun deltagere kan se deres egne matches
    - Insert/Update policies kun for involverede parter
  
  3. Realtime
    - Tilføj pings til supabase_realtime publication
*/

-- Opret pings tabel
CREATE TABLE IF NOT EXISTS public.pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity text NOT NULL DEFAULT 'coffee',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'ignored', 'expired'))
);

-- Opret matches tabel
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);

-- Opret indexes for performance
CREATE INDEX IF NOT EXISTS idx_pings_to_user ON public.pings(to_user);
CREATE INDEX IF NOT EXISTS idx_pings_from_user ON public.pings(from_user);
CREATE INDEX IF NOT EXISTS idx_pings_status ON public.pings(status);
CREATE INDEX IF NOT EXISTS idx_pings_expires_at ON public.pings(expires_at);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b);
CREATE INDEX IF NOT EXISTS idx_matches_expires_at ON public.matches(expires_at);

-- Enable RLS
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Pings Policies: Kun afsender eller modtager kan se
CREATE POLICY "Users can view their own pings" ON public.pings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "Users can send pings" ON public.pings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Parties can update ping status" ON public.pings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user OR auth.uid() = to_user);

-- Matches Policies: Kun deltagere kan se
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (user_a, user_b));

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (user_a, user_b));

-- Tilføj pings til realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'pings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pings;
  END IF;
END $$;

-- Tilføj matches til realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;

-- Function til at automatisk markere udløbne pings
CREATE OR REPLACE FUNCTION expire_old_pings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.pings
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$;

-- Function til at slette udløbne matches
CREATE OR REPLACE FUNCTION cleanup_expired_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.matches
  WHERE expires_at < now();
END;
$$;
