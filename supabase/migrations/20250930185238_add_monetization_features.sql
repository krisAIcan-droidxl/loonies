/*
  # Monetization Features

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text: free, plus, premium)
      - `display_name` (text)
      - `price_monthly` (decimal)
      - `price_yearly` (decimal)
      - `features` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `plan_id` (uuid, references subscription_plans)
      - `status` (text: active, cancelled, expired, trial)
      - `billing_cycle` (text: monthly, yearly)
      - `started_at` (timestamp)
      - `expires_at` (timestamp)
      - `auto_renew` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `usage_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `daily_pings_used` (integer, default 0)
      - `daily_pings_limit` (integer)
      - `boost_active_until` (timestamp)
      - `last_reset_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `partner_venues`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text: cafe, coworking, cinema, restaurant, experience)
      - `description` (text)
      - `address` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `discount_code` (text)
      - `discount_description` (text)
      - `is_featured` (boolean)
      - `featured_until` (timestamp)
      - `logo_url` (text)
      - `created_at` (timestamp)
    
    - `premium_groups`
      - `id` (uuid, primary key)
      - `group_id` (uuid)
      - `is_featured` (boolean)
      - `feature_expires_at` (timestamp)
      - `organization_name` (text)
      - `subscription_status` (text: active, expired)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text: subscription, boost, extra_pings, safety_pack)
      - `amount` (decimal)
      - `currency` (text, default EUR)
      - `status` (text: pending, completed, failed, refunded)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for users to view their own data
    - Policies for managing subscriptions
    - Public read access for partner venues and featured content
*/

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (name IN ('free', 'plus', 'premium')),
  display_name text NOT NULL,
  price_monthly decimal(10, 2) DEFAULT 0,
  price_yearly decimal(10, 2) DEFAULT 0,
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_pings_used integer DEFAULT 0,
  daily_pings_limit integer DEFAULT 5,
  boost_active_until timestamptz,
  last_reset_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage limits"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS partner_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cafe', 'coworking', 'cinema', 'restaurant', 'experience', 'entertainment')),
  description text,
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  discount_code text,
  discount_description text,
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  logo_url text,
  contact_email text,
  phone text,
  website_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partner_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner venues"
  ON partner_venues FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS premium_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  is_featured boolean DEFAULT false,
  feature_expires_at timestamptz,
  organization_name text,
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE premium_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured groups"
  ON premium_groups FOR SELECT
  TO authenticated
  USING (is_featured = true AND subscription_status = 'active');

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('subscription', 'boost', 'extra_pings', 'safety_pack', 'group_feature')),
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, features) VALUES
  ('free', 'Free', 0, 0, '{
    "daily_pings": 5,
    "visibility_radius_km": 2,
    "chat_duration_hours": 24,
    "advanced_filters": false,
    "priority_placement": false,
    "verification_badge": false,
    "max_group_size": 6,
    "featured_groups": 0
  }'),
  ('plus', 'Loonie Plus', 7.99, 79.99, '{
    "daily_pings": 20,
    "visibility_radius_km": 5,
    "chat_duration_hours": 72,
    "advanced_filters": true,
    "priority_placement": true,
    "verification_badge": true,
    "max_group_size": 12,
    "featured_groups": 1,
    "venue_discounts": true
  }'),
  ('premium', 'Loonie Premium', 14.99, 149.99, '{
    "daily_pings": -1,
    "visibility_radius_km": 10,
    "chat_duration_hours": -1,
    "advanced_filters": true,
    "priority_placement": true,
    "verification_badge": true,
    "max_group_size": 20,
    "featured_groups": 3,
    "venue_discounts": true,
    "safety_pack": true
  }')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_venues_featured ON partner_venues(is_featured);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
