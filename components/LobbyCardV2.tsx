import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Clock, MapPin, Users } from 'lucide-react-native';

interface LobbyCardV2Props {
  lobby: {
    id: string;
    title: string;
    description: string;
    host: {
      name: string;
      photo: string;
      isVerified?: boolean;
    };
    activityTags: string[];
    currentParticipants: number;
    maxParticipants: number;
    isPaid: boolean;
    pricePerSeat?: number;
    currency?: string;
    scheduledTime: string;
    locationName?: string;
    status: 'open' | 'full' | 'started' | 'completed' | 'cancelled';
  };
  onPress: () => void;
  onJoinPress: () => void;
}

export default function LobbyCardV2({ lobby, onPress, onJoinPress }: LobbyCardV2Props) {
  const progress = (lobby.currentParticipants / lobby.maxParticipants) * 100;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <BlurView intensity={30} style={styles.blur}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.hostInfo}>
              <Image source={{ uri: lobby.host.photo }} style={styles.hostAvatar} />
              <View style={styles.hostDetails}>
                <View style={styles.hostNameContainer}>
                  <Text style={styles.hostName}>{lobby.host.name}</Text>
                  {lobby.host.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
                <Text style={styles.hostLabel}>Vært</Text>
              </View>
            </View>

            {lobby.status === 'open' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ÅBEN</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{lobby.title}</Text>
            {lobby.description && (
              <Text style={styles.description} numberOfLines={2}>
                {lobby.description}
              </Text>
            )}

            <View style={styles.tags}>
              {lobby.activityTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.infoText}>
                  {formatDate(lobby.scheduledTime)} • {formatTime(lobby.scheduledTime)}
                </Text>
              </View>
              {lobby.locationName && (
                <View style={styles.infoItem}>
                  <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {lobby.locationName}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.participantsSection}>
              <View style={styles.participantsHeader}>
                <View style={styles.participantsInfo}>
                  <Users size={18} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.participantsText}>
                    {lobby.currentParticipants} / {lobby.maxParticipants} deltagere
                  </Text>
                </View>
                {lobby.isPaid && lobby.pricePerSeat && (
                  <View style={styles.pricePill}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FFB347']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.priceGradient}
                    >
                      <Text style={styles.priceText}>
                        {lobby.pricePerSeat} {lobby.currency || 'DKK'}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={['#8B7FFF', '#9D6FFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            </View>
          </View>

          <Pressable style={styles.joinButton} onPress={onJoinPress}>
            <LinearGradient
              colors={['#8B7FFF', '#9D6FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.joinGradient}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  blur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  card: {
    backgroundColor: 'rgba(20, 20, 35, 0.6)',
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(139, 127, 255, 0.3)',
  },
  hostDetails: {
    flex: 1,
    gap: 2,
  },
  hostNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#8B7FFF',
  },
  hostLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 127, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 127, 255, 0.3)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7FFF',
    letterSpacing: 0.3,
  },
  infoRow: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    flex: 1,
  },
  participantsSection: {
    gap: 10,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  pricePill: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    height: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
