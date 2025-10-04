import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, User, ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

type Step = 'name' | 'birthdate' | 'gender' | 'photo';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const genderOptions = [
    { value: 'man', label: 'Mand' },
    { value: 'woman', label: 'Kvinde' },
    { value: 'non-binary', label: 'Ikke-binær' },
    { value: 'other', label: 'Andet' },
  ];

  const steps: Step[] = ['name', 'birthdate', 'gender', 'photo'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const calculateAge = (birthdate: string): number => {
    const parts = birthdate.split('-');
    if (parts.length !== 3) return 0;

    const [day, month, year] = parts.map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const validateBirthdate = (date: string): boolean => {
    const parts = date.split('-');
    if (parts.length !== 3) return false;

    const [day, month, year] = parts.map(Number);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
      return false;
    }

    const age = calculateAge(date);
    return age >= 18 && age <= 100;
  };

  const handleNext = () => {
    if (currentStep === 'name') {
      if (!firstName.trim() || firstName.trim().length < 2) {
        Alert.alert('Fejl', 'Indtast venligst dit fornavn (mindst 2 bogstaver)');
        return;
      }
      setCurrentStep('birthdate');
    } else if (currentStep === 'birthdate') {
      if (!validateBirthdate(birthdate)) {
        Alert.alert('Fejl', 'Indtast venligst en gyldig fødselsdato (DD-MM-ÅÅÅÅ). Du skal være mindst 18 år.');
        return;
      }
      setCurrentStep('gender');
    } else if (currentStep === 'gender') {
      setCurrentStep('photo');
    } else if (currentStep === 'photo') {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const handlePhotoUpload = () => {
    setPhotoUrl('https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400');
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Fejl', 'Du skal være logget ind');
        router.replace('/(auth)/signin');
        return;
      }

      const age = calculateAge(birthdate);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName.trim(),
          age: age,
          photo_url: photoUrl,
          activities: [],
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      console.log('Profile created successfully');
      router.replace('/(auth)/activities');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      Alert.alert('Fejl', error.message || 'Kunne ikke oprette profil');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 'name') return firstName.trim().length >= 2;
    if (currentStep === 'birthdate') return validateBirthdate(birthdate);
    if (currentStep === 'gender') return gender !== '';
    if (currentStep === 'photo') return true;
    return false;
  };

  const formatBirthdate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2);
      if (cleaned.length >= 4) {
        formatted += '-' + cleaned.slice(2, 4);
        if (cleaned.length >= 8) {
          formatted += '-' + cleaned.slice(4, 8);
        } else if (cleaned.length > 4) {
          formatted += '-' + cleaned.slice(4);
        }
      } else if (cleaned.length > 2) {
        formatted += '-' + cleaned.slice(2);
      }
    }

    return formatted;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, {
              width: `${progress}%`,
              backgroundColor: colors.primary
            }]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'name' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Hvad er dit fornavn?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Dette vil være synligt for andre brugere
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="Dit fornavn"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoFocus
                maxLength={50}
              />
            </View>
          </View>
        )}

        {currentStep === 'birthdate' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Hvornår er du født?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Din alder vil være synlig. Du skal være mindst 18 år.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="DD-MM-ÅÅÅÅ"
                placeholderTextColor={colors.textSecondary}
                value={birthdate}
                onChangeText={(text) => setBirthdate(formatBirthdate(text))}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
              {birthdate.length === 10 && validateBirthdate(birthdate) && (
                <Text style={[styles.ageDisplay, { color: colors.success }]}>
                  ✓ Du er {calculateAge(birthdate)} år
                </Text>
              )}
            </View>
          </View>
        )}

        {currentStep === 'gender' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Hvad er dit køn?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Dette hjælper os med at skabe et bedre fællesskab
            </Text>

            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: gender === option.value ? colors.primary : colors.border
                    },
                    gender === option.value && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender(option.value)}
                >
                  <View style={styles.genderOptionContent}>
                    <Text style={[
                      styles.genderOptionText,
                      { color: gender === option.value ? colors.primary : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                    {gender === option.value && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {currentStep === 'photo' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Tilføj et profilbillede</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Valgfrit - Du kan tilføje et billede senere
            </Text>

            <View style={styles.photoSection}>
              <View style={styles.photoContainer}>
                {photoUrl ? (
                  <View style={styles.photoWrapper}>
                    <View style={[styles.photoFrame, { borderColor: colors.primary }]}>
                      <Text style={styles.photoEmoji}>👤</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.photoPlaceholder, {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border
                  }]}>
                    <User size={48} color={colors.textSecondary} />
                  </View>
                )}
                <Pressable
                  style={styles.cameraButton}
                  onPress={handlePhotoUpload}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cameraButtonGradient}
                  >
                    <Camera size={20} color="#FFFFFF" />
                  </LinearGradient>
                </Pressable>
              </View>
              <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
                Vælg et venligt billede hvor dit ansigt er tydeligt
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={styles.continueButton}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <LinearGradient
            colors={canProceed() && !loading ? colors.primaryGradient : [colors.border, colors.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButtonGradient}
          >
            <Text style={[styles.continueButtonText, {
              opacity: canProceed() && !loading ? 1 : 0.5
            }]}>
              {loading ? 'Gemmer...' : currentStep === 'photo' ? 'Færdig' : 'Næste'}
            </Text>
            {!loading && currentStep !== 'photo' && (
              <ArrowRight size={20} color="#FFFFFF" />
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    fontWeight: '600',
  },
  ageDisplay: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  genderContainer: {
    gap: 12,
  },
  genderOption: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
  },
  genderOptionSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  genderOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genderOptionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    gap: 20,
  },
  photoContainer: {
    position: 'relative',
  },
  photoWrapper: {
    padding: 4,
  },
  photoFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  photoEmoji: {
    fontSize: 64,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
