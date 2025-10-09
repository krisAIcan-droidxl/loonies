/*
  # Synchronicity Network - Advanced Features
  
  ## Overview
  Udvider Loonies til et komplet "neighborhood operating system" med:
  1. Mirror Mode - Find din parallel-person
  2. Rhythm Matching - Match kompatible daglige rytmer
  3. Swarm Intelligence - Detect unusual crowd patterns
  4. Micro-Experiences Marketplace
  5. Neighborhood Micro-Tasks System
  
  ## Nye Tabeller
  
  ### 1. user_rhythms
  Daglige rytmer og mønstre for hver bruger
  - `wake_time` - Typisk vågne-tid
  - `sleep_time` - Typisk sove-tid
  - `lunch_time` - Typisk frokost-tid
  - `workout_pattern` - Trænings mønster
  - `social_peaks` - Peak social aktivitet times
  - `rhythm_type` - early_bird, night_owl, etc.
  
  ### 2. mirror_matches
  Parallel-personer med næsten identiske rutiner
  - `user_a` & `user_b` - De to brugere
  - `overlap_score` - Hvor meget overlapper deres liv (0-1)
  - `shared_routines` - JSON med delte rutiner
  - `suggested_meetup` - AI-genereret forslag
  
  ### 3. swarm_events
  Spontane crowd-samlinger
  - `location` - Hvor sværmen er
  - `user_count` - Antal mennesker
  - `activity_type` - Hvad de laver
  - `unusual_ratio` - Hvor usædvanligt det er (3.0 = 3x normal)
  - `predicted_duration` - ML forudsigelse
  
  ### 4. experiences
  Micro-experience marketplace
  - `host_id` - Experience vært
  - `title` - Oplevelse titel
  - `experience_type` - micro, mini, skill, branded
  - `duration_minutes` - Varighed
  - `price` - Pris i øre (eller NULL for karma-baseret)
  - `karma_cost` - Karma omkostning (eller NULL for paid)
  - `category` - food, skill, social, outdoor, etc.
  
  ### 5. experience_bookings
  Bookinger af experiences
  - `experience_id` - Reference
  - `participant_id` - Deltager
  - `status` - pending, confirmed, completed, cancelled
  - `payment_status` - Betalings status
  - `check_in_time` - Real check-in
  
  ### 6. micro_tasks
  Neighborhood hjælpe-opgaver
  - `requester_id` - Hvem der beder om hjælp
  - `helper_id` - Hvem der hjælper (NULL før claimed)
  - `task_type` - instant_needs, skill_specific, community_good, emergency
  - `title` - Opgave titel
  - `description` - Beskrivelse
  - `karma_cost` - Karma omkostning for requester
  - `karma_reward` - Karma belønning for helper
  - `urgency` - normal, urgent, emergency
  - `required_skill` - Nødvendig skill (optional)
  
  ### 7. karma_levels
  Karma level system og achievements
  - `user_id` - Bruger
  - `level_name` - newcomer, neighbor, helper, etc.
  - `consecutive_help_days` - Streak
  - `achievements` - JSON array af unlocked achievements
  - `perks_unlocked` - JSON array af perks
  
  ## Sikkerhed
  - RLS på alle tabeller
  - Content moderation for experiences
  - Emergency task broadcasts
  - Safe experience guidelines
*/

-- 1. USER RHYTHMS TABLE
CREATE TABLE IF NOT EXISTS user_rhythms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  wake_time time,
  sleep_time time,
  lunch_time time,
  workout_pattern jsonb DEFAULT '[]'::jsonb,
  commute_pattern jsonb DEFAULT '[]'::jsonb,
  social_peaks integer[] DEFAULT '{}',
  rhythm_type text CHECK (rhythm_type IN ('early_bird', 'night_owl', 'flexible', 'unknown')),
  energy_peaks integer[] DEFAULT '{}',
  coffee_spots text[] DEFAULT '{}',
  favorite_venues text[] DEFAULT '{}',
  weekend_routine jsonb DEFAULT '{}'::jsonb,
  calculated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. MIRROR MATCHES TABLE
CREATE TABLE IF NOT EXISTS mirror_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overlap_score numeric NOT NULL CHECK (overlap_score >= 0 AND overlap_score <= 1),
  shared_routines jsonb DEFAULT '[]'::jsonb,
  routine_similarity numeric DEFAULT 0,
  location_overlap numeric DEFAULT 0,
  time_overlap numeric DEFAULT 0,
  suggested_meetup text,
  is_active boolean DEFAULT true,
  discovered_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_a, user_b)
);

-- 3. SWARM EVENTS TABLE
CREATE TABLE IF NOT EXISTS swarm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location geography(POINT),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  location_name text,
  user_count integer DEFAULT 0,
  user_ids uuid[] DEFAULT '{}',
  activity_type text NOT NULL,
  unusual_ratio numeric DEFAULT 1.0,
  predicted_duration_minutes integer,
  event_trigger text,
  is_active boolean DEFAULT true,
  detected_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '2 hours')
);

-- 4. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  experience_type text NOT NULL CHECK (experience_type IN ('micro', 'mini', 'skill', 'branded')),
  category text NOT NULL CHECK (category IN ('food', 'skill', 'social', 'outdoor', 'culture', 'wellness', 'learning', 'creative')),
  duration_minutes integer NOT NULL CHECK (duration_minutes >= 5 AND duration_minutes <= 240),
  price_ore integer CHECK (price_ore >= 0),
  karma_cost integer CHECK (karma_cost >= 0),
  max_participants integer DEFAULT 1 CHECK (max_participants >= 1 AND max_participants <= 20),
  location_name text,
  latitude numeric,
  longitude numeric,
  is_outdoor boolean DEFAULT false,
  required_items text[] DEFAULT '{}',
  language text DEFAULT 'da',
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active boolean DEFAULT true,
  is_sponsored boolean DEFAULT false,
  sponsor_name text,
  total_bookings integer DEFAULT 0,
  rating_average numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. EXPERIENCE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS experience_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'karma_spent')),
  payment_amount integer,
  karma_spent integer,
  scheduled_time timestamptz NOT NULL,
  check_in_time timestamptz,
  check_out_time timestamptz,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. MICRO TASKS TABLE
CREATE TABLE IF NOT EXISTS micro_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  helper_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  task_type text NOT NULL CHECK (task_type IN ('instant_needs', 'skill_specific', 'community_good', 'emergency')),
  title text NOT NULL,
  description text NOT NULL,
  location_name text,
  latitude numeric,
  longitude numeric,
  karma_cost integer DEFAULT 2,
  karma_reward integer DEFAULT 1,
  urgency text DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  required_skill text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'in_progress', 'completed', 'cancelled', 'expired')),
  max_response_time_minutes integer DEFAULT 60,
  estimated_duration_minutes integer DEFAULT 15,
  claimed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '2 hours'),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now()
);

-- 7. KARMA LEVELS TABLE
CREATE TABLE IF NOT EXISTS karma_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  level_name text DEFAULT 'newcomer' CHECK (level_name IN ('newcomer', 'neighbor', 'helper', 'community_pillar', 'neighborhood_hero')),
  level_number integer DEFAULT 1,
  consecutive_help_days integer DEFAULT 0,
  total_helps_given integer DEFAULT 0,
  total_helps_received integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  experiences_hosted integer DEFAULT 0,
  achievements jsonb DEFAULT '[]'::jsonb,
  perks_unlocked jsonb DEFAULT '[]'::jsonb,
  streak_multiplier numeric DEFAULT 1.0,
  last_help_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INDEXES

-- User rhythms
CREATE INDEX IF NOT EXISTS idx_user_rhythms_user_id ON user_rhythms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rhythms_rhythm_type ON user_rhythms(rhythm_type);

-- Mirror matches
CREATE INDEX IF NOT EXISTS idx_mirror_matches_user_a ON mirror_matches(user_a);
CREATE INDEX IF NOT EXISTS idx_mirror_matches_user_b ON mirror_matches(user_b);
CREATE INDEX IF NOT EXISTS idx_mirror_matches_score ON mirror_matches(overlap_score DESC);
CREATE INDEX IF NOT EXISTS idx_mirror_matches_active ON mirror_matches(is_active);

-- Swarm events
CREATE INDEX IF NOT EXISTS idx_swarm_events_location ON swarm_events USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_swarm_events_detected_at ON swarm_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_swarm_events_active ON swarm_events(is_active);
CREATE INDEX IF NOT EXISTS idx_swarm_events_expires_at ON swarm_events(expires_at);

-- Experiences
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_type ON experiences(experience_type);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_rating ON experiences(rating_average DESC);

-- Experience bookings
CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_participant_id ON experience_bookings(participant_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_status ON experience_bookings(status);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_scheduled_time ON experience_bookings(scheduled_time);

-- Micro tasks
CREATE INDEX IF NOT EXISTS idx_micro_tasks_requester_id ON micro_tasks(requester_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_helper_id ON micro_tasks(helper_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_status ON micro_tasks(status);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_task_type ON micro_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_urgency ON micro_tasks(urgency);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_created_at ON micro_tasks(created_at DESC);

-- Karma levels
CREATE INDEX IF NOT EXISTS idx_karma_levels_user_id ON karma_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_karma_levels_level_number ON karma_levels(level_number DESC);
CREATE INDEX IF NOT EXISTS idx_karma_levels_streak ON karma_levels(consecutive_help_days DESC);

-- ROW LEVEL SECURITY

-- User rhythms
ALTER TABLE user_rhythms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rhythm"
  ON user_rhythms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rhythm"
  ON user_rhythms FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mirror matches
ALTER TABLE mirror_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mirror matches"
  ON mirror_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "System can create mirror matches"
  ON mirror_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Swarm events
ALTER TABLE swarm_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active swarm events"
  ON swarm_events FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "System can manage swarm events"
  ON swarm_events FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Hosts can manage own experiences"
  ON experiences FOR ALL
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Experience bookings
ALTER TABLE experience_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON experience_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_id OR auth.uid() = host_id);

CREATE POLICY "Participants can create bookings"
  ON experience_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Hosts and participants can update bookings"
  ON experience_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant_id OR auth.uid() = host_id)
  WITH CHECK (auth.uid() = participant_id OR auth.uid() = host_id);

-- Micro tasks
ALTER TABLE micro_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view open tasks nearby"
  ON micro_tasks FOR SELECT
  TO authenticated
  USING (status = 'open' OR auth.uid() = requester_id OR auth.uid() = helper_id);

CREATE POLICY "Users can create tasks"
  ON micro_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own tasks or claimed tasks"
  ON micro_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = helper_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = helper_id);

-- Karma levels
ALTER TABLE karma_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own karma level"
  ON karma_levels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage karma levels"
  ON karma_levels FOR ALL
  TO authenticated
  WITH CHECK (true);

-- FUNCTIONS

-- Calculate rhythm compatibility score
CREATE OR REPLACE FUNCTION calculate_rhythm_compatibility(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_score numeric := 0;
  v_rhythm1 record;
  v_rhythm2 record;
BEGIN
  SELECT * INTO v_rhythm1 FROM user_rhythms WHERE user_id = p_user1_id;
  SELECT * INTO v_rhythm2 FROM user_rhythms WHERE user_id = p_user2_id;
  
  IF v_rhythm1 IS NULL OR v_rhythm2 IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Similar wake times (+0.3)
  IF ABS(EXTRACT(EPOCH FROM v_rhythm1.wake_time - v_rhythm2.wake_time)) < 3600 THEN
    v_score := v_score + 0.3;
  END IF;
  
  -- Same rhythm type (+0.4)
  IF v_rhythm1.rhythm_type = v_rhythm2.rhythm_type THEN
    v_score := v_score + 0.4;
  END IF;
  
  -- Overlapping social peaks (+0.3)
  IF v_rhythm1.social_peaks && v_rhythm2.social_peaks THEN
    v_score := v_score + 0.3;
  END IF;
  
  RETURN LEAST(v_score, 1.0);
END;
$$;

-- Get nearby open tasks
CREATE OR REPLACE FUNCTION get_nearby_tasks(
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_radius_meters numeric DEFAULT 2000
)
RETURNS TABLE (
  task_id uuid,
  title text,
  task_type text,
  urgency text,
  karma_reward integer,
  distance_meters numeric,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    mt.id as task_id,
    mt.title,
    mt.task_type,
    mt.urgency,
    mt.karma_reward,
    ST_Distance(
      ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
      ST_GeogFromText('POINT(' || mt.longitude || ' ' || mt.latitude || ')')
    ) as distance_meters,
    mt.created_at
  FROM micro_tasks mt
  WHERE mt.status = 'open'
    AND mt.expires_at > now()
    AND mt.latitude IS NOT NULL
    AND mt.longitude IS NOT NULL
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
      ST_GeogFromText('POINT(' || mt.longitude || ' ' || mt.latitude || ')'),
      p_radius_meters
    )
  ORDER BY 
    CASE mt.urgency
      WHEN 'emergency' THEN 1
      WHEN 'urgent' THEN 2
      ELSE 3
    END,
    distance_meters ASC;
$$;

-- Update streak and level
CREATE OR REPLACE FUNCTION update_karma_level(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_karma_balance integer;
  v_new_level_name text;
  v_new_level_number integer;
BEGIN
  -- Get current karma balance
  SELECT karma_balance INTO v_karma_balance FROM profiles WHERE id = p_user_id;
  
  -- Determine level
  IF v_karma_balance < 11 THEN
    v_new_level_name := 'newcomer';
    v_new_level_number := 1;
  ELSIF v_karma_balance < 51 THEN
    v_new_level_name := 'neighbor';
    v_new_level_number := 2;
  ELSIF v_karma_balance < 151 THEN
    v_new_level_name := 'helper';
    v_new_level_number := 3;
  ELSIF v_karma_balance < 501 THEN
    v_new_level_name := 'community_pillar';
    v_new_level_number := 4;
  ELSE
    v_new_level_name := 'neighborhood_hero';
    v_new_level_number := 5;
  END IF;
  
  -- Update or insert karma level
  INSERT INTO karma_levels (user_id, level_name, level_number)
  VALUES (p_user_id, v_new_level_name, v_new_level_number)
  ON CONFLICT (user_id) DO UPDATE
  SET level_name = v_new_level_name,
      level_number = v_new_level_number,
      updated_at = now();
END;
$$;
