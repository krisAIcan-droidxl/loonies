/*
  # Opdater Pings og Matches Schema til Type Definitioner

  1. Schema Ændringer
    - Omdøb kolonner i `pings` tabel:
      - `from_user` → `from_user_id`
      - `to_user` → `to_user_id`
      - `activity` → `activity_tag`
    - Tilføj nye kolonner til `pings`:
      - `message` (text, beskeden i pinget)
      - `responded_at` (timestamptz, hvornår ping blev besvaret)
      - `from_group_id` (uuid, optional group sender)
      - `to_group_id` (uuid, optional group receiver)
      - `suggested_time` (text, foreslået tid)
      - `suggested_location` (text, foreslået sted)
    
    - Opdater `status` check constraint til: pending, accepted, declined, expired
    
    - Opdater `matches` tabel:
      - Omdøb `activity` → `activity_tag`
      - Tilføj `ping_id` reference
      - Ændr expires_at default til 24 timer
    
  2. Indexes
    - Opdater alle indexes til nye kolonnenavne
    - Tilføj nye indexes for performance
  
  3. RLS Policies
    - Opdater policies til nye kolonnenavne
  
  4. Functions
    - Opdater expire_old_pings() til at bruge 'declined' i stedet for 'ignored'
*/

-- Drop eksisterende indexes først
DROP INDEX IF EXISTS public.idx_pings_to_user;
DROP INDEX IF EXISTS public.idx_pings_from_user;
DROP INDEX IF EXISTS public.idx_matches_user_a;
DROP INDEX IF EXISTS public.idx_matches_user_b;

-- Drop eksisterende policies først
DROP POLICY IF EXISTS "Users can view their own pings" ON public.pings;
DROP POLICY IF EXISTS "Users can send pings" ON public.pings;
DROP POLICY IF EXISTS "Parties can update ping status" ON public.pings;
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;

-- Opdater pings tabel struktur
DO $$
BEGIN
  -- Omdøb kolonner hvis de eksisterer med gamle navne
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'from_user'
  ) THEN
    ALTER TABLE public.pings RENAME COLUMN from_user TO from_user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'to_user'
  ) THEN
    ALTER TABLE public.pings RENAME COLUMN to_user TO to_user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'activity'
  ) THEN
    ALTER TABLE public.pings RENAME COLUMN activity TO activity_tag;
  END IF;

  -- Tilføj nye kolonner hvis de ikke eksisterer
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN message text NOT NULL DEFAULT 'Lad os mødes!';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'responded_at'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN responded_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'from_group_id'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN from_group_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'to_group_id'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN to_group_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'suggested_time'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN suggested_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pings' AND column_name = 'suggested_location'
  ) THEN
    ALTER TABLE public.pings ADD COLUMN suggested_location text;
  END IF;
END $$;

-- Opdater status constraint
ALTER TABLE public.pings DROP CONSTRAINT IF EXISTS pings_status_check;
ALTER TABLE public.pings ADD CONSTRAINT pings_status_check 
  CHECK (status IN ('pending', 'accepted', 'declined', 'expired'));

-- Opdater matches tabel struktur
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'activity'
  ) THEN
    ALTER TABLE public.matches RENAME COLUMN activity TO activity_tag;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'ping_id'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN ping_id uuid REFERENCES public.pings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Opdater matches expires_at default til 24 timer
ALTER TABLE public.matches ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');

-- Opret nye indexes
CREATE INDEX IF NOT EXISTS idx_pings_to_user_id ON public.pings(to_user_id);
CREATE INDEX IF NOT EXISTS idx_pings_from_user_id ON public.pings(from_user_id);
CREATE INDEX IF NOT EXISTS idx_pings_status ON public.pings(status);
CREATE INDEX IF NOT EXISTS idx_pings_expires_at ON public.pings(expires_at);
CREATE INDEX IF NOT EXISTS idx_pings_from_group_id ON public.pings(from_group_id) WHERE from_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pings_to_group_id ON public.pings(to_group_id) WHERE to_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b);
CREATE INDEX IF NOT EXISTS idx_matches_ping_id ON public.matches(ping_id);
CREATE INDEX IF NOT EXISTS idx_matches_expires_at ON public.matches(expires_at);

-- Genopret RLS policies med nye kolonnenavne
CREATE POLICY "Users can view their own pings" ON public.pings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send pings" ON public.pings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Parties can update ping status" ON public.pings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (user_a, user_b));

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (user_a, user_b));

-- Opdater expire_old_pings function
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
