import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, Users, Check } from 'lucide-react-native';

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
  const isFull = lobby.currentParticipants >= lobby.maxParticipants;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('da-DK', { month: 'short' });
    const time = date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    return { day, month, time };
  };

  const { day, month, time } = formatDateTime(lobby.scheduledTime);

  const getStatusText = () => {
    if (lobby.status === 'open' && !isFull) return 'ÅBEN';
    if (isFull) return 'Næsten fuld';
    return lobby.status.toUpperCase();
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.hostInfo}>
            <Image source={{ uri: lobby.host.photo }} style={styles.avatar} />
            <View style={styles.hostText}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName}>{lobby.host.name}</Text>
                {lobby.host.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Check size={14} color="#4BC8B4" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text style={styles.hostLabel}>Vært</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{lobby.title}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {lobby.description}
        </Text>

        {/* Activity Tags */}
        <View style={styles.tagsRow}>
          {lobby.activityTags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Info Rows */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Clock size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
            <Text style={styles.infoText}>
              {day}. {month}. • {time}
            </Text>
          </View>

          {lobby.locationName && (
            <View style={styles.infoRow}>
              <MapPin size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
              <Text style={styles.infoText}>{lobby.locationName}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Users size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
            <Text style={styles.infoText}>
              {lobby.currentParticipants}/{lobby.maxParticipants} deltagere
            </Text>
            {lobby.isPaid && lobby.pricePerSeat && (
              <View style={styles.pricePill}>
                <LinearGradient
                  colors={['#FFB347', '#FF8A5C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.priceGradient}
                >
                  <Text style={styles.priceText}>
                    {lobby.pricePerSeat} {lobby.currency || 'EUR'}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>

        {/* Join Button */}
        <Pressable onPress={onJoinPress}>
          <LinearGradient
            colors={['#9D8CFF', '#8B7FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.joinButton}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1C1E2E',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hostText: {
    gap: 4,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 200, 180, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    backgroundColor: 'rgba(75, 200, 180, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4BC8B4',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 127, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 127, 255, 0.3)',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7FFF',
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  pricePill: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#8B7FFF',
    borderRadius: 3,
  },
  joinButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
