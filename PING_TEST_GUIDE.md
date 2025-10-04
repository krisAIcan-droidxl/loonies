# Ping System Test Guide

Guide til at teste det komplette ping flow med realtime funktionalitet.

## 🎯 Test Setup

### Forudsætninger

Du skal bruge **to browsere eller devices** til at teste ping flow:
- Browser A: User A (afsender)
- Browser B: User B (modtager)

### Test Profiler

Systemet bruger følgende test profiler som er tilgængelige i "Folk i nærheden":
- Sarah (ID: `11111111-1111-1111-1111-111111111111`)
- Michael (ID: `22222222-2222-2222-2222-222222222222`)
- Emma (ID: `33333333-3333-3333-3333-333333333333`)

---

## 📋 Test Scenarie 1: Send og Acceptér Ping

### Step 1: Login som User A
```
1. Åbn browser A
2. Gå til signup/login
3. Opret bruger eller login som Kristian
```

### Step 2: Gør dig tilgængelig
```
1. Gå til "Folk i nærheden" tab
2. Klik på en af availability knapperne (30/60/90 min)
3. Du bliver nu synlig for andre
```

### Step 3: Send Ping
```
1. Du ser nu Sarah, Michael og Emma i listen
2. Find Sarah's kort
3. Klik på "Ping for kaffe" knappen
4. Alert vises: "Ping sendt! ☕"
5. Knappen ændrer sig til: "Ping sendt • 14:59" (countdown)
```

### Step 4: Login som User B (Sarah)
```
1. Åbn browser B (eller inkognito mode)
2. Login med Sarah's credentials (hvis muligt)
3. ALTERNATIVT: Simulér ved at bruge Supabase SQL:

   INSERT INTO pings (from_user, to_user, activity)
   VALUES (
     '<kristian-id>',
     '11111111-1111-1111-1111-111111111111',
     'coffee'
   );
```

### Step 5: Acceptér Ping (Sarah)
```
1. Modal vises automatisk (realtime): "Kaffe ping"
2. "Kristian er klar i nærheden"
3. Klik "Acceptér"
4. Alert: "Ping accepteret! 🎉"
5. Match oprettes
6. Klik "OK" for at åbne chat
```

### Step 6: Verificér Match (User A)
```
1. Gå tilbage til browser A (Kristian)
2. Alert vises: "Ping accepteret! 🎉"
3. Knappen ved Sarah ændres til: "Åbn chat" (grøn)
4. Klik på "Åbn chat"
```

---

## 💬 Test Scenarie 2: Chat Funktionalitet

### Step 1: Åbn Chat (begge brugere)
```
Browser A (Kristian): Klik "Åbn chat" ved Sarah
Browser B (Sarah): Allerede i chat fra accept flow
```

### Step 2: Send Beskeder
```
Browser A:
1. Skriv "Hej Sarah! ☕"
2. Klik send
3. Besked vises i din chat (orange bubble, højre side)

Browser B:
1. Besked vises realtime (grå bubble, venstre side)
2. Skriv "Hej! Skal vi mødes ved kaffen?"
3. Klik send

Browser A:
1. Besked vises realtime
```

### Step 3: Verificér Countdown
```
Begge browsere:
1. Se header - countdown timer: "29:45"
2. Timer tæller ned hvert sekund
3. Når den når 0:00:
   - "Chat udløbet" banner vises
   - Input feltet er disabled
   - Gamle beskeder kan stadig ses
```

---

## ⏰ Test Scenarie 3: Ping Udløb

### Step 1: Send Ping uden Accept
```
Browser A (Kristian):
1. Send ping til Michael
2. Knap viser: "Ping sendt • 14:59"
```

### Step 2: Vent på Udløb
```
Option 1 - Vent 15 minutter:
- Countdown tæller ned til 0:00
- Knappen forsvinder
- Normal "Ping for kaffe" knap vises igen

Option 2 - Simulér udløb med SQL:
UPDATE pings
SET status = 'expired', expires_at = now() - interval '1 minute'
WHERE from_user = '<kristian-id>'
  AND to_user = '22222222-2222-2222-2222-222222222222';
```

### Step 3: Verificér State Reset
```
Browser A:
1. Knappen ved Michael er nu: "Ping for kaffe"
2. Du kan sende nyt ping
```

---

## 🔄 Test Scenarie 4: Realtime Sync

### Step 1: Send Multiple Pings
```
Browser A (Kristian):
1. Send ping til Sarah
2. Send ping til Michael
3. Send ping til Emma
4. Alle tre viser: "Ping sendt • countdown"
```

### Step 2: Forskellige Outcomes
```
Browser B (Sarah):
1. Acceptér ping fra Kristian
2. Kristian's UI opdateres til "Åbn chat"

Browser C (Michael):
1. Ignorér ping fra Kristian
2. Kristian ser IKKE at det blev ignoreret
3. Kun countdown fortsætter

Browser D (Emma):
1. Lad ping udløbe (vent eller simulér)
2. Kristian's UI resetter efter 15 min
```

---

## 🧪 Test Scenarie 5: Edge Cases

### Test 1: Duplikat Ping
```
Browser A:
1. Send ping til Sarah
2. Prøv at sende igen mens pending
3. Alert: "Ping allerede sendt"
4. Ingen nyt ping oprettes
```

### Test 2: Chat Efter Udløb
```
Browser A & B:
1. Opret match
2. Åbn chat
3. Send beskeder
4. Simulér udløb:
   UPDATE matches
   SET expires_at = now() - interval '1 minute'
   WHERE id = '<match-id>';
5. Refresh begge browsere
6. Input er disabled
7. "Chat udløbet" banner vises
```

### Test 3: Offline User
```
Dette skal implementeres i UI:
- Filtrer offline brugere fra listen
- Eller disable ping knap for offline brugere
```

### Test 4: Network Reconnect
```
Browser A:
1. Send ping
2. Disable netværk (offline)
3. Enable netværk igen
4. Realtime reconnect
5. UI opdateres korrekt
```

---

## 🛠️ Simulering med SQL

Hvis du ikke har to devices, kan du simulere med SQL:

### Simulér Indgående Ping
```sql
INSERT INTO pings (from_user, to_user, activity)
VALUES (
  '11111111-1111-1111-1111-111111111111', -- Sarah
  '<din-user-id>',                         -- Dig
  'coffee'
);
```

### Simulér Accept
```sql
-- 1. Opdater ping
UPDATE pings
SET status = 'accepted'
WHERE id = '<ping-id>';

-- 2. Opret match
INSERT INTO matches (user_a, user_b, activity)
VALUES (
  '<ping-from-user>',
  '<ping-to-user>',
  'coffee'
);
```

### Simulér Udløb
```sql
-- Ping udløb
UPDATE pings
SET status = 'expired', expires_at = now() - interval '1 minute'
WHERE id = '<ping-id>';

-- Match udløb
UPDATE matches
SET expires_at = now() - interval '1 minute'
WHERE id = '<match-id>';
```

---

## ✅ Acceptance Criteria Checklist

Gå gennem hver punkt og verificér:

- [ ] **Send Ping**
  - [ ] Kan sende ping til bruger ≤2 km væk
  - [ ] Knap ændrer sig til "Ping sendt • countdown"
  - [ ] Alert vises: "Ping sendt! ☕"
  - [ ] Countdown tæller ned hvert sekund

- [ ] **Modtag Ping (Realtime)**
  - [ ] Modal vises automatisk uden refresh
  - [ ] Viser afsenderens navn og foto
  - [ ] "Kaffe ping" titel
  - [ ] Accept og Ignorer knapper

- [ ] **Accept Ping**
  - [ ] Match oprettes
  - [ ] Alert: "Ping accepteret! 🎉"
  - [ ] Chat kan åbnes
  - [ ] Afsender får notifikation (alert)
  - [ ] Knap ændres til "Åbn chat"

- [ ] **Ignorer Ping**
  - [ ] Modal lukker
  - [ ] Afsender ser IKKE at det blev ignoreret
  - [ ] Kun countdown fortsætter

- [ ] **Chat**
  - [ ] Realtime beskeder fungerer
  - [ ] Countdown timer i header
  - [ ] Egne beskeder højre side (orange)
  - [ ] Andre beskeder venstre side (grå)
  - [ ] Auto-scroll til seneste besked

- [ ] **Udløb**
  - [ ] Ping udløber efter 15 min
  - [ ] Knap resetter til "Ping for kaffe"
  - [ ] Chat udløber efter 30 min
  - [ ] "Chat udløbet" banner vises
  - [ ] Input disabled

- [ ] **RLS Security**
  - [ ] Kan kun se egne pings
  - [ ] Kan kun se matches jeg er del af
  - [ ] Kan kun se chat beskeder i mine matches

- [ ] **Realtime**
  - [ ] Ingen reload nødvendigt
  - [ ] Opdateringer sker instant
  - [ ] Reconnect håndteres korrekt
  - [ ] Ingen dubletter i UI

- [ ] **Error Handling**
  - [ ] Duplikat ping blokeret
  - [ ] Fejlbeskeder vises ved fejl
  - [ ] Udløbne pings håndteres gracefully

---

## 🐛 Debug Tips

### Realtime virker ikke?

1. Tjek Supabase Dashboard:
   - Settings → API → Realtime enabled?
   - Database → Replication → pings, matches, chat_messages enabled?

2. Check browser console:
   ```javascript
   // Se aktive channels
   supabase.getChannels()

   // Se connection status
   supabase.getSubscriptions()
   ```

3. Verificér RLS policies:
   ```sql
   SELECT * FROM pings WHERE to_user = auth.uid();
   ```

### Countdown stopper?

- Tjek at intervals er cleanup korrekt i useEffect
- Verificér expires_at format er korrekt (ISO 8601)

### Chat beskeder vises ikke?

1. Tjek RLS policy for chat_messages
2. Verificér match_id er korrekt
3. Check realtime subscription filter

---

## 📊 Performance Metrics

Målinger for optimal performance:

- **Ping send latency**: < 500ms
- **Realtime notification**: < 1 sekund
- **Chat message sync**: < 500ms
- **UI state update**: Instant
- **Database query**: < 200ms

---

## 🎉 Success Criteria

Testen er succesfuld når:

1. ✅ Ping kan sendes og modtages realtime
2. ✅ Accept opretter match og åbner chat
3. ✅ Chat beskeder synces realtime
4. ✅ Udløb håndteres korrekt (ping + chat)
5. ✅ Ingen data læk mellem brugere
6. ✅ UI opdaterer uden refresh
7. ✅ Fejl håndteres gracefully

---

God test! 🚀
