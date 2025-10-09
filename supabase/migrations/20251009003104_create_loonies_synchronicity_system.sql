/*
  # Loonies Synchronicity Platform - Core System
  
  ## Overview
  Denne migration opretter kernefunktionaliteten for Loonies - en "neighborhood operating system"
  der automatisk forbinder mennesker inden for 2km baseret på deres real-time aktiviteter.
  
  ## Nye Tabeller
  
  ### 1. user_activities
  Real-time aktivitets detection og tracking
  - `user_id` - Reference til bruger
  - `activity_type` - Type aktivitet (coffee, lunch, commute, exercise, leisure)
  - `venue_type` - Type venue (cafe, restaurant, gym, park, etc.)
  - `location` - PostGIS point for præcis lokation
  - `latitude` & `longitude` - Koordinater
  - `location_name` - Menneske-læsbart stedsnavn
  - `confidence` - ML confidence score (0-1)
  - `speed` - Hastighed i m/s (hjælper med detection)
  - `detected_at` - Tidspunkt for detection
  - `expires_at` - Hvornår aktiviteten udløber (auto-cleanup)
  
  ### 2. activity_patterns
  Lær brugerens daglige rytmer for bedre matching
  - `user_id` - Reference til bruger
  - `day_of_week` - Ugedag (0-6, søndag=0)
  - `time_slot` - Time på dagen (format: HH:00)
  - `activity_type` - Typisk aktivitet på dette tidspunkt
  - `location_name` - Typisk lokation
  - `frequency` - Hvor ofte dette sker (0-1)
  - `last_occurred` - Sidste gang dette skete
  
  ### 3. synchronicities
  Matches mellem brugere baseret på aktivitet og lokation
  - `id` - Primary key
  - `user_ids` - Array af bruger IDs der matcher
  - `activity_type` - Delt aktivitet
  - `location_name` - Hvor synkroniciteten sker
  - `latitude` & `longitude` - Koordinater
  - `sync_score` - Match quality (0-1, baseret på timing, distance, patterns)
  - `distance_meters` - Distance mellem brugere
  - `lobby_created` - Om der blev oprettet en lobby
  - `lobby_id` - Reference til oprettet lobby
  - `expires_at` - Hvornår muligheden udløber
  - `notified_at` - Hvornår brugere blev notificeret
  
  ### 4. karma_transactions
  Komplet karma økonomi system
  - `id` - Primary key
  - `user_id` - Bruger der modtager/mister karma
  - `amount` - Karma points (+/-)
  - `transaction_type` - Type: help_given, help_received, request, emergency, bonus
  - `related_user_id` - Anden bruger involveret (hvis relevant)
  - `description` - Menneske-læsbar beskrivelse
  - `multiplier` - Weather/time multiplier (1.0, 1.5, 2.0)
  - `metadata` - JSON med ekstra info (weather, time, task details)
  
  ### 5. auto_lobbies
  Automatisk genererede lobbies baseret på synchronicities
  - Extends existing dinner_lobbies functionality
  - `is_auto_generated` - Om lobby blev auto-created
  - `synchronicity_id` - Reference til synchronicity
  - `min_participants` - Minimum deltagere (typisk 2-3)
  - `auto_start_at` - Hvornår lobby auto-starter
  
  ## Sikkerhed
  - RLS enabled på alle tabeller
  - Brugere kan kun se egne aktiviteter og patterns
  - Synchronicities synlige for involverede brugere
  - Karma transactions synlige for ejer
  - Public lobbies synlige for alle aktive brugere
  
  ## Indexes
  - Spatial indexes for hurtig geolocation søgning
  - Time-based indexes for activity cleanup
  - Composite indexes for matching queries
  
  ## Notes
  - Aktiviteter auto-expires efter 60 minutter
  - Synchronicities cleanup efter 24 timer
  - Karma balance beregnes real-time fra transactions
*/

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USER ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('coffee', 'lunch', 'dinner', 'commute', 'exercise', 'leisure', 'work', 'shopping', 'social')),
  venue_type text CHECK (venue_type IN ('cafe', 'restaurant', 'bar', 'gym', 'park', 'coworking', 'cinema', 'shop', 'venue', 'outdoor', 'transit', 'home')),
  location geography(POINT),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  location_name text,
  confidence numeric DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  speed numeric DEFAULT 0 CHECK (speed >= 0),
  detected_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ACTIVITY PATTERNS TABLE
CREATE TABLE IF NOT EXISTS activity_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot text NOT NULL,
  activity_type text NOT NULL,
  location_name text,
  latitude numeric,
  longitude numeric,
  frequency numeric DEFAULT 0 CHECK (frequency >= 0 AND frequency <= 1),
  occurrence_count integer DEFAULT 1,
  last_occurred timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, time_slot, activity_type)
);

-- 3. SYNCHRONICITIES TABLE
CREATE TABLE IF NOT EXISTS synchronicities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ids uuid[] NOT NULL,
  activity_type text NOT NULL,
  location_name text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  sync_score numeric NOT NULL CHECK (sync_score >= 0 AND sync_score <= 1),
  distance_meters numeric NOT NULL,
  lobby_created boolean DEFAULT false,
  lobby_id uuid REFERENCES dinner_lobbies(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 minutes'),
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. KARMA TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS karma_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('help_given', 'help_received', 'request', 'emergency', 'bonus', 'penalty', 'reward')),
  related_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  multiplier numeric DEFAULT 1.0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add karma_balance to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'karma_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN karma_balance integer DEFAULT 10;
  END IF;
END $$;

-- Add privacy_level to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'privacy_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN privacy_level text DEFAULT 'basic' CHECK (privacy_level IN ('basic', 'enhanced', 'full'));
  END IF;
END $$;

-- Add auto-lobby fields to dinner_lobbies if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dinner_lobbies' AND column_name = 'is_auto_generated'
  ) THEN
    ALTER TABLE dinner_lobbies ADD COLUMN is_auto_generated boolean DEFAULT false;
    ALTER TABLE dinner_lobbies ADD COLUMN synchronicity_id uuid REFERENCES synchronicities(id) ON DELETE SET NULL;
    ALTER TABLE dinner_lobbies ADD COLUMN min_participants integer DEFAULT 2;
    ALTER TABLE dinner_lobbies ADD COLUMN auto_start_at timestamptz;
  END IF;
END $$;

-- INDEXES for performance

-- User activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_detected_at ON user_activities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_expires_at ON user_activities(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_location ON user_activities USING GIST(location);

-- Activity patterns indexes
CREATE INDEX IF NOT EXISTS idx_activity_patterns_user_id ON activity_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_patterns_day_time ON activity_patterns(day_of_week, time_slot);
CREATE INDEX IF NOT EXISTS idx_activity_patterns_frequency ON activity_patterns(frequency DESC);

-- Synchronicities indexes
CREATE INDEX IF NOT EXISTS idx_synchronicities_created_at ON synchronicities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_synchronicities_expires_at ON synchronicities(expires_at);
CREATE INDEX IF NOT EXISTS idx_synchronicities_user_ids ON synchronicities USING GIN(user_ids);
CREATE INDEX IF NOT EXISTS idx_synchronicities_score ON synchronicities(sync_score DESC);
CREATE INDEX IF NOT EXISTS idx_synchronicities_lobby_created ON synchronicities(lobby_created);

-- Karma transactions indexes
CREATE INDEX IF NOT EXISTS idx_karma_transactions_user_id ON karma_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_created_at ON karma_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_type ON karma_transactions(transaction_type);

-- ROW LEVEL SECURITY

-- User activities RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON user_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON user_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Activity patterns RLS
ALTER TABLE activity_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns"
  ON activity_patterns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns"
  ON activity_patterns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns"
  ON activity_patterns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns"
  ON activity_patterns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Synchronicities RLS
ALTER TABLE synchronicities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view synchronicities they are part of"
  ON synchronicities FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(user_ids));

CREATE POLICY "System can create synchronicities"
  ON synchronicities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update synchronicities"
  ON synchronicities FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(user_ids))
  WITH CHECK (auth.uid() = ANY(user_ids));

-- Karma transactions RLS
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own karma transactions"
  ON karma_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create karma transactions"
  ON karma_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- FUNCTIONS

-- Function to calculate user's current karma balance
CREATE OR REPLACE FUNCTION get_karma_balance(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 10)::integer
  FROM karma_transactions
  WHERE user_id = p_user_id;
$$;

-- Function to find nearby active users
CREATE OR REPLACE FUNCTION find_nearby_users(
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_radius_meters numeric DEFAULT 2000
)
RETURNS TABLE (
  user_id uuid,
  distance_meters numeric,
  activity_type text,
  location_name text,
  detected_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    ua.user_id,
    ST_Distance(
      ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
      ua.location
    ) as distance_meters,
    ua.activity_type,
    ua.location_name,
    ua.detected_at
  FROM user_activities ua
  WHERE ua.user_id != p_user_id
    AND ua.expires_at > now()
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
      ua.location,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
$$;

-- Function to cleanup expired activities
CREATE OR REPLACE FUNCTION cleanup_expired_activities()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM user_activities WHERE expires_at < now();
  DELETE FROM synchronicities WHERE expires_at < now() AND lobby_created = false;
$$;

-- Update updated_at timestamp on activity_patterns
CREATE OR REPLACE FUNCTION update_activity_patterns_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_activity_patterns_timestamp
  BEFORE UPDATE ON activity_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_patterns_updated_at();
