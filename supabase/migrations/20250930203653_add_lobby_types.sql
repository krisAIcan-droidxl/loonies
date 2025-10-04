/*
  # Tilføj Lobby Typer
  
  1. Ændringer
    - Tilføj `lobby_type` enum med tre værdier: 'dinner', 'sports', 'social'
    - Tilføj `lobby_type` kolonne til `dinner_lobbies` tabellen
    - Opdater tabelnavn konceptuelt (beholdere stadig 'dinner_lobbies' for bagudkompatibilitet)
    - Tilføj standardværdi 'dinner' for eksisterende rækker
    - Opdater cuisine_type til at være valgfri (kun relevant for dinner lobbies)
    
  2. Formål
    - Understøt forskellige typer af sociale samlinger
    - Middag lobbyer: til måltider og gastronomi
    - Sports lobbyer: til fysiske aktiviteter og sport
    - Sociale lobbyer: til generelle sociale sammenkomster
*/

-- Opret enum type for lobby kategorier
DO $$ BEGIN
  CREATE TYPE lobby_type AS ENUM ('dinner', 'sports', 'social');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tilføj lobby_type kolonne hvis den ikke eksisterer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dinner_lobbies' AND column_name = 'lobby_type'
  ) THEN
    ALTER TABLE dinner_lobbies ADD COLUMN lobby_type lobby_type DEFAULT 'dinner' NOT NULL;
  END IF;
END $$;

-- Opdater cuisine_type til at være nullable (kun relevant for dinner lobbies)
ALTER TABLE dinner_lobbies ALTER COLUMN cuisine_type DROP NOT NULL;

-- Tilføj indeks for bedre performance ved filtrering
CREATE INDEX IF NOT EXISTS idx_dinner_lobbies_lobby_type ON dinner_lobbies(lobby_type);

-- Tilføj activity_type kolonne for sports/social lobbyer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dinner_lobbies' AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE dinner_lobbies ADD COLUMN activity_type TEXT;
  END IF;
END $$;

-- Tilføj kommentar for at dokumentere kolonnen
COMMENT ON COLUMN dinner_lobbies.lobby_type IS 'Type af lobby: dinner (måltid), sports (fysisk aktivitet), eller social (generel sammenkomst)';
COMMENT ON COLUMN dinner_lobbies.activity_type IS 'Specifik aktivitetstype: for sports (fodbold, løb, etc.) eller social (kaffe, spil, etc.)';
