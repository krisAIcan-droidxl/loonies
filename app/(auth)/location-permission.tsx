import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Shield, Users } from 'lucide-react-native';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnableLocation = async () => {
    setLoading(true);
    // Simulate location permission request
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MapPin size={48} color="#F97316" />
          </View>
          <Text style={styles.title}>Enable location</Text>
          <Text style={styles.subtitle}>
            To find people nearby and ensure safe meetups within 2km
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Shield size={24} color="#059669" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Privacy first</Text>
              <Text style={styles.featureText}>Location used only for real-time matching. No history stored.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Users size={24} color="#7C3AED" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Local connections</Text>
              <Text style={styles.featureText}>Only see people within 2km who are online right now.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MapPin size={24} color="#DC2626" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Safe meetups</Text>
              <Text style={styles.featureText}>Neutral public places suggested automatically.</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleEnableLocation}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Requesting permission...' : 'Enable Location'}
          </Text>
        </Pressable>
        
        <Text style={styles.disclaimer}>
          Location permission is required for Loonies to work safely
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});