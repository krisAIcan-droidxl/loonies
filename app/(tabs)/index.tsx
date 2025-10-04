import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, MapPin, Clock, Zap, Map } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

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
  const [isAvailable, setIsAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [timeLeft, setTimeLeft] = useState(0);
  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>([
    {
      id: '1',
      name: 'Sarah',
      age: 28,
      distance: 0.8,
      eta: '10 min walk',
      activities: ['coffee', 'reading'],
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Alex',
      age: 25,
      distance: 1.2,
      eta: '15 min walk',
      activities: ['gaming', 'coffee'],
      photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
      isOnline: true,
    },
  ]);

  useEffect(() => {
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

  const toggleAvailability = (minutes: number) => {
    setIsAvailable(true);
    setTimeLeft(minutes * 60);
  };

  const sendPing = (person: NearbyPerson, activity: string) => {
    // Handle ping sending logic
    console.log(`Pinging ${person.name} for ${activity}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>{t('nearby.title')}</Text>
          <Pressable
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          >
            <Map size={20} color={colors.primary} />
          </Pressable>
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
                    <View style={styles.onlineIndicator} />
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
                <Pressable
                  style={styles.pingButton}
                  onPress={() => sendPing(person, 'coffee')}
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

                <Pressable
                  style={[styles.secondaryPingButton, { borderColor: colors.primary }]}
                  onPress={() => sendPing(person, 'gaming')}
                >
                  <Text style={[styles.secondaryPingButtonText, { color: colors.primary }]}>Gaming?</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  viewToggle: {
    padding: 8,
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
  secondaryPingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});