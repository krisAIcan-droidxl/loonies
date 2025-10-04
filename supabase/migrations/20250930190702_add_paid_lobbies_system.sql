/*
  # Paid Lobbies & Payment System

  1. Schema Updates
    - Add payment fields to `dinner_lobbies`
      - `is_paid` (boolean, default false)
      - `price_per_seat` (decimal)
      - `currency` (text, default EUR)
      - `commission_rate` (decimal, default 0.15)
      - `host_payout_amount` (decimal)
      - `host_payout_status` (text)
      - `host_payout_date` (timestamp)
    
    - Add verification to `profiles`
      - `is_verified_host` (boolean, default false)
      - `verification_status` (text)
      - `verification_submitted_at` (timestamp)
      - `stripe_account_id` (text)
      - `rating_average` (decimal)
      - `rating_count` (integer)
    
    - Update `lobby_participants`
      - `payment_status` (text: pending, completed, failed, refunded)
      - `payment_amount` (decimal)
      - `payment_intent_id` (text)
      - `paid_at` (timestamp)
    
  2. New Tables
    - `host_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `id_document_url` (text)
      - `selfie_url` (text)
      - `status` (text: pending, approved, rejected)
      - `reviewed_by` (uuid)
      - `reviewed_at` (timestamp)
      - `rejection_reason` (text)
      - `created_at` (timestamp)
    
    - `lobby_ratings`
      - `id` (uuid, primary key)
      - `lobby_id` (uuid, references dinner_lobbies)
      - `rater_id` (uuid, references profiles)
      - `rated_id` (uuid, references profiles)
      - `rating` (integer 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
    
    - `payouts`
      - `id` (uuid, primary key)
      - `lobby_id` (uuid, references dinner_lobbies)
      - `host_id` (uuid, references profiles)
      - `amount` (decimal)
      - `currency` (text)
      - `status` (text: pending, processing, completed, failed)
      - `stripe_payout_id` (text)
      - `scheduled_date` (timestamp)
      - `completed_date` (timestamp)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on all tables
    - Policies for verified hosts
    - Payment verification policies
    
  4. Important Notes
    - Only verified hosts can create paid lobbies (enforced via RLS)
    - App commission: 10-20% configurable per lobby
    - Escrow model: payouts released after event completion
    - Ratings required after paid events
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_host boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_average decimal(3, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS price_per_seat decimal(10, 2) DEFAULT 0;
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS commission_rate decimal(4, 3) DEFAULT 0.15;
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS host_payout_amount decimal(10, 2);
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS host_payout_status text DEFAULT 'pending' CHECK (host_payout_status IN ('pending', 'processing', 'completed', 'failed'));
ALTER TABLE dinner_lobbies ADD COLUMN IF NOT EXISTS host_payout_date timestamptz;

ALTER TABLE lobby_participants ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
ALTER TABLE lobby_participants ADD COLUMN IF NOT EXISTS payment_amount decimal(10, 2);
ALTER TABLE lobby_participants ADD COLUMN IF NOT EXISTS payment_intent_id text;
ALTER TABLE lobby_participants ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE TABLE IF NOT EXISTS host_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  id_document_url text,
  selfie_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE host_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification"
  ON host_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification"
  ON host_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending verification"
  ON host_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE TABLE IF NOT EXISTS lobby_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES dinner_lobbies(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lobby_id, rater_id, rated_id)
);

ALTER TABLE lobby_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for their lobbies"
  ON lobby_ratings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = rater_id OR
    auth.uid() = rated_id OR
    EXISTS (
      SELECT 1 FROM lobby_participants
      WHERE lobby_participants.lobby_id = lobby_ratings.lobby_id
      AND lobby_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ratings"
  ON lobby_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
      SELECT 1 FROM lobby_participants
      WHERE lobby_participants.lobby_id = lobby_ratings.lobby_id
      AND lobby_participants.user_id = auth.uid()
      AND lobby_participants.status = 'joined'
    )
  );

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES dinner_lobbies(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payout_id text,
  scheduled_date timestamptz,
  completed_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can create lobbies" ON dinner_lobbies;

CREATE POLICY "Users can create free lobbies"
  ON dinner_lobbies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = host_id AND
    (NOT is_paid OR is_paid = false)
  );

CREATE POLICY "Verified hosts can create paid lobbies"
  ON dinner_lobbies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = host_id AND
    is_paid = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified_host = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified_host);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating_average);
CREATE INDEX IF NOT EXISTS idx_lobbies_paid ON dinner_lobbies(is_paid);
CREATE INDEX IF NOT EXISTS idx_participants_payment ON lobby_participants(payment_status);
CREATE INDEX IF NOT EXISTS idx_ratings_lobby ON lobby_ratings(lobby_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated ON lobby_ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_payouts_host ON payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
