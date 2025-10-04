import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Clock, MapPin, ChefHat, Euro, BadgeCheck, Star } from 'lucide-react-native';
import { DinnerLobby } from '@/types/lobby';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface LobbyCardProps {
  lobby: DinnerLobby;
  onPress: () => void;
}

export default function LobbyCard({ lobby, onPress }: LobbyCardProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const scheduledDate = new Date(lobby.scheduled_time);
  const now = new Date();
  const hoursUntil = Math.round((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  const timeText = hoursUntil < 1
    ? t('lobbies.startingSoon')
    : hoursUntil < 24
      ? t('lobbies.inHours', { hours: hoursUntil })
      : scheduledDate.toLocaleDateString('da-DK', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      <LinearGradient
        colors={lobby.is_paid ? colors.paidGradient : colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.header}>
            <View style={styles.hostInfo}>
              {lobby.host?.photo_url ? (
                <Image source={{ uri: lobby.host.photo_url }} style={styles.hostAvatar} />
              ) : (
                <LinearGradient
                  colors={['#FF6B6B', '#FFB347']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.hostAvatar, styles.avatarPlaceholder]}
                >
                  <Text style={styles.avatarText}>
                    {lobby.host?.first_name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.hostDetails}>
                <View style={styles.hostNameRow}>
                  <Text style={[styles.hostName, { color: colors.text }]}>{lobby.host?.first_name}</Text>
                  {lobby.host?.rating_average && lobby.host.rating_average > 0 && (
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#FFB347" fill="#FFB347" />
                      <Text style={styles.ratingText}>{lobby.host?.rating_average.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.hostLabel, { color: colors.textSecondary }]}>{t('lobbyDetails.host')}</Text>
              </View>
            </View>
            <View style={styles.badges}>
              {lobby.host?.is_verified_host && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheck size={16} color="#FFFFFF" />
                </View>
              )}
              <View style={[styles.statusBadge, lobby.status === 'full' && styles.fullBadge]}>
                <Text style={[styles.statusText, lobby.status === 'full' && styles.fullStatusText]}>
                  {lobby.status === 'full' ? t('lobbyDetails.full') : t('lobbyDetails.open')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{lobby.title}</Text>
            {lobby.is_paid && (
              <View style={styles.priceTag}>
                <Euro size={16} color="#FF6B6B" />
                <Text style={styles.priceText}>{lobby.price_per_seat}€</Text>
              </View>
            )}
          </View>

          {lobby.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {lobby.description}
            </Text>
          )}

          <View style={styles.details}>
            {lobby.cuisine_type && (
              <View style={[styles.detailChip, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}>
                <ChefHat size={14} color={colors.primary} />
                <Text style={[styles.detailChipText, { color: colors.primary }]}>{lobby.cuisine_type}</Text>
              </View>
            )}
            <View style={[styles.detailChip, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}>
              <Clock size={14} color={colors.primary} />
              <Text style={[styles.detailChipText, { color: colors.primary }]}>{timeText}</Text>
            </View>
            {lobby.location_name && (
              <View style={[styles.detailChip, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}>
                <MapPin size={14} color={colors.primary} />
                <Text style={[styles.detailChipText, { color: colors.primary }]} numberOfLines={1}>
                  {lobby.location_name}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.footer, { borderTopColor: isDark ? '#2D3748' : '#F3F4F6' }]}>
            <View style={styles.participantsInfo}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.participantsText, { color: colors.text }]}>
                {lobby.current_participants}/{lobby.max_participants} {t('lobbies.joined')}
              </Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#252538' : '#F3F4F6' }]}>
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${(lobby.current_participants / lobby.max_participants) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  gradientBorder: {
    borderRadius: 28,
    padding: 3,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  hostDetails: {
    justifyContent: 'center',
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  hostLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  statusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  fullBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FF6B6B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 1,
  },
  fullStatusText: {
    color: '#DC2626',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 28,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB347',
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  detailChipText: {
    fontSize: 13,
    color: '#667EEA',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  participantsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
});
