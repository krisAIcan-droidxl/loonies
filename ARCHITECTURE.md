# System Architecture Documentation

## 📖 Overview

Dette er en social meetup app bygget med **React Native (Expo)**, **Supabase** og **TypeScript**. Appen gør det muligt for brugere at finde hinanden i nærheden, sende "pings" for at mødes, og chatte i tidsbegrænsede sessioner.

---

## 🏗️ Tech Stack

### Frontend
- **React Native 0.81.4** (via Expo SDK 54)
- **Expo Router** (file-based routing)
- **TypeScript 5.9.2**
- **Expo Location** (geolocation)
- **Expo Camera** (til verification)

### Backend
- **Supabase** (PostgreSQL database)
- **Supabase Auth** (email/password authentication)
- **Supabase Realtime** (WebSocket for live updates)
- **Row Level Security (RLS)** (database security)

### Type System
- **Comprehensive TypeScript types** i `/types` directory
- **Enums** for alle konstanter
- **Type guards** for runtime validation

---

## 📁 Project Structure

```
/tmp/cc-agent/57793245/project
├── app/                           # Expo Router screens
│   ├── (auth)/                   # Auth flow screens
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   ├── welcome.tsx
│   │   ├── profile-setup.tsx
│   │   └── ...
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Nearby people (main screen)
│   │   ├── lobbies.tsx
│   │   ├── groups.tsx
│   │   ├── profile.tsx
│   │   └── ...
│   ├── chat/[matchId].tsx        # Chat screen
│   └── _layout.tsx
│
├── components/                    # Reusable UI components
│   ├── PingModal.tsx
│   ├── PingIncomingModal.tsx
│   ├── ChatModal.tsx
│   ├── LobbyCard.tsx
│   └── ...
│
├── lib/                          # Business logic & API calls
│   ├── supabase.ts              # Supabase client
│   ├── ping.ts                  # Ping operations
│   └── time.ts                  # Time utilities
│
├── types/                        # TypeScript type definitions
│   ├── shared/
│   │   ├── enums.ts             # All enums
│   │   └── base.ts              # Base interfaces
│   ├── core/
│   │   ├── auth.ts              # Auth types
│   │   ├── user.ts              # User & Profile types
│   │   ├── presence.ts          # Presence & availability
│   │   └── group.ts             # Social groups
│   ├── matching/
│   │   ├── ping.ts              # Ping types
│   │   └── match.ts             # Matching types
│   ├── chat/
│   │   └── session.ts           # Chat types
│   ├── safety/
│   │   └── checkin.ts           # Safety features
│   ├── lobby/
│   │   └── lobby.ts             # Activity lobbies
│   ├── monetization/
│   │   └── subscription.ts      # Subscriptions
│   ├── config.ts                # App configuration
│   ├── utils.ts                 # Type guards
│   └── index.ts                 # Central exports
│
├── hooks/                        # React hooks
│   ├── useTheme.ts
│   ├── useTranslation.ts
│   └── useSubscription.ts
│
├── locales/                      # i18n translations
│   └── da.ts
│
└── supabase/migrations/          # Database migrations
    ├── 20250930183136_create_dinner_lobbies.sql
    ├── 20251004190544_create_pings_and_matches_system.sql
    ├── update_pings_schema_to_match_types.sql
    ├── update_profiles_to_match_user_types.sql
    └── create_user_presence_table.sql
```

---

## 🗄️ Database Schema

### Core Tables

#### **profiles** (User Profiles)
```sql
- id (uuid, PK, references auth.users)
- first_name (text)
- age (integer, auto-calculated from date_of_birth)
- email (text, unique)
- phone_number (text, unique)
- gender (enum: male, female, non_binary, prefer_not_to_say)
- date_of_birth (date)
- bio (text)
- photo_url (text)

-- Mode & Relationships
- current_mode (enum: solo, duo, group)
- activity_tags (text[])
- duo_partner_id (uuid, references profiles)
- group_id (uuid)

-- Verification
- is_verified (boolean)
- is_verified_host (boolean)
- verification_status (enum: unverified, pending, approved, rejected)

-- Stats
- rating_average (numeric)
- rating_count (integer)
- connections_made (integer)
- successful_meetups (integer)

-- Status
- is_active (boolean)
- is_banned (boolean)
- banned_until (timestamptz)

-- Timestamps
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### **user_presence** (Real-time Availability)
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles, unique)

-- Online Status
- is_online (boolean)
- last_seen (timestamptz)

-- Availability
- is_available (boolean)
- availability_preset (integer: 30, 60, 90 minutes)
- availability_expires_at (timestamptz)
- is_snoozed (boolean)

-- Location (only when available)
- current_latitude (numeric)
- current_longitude (numeric)
- location_updated_at (timestamptz)

-- WebSocket
- websocket_connection_id (text)

-- Timestamps
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### **pings** (Meetup Requests)
```sql
- id (uuid, PK)
- from_user_id (uuid, FK → auth.users)
- to_user_id (uuid, FK → auth.users)
- from_group_id (uuid, optional)
- to_group_id (uuid, optional)

-- Content
- activity_tag (text: coffee, dinner, sports, etc.)
- message (text)
- suggested_time (text)
- suggested_location (text)

-- Status
- status (enum: pending, accepted, declined, expired)
- responded_at (timestamptz)

-- Lifecycle
- created_at (timestamptz)
- expires_at (timestamptz, +15 minutes)
```

#### **matches** (Accepted Pings → Active Matches)
```sql
- id (uuid, PK)
- user_a (uuid, FK → auth.users)
- user_b (uuid, FK → auth.users)
- ping_id (uuid, FK → pings)
- activity_tag (text)
- created_at (timestamptz)
- expires_at (timestamptz, +24 hours)
```

#### **chat_messages** (Ephemeral Chat)
```sql
- id (uuid, PK)
- match_id (uuid, FK → matches)
- sender_id (uuid, FK → auth.users)
- content (text)
- created_at (timestamptz)

-- Auto-deleted when match expires
```

#### **dinner_lobbies** (Activity Lobbies)
```sql
- id (uuid, PK)
- host_id (uuid, FK → profiles)
- title (text)
- description (text)
- lobby_type (enum: dinner, sports, social)
- activity_type (text)
- cuisine_type (text, for dinner)

-- Participants
- max_participants (integer, 2-20)
- current_participants (integer)

-- Schedule
- scheduled_time (timestamptz)

-- Location
- location_name (text)
- latitude (numeric)
- longitude (numeric)

-- Status
- status (enum: open, full, started, completed, cancelled)

-- Payment (for paid lobbies)
- is_paid (boolean)
- price_per_seat (numeric)
- currency (text)
- commission_rate (numeric)
- host_payout_amount (numeric)
- host_payout_status (enum: pending, processing, completed, failed)

-- Timestamps
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Monetization Tables

#### **subscription_plans**
```sql
- id (uuid, PK)
- name (enum: free, plus, premium)
- display_name (text)
- price_monthly (numeric)
- price_yearly (numeric)
- features (jsonb)
- is_active (boolean)
- created_at (timestamptz)
```

#### **user_subscriptions**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles, unique)
- plan_id (uuid, FK → subscription_plans)
- status (enum: active, cancelled, expired, trial)
- billing_cycle (enum: monthly, yearly)
- started_at (timestamptz)
- expires_at (timestamptz)
- auto_renew (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### **usage_limits**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles, unique)
- daily_pings_used (integer)
- daily_pings_limit (integer)
- boost_active_until (timestamptz)
- last_reset_date (date)
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## 🔐 Security (Row Level Security)

### Profiles
```sql
-- Users can view online/available users
CREATE POLICY "Anyone can view active profiles"
  ON profiles FOR SELECT
  USING (is_active = true AND NOT is_banned);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### User Presence
```sql
-- Anyone can view online available users (for matching)
CREATE POLICY "Anyone can view online available users"
  ON user_presence FOR SELECT
  USING (is_online = true AND is_available = true AND is_snoozed = false);

-- Users can only update own presence
CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE
  USING (auth.uid() = user_id);
```

### Pings
```sql
-- Kun afsender eller modtager kan se
CREATE POLICY "Users can view their own pings"
  ON pings FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Kun afsender kan sende
CREATE POLICY "Users can send pings"
  ON pings FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Begge parter kan opdatere status
CREATE POLICY "Parties can update ping status"
  ON pings FOR UPDATE
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
```

### Matches & Chat
```sql
-- Kun match participants kan se
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (auth.uid() IN (user_a, user_b));

-- Kun participants kan sende beskeder
CREATE POLICY "Participants can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = chat_messages.match_id
      AND auth.uid() IN (matches.user_a, matches.user_b)
    )
  );
```

---

## 🔄 Realtime Features

### Enabled Realtime Tables
```sql
-- Pings (for incoming ping notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE pings;

-- Matches (for match creation alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Chat Messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- User Presence (for online status)
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
```

### Realtime Subscriptions (Frontend)

```typescript
// Listen for incoming pings
const pingChannel = supabase
  .channel('pings')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'pings',
      filter: `to_user_id=eq.${userId}`
    },
    (payload) => {
      // Show incoming ping modal
      setIncomingPing(payload.new);
    }
  )
  .subscribe();

// Listen for ping status changes
const pingStatusChannel = supabase
  .channel('ping-status')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'pings',
      filter: `from_user_id=eq.${userId}`
    },
    (payload) => {
      // Update UI when ping is accepted/declined
      if (payload.new.status === 'accepted') {
        showAlert('Ping accepteret! 🎉');
      }
    }
  )
  .subscribe();

// Listen for new chat messages
const chatChannel = supabase
  .channel(`match:${matchId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `match_id=eq.${matchId}`
    },
    (payload) => {
      // Add message to chat
      setMessages(prev => [...prev, payload.new]);
    }
  )
  .subscribe();
```

---

## 🎯 Core Features

### 1. Ping System

**Flow:**
```
1. User A sees User B nearby (within 2km)
2. User A clicks "Ping for kaffe" ☕
3. System creates ping (expires in 15 min)
4. User B receives realtime notification
5. User B clicks "Acceptér"
6. System creates match (expires in 24h)
7. Both users redirected to chat
8. Chat auto-deletes after 24h
```

**Implementation:**
```typescript
// Send ping
const { data, error } = await sendPing(
  toUserId,
  ActivityTag.COFFEE,
  'Kaffe om 30 min?'
);

// Accept ping
const { data: match, error } = await acceptPing(pingId);

// Auto-creates match and chat session via trigger
```

**Database Trigger:**
```sql
CREATE TRIGGER create_chat_on_accept
  AFTER UPDATE ON pings
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION create_chat_session_on_ping_accept();
```

### 2. Availability System

Users kan sætte sig som "tilgængelig" i 30, 60 eller 90 minutter:

```typescript
// Set available for 30 minutes
const expiresAt = new Date();
expiresAt.setMinutes(expiresAt.getMinutes() + 30);

await supabase
  .from('user_presence')
  .upsert({
    user_id: userId,
    is_online: true,
    is_available: true,
    availability_preset: 30,
    availability_expires_at: expiresAt.toISOString(),
    current_latitude: location.latitude,
    current_longitude: location.longitude,
  });
```

**Auto-expire function:**
```sql
CREATE FUNCTION expire_availability() AS $$
BEGIN
  UPDATE user_presence
  SET is_available = false,
      availability_expires_at = NULL
  WHERE is_available = true
    AND availability_expires_at < now();
END;
$$ LANGUAGE plpgsql;
```

### 3. Nearby Matching

**Query for nearby users:**
```typescript
// Haversine formula for distance calculation
const { data: nearbyUsers } = await supabase.rpc('get_nearby_users', {
  user_lat: currentLocation.latitude,
  user_lng: currentLocation.longitude,
  max_distance_km: 2
});
```

**SQL Function:**
```sql
CREATE FUNCTION get_nearby_users(
  user_lat numeric,
  user_lng numeric,
  max_distance_km integer
) RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.*,
    -- Haversine distance calculation
    (
      6371 * acos(
        cos(radians(user_lat))
        * cos(radians(up.current_latitude))
        * cos(radians(up.current_longitude) - radians(user_lng))
        + sin(radians(user_lat))
        * sin(radians(up.current_latitude))
      )
    ) AS distance_km
  FROM profiles p
  JOIN user_presence up ON p.id = up.user_id
  WHERE up.is_online = true
    AND up.is_available = true
    AND up.is_snoozed = false
    AND distance_km <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
```

### 4. Chat System

**Ephemeral by design:**
- Chats expire after 24 hours
- Messages auto-delete with match
- No permanent message history

```typescript
// Send message
await supabase
  .from('chat_messages')
  .insert({
    match_id: matchId,
    sender_id: userId,
    content: messageText,
  });

// Auto-cleanup expired matches
CREATE FUNCTION cleanup_expired_matches() AS $$
BEGIN
  DELETE FROM matches
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 UI Components

### PingModal
Modal der vises når man klikker "Ping for kaffe" på en person i nearby liste.

```typescript
<PingModal
  visible={showPingModal}
  onClose={() => setShowPingModal(false)}
  person={selectedPerson}
  onSendPing={handleSendPing}
/>
```

### PingIncomingModal
Modal der vises automatisk via realtime når man modtager et ping.

```typescript
<PingIncomingModal
  visible={!!incomingPing}
  ping={incomingPing}
  onAccept={handleAcceptPing}
  onDecline={handleDeclinePing}
/>
```

### ChatModal
Fuld-skærm chat view med countdown og auto-scroll.

```typescript
<ChatModal
  matchId={matchId}
  expiresAt={match.expires_at}
  otherUser={otherUserProfile}
/>
```

---

## 📝 Type System

### Enums

```typescript
// User modes
enum UserMode {
  SOLO = 'solo',
  DUO = 'duo',
  GROUP = 'group'
}

// Activity tags
enum ActivityTag {
  COFFEE = 'coffee',
  DINNER = 'dinner',
  SPORTS = 'sports',
  GAMING = 'gaming',
  // ... 16 total activities
}

// Ping status
enum PingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}
```

### Core Interfaces

```typescript
// User profile
interface User extends Identifiable, FullyTimestamped {
  first_name: string;
  age: number;
  gender?: Gender;
  email: string;
  current_mode: UserMode;
  activity_tags: ActivityTag[];
  is_verified: boolean;
  rating_average: number;
  // ... 20+ more fields
}

// Public profile (limited data)
type PublicProfile = Pick<User,
  'id' |
  'first_name' |
  'age' |
  'photo_url' |
  'is_verified' |
  'rating_average'
>;

// Ping
interface Ping extends Identifiable, Timestamped {
  from_user_id: string;
  to_user_id: string;
  activity_tag: ActivityTag;
  message: string;
  status: PingStatus;
  expires_at: string;
  // Optional populated relations
  from_user?: PublicProfile;
  to_user?: PublicProfile;
}
```

### Type Guards

```typescript
// Check if user is verified
export const isVerifiedUser = (user: User): boolean => {
  return user.verification_status === VerificationStatus.APPROVED
    && user.is_verified;
};

// Check if ping is expired
export const isPingExpired = (ping: Ping): boolean => {
  return new Date(ping.expires_at) < new Date();
};
```

---

## 🚀 Key API Functions

### Ping Operations (`lib/ping.ts`)

```typescript
// Send a ping
sendPing(
  toUserId: string,
  activity: ActivityTag,
  message: string
): Promise<{ data: Ping | null; error: Error | null }>

// Accept a ping (creates match)
acceptPing(
  pingId: string
): Promise<{ data: Match | null; error: Error | null }>

// Decline a ping
declinePing(
  pingId: string
): Promise<{ error: Error | null }>

// Get active pings for current user
getActivePings(): Promise<{
  data: Ping[] | null;
  error: Error | null;
}>

// Get active matches
getActiveMatches(): Promise<{
  data: Match[] | null;
  error: Error | null;
}>
```

---

## ⚙️ Configuration

### App Config (`types/config.ts`)

```typescript
const DEFAULT_APP_CONFIG: AppConfig = {
  MAX_DISTANCE_KM: 2,              // Max radius for nearby search
  PING_EXPIRY_MINUTES: 15,         // Ping auto-expires after
  DAILY_FREE_PINGS: 10,            // Free tier limit
  CHAT_SESSION_DURATION_HOURS: 24, // Chat auto-deletes after
  MAX_MESSAGE_LENGTH: 500,         // Max characters per message
  MIN_AGE: 18,                     // Minimum user age
  MAX_PINGS_PER_HOUR: 20,          // Rate limiting
  MAX_MESSAGES_PER_MINUTE: 10,     // Rate limiting
};
```

### Feature Flags

```typescript
interface FeatureFlags {
  groups_enabled: boolean;              // Social groups (3-6 members)
  lobbies_enabled: boolean;             // Activity lobbies
  paid_lobbies_enabled: boolean;        // Paid dinner lobbies
  extended_radius_enabled: boolean;     // >2km for Plus users
  partner_venues_enabled: boolean;      // Venue partnerships
  enhanced_verification_required: boolean;
  mandatory_checkins: boolean;          // Safety check-ins
}
```

---

## 🧪 Testing Guide

### Test Ping Flow (Requires 2 Users)

**Browser A - User Kristian:**
```
1. Login: kristian@test.com
2. Go to "Folk i nærheden"
3. Click "30 min" → becomes available
4. See Sarah in list
5. Click "Ping for kaffe" on Sarah
6. ✅ Alert: "Ping sendt! ☕"
7. ✅ Button changes to "Ping sendt • 14:59"
8. Wait for Sarah to accept...
9. ✅ Alert: "Ping accepteret! 🎉"
10. Click "Åbn chat"
```

**Browser B - User Sarah:**
```
1. Login: sarah@test.com
2. Go to "Folk i nærheden"
3. ✅ Incoming ping modal appears automatically
4. Click "Acceptér"
5. ✅ Alert: "Match oprettet! 🎉"
6. Chat opens automatically
7. Send message to Kristian
```

**Both Browsers:**
```
8. ✅ See realtime messages
9. ✅ See countdown: "Udløber om 23:58"
10. ✅ Auto-scroll to latest message
```

---

## 📊 Database Maintenance

### Scheduled Jobs (Recommended)

```sql
-- Expire old pings (run every 5 minutes)
SELECT expire_old_pings();

-- Cleanup expired matches (run every hour)
SELECT cleanup_expired_matches();

-- Set inactive users offline (run every 5 minutes)
SELECT set_inactive_users_offline();

-- Expire availability (run every minute)
SELECT expire_availability();

-- Reset daily usage limits (run daily at midnight)
UPDATE usage_limits
SET daily_pings_used = 0,
    last_reset_date = CURRENT_DATE
WHERE last_reset_date < CURRENT_DATE;
```

---

## 🔮 Future Enhancements

### Phase 1 (Completed)
- ✅ Core ping system
- ✅ Realtime chat
- ✅ User presence
- ✅ Type system
- ✅ RLS security

### Phase 2 (In Progress)
- ⏳ Social groups (3-6 members)
- ⏳ Safety features (check-ins, SOS)
- ⏳ Enhanced verification
- ⏳ Zod validation

### Phase 3 (Planned)
- ⬜ Partner venues
- ⬜ Advanced matching algorithm
- ⬜ Analytics dashboard
- ⬜ Push notifications
- ⬜ In-app payments

---

## 📚 Additional Documentation

- `PING_SYSTEM.md` - Detailed ping system docs
- `PING_TEST_GUIDE.md` - Testing guide for ping flow
- `README.md` - Project overview
- `types/` - All TypeScript definitions with inline docs

---

## 🤝 Contributing

When making changes:

1. **Always update types first** (`types/` directory)
2. **Create migration** for database changes
3. **Update this documentation** if architecture changes
4. **Test with 2 browsers** for realtime features
5. **Check RLS policies** for security
6. **Run build** to verify no TypeScript errors

```bash
npm run build:web
```

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** Production Ready 🚀
