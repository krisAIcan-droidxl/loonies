/*
  # Opret User Presence Tabel

  1. Ny Tabel
    - `user_presence`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique)
      - `is_online` (boolean, default false)
      - `last_seen` (timestamptz)
      - `is_available` (boolean, default false)
      - `availability_preset` (integer, 30/60/90 min)
      - `availability_expires_at` (timestamptz)
      - `is_snoozed` (boolean, default false)
      - `current_latitude` (numeric)
      - `current_longitude` (numeric)
      - `location_updated_at` (timestamptz)
      - `websocket_connection_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view online/available users (for matching)
    - Users can only update their own presence

  3. Indexes
    - user_id (unique)
    - is_online, is_available (for filtering)
    - availability_expires_at (for cleanup)

  4. Realtime
    - Add to supabase_realtime publication
*/

-- Opret user_presence tabel
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Online status
  is_online boolean NOT NULL DEFAULT false,
  last_seen timestamptz NOT NULL DEFAULT now(),
  
  -- Availability
  is_available boolean NOT NULL DEFAULT false,
  availability_preset integer CHECK (availability_preset IN (30, 60, 90)),
  availability_expires_at timestamptz,
  is_snoozed boolean NOT NULL DEFAULT false,
  
  -- Location (only when available)
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  location_updated_at timestamptz,
  
  -- Session
  websocket_connection_id text,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Opret indexes
CREATE INDEX IF NOT EXISTS idx_presence_user_id ON public.user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_online_available ON public.user_presence(is_online, is_available) 
  WHERE is_online = true AND is_available = true AND is_snoozed = false;
CREATE INDEX IF NOT EXISTS idx_presence_expires_at ON public.user_presence(availability_expires_at) 
  WHERE availability_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_presence_location ON public.user_presence(current_latitude, current_longitude)
  WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view online users (for nearby matching)
CREATE POLICY "Anyone can view online available users" ON public.user_presence
  FOR SELECT
  TO authenticated
  USING (is_online = true AND is_available = true AND is_snoozed = false);

-- Users can view their own presence
CREATE POLICY "Users can view own presence" ON public.user_presence
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own presence
CREATE POLICY "Users can insert own presence" ON public.user_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presence
CREATE POLICY "Users can update own presence" ON public.user_presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger til auto-update af updated_at
DROP TRIGGER IF EXISTS update_presence_updated_at ON public.user_presence;
CREATE TRIGGER update_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tilføj til realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
  END IF;
END $$;

-- Function til at expire availability
CREATE OR REPLACE FUNCTION expire_availability()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_presence
  SET 
    is_available = false,
    availability_expires_at = NULL,
    availability_preset = NULL
  WHERE is_available = true
    AND availability_expires_at IS NOT NULL
    AND availability_expires_at < now();
END;
$$;

-- Function til at sætte user offline når de ikke har været aktive
CREATE OR REPLACE FUNCTION set_inactive_users_offline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_presence
  SET is_online = false
  WHERE is_online = true
    AND last_seen < now() - interval '5 minutes';
END;
$$;
