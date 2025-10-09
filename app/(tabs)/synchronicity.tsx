import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Users, Clock, Zap, Coffee, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { locationTracker } from '@/lib/location-tracker';
import { synchronicityEngine, Synchronicity } from '@/lib/synchronicity-engine';
import { autoLobbyCreator } from '@/lib/auto-lobby-creator';
import { supabase } from '@/lib/supabase';

export default function SynchronicityScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [synchronicities, setSynchronicities] = useState<Synchronicity[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadSynchronicities(user.id);
    }
  };

  const startTracking = async () => {
    if (!userId) return;

    const success = await locationTracker.startTracking(userId);
    if (success) {
      setIsTracking(true);
      synchronicityEngine.startScanning(userId, 120000);
      setIsScanning(true);

      Alert.alert(
        'Tracking Started',
        'Loonies is now tracking your location and finding synchronicities nearby!',
        [{ text: 'OK' }]
      );

      const location = await locationTracker.getCurrentLocation();
      if (location) {
        setCurrentLocation({
          lat: location.latitude,
          lng: location.longitude,
        });
      }

      loadSynchronicities(userId);
    } else {
      Alert.alert(
        'Permission Required',
        'Location permission is required for Loonies to work. Please enable it in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopTracking = () => {
    locationTracker.stopTracking();
    synchronicityEngine.stopScanning();
    setIsTracking(false);
    setIsScanning(false);
  };

  const loadSynchronicities = async (uid: string) => {
    const syncs = await synchronicityEngine.getSynchronicitiesForUser(uid);
    setSynchronicities(syncs.sort((a, b) => b.syncScore - a.syncScore));
  };

  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await loadSynchronicities(userId);
    setRefreshing(false);
  };

  const handleJoinSynchronicity = async (sync: Synchronicity) => {
    if (sync.lobbyId) {
      router.push(`/(tabs)/lobbies`);
      return;
    }

    const canCreate = await autoLobbyCreator.shouldCreateLobby(sync);
    if (!canCreate) {
      Alert.alert('Lobby exists', 'This synchronicity already has a lobby!');
      return;
    }

    const lobby = await autoLobbyCreator.createAutoLobby(sync);
    if (lobby) {
      await synchronicityEngine.markAsNotified(sync.id);
      Alert.alert(
        'Lobby Created! 🎉',
        `Auto-lobby "${lobby.title}" has been created! Check the Lobbies tab.`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'View Lobbies', onPress: () => router.push('/(tabs)/lobbies') },
        ]
      );
      loadSynchronicities(userId);
    } else {
      Alert.alert('Error', 'Failed to create lobby. Please try again.');
    }
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'coffee':
        return <Coffee size={20} color="#8B7FFF" />;
      case 'lunch':
      case 'dinner':
        return <Users size={20} color="#8B7FFF" />;
      case 'exercise':
        return <TrendingUp size={20} color="#8B7FFF" />;
      default:
        return <Zap size={20} color="#8B7FFF" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#10B981';
    if (score >= 0.6) return '#F59E0B';
    return '#6B7280';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Perfect Match';
    if (score >= 0.6) return 'Good Match';
    return 'Okay Match';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Synchronicities</Text>
          <Pressable
            style={styles.trackingButton}
            onPress={isTracking ? stopTracking : startTracking}
          >
            <LinearGradient
              colors={isTracking ? ['#EF4444', '#DC2626'] : ['#8B7FFF', '#7C6FED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackingGradient}
            >
              <Zap size={16} color="#FFFFFF" fill={isTracking ? '#FFFFFF' : 'transparent'} />
              <Text style={styles.trackingText}>
                {isTracking ? 'Stop' : 'Start'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {isTracking && (
          <View style={styles.statusBar}>
            <View style={styles.statusIndicator}>
              <View style={styles.pulse} />
              <Text style={styles.statusText}>
                Scanning for synchronicities...
              </Text>
            </View>
          </View>
        )}
      </View>

      {!isTracking ? (
        <View style={styles.emptyState}>
          <Zap size={64} color="#8B7FFF" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Start Tracking</Text>
          <Text style={styles.emptyText}>
            Enable tracking to discover synchronicities with people doing the same activities nearby (within 2km).
          </Text>
          <Pressable style={styles.startButton} onPress={startTracking}>
            <LinearGradient
              colors={['#8B7FFF', '#7C6FED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startGradient}
            >
              <Zap size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Tracking</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : synchronicities.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={64} color="#6B7280" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No Synchronicities Yet</Text>
          <Text style={styles.emptyText}>
            Keep moving! We'll notify you when we find people with matching activities nearby.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {synchronicities.map((sync) => (
            <View key={sync.id} style={styles.syncCard}>
              <View style={styles.syncHeader}>
                <View style={styles.activityBadge}>
                  {getActivityIcon(sync.activityType)}
                  <Text style={styles.activityType}>
                    {sync.activityType}
                  </Text>
                </View>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: `${getScoreColor(sync.syncScore)}20` },
                  ]}
                >
                  <Text style={[styles.scoreText, { color: getScoreColor(sync.syncScore) }]}>
                    {Math.round(sync.syncScore * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.syncInfo}>
                <View style={styles.infoRow}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {sync.userIds.length} people nearby
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {sync.locationName || 'Nearby'} • {Math.round(sync.distanceMeters)}m away
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {formatTimeAgo(sync.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.matchQuality}>
                <View style={styles.qualityBar}>
                  <View
                    style={[
                      styles.qualityFill,
                      {
                        width: `${sync.syncScore * 100}%`,
                        backgroundColor: getScoreColor(sync.syncScore),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.qualityLabel, { color: getScoreColor(sync.syncScore) }]}>
                  {getScoreLabel(sync.syncScore)}
                </Text>
              </View>

              <Pressable
                style={styles.joinButton}
                onPress={() => handleJoinSynchronicity(sync)}
                disabled={sync.lobbyCreated}
              >
                <LinearGradient
                  colors={
                    sync.lobbyCreated
                      ? ['#6B7280', '#4B5563']
                      : ['#8B7FFF', '#7C6FED']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinGradient}
                >
                  <Text style={styles.joinButtonText}>
                    {sync.lobbyCreated ? 'Lobby Created' : 'Create Lobby'}
                  </Text>
                </LinearGradient>
              </Pressable>
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
    backgroundColor: '#0F0F1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#1C1E2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackingButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  trackingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBar: {
    marginTop: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  startButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  syncCard: {
    backgroundColor: '#1C1E2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 127, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7FFF',
    textTransform: 'capitalize',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  syncInfo: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  matchQuality: {
    marginBottom: 16,
  },
  qualityBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  qualityFill: {
    height: 6,
    borderRadius: 3,
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  joinGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
