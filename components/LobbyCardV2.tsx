import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  const getStatusText = () => {
    if (lobby.status === 'open' && !isFull) return 'ÅBEN';
    if (isFull) return 'Næsten fuld';
    return lobby.status.toUpperCase();
  };

  const getButtonText = () => {
    if (lobby.isPaid && lobby.pricePerSeat) {
      return `${lobby.pricePerSeat} ${lobby.currency || 'DKK'}`;
    }
    return 'Jeinn';
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.hostInfo}>
            <Image source={{ uri: lobby.host.photo }} style={styles.avatar} />
            <View style={styles.hostText}>
              <Text style={styles.hostName}>{lobby.host.name}</Text>
              <Text style={styles.hostLabel}>Vært</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <Text style={styles.title}>{lobby.title}</Text>

        <Text style={styles.description} numberOfLines={3}>
          {lobby.description}
        </Text>

        <View style={styles.tagsRow}>
          {lobby.activityTags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {lobby.locationName && (
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{lobby.locationName}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          <View style={styles.participantsSection}>
            <Text style={styles.participantsText}>
              {lobby.currentParticipants}/{lobby.maxParticipants} tilmeldt
            </Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>

          <Pressable style={styles.joinButton} onPress={onJoinPress}>
            {lobby.isPaid && lobby.pricePerSeat ? (
              <LinearGradient
                colors={['#FFB347', '#FF8A5C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.buttonGradient, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              </View>
            )}
          </Pressable>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hostText: {
    gap: 2,
  },
  hostName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B7FFF',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  participantsSection: {
    flex: 1,
    gap: 8,
  },
  participantsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#8B7FFF',
    borderRadius: 4,
  },
  joinButton: {
    minWidth: 100,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
