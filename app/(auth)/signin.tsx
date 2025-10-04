import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/profile-setup');
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Fejl', error.message || 'Kunne ikke logge ind. Tjek din email og adgangskode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.text }]}>Velkommen tilbage</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Log ind med din email og adgangskode
          </Text>
        </View>

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
              placeholder="Din adgangskode"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Pressable
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading || email.length < 3 || password.length < 6}
          >
            <LinearGradient
              colors={email.length >= 3 && password.length >= 6 && !loading ? colors.primaryGradient : [colors.border, colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signInButtonGradient}
            >
              <Text style={[styles.signInButtonText, {
                opacity: email.length >= 3 && password.length >= 6 && !loading ? 1 : 0.5
              }]}>
                {loading ? 'Logger ind...' : 'Log ind'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.signupButton}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={[styles.signupButtonText, { color: colors.primary }]}>
              Har du ikke en konto? Opret en
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  textContent: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
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
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  signInButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  signupButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
