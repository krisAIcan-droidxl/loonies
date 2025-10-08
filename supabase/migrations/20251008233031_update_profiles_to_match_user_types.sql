/*
  # Opdater Profiles Tabel til User Type Definition

  1. Nye Kolonner
    - `email` (text, unique)
    - `phone_number` (text, unique)
    - `gender` (text, check constraint)
    - `date_of_birth` (date)
    - `bio` (text)
    - `current_mode` (text, default 'solo')
    - `activity_tags` (text[], erstatter activities)
    - `duo_partner_id` (uuid, reference til anden user)
    - `group_id` (uuid, reference til gruppe)
    - `is_verified` (boolean)
    - `connections_made` (integer, default 0)
    - `successful_meetups` (integer, default 0)
    - `is_active` (boolean, default true)
    - `is_banned` (boolean, default false)
    - `banned_until` (timestamptz)

  2. Opdateringer
    - Omdøb `activities` til `activity_tags`
    - Sæt defaults på eksisterende kolonner
    - Tilføj check constraints

  3. Indexes
    - email, phone_number (unique)
    - current_mode, is_active, is_verified

  4. Trigger
    - Auto-beregn age fra date_of_birth
*/

-- Tilføj nye kolonner
DO $$
BEGIN
  -- Contact info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number text UNIQUE;
  END IF;

  -- Personal info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gender text 
      CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;

  -- Mode and relationships
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'current_mode'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN current_mode text NOT NULL DEFAULT 'solo'
      CHECK (current_mode IN ('solo', 'duo', 'group'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'activity_tags'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN activity_tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'duo_partner_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN duo_partner_id uuid REFERENCES public.profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN group_id uuid;
  END IF;

  -- Verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  -- Stats
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'connections_made'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN connections_made integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'successful_meetups'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN successful_meetups integer DEFAULT 0;
  END IF;

  -- Status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'banned_until'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN banned_until timestamptz;
  END IF;
END $$;

-- Sæt defaults på eksisterende kolonner
ALTER TABLE public.profiles ALTER COLUMN is_verified_host SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN verification_status SET DEFAULT 'unverified';
ALTER TABLE public.profiles ALTER COLUMN rating_average SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN rating_count SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();

-- Opdater verification_status constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));

-- Migrer data fra activities til activity_tags hvis nødvendigt
UPDATE public.profiles 
SET activity_tags = activities 
WHERE activity_tags IS NULL OR array_length(activity_tags, 1) IS NULL;

-- Opret indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_current_mode ON public.profiles(current_mode);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_duo_partner ON public.profiles(duo_partner_id) WHERE duo_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON public.profiles(group_id) WHERE group_id IS NOT NULL;

-- Trigger til at opdatere updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function til at beregne age fra date_of_birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Opdater age når date_of_birth ændres
CREATE OR REPLACE FUNCTION update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = calculate_age(NEW.date_of_birth);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_age ON public.profiles;
CREATE TRIGGER update_profile_age
  BEFORE INSERT OR UPDATE OF date_of_birth ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_from_dob();
