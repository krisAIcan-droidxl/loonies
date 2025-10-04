import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Coffee, Gamepad2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#0F0F1E'] : ['#F5F3FF', '#FFFFFF']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.text }]}>🎈 Loonies</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Spontane møder for ægte forbindelser
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2D1F3E' : '#FEF3E2' }]}>
                <Users size={32} color="#F97316" />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Mød folk i nærheden med det samme
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1F3E3A' : '#E6F7F5' }]}>
                <Coffee size={32} color="#14B8A6" />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Kaffe, spil, film og meget mere
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2D1F47' : '#F3E8FF' }]}>
                <Gamepad2 size={32} color="#8B5CF6" />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Grupper, duoer eller solo møder
              </Text>
            </View>
          </View>

          <View style={[styles.antiDating, {
            backgroundColor: isDark ? '#2D1F1F' : '#FEF2F2',
            borderColor: isDark ? '#3E2424' : '#FECACA'
          }]}>
            <Text style={[styles.antiDatingText, { color: isDark ? '#FFB3B3' : '#DC2626' }]}>
              Loonies handler om venskab og forbindelser. Ikke dating.
            </Text>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/signup')}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Kom i gang</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/signin')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Har du allerede en konto?
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  features: {
    gap: 28,
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  antiDating: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  antiDatingText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  buttons: {
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
