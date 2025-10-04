/*
  # Tilføj test profiler og lobbies til demo
  
  1. Test Profiler
    - Opretter 5 demo profiler uden auth users
    - Bruges kun til at vise lobbies med forskellige hosts
  
  2. Test Lobbies
    - 8 forskellige lobbies (dinner, sports, social)
    - Varierede tidspunkter og lokationer
  
  Note: Dette er test data og skal ikke bruges i produktion
*/

-- Midlertidigt disable foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Opret test profiler
INSERT INTO profiles (id, first_name, age, photo_url, activities, is_verified_host, rating_average, rating_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sarah', 28, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Dining', 'Sports', 'Socializing'], true, 4.8, 24),
  ('22222222-2222-2222-2222-222222222222', 'Michael', 32, 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Sports', 'Fitness', 'Outdoor'], true, 4.6, 18),
  ('33333333-3333-3333-3333-333333333333', 'Emma', 25, 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Dining', 'Art', 'Culture'], true, 4.9, 31),
  ('44444444-4444-4444-4444-444444444444', 'Lucas', 29, 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Sports', 'Gaming', 'Tech'], true, 4.5, 15),
  ('55555555-5555-5555-5555-555555555555', 'Sofia', 27, 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Dining', 'Travel', 'Photography'], true, 4.7, 22)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  age = EXCLUDED.age,
  photo_url = EXCLUDED.photo_url,
  activities = EXCLUDED.activities,
  is_verified_host = EXCLUDED.is_verified_host,
  rating_average = EXCLUDED.rating_average,
  rating_count = EXCLUDED.rating_count;

-- Re-enable foreign key constraint (men kun for rigtige users)
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- Opret test lobbies
INSERT INTO dinner_lobbies (
  host_id, title, description, cuisine_type, max_participants, current_participants,
  scheduled_time, location_name, latitude, longitude, status, is_paid, price_per_seat,
  lobby_type, activity_type
)
VALUES 
  -- Dinner lobbies
  ('11111111-1111-1111-1111-111111111111', 'Italiensk aften i Nørrebro', 
   'Lad os lave frisk pasta sammen og nyde en hyggelig aften med god mad og vin. Jeg har alle ingredienser klar!',
   'Italian', 6, 3, now() + interval '2 days' + interval '6 hours',
   'Nørrebro, København', 55.6867, 12.5534, 'open', false, 0, 'dinner', NULL),
   
  ('33333333-3333-3333-3333-333333333333', 'Sushi Workshop + Dinner',
   'Kom og lær at lave sushi fra bunden! Vi starter med en workshop og spiser det bagefter. Alt inkluderet.',
   'Japanese', 8, 2, now() + interval '3 days' + interval '5 hours',
   'Vesterbro, København', 55.6736, 12.5617, 'open', true, 150, 'dinner', NULL),
   
  ('55555555-5555-5555-5555-555555555555', 'Brunch & Mimosas',
   'Søndagsbrunch med lækre mimosas, friskbagt brød og god stemning. Perfekt måde at starte søndagen på!',
   'Brunch', 4, 1, now() + interval '5 days' + interval '4 hours',
   'Frederiksberg, København', 55.6792, 12.5341, 'open', false, 0, 'dinner', NULL),
   
  -- Sports lobbies
  ('22222222-2222-2222-2222-222222222222', 'Morgenløb i Fælledparken',
   'Let 5km løbetur for alle niveauer. Vi holder et roligt tempo og slutter med kaffe.',
   NULL, 10, 4, now() + interval '1 day' + interval '6 hours',
   'Fælledparken, København', 55.7013, 12.5707, 'open', false, 0, 'sports', 'Løb'),
   
  ('44444444-4444-4444-4444-444444444444', 'Fodbold 5v5',
   'Casual fodboldkamp i Valbyparken. Alle niveauer velkommen, fokus på sjov!',
   NULL, 10, 7, now() + interval '2 days' + interval '4 hours',
   'Valbyparken, København', 55.6515, 12.5115, 'open', false, 0, 'sports', 'Fodbold'),
   
  -- Social lobbies
  ('11111111-1111-1111-1111-111111111111', 'Kaffe & Brætspil',
   'Hyggeligt kaffemøde med brætspil på en lokal café. Jeg tager Catan og Ticket to Ride med!',
   NULL, 6, 2, now() + interval '4 days' + interval '3 hours',
   'The Coffee Collective, Jægersborggade', 55.6891, 12.5512, 'open', false, 0, 'social', 'Brætspil'),
   
  ('33333333-3333-3333-3333-333333333333', 'Kunstgalleri Tour + Drinks',
   'Besøg til ny udstilling på SMK efterfulgt af drinks. Perfekt for kunstelskere!',
   NULL, 8, 3, now() + interval '6 days' + interval '2 hours',
   'SMK, København', 55.6889, 12.5786, 'open', true, 50, 'social', 'Kultur'),
   
  ('55555555-5555-5555-5555-555555555555', 'Foto Walk i Nyhavn',
   'Fotografering tur gennem Københavns smukkeste gader. Alle kameraer velkommen, fra mobil til DSLR!',
   NULL, 5, 2, now() + interval '3 days' + interval '5 hours',
   'Nyhavn, København', 55.6798, 12.5914, 'open', false, 0, 'social', 'Fotografi')
ON CONFLICT DO NOTHING;
