import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

export default function VerifyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const phone = params.phone as string;
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const isEmail = !!email;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Fejl', 'Indtast venligst den 6-cifrede kode');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp(
        isEmail
          ? { email: email!, token: code, type: 'email' }
          : { phone: phone!, token: code, type: 'sms' }
      );

      if (error) throw error;

      console.log('Verification successful:', data);

      // Check if profile exists
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
      console.error('Verification error:', error);
      Alert.alert('Fejl', error.message || 'Kunne ikke verificere kode');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      if (isEmail) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
        });
        if (error) throw error;
      }

      Alert.alert('Succes', 'En ny kode er sendt');
      setTimer(60);
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert('Fejl', error.message || 'Kunne ikke sende ny kode');
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
        <Text style={[styles.title, { color: colors.text }]}>
          Verificer {isEmail ? 'email' : 'telefon'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Indtast den 6-cifrede kode sendt til {isEmail ? email : phone}
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="000000"
            placeholderTextColor={colors.textSecondary}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
        </View>

        <Pressable
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verificerer...' : 'Verificer'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleResend} disabled={timer > 0 || loading}>
          <Text style={[
            styles.resendText,
            { color: timer > 0 || loading ? colors.textSecondary : colors.primary }
          ]}>
            {timer > 0 ? `Send kode igen om ${timer}s` : 'Send kode igen'}
          </Text>
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
    padding: 24,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
});
