import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Coffee, Film, Gamepad2, MapPin, X, Zap, Crown } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';

interface PingModalProps {
  visible: boolean;
  onClose: () => void;
  personName: string;
  onSendPing: (activity: string, message: string) => void;
}

export default function PingModal({ visible, onClose, personName, onSendPing }: PingModalProps) {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const { canSendPing, usageLimits, plan, incrementPingUsage } = useSubscription();

  const activities = [
    { id: 'coffee', title: 'Coffee', icon: Coffee, message: 'Coffee in 30 min?' },
    { id: 'movies', title: 'Movie', icon: Film, message: 'Movie tonight?' },
    { id: 'gaming', title: 'Gaming', icon: Gamepad2, message: 'Gaming session?' },
    { id: 'walking', title: 'Walk', icon: MapPin, message: 'Walk in the park?' },
  ];

  const handleSend = async () => {
    if (!selectedActivity || !canSendPing()) return;

    const activity = activities.find(a => a.id === selectedActivity);
    const message = customMessage || activity?.message || '';

    await incrementPingUsage();
    onSendPing(selectedActivity, message);
    setSelectedActivity('');
    setCustomMessage('');
    onClose();
  };

  const pingsRemaining = usageLimits
    ? usageLimits.daily_pings_limit - usageLimits.daily_pings_used
    : 0;

  const isUnlimited = plan?.features.daily_pings === -1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ping {personName}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <Text style={styles.modalSubtitle}>What would you like to do together?</Text>

          <View style={styles.activities}>
            {activities.map((activity) => (
              <Pressable
                key={activity.id}
                style={[
                  styles.activityOption,
                  selectedActivity === activity.id && styles.activityOptionSelected
                ]}
                onPress={() => setSelectedActivity(activity.id)}
              >
                <activity.icon 
                  size={20} 
                  color={selectedActivity === activity.id ? '#FFFFFF' : '#F97316'} 
                />
                <Text style={[
                  styles.activityOptionText,
                  selectedActivity === activity.id && styles.activityOptionTextSelected
                ]}>
                  {activity.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.messagePreview}>
            <Text style={styles.messageLabel}>Your ping:</Text>
            <Text style={styles.messageText}>
              "{activities.find(a => a.id === selectedActivity)?.message || 'Select an activity'}"
            </Text>
          </View>

          {canSendPing() ? (
            <>
              <View style={styles.limitInfo}>
                {isUnlimited ? (
                  <>
                    <Crown size={16} color="#F59E0B" />
                    <Text style={styles.unlimitedText}>Unlimited pings</Text>
                  </>
                ) : (
                  <>
                    <Zap size={16} color="#F97316" />
                    <Text style={styles.limitText}>
                      {pingsRemaining} ping{pingsRemaining !== 1 ? 's' : ''} left today
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.sendButton, !selectedActivity && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={!selectedActivity}
                >
                  <Text style={styles.sendButtonText}>Send Ping</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.limitReached}>
                <Text style={styles.limitReachedText}>Daily limit reached</Text>
                <Text style={styles.limitReachedSubtext}>
                  Upgrade to send more pings or buy extra
                </Text>
              </View>

              <Pressable style={styles.upgradeButton}>
                <Crown size={18} color="#FFFFFF" />
                <Text style={styles.upgradeButtonText}>Upgrade to Plus</Text>
              </Pressable>

              <Pressable style={styles.buyPingsButton}>
                <Text style={styles.buyPingsButtonText}>Buy 5 pings - €1.99</Text>
              </Pressable>
            </>
          )}

          <Text style={styles.modalNote}>
            ⏰ Pings expire in 15 minutes
          </Text>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F97316',
    gap: 8,
  },
  activityOptionSelected: {
    backgroundColor: '#F97316',
  },
  activityOptionText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
  activityOptionTextSelected: {
    color: '#FFFFFF',
  },
  messagePreview: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#F97316',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  limitText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
  },
  unlimitedText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  limitReached: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  limitReachedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  limitReachedSubtext: {
    fontSize: 13,
    color: '#991B1B',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buyPingsButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F97316',
    alignItems: 'center',
  },
  buyPingsButtonText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
});