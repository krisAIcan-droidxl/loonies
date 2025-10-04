# Ping System Implementation

Et komplet realtime ping og match system til Loonies appen.

## 📋 Oversigt

Ping systemet giver brugere mulighed for at sende hurtige "kaffe pings" til personer i nærheden. Ved accept oprettes et midlertidigt match med en 30-minutters chat.

## 🗄️ Database Schema

### Tabeller

#### `pings`
- `id` (uuid) - Primary key
- `from_user` (uuid) - Afsender reference til auth.users
- `to_user` (uuid) - Modtager reference til auth.users
- `activity` (text) - Aktivitetstype (default: 'coffee')
- `created_at` (timestamptz) - Oprettelsestidspunkt
- `expires_at` (timestamptz) - Udløbstid (default: now() + 15 min)
- `status` (text) - Status: pending, accepted, ignored, expired

#### `matches`
- `id` (uuid) - Primary key
- `user_a` (uuid) - Bruger A reference til auth.users
- `user_b` (uuid) - Bruger B reference til auth.users
- `activity` (text) - Aktivitetstype
- `created_at` (timestamptz) - Oprettelsestidspunkt
- `expires_at` (timestamptz) - Udløbstid (default: now() + 30 min)

#### `chat_messages`
- `id` (uuid) - Primary key
- `match_id` (uuid) - Reference til matches
- `sender_id` (uuid) - Afsender reference til auth.users
- `content` (text) - Beskedindhold
- `created_at` (timestamptz) - Oprettelsestidspunkt

### Row Level Security (RLS)

Alle tabeller har RLS aktiveret:

- **Pings**: Kun afsender og modtager kan se deres egne pings
- **Matches**: Kun deltagere (user_a eller user_b) kan se deres egne matches
- **Chat Messages**: Kun match deltagere kan se og sende beskeder

### Realtime

Følgende tabeller er tilføjet til `supabase_realtime` publication:
- `pings` - For realtime ping notifikationer
- `matches` - For realtime match opdateringer
- `chat_messages` - For realtime chat beskeder

## 📁 Fil Struktur

```
/lib
  ping.ts         # Ping funktioner (sendPing, acceptPing, etc.)
  time.ts         # Tid hjælpefunktioner (countdown, formatering)

/types
  ping.ts         # TypeScript interfaces for Ping, Match, ChatMessage

/components
  PingIncomingModal.tsx  # Modal til indgående pings

/app
  /chat
    [matchId].tsx  # Midlertidig chat skærm
```

## 🔧 API Funktioner

### `sendPing(toUserId: string, activity: PingActivity)`

Sender et ping til en anden bruger.

```typescript
const { data, error } = await sendPing('user-id', 'coffee');
```

**Validering:**
- Tjekker for eksisterende aktive pings til samme bruger
- Forhindrer duplikater

### `acceptPing(pingId: string)`

Accepterer et indgående ping og opretter et match.

```typescript
const { data: match, error } = await acceptPing('ping-id');
// Returner match objekt med 30 min udløbstid
```

**Flow:**
1. Henter ping og verificerer gyldighed
2. Tjekker om pinget er udløbet
3. Opdaterer ping status til 'accepted'
4. Opretter nyt match med 30 min udløb

### `ignorePing(pingId: string)`

Ignorerer et indgående ping.

```typescript
const { error } = await ignorePing('ping-id');
```

### `getActivePings()`

Henter alle aktive pings for nuværende bruger.

```typescript
const { data: pings, error } = await getActivePings();
```

Returnerer pings hvor:
- Bruger er enten afsender eller modtager
- Status er 'pending' eller 'accepted'
- Ikke udløbet

### `getActiveMatches()`

Henter alle aktive matches for nuværende bruger.

```typescript
const { data: matches, error } = await getActiveMatches();
```

## ⏱️ Tid Hjælpere

### `formatTimeRemaining(expiresAt: string)`

Formaterer tid tilbage som "MM:SS".

```typescript
const timeString = formatTimeRemaining('2025-10-04T18:30:00Z');
// Output: "14:23"
```

### `getTimeRemaining(expiresAt: string)`

Returnerer detaljeret tid information.

```typescript
const { minutes, seconds, isExpired } = getTimeRemaining(expiresAt);
```

### `formatRelativeTime(timestamp: string)`

Formaterer relativ tid (f.eks. "5 min siden").

```typescript
const relative = formatRelativeTime('2025-10-04T18:15:00Z');
// Output: "5 min siden"
```

## 🎨 UI Komponenter

### PingIncomingModal

Modal der vises når bruger modtager et ping.

```typescript
<PingIncomingModal
  ping={currentPing}
  visible={showModal}
  onAccept={handleAccept}
  onIgnore={handleIgnore}
/>
```

**Features:**
- Viser afsenderens navn og profil
- Aktivitetsikon (kaffe, gaming, etc.)
- Accept/Ignorer knapper
- Auto-lukker ved klik udenfor

### Chat Screen (`/chat/[matchId]`)

Midlertidig chat skærm med udløbstimer.

**Features:**
- Realtime beskeder via Supabase Realtime
- Countdown timer i header
- Automatic scroll til seneste besked
- Disable input når udløbet
- "Chat udløbet" banner

**Navigation:**
```typescript
router.push(`/chat/${matchId}`);
```

## 🔄 Realtime Integration

### Lyt efter indgående pings

```typescript
useEffect(() => {
  const { data: user } = await supabase.auth.getUser();

  const channel = supabase
    .channel('incoming-pings')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pings',
        filter: `to_user=eq.${user.user.id}`,
      },
      (payload) => {
        const newPing = payload.new as Ping;
        // Vis PingIncomingModal
        setCurrentPing(newPing);
        setShowModal(true);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Lyt efter ping status opdateringer

```typescript
const channel = supabase
  .channel('ping-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'pings',
      filter: `from_user=eq.${currentUserId}`,
    },
    (payload) => {
      const updatedPing = payload.new as Ping;
      if (updatedPing.status === 'accepted') {
        // Åbn chat
        router.push(`/chat/${matchId}`);
      }
    }
  )
  .subscribe();
```

### Lyt efter chat beskeder

```typescript
const channel = supabase
  .channel(`chat:${matchId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `match_id=eq.${matchId}`,
    },
    (payload) => {
      setMessages((prev) => [...prev, payload.new as ChatMessage]);
    }
  )
  .subscribe();
```

## ✅ States og Flow

### Ping Lifecycle

1. **Oprettelse**
   - Status: `pending`
   - Udløber efter 15 min

2. **Modtagelse**
   - Modtager ser modal med Accept/Ignorer valg

3. **Accept**
   - Status ændres til `accepted`
   - Match oprettes med 30 min udløb
   - Begge parter kan åbne chat

4. **Ignorer**
   - Status ændres til `ignored`
   - Afsender ser ikke at det blev ignoreret (kun udløb)

5. **Udløb**
   - Efter 15 min: Status ændres automatisk til `expired`
   - Ping knap aktiveres igen

### Match Lifecycle

1. **Oprettelse**
   - Udløber efter 30 min
   - Chat er aktiv

2. **Aktiv Chat**
   - Realtime beskeder
   - Countdown timer i header

3. **Udløb**
   - Efter 30 min: Input deaktiveres
   - Banner vises: "Chat udløbet"
   - Gamle beskeder kan stadig ses

## 🛡️ Sikkerhed

### Validering

- **Duplikat beskyttelse**: Forhindrer flere pings til samme bruger for samme aktivitet
- **Offline check**: Kan ikke pinge offline brugere (skal implementeres i UI)
- **Udløbscheck**: Automatisk markering af udløbne pings

### RLS Policies

Alle queries går gennem Row Level Security:
- Brugere kan kun se deres egne pings
- Kun match deltagere kan se beskeder
- Ingen kan se andre brugeres private data

## 📱 Implementation i Index Screen

For at integrere i hovedskærmen (Folk i nærheden):

```typescript
import { sendPing } from '@/lib/ping';
import { Ping } from '@/types/ping';
import PingIncomingModal from '@/components/PingIncomingModal';

// State
const [sentPings, setSentPings] = useState<Map<string, Ping>>(new Map());
const [incomingPing, setIncomingPing] = useState<Ping | null>(null);
const [showPingModal, setShowPingModal] = useState(false);

// Send ping funktion
const handleSendPing = async (toUserId: string) => {
  const { data, error } = await sendPing(toUserId, 'coffee');

  if (error) {
    Alert.alert('Fejl', error.message);
    return;
  }

  if (data) {
    setSentPings((prev) => new Map(prev).set(toUserId, data));
  }
};

// Lyt efter indgående pings
useEffect(() => {
  const channel = supabase
    .channel('pings')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'pings',
      filter: `to_user=eq.${currentUserId}`,
    }, (payload) => {
      setIncomingPing(payload.new as Ping);
      setShowPingModal(true);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUserId]);

// UI - Ping knap med state
{sentPings.has(person.id) ? (
  <View style={styles.sentPingChip}>
    <Text>Ping sendt • {formatTimeRemaining(sentPing.expires_at)}</Text>
  </View>
) : (
  <Pressable onPress={() => handleSendPing(person.id)}>
    <Text>Ping for kaffe</Text>
  </Pressable>
)}

// Modal
<PingIncomingModal
  ping={incomingPing}
  visible={showPingModal}
  onAccept={async () => {
    const { data: match } = await acceptPing(incomingPing!.id);
    if (match) {
      router.push(`/chat/${match.id}`);
    }
    setShowPingModal(false);
  }}
  onIgnore={async () => {
    await ignorePing(incomingPing!.id);
    setShowPingModal(false);
  }}
/>
```

## 🧪 Testing

### Database funktioner

```sql
-- Test expire function
SELECT expire_old_pings();

-- Test cleanup function
SELECT cleanup_expired_matches();
```

### Manual test flow

1. Login som User A
2. Send ping til User B
3. Login som User B (anden device/browser)
4. Acceptér ping
5. Åbn chat
6. Send beskeder frem og tilbage
7. Vent til chat udløber (eller ændre expires_at)
8. Verificer at input er disabled

## 🚀 Næste Skridt

1. **Implementer i Index Screen**
   - Tilføj ping knapper til person kort
   - Vis sendte pings med countdown
   - Integrér PingIncomingModal

2. **Push Notifikationer**
   - Send notifikation ved indgående ping
   - Send notifikation ved accept

3. **Aktivitetstyper**
   - Tilføj flere aktiviteter (gaming, sports, etc.)
   - Forskellige ikoner og farver

4. **Analytics**
   - Track ping success rate
   - Populære aktiviteter
   - Gennemsnitslig responstid

5. **Scheduled Tasks**
   - Automatisk kør expire_old_pings() hver 5 min
   - Automatisk cleanup_expired_matches() hver time
