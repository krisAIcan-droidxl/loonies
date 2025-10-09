import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Users, Zap, Shield } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B16', '#12121F', '#0B0B16']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>🎈 Loonies</Text>
              <Text style={styles.tagline}>
                Spontane møder for ægte forbindelser
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.featureCard}>
                <BlurView intensity={20} style={styles.featureBlur}>
                  <LinearGradient
                    colors={['rgba(139, 127, 255, 0.15)', 'rgba(157, 111, 255, 0.08)']}
                    style={styles.featureGradient}
                  >
                    <View style={styles.featureIconContainer}>
                      <Users size={28} color="#8B7FFF" strokeWidth={2.5} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>Folk i nærheden</Text>
                      <Text style={styles.featureDescription}>
                        Find personer omkring dig der vil mødes nu
                      </Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              <View style={styles.featureCard}>
                <BlurView intensity={20} style={styles.featureBlur}>
                  <LinearGradient
                    colors={['rgba(75, 200, 180, 0.15)', 'rgba(75, 200, 180, 0.08)']}
                    style={styles.featureGradient}
                  >
                    <View style={styles.featureIconContainer}>
                      <Zap size={28} color="#4BC8B4" strokeWidth={2.5} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>Spontane pings</Text>
                      <Text style={styles.featureDescription}>
                        Send en ping og mød op på få minutter
                      </Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              <View style={styles.featureCard}>
                <BlurView intensity={20} style={styles.featureBlur}>
                  <LinearGradient
                    colors={['rgba(139, 127, 255, 0.15)', 'rgba(157, 111, 255, 0.08)']}
                    style={styles.featureGradient}
                  >
                    <View style={styles.featureIconContainer}>
                      <Shield size={28} color="#8B7FFF" strokeWidth={2.5} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>Sikkerhed først</Text>
                      <Text style={styles.featureDescription}>
                        Check-ins, verifikation og offentlige steder
                      </Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>
            </View>

            <View style={styles.antiDatingBanner}>
              <BlurView intensity={30} style={styles.bannerBlur}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerText}>
                    Ikke en dating-app – Loonies handler om venskab og forbindelser
                  </Text>
                </View>
              </BlurView>
            </View>

            <View style={styles.buttons}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/signup')}
              >
                <LinearGradient
                  colors={['#7C6CFF', '#B388FF']}
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
                <Text style={styles.secondaryButtonText}>
                  Har du allerede en konto?
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B16',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1,
    color: '#FFFFFF',
    textShadowColor: 'rgba(139, 127, 255, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.3,
  },
  features: {
    gap: 16,
    marginVertical: 40,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureBlur: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  antiDatingBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 98, 0.3)',
  },
  bannerBlur: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  bannerContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 116, 98, 0.1)',
  },
  bannerText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
    color: '#FF7462',
    letterSpacing: 0.2,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C6CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
