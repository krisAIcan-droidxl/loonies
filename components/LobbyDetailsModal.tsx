import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { X, Users, Clock, MapPin, ChefHat, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DinnerLobby } from '@/types/lobby';
import { useTheme } from '@/hooks/useTheme';

interface LobbyDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  lobby: DinnerLobby | null;
  onJoin: () => void;
  onLeave: () => void;
  isParticipant: boolean;
  currentUserId: string;
}

export default function LobbyDetailsModal({
  visible,
  onClose,
  lobby,
  onJoin,
  onLeave,
  isParticipant,
  currentUserId,
}: LobbyDetailsModalProps) {
  const { colors } = useTheme();

  if (!lobby) return null;

  const isHost = lobby.host_id === currentUserId;
  const canJoin = !isParticipant && lobby.status === 'open' && lobby.current_participants < lobby.max_participants;
  const scheduledDate = new Date(lobby.scheduled_time);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Lobby Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hostSection}>
              {lobby.host?.photo_url ? (
                <Image source={{ uri: lobby.host.photo_url }} style={styles.hostAvatar} />
              ) : (
                <LinearGradient
                  colors={colors.secondaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.hostAvatar, styles.avatarPlaceholder]}
                >
                  <Text style={styles.avatarText}>
                    {lobby.host?.first_name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.hostInfo}>
                <View style={styles.hostNameRow}>
                  <Text style={[styles.hostName, { color: colors.text }]}>{lobby.host?.first_name}</Text>
                  <Crown size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.hostLabel, { color: colors.textSecondary }]}>Lobby Host</Text>
              </View>
            </View>

            <Text style={[styles.lobbyTitle, { color: colors.text }]}>{lobby.title}</Text>
            {lobby.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{lobby.description}</Text>
            )}

            <View style={styles.detailsSection}>
              {lobby.cuisine_type && (
                <View style={[styles.detailRow, { backgroundColor: colors.chipBackground }]}>
                  <View style={styles.detailIcon}>
                    <ChefHat size={20} color={colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Cuisine</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{lobby.cuisine_type}</Text>
                  </View>
                </View>
              )}

              <View style={[styles.detailRow, { backgroundColor: colors.chipBackground }]}>
                <View style={styles.detailIcon}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Scheduled Time</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              {lobby.location_name && (
                <View style={[styles.detailRow, { backgroundColor: colors.chipBackground }]}>
                  <View style={styles.detailIcon}>
                    <MapPin size={20} color={colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{lobby.location_name}</Text>
                  </View>
                </View>
              )}

              <View style={[styles.detailRow, { backgroundColor: colors.chipBackground }]}>
                <View style={styles.detailIcon}>
                  <Users size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Participants</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {lobby.current_participants} / {lobby.max_participants} joined
                  </Text>
                </View>
              </View>
            </View>

            {lobby.participants && lobby.participants.length > 0 && (
              <View style={styles.participantsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Who's Joining</Text>
                {lobby.participants.map((participant) => (
                  <View key={participant.id} style={styles.participantItem}>
                    {participant.profile?.photo_url ? (
                      <Image
                        source={{ uri: participant.profile.photo_url }}
                        style={styles.participantAvatar}
                      />
                    ) : (
                      <LinearGradient
                        colors={colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.participantAvatar, styles.avatarPlaceholder]}
                      >
                        <Text style={styles.participantAvatarText}>
                          {participant.profile?.first_name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    )}
                    <Text style={[styles.participantName, { color: colors.text }]}>
                      {participant.profile?.first_name}
                      {participant.user_id === lobby.host_id && ' (Host)'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.modalBackground }]}>
            {isHost ? (
              <View style={styles.hostFooter}>
                <View style={[styles.hostBadge, { backgroundColor: colors.chipBackground }]}>
                  <Crown size={16} color="#F59E0B" />
                  <Text style={[styles.hostBadgeText, { color: colors.text }]}>You're the host</Text>
                </View>
              </View>
            ) : canJoin ? (
              <Pressable style={styles.joinButton} onPress={onJoin}>
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinButtonGradient}
                >
                  <Text style={styles.joinButtonText}>Join Lobby</Text>
                </LinearGradient>
              </Pressable>
            ) : isParticipant ? (
              <Pressable style={[styles.leaveButton, { backgroundColor: colors.chipBackground, borderColor: colors.error }]} onPress={onLeave}>
                <Text style={[styles.leaveButtonText, { color: colors.error }]}>Leave Lobby</Text>
              </Pressable>
            ) : (
              <View style={[styles.fullBadge, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.fullBadgeText, { color: colors.textSecondary }]}>Lobby is Full</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  hostInfo: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  hostLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  lobbyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    gap: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  participantsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 16,
    color: '#1F2937',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  joinButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  hostFooter: {
    alignItems: 'center',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
});
