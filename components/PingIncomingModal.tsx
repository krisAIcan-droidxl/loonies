import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Coffee, X } from 'lucide-react-native';
import { Ping } from '@/types/ping';
import { useTheme } from '@/hooks/useTheme';

interface PingIncomingModalProps {
  ping: Ping | null;
  visible: boolean;
  onAccept: () => void;
  onIgnore: () => void;
}

export default function PingIncomingModal({
  ping,
  visible,
  onAccept,
  onIgnore,
}: PingIncomingModalProps) {
  const { colors } = useTheme();

  if (!ping || !ping.from_profile) return null;

  const getActivityIcon = () => {
    switch (ping.activity) {
      case 'coffee':
        return <Coffee size={32} color="#F97316" />;
      default:
        return <Coffee size={32} color="#F97316" />;
    }
  };

  const getActivityText = () => {
    switch (ping.activity) {
      case 'coffee':
        return 'Kaffe ping';
      case 'gaming':
        return 'Gaming ping';
      case 'sports':
        return 'Sports ping';
      case 'dinner':
        return 'Middag ping';
      default:
        return 'Ping';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onIgnore}
    >
      <Pressable style={styles.overlay} onPress={onIgnore}>
        <Pressable
          style={[styles.modal, { backgroundColor: colors.modalBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable style={styles.closeButton} onPress={onIgnore}>
            <X size={24} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.content}>
            <View style={styles.iconContainer}>{getActivityIcon()}</View>

            <Text style={[styles.title, { color: colors.text }]}>
              {getActivityText()}
            </Text>

            {ping.from_profile.photo_url && (
              <Image
                source={{ uri: ping.from_profile.photo_url }}
                style={styles.profileImage}
              />
            )}

            <Text style={[styles.message, { color: colors.text }]}>
              <Text style={styles.name}>{ping.from_profile.first_name}</Text>{' '}
              er klar i nærheden
            </Text>

            <View style={styles.buttons}>
              <Pressable
                style={[styles.button, styles.ignoreButton, { borderColor: colors.border }]}
                onPress={onIgnore}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                  Ignorer
                </Text>
              </Pressable>

              <Pressable style={[styles.button, styles.acceptButton]} onPress={onAccept}>
                <Text style={styles.acceptButtonText}>Acceptér</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  name: {
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ignoreButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#F97316',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
