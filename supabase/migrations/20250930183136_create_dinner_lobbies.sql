/*
  # Dinner Lobby System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `age` (integer)
      - `photo_url` (text)
      - `activities` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `dinner_lobbies`
      - `id` (uuid, primary key)
      - `host_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `cuisine_type` (text)
      - `max_participants` (integer, default 4)
      - `current_participants` (integer, default 1)
      - `scheduled_time` (timestamp)
      - `location_name` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `status` (text: open, full, started, completed, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lobby_participants`
      - `id` (uuid, primary key)
      - `lobby_id` (uuid, references dinner_lobbies)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `status` (text: joined, left, kicked)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their data
    - Policies for viewing public lobbies
    - Policies for joining/leaving lobbies
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL,
  age integer,
  photo_url text,
  activities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS dinner_lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cuisine_type text,
  max_participants integer DEFAULT 4 CHECK (max_participants >= 2 AND max_participants <= 10),
  current_participants integer DEFAULT 1,
  scheduled_time timestamptz NOT NULL,
  location_name text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  status text DEFAULT 'open' CHECK (status IN ('open', 'full', 'started', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dinner_lobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open lobbies"
  ON dinner_lobbies FOR SELECT
  TO authenticated
  USING (status IN ('open', 'full'));

CREATE POLICY "Host can update own lobby"
  ON dinner_lobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can create lobbies"
  ON dinner_lobbies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can delete own lobby"
  ON dinner_lobbies FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE TABLE IF NOT EXISTS lobby_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES dinner_lobbies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked')),
  UNIQUE(lobby_id, user_id)
);

ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lobby participants"
  ON lobby_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join lobbies"
  ON lobby_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies"
  ON lobby_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Host can manage participants"
  ON lobby_participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dinner_lobbies
      WHERE dinner_lobbies.id = lobby_participants.lobby_id
      AND dinner_lobbies.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dinner_lobbies
      WHERE dinner_lobbies.id = lobby_participants.lobby_id
      AND dinner_lobbies.host_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_lobbies_status ON dinner_lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobbies_scheduled_time ON dinner_lobbies(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_participants_lobby ON lobby_participants(lobby_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON lobby_participants(user_id);
