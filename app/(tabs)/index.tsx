import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, MapPin, Clock, Check, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { sendPing, acceptPing, ignorePing, getActivePings } from '@/lib/ping';
import { formatTimeRemaining, getTimeRemaining } from '@/lib/time';
import { Ping } from '@/types/ping';
import PingIncomingModal from '@/components/PingIncomingModal';

interface NearbyPerson {
  id: string;
  name: string;
  age: number;
  distance: number;
  eta: string;
  activities: string[];
  photo: string;
  isOnline: boolean;
}

export default function NearbyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [isAvailable, setIsAvailable] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Ping states
  const [sentPings, setSentPings] = useState<Map<string, Ping>>(new Map());
  const [acceptedMatches, setAcceptedMatches] = useState<Map<string, string>>(new Map());
  const [incomingPing, setIncomingPing] = useState<Ping | null>(null);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingCountdowns, setPingCountdowns] = useState<Map<string, string>>(new Map());

  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>([]);

  useEffect(() => {
    getCurrentUser();
    loadActivePings();
    loadNearbyPeople();
    setupRealtimeListeners();
  }, []);

  useEffect(() => {
    // Availability countdown
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isAvailable && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsAvailable(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAvailable, timeLeft]);

  useEffect(() => {
    // Ping countdowns
    const interval = setInterval(() => {
      const newCountdowns = new Map<string, string>();
      sentPings.forEach((ping, userId) => {
        const { isExpired } = getTimeRemaining(ping.expires_at);
        if (isExpired) {
          // Remove expired ping
          setSentPings(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        } else {
          newCountdowns.set(userId, formatTimeRemaining(ping.expires_at));
        }
      });
      setPingCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [sentPings]);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUserId(data.user.id);
    }
  };

  const loadActivePings = async () => {
    const { data: pings } = await getActivePings();
    if (pings) {
      const pingsMap = new Map<string, Ping>();
      const matchesMap = new Map<string, string>();

      pings.forEach(ping => {
        if (ping.from_user === currentUserId) {
          // Sendte pings
          pingsMap.set(ping.to_user, ping);
          if (ping.status === 'accepted') {
            // Match opretet (skal hentes fra matches tabel)
            matchesMap.set(ping.to_user, 'match-id');
          }
        }
      });

      setSentPings(pingsMap);
      setAcceptedMatches(matchesMap);
    }
  };

  const loadNearbyPeople = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Hent andre brugere fra profiles (undtagen dig selv)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, age, photo_url')
        .neq('id', user.user.id)
        .limit(10);

      if (error) {
        console.error('Error loading nearby people:', error);
        return;
      }

      if (profiles && profiles.length > 0) {
        const nearbyList: NearbyPerson[] = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.first_name || 'Unknown',
          age: profile.age || 25,
          distance: 0.5 + (index * 0.3), // Mock distance
          eta: `${5 + (index * 5)} min`,
          activities: ['Dining', 'Sports'],
          photo: profile.photo_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
          isOnline: true,
        }));

        setNearbyPeople(nearbyList);
      }
    } catch (err) {
      console.error('Error in loadNearbyPeople:', err);
    }
  };

  const setupRealtimeListeners = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Lyt efter indgående pings
    const incomingChannel = supabase
      .channel('incoming-pings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pings',
          filter: `to_user=eq.${user.id}`,
        },
        async (payload) => {
          const newPing = payload.new as Ping;

          // Hent afsenderens profil
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, age, photo_url')
            .eq('id', newPing.from_user)
            .single();

          if (profile) {
            newPing.from_profile = profile;
            setIncomingPing(newPing);
            setShowPingModal(true);
          }
        }
      )
      .subscribe();

    // Lyt efter ping status opdateringer (når nogen accepterer vores ping)
    const updatesChannel = supabase
      .channel('ping-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pings',
          filter: `from_user=eq.${user.id}`,
        },
        async (payload) => {
          const updatedPing = payload.new as Ping;

          if (updatedPing.status === 'accepted') {
            // Hent det nyoprettede match
            const { data: matches } = await supabase
              .from('matches')
              .select('*')
              .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
              .order('created_at', { ascending: false })
              .limit(1);

            if (matches && matches.length > 0) {
              const match = matches[0];
              setAcceptedMatches(prev => new Map(prev).set(updatedPing.to_user, match.id));

              Alert.alert(
                'Ping accepteret! 🎉',
                'Din ping blev accepteret. Åbn chat for at snakke sammen!',
                [
                  { text: 'Senere', style: 'cancel' },
                  { text: 'Åbn chat', onPress: () => router.push(`/chat/${match.id}`) },
                ]
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incomingChannel);
      supabase.removeChannel(updatesChannel);
    };
  };

  const toggleAvailability = (minutes: number) => {
    setIsAvailable(true);
    setTimeLeft(minutes * 60);
  };

  const handleSendPing = async (person: NearbyPerson) => {
    if (sentPings.has(person.id)) {
      Alert.alert('Ping allerede sendt', 'Du har allerede sendt et ping til denne person.');
      return;
    }

    const { data, error } = await sendPing(person.id, 'coffee');

    if (error) {
      Alert.alert('Fejl', error.message);
      return;
    }

    if (data) {
      setSentPings(prev => new Map(prev).set(person.id, data));
      Alert.alert('Ping sendt! ☕', `Dit kaffe ping er sendt til ${person.name}`);
    }
  };

  const handleAcceptPing = async () => {
    if (!incomingPing) return;

    const { data: match, error } = await acceptPing(incomingPing.id);

    if (error) {
      Alert.alert('Fejl', error.message);
      setShowPingModal(false);
      return;
    }

    if (match) {
      setShowPingModal(false);
      Alert.alert(
        'Ping accepteret! 🎉',
        'Match oprettet! Chatten er åben i 30 minutter.',
        [
          { text: 'OK', onPress: () => router.push(`/chat/${match.id}`) },
        ]
      );
    }
  };

  const handleIgnorePing = async () => {
    if (!incomingPing) return;

    await ignorePing(incomingPing.id);
    setShowPingModal(false);
    setIncomingPing(null);
  };

  const handleOpenChat = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPingButtonContent = (person: NearbyPerson) => {
    const matchId = acceptedMatches.get(person.id);
    const sentPing = sentPings.get(person.id);
    const countdown = pingCountdowns.get(person.id);

    if (matchId) {
      // Match oprettet - vis "Åbn chat" knap
      return (
        <Pressable
          style={styles.pingButton}
          onPress={() => handleOpenChat(matchId)}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pingButtonGradient}
          >
            <MessageCircle size={16} color="#FFFFFF" />
            <Text style={styles.pingButtonText}>Åbn chat</Text>
          </LinearGradient>
        </Pressable>
      );
    }

    if (sentPing && countdown) {
      // Ping sendt - vis status med countdown
      return (
        <View style={[styles.sentPingChip, { backgroundColor: colors.warningBackground }]}>
          <Clock size={14} color={colors.warning} />
          <Text style={[styles.sentPingText, { color: colors.warning }]}>
            Ping sendt • {countdown}
          </Text>
        </View>
      );
    }

    // Normal ping knap
    return (
      <Pressable
        style={styles.pingButton}
        onPress={() => handleSendPing(person)}
      >
        <LinearGradient
          colors={colors.secondaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pingButtonGradient}
        >
          <Coffee size={16} color="#FFFFFF" />
          <Text style={styles.pingButtonText}>{t('nearby.pingForCoffee')}</Text>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>{t('nearby.title')}</Text>
        </View>

        <View style={styles.statusBar}>
          {isAvailable ? (
            <View style={[styles.availableStatus, { backgroundColor: colors.successBackground }]}>
              <View style={styles.onlineIndicator} />
              <Text style={[styles.statusText, { color: colors.success }]}>
                {t('nearby.availableFor', { time: formatTime(timeLeft) })}
              </Text>
            </View>
          ) : (
            <View style={styles.availabilityOptions}>
              <Pressable
                style={styles.availabilityButton}
                onPress={() => toggleAvailability(30)}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.availabilityGradient}
                >
                  <Text style={styles.availabilityText}>{t('nearby.minutes30')}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={styles.availabilityButton}
                onPress={() => toggleAvailability(60)}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.availabilityGradient}
                >
                  <Text style={styles.availabilityText}>{t('nearby.minutes60')}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={styles.availabilityButton}
                onPress={() => toggleAvailability(90)}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.availabilityGradient}
                >
                  <Text style={styles.availabilityText}>{t('nearby.minutes90')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {!isAvailable ? (
        <View style={styles.unavailableState}>
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>{t('nearby.notVisible')}</Text>
          <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>
            {t('nearby.notVisibleDescription')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {nearbyPeople.map((person) => (
            <View key={person.id} style={[styles.personCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.personHeader}>
                <Image source={{ uri: person.photo }} style={styles.avatar} />
                <View style={styles.personInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.text }]}>{person.name}, {person.age}</Text>
                    {person.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.distanceRow}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={[styles.distance, { color: colors.textSecondary }]}>{person.distance}km • {person.eta}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.activities}>
                {person.activities.map((activity) => (
                  <View key={activity} style={[styles.activityTag, { backgroundColor: colors.chipBackground }]}>
                    <Text style={[styles.activityText, { color: colors.primary }]}>{activity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actions}>
                {getPingButtonContent(person)}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <PingIncomingModal
        ping={incomingPing}
        visible={showPingModal}
        onAccept={handleAcceptPing}
        onIgnore={handleIgnorePing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusBar: {
    alignItems: 'center',
  },
  availableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  availabilityButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  availabilityGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  unavailableState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  unavailableText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  personCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  personInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    marginLeft: 4,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  activityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  pingButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pingButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sentPingChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  sentPingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
