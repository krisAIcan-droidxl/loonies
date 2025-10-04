import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Euro, BadgeCheck, CircleAlert as AlertCircle, UtensilsCrossed, Dumbbell, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { LobbyType } from '@/types/lobby';

interface CreateLobbyModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (lobbyData: LobbyFormData) => void;
}

export interface LobbyFormData {
  title: string;
  description: string;
  lobby_type: LobbyType;
  cuisine_type: string | null;
  activity_type: string | null;
  max_participants: number;
  scheduled_time: Date;
  location_name: string;
  is_paid: boolean;
  price_per_seat: number;
}

export default function CreateLobbyModal({ visible, onClose, onCreate }: CreateLobbyModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [lobbyType, setLobbyType] = useState<LobbyType>('dinner');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [locationName, setLocationName] = useState('');
  const [selectedTime, setSelectedTime] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [isPaid, setIsPaid] = useState(false);
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [isVerifiedHost, setIsVerifiedHost] = useState(false);

  const cuisineTypes = ['italian', 'japanese', 'mexican', 'chinese', 'indian', 'thai', 'american', 'mediterranean', 'korean', 'french'];
  const sportsTypes = ['football', 'basketball', 'tennis', 'running', 'cycling', 'swimming', 'yoga', 'gym', 'hiking', 'climbing'];
  const socialTypes = ['coffee', 'drinks', 'movies', 'gaming', 'boardgames', 'reading', 'art', 'music', 'photography', 'networking'];

  const lobbyTypeOptions = [
    { value: 'dinner' as LobbyType, icon: UtensilsCrossed, label: t('lobbyTypes.dinner') },
    { value: 'sports' as LobbyType, icon: Dumbbell, label: t('lobbyTypes.sports') },
    { value: 'social' as LobbyType, icon: Users, label: t('lobbyTypes.social') },
  ];

  React.useEffect(() => {
    checkVerification();
  }, [visible]);

  const checkVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('is_verified_host')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setIsVerifiedHost(data.is_verified_host);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    const now = new Date();
    let scheduledTime = new Date();

    if (selectedTime === 'today') {
      scheduledTime.setHours(now.getHours() + 2);
    } else if (selectedTime === 'tomorrow') {
      scheduledTime.setDate(now.getDate() + 1);
      scheduledTime.setHours(19, 0, 0, 0);
    }

    onCreate({
      title: title.trim(),
      description: description.trim() || '',
      lobby_type: lobbyType,
      cuisine_type: lobbyType === 'dinner' && selectedCuisine ? selectedCuisine : null,
      activity_type: lobbyType !== 'dinner' && selectedActivity ? selectedActivity : null,
      max_participants: maxParticipants,
      scheduled_time: scheduledTime,
      location_name: locationName.trim() || '',
      is_paid: isPaid,
      price_per_seat: isPaid ? parseFloat(pricePerSeat) || 0 : 0,
    });

    setTitle('');
    setDescription('');
    setLobbyType('dinner');
    setSelectedCuisine('');
    setSelectedActivity('');
    setMaxParticipants(4);
    setLocationName('');
    setSelectedTime('today');
    setIsPaid(false);
    setPricePerSeat('');
  };

  const getActivityTypes = () => {
    if (lobbyType === 'sports') return sportsTypes;
    if (lobbyType === 'social') return socialTypes;
    return cuisineTypes;
  };

  const getActivityLabel = () => {
    if (lobbyType === 'sports') return 'sports';
    if (lobbyType === 'social') return 'social';
    return 'cuisines';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('createLobby.title')}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Lobby Type Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.lobbyType')}</Text>
              <View style={styles.lobbyTypeContainer}>
                {lobbyTypeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.lobbyTypeButton,
                      { borderColor: colors.border },
                      lobbyType === option.value && styles.lobbyTypeButtonActive,
                    ]}
                    onPress={() => {
                      setLobbyType(option.value);
                      setSelectedCuisine('');
                      setSelectedActivity('');
                    }}
                  >
                    {lobbyType === option.value ? (
                      <LinearGradient
                        colors={colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.lobbyTypeGradient}
                      >
                        <option.icon size={28} color="#FFFFFF" />
                        <Text style={styles.lobbyTypeTextActive}>{option.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.lobbyTypeContent}>
                        <option.icon size={28} color={colors.textSecondary} />
                        <Text style={[styles.lobbyTypeText, { color: colors.textSecondary }]}>{option.label}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.lobbyTitle')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder={t('createLobby.lobbyTitlePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder={t('createLobby.descriptionPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {lobbyType === 'dinner' ? t('createLobby.cuisineType') : t('createLobby.activityType')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {getActivityTypes().map((type) => {
                  const isSelected = lobbyType === 'dinner' ? selectedCuisine === type : selectedActivity === type;
                  return (
                    <Pressable
                      key={type}
                      style={[
                        styles.chip,
                        { borderColor: colors.border, backgroundColor: colors.inputBackground },
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => {
                        if (lobbyType === 'dinner') {
                          setSelectedCuisine(type);
                        } else {
                          setSelectedActivity(type);
                        }
                      }}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={colors.primaryGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.chipGradient}
                        >
                          <Text style={styles.chipTextSelected}>
                            {t(`createLobby.${getActivityLabel()}.${type}`)}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={[styles.chipText, { color: colors.text }]}>
                          {t(`createLobby.${getActivityLabel()}.${type}`)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.maxParticipants')}</Text>
              <View style={styles.participantsControl}>
                {[2, 4, 6, 8, 10].map((num) => (
                  <Pressable
                    key={num}
                    style={[
                      styles.participantButton,
                      { borderColor: colors.border, backgroundColor: colors.inputBackground },
                      maxParticipants === num && styles.participantButtonSelected,
                    ]}
                    onPress={() => setMaxParticipants(num)}
                  >
                    {maxParticipants === num ? (
                      <LinearGradient
                        colors={colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.participantGradient}
                      >
                        <Text style={styles.participantTextSelected}>{num}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={[styles.participantText, { color: colors.text }]}>{num}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.when')}</Text>
              <View style={styles.timeButtons}>
                <Pressable
                  style={[
                    styles.timeButton,
                    { borderColor: colors.border, backgroundColor: colors.inputBackground },
                    selectedTime === 'today' && styles.timeButtonSelected,
                  ]}
                  onPress={() => setSelectedTime('today')}
                >
                  {selectedTime === 'today' ? (
                    <LinearGradient
                      colors={colors.primaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.timeGradient}
                    >
                      <Text style={styles.timeTextSelected}>{t('createLobby.today')}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[styles.timeText, { color: colors.text }]}>{t('createLobby.today')}</Text>
                  )}
                </Pressable>
                <Pressable
                  style={[
                    styles.timeButton,
                    { borderColor: colors.border, backgroundColor: colors.inputBackground },
                    selectedTime === 'tomorrow' && styles.timeButtonSelected,
                  ]}
                  onPress={() => setSelectedTime('tomorrow')}
                >
                  {selectedTime === 'tomorrow' ? (
                    <LinearGradient
                      colors={colors.primaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.timeGradient}
                    >
                      <Text style={styles.timeTextSelected}>{t('createLobby.tomorrow')}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[styles.timeText, { color: colors.text }]}>{t('createLobby.tomorrow')}</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{t('createLobby.location')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                placeholder={t('createLobby.locationPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>

            {isVerifiedHost && (
              <View style={[styles.section, styles.paidSection, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}>
                <View style={styles.paidHeader}>
                  <View style={styles.paidTitle}>
                    <Euro size={20} color={colors.primary} />
                    <Text style={[styles.paidLabel, { color: colors.text }]}>{t('createLobby.chargePerSeat')}</Text>
                  </View>
                  <Pressable
                    style={[styles.toggle, isPaid && { backgroundColor: colors.primary }]}
                    onPress={() => setIsPaid(!isPaid)}
                  >
                    <View style={[styles.toggleThumb, isPaid && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                {isPaid && (
                  <View style={styles.priceInput}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                      placeholder="15"
                      keyboardType="decimal-pad"
                      value={pricePerSeat}
                      onChangeText={setPricePerSeat}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>€ {t('createLobby.pricePerSeat')}</Text>
                  </View>
                )}
              </View>
            )}

            {!isVerifiedHost && (
              <View style={[styles.verificationNotice, { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder }]}>
                <AlertCircle size={20} color={colors.warning} />
                <Text style={[styles.verificationText, { color: colors.textSecondary }]}>
                  {t('createLobby.getVerified')}
                </Text>
              </View>
            )}

            <Pressable style={styles.createButton} onPress={handleCreate}>
              <LinearGradient
                colors={colors.secondaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButtonGradient}
              >
                <Text style={styles.createButtonText}>{t('createLobby.create')}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  lobbyTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  lobbyTypeButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  lobbyTypeButtonActive: {
    borderColor: 'transparent',
  },
  lobbyTypeGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  lobbyTypeContent: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  lobbyTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lobbyTypeTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  chipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipTextSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantsControl: {
    flexDirection: 'row',
    gap: 12,
  },
  participantButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  participantButtonSelected: {
    borderColor: 'transparent',
  },
  participantGradient: {
    padding: 16,
    alignItems: 'center',
  },
  participantText: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    textAlign: 'center',
  },
  participantTextSelected: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  timeButtonSelected: {
    borderColor: 'transparent',
  },
  timeGradient: {
    padding: 16,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    textAlign: 'center',
  },
  timeTextSelected: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paidSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  paidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paidLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    padding: 4,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  priceInput: {
    marginTop: 16,
  },
  priceLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  verificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  createButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
