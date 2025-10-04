import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Phone, Mail } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

type SignUpMethod = 'phone' | 'email' | null;

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!signUpMethod) return;

    if (signUpMethod === 'email') {
      if (!email.includes('@')) {
        Alert.alert('Fejl', 'Indtast venligst en gyldig email');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Fejl', 'Adgangskoden skal være mindst 6 tegn');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) throw error;

        if (data.user) {
          console.log('Sign up successful:', data.user.id);
          router.replace('/(auth)/profile-setup');
        }
      } catch (error: any) {
        console.error('Email sign up error:', error);
        Alert.alert('Fejl', error.message || 'Kunne ikke oprette bruger');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert(
        'Telefon Login',
        'Telefon login kræver SMS konfiguration i Supabase. Brug email i stedet.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!signUpMethod) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>Opret profil</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Vælg hvordan du vil tilmelde dig
            </Text>
          </View>

          <View style={styles.methodsContainer}>
            <Pressable
              style={[styles.methodCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => setSignUpMethod('email')}
            >
              <View style={[styles.methodIcon, { backgroundColor: colors.primaryLight }]}>
                <Mail size={32} color={colors.primary} />
              </View>
              <Text style={[styles.methodTitle, { color: colors.text }]}>Email</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>
                Tilmeld dig med email og adgangskode
              </Text>
            </Pressable>

            <Pressable
              style={[styles.methodCard, {
                backgroundColor: colors.cardBackground,
                opacity: 0.5
              }]}
              onPress={() => setSignUpMethod('phone')}
            >
              <View style={[styles.methodIcon, { backgroundColor: colors.primaryLight }]}>
                <Phone size={32} color={colors.primary} />
              </View>
              <Text style={[styles.methodTitle, { color: colors.text }]}>Telefonnummer</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>
                Kræver SMS konfiguration
              </Text>
            </Pressable>
          </View>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>✨</Text>
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Hurtig og sikker tilmelding
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🔒</Text>
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Dine data er beskyttede
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🎈</Text>
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Mød nye venner i nærheden
              </Text>
            </View>
          </View>

          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            Ved at fortsætte accepterer du vores vilkår og betingelser
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => setSignUpMethod(null)} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Email
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContent}>
          <Text style={[styles.inputTitle, { color: colors.text }]}>
            Opret din konto
          </Text>
          <Text style={[styles.inputSubtitle, { color: colors.textSecondary }]}>
            Indtast din email og vælg en adgangskode
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="din@email.dk"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Adgangskode</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="Mindst 6 tegn"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={loading || email.length < 3 || password.length < 6}
          >
            <LinearGradient
              colors={email.length >= 3 && password.length >= 6 && !loading ? colors.primaryGradient : [colors.border, colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={[styles.continueButtonText, {
                opacity: email.length >= 3 && password.length >= 6 && !loading ? 1 : 0.5
              }]}>
                {loading ? 'Opretter...' : 'Opret konto'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.signinButton}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={[styles.signinButtonText, { color: colors.primary }]}>
              Har du allerede en konto? Log ind
            </Text>
          </Pressable>
        </View>
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
    padding: 24,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  methodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  benefits: {
    gap: 16,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputContent: {
    flex: 1,
  },
  inputTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  inputSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonWrapper: {
    gap: 16,
    paddingBottom: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  signinButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signinButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
