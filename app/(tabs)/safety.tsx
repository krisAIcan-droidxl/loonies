import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Phone, MapPin, Clock, TriangleAlert as AlertTriangle, UserCheck } from 'lucide-react-native';

export default function SafetyScreen() {
  const [checkInTimer, setCheckInTimer] = useState(0);
  const [isInMeetup, setIsInMeetup] = useState(false);

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately share your location with your emergency contact and local authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send SOS', style: 'destructive', onPress: () => {
          console.log('SOS triggered');
        }},
      ]
    );
  };

  const handleCheckIn = () => {
    if (isInMeetup) {
      setCheckInTimer(30 * 60); // 30 minutes
      Alert.alert('Check-in sent', 'Your safety check-in has been recorded.');
    } else {
      Alert.alert('No active meetup', 'Start a meetup to use safety check-ins.');
    }
  };

  const safetyFeatures = [
    {
      icon: UserCheck,
      title: 'Photo verification',
      description: 'All users verify their identity with photo ID',
      status: 'Active',
      color: '#059669',
    },
    {
      icon: Phone,
      title: 'Emergency contact',
      description: 'Auto-notify your trusted contact during meetups',
      status: 'Set up',
      color: '#7C3AED',
    },
    {
      icon: MapPin,
      title: 'Location sharing',
      description: 'Share live location during meetups (60 min max)',
      status: 'Ready',
      color: '#DC2626',
    },
    {
      icon: Clock,
      title: 'Check-in timer',
      description: 'Automatic safety check-ins every 30 minutes',
      status: 'Active',
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Center</Text>
        <Text style={styles.subtitle}>Your safety is our priority</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sosSection}>
          <Pressable style={styles.sosButton} onPress={handleSOS}>
            <AlertTriangle size={32} color="#FFFFFF" />
            <Text style={styles.sosButtonText}>Emergency SOS</Text>
          </Pressable>
          <Text style={styles.sosDescription}>
            Press and hold for 3 seconds to alert emergency contacts
          </Text>
        </View>

        <View style={styles.checkInSection}>
          <Text style={styles.sectionTitle}>Safety Check-in</Text>
          {isInMeetup ? (
            <View style={styles.activeCheckIn}>
              <View style={styles.checkInHeader}>
                <Clock size={20} color="#059669" />
                <Text style={styles.checkInText}>
                  Next check-in: {Math.floor(checkInTimer / 60)}:{(checkInTimer % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              <Pressable style={styles.checkInButton} onPress={handleCheckIn}>
                <Text style={styles.checkInButtonText}>Check in now</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.inactiveCheckIn}>
              <Text style={styles.inactiveText}>
                Safety check-ins will activate automatically when you start a meetup
              </Text>
            </View>
          )}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Safety features</Text>
          {safetyFeatures.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <feature.icon size={20} color={feature.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${feature.color}20` }]}>
                  <Text style={[styles.statusText, { color: feature.color }]}>
                    {feature.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🏛️ Meet in public places</Text>
            <Text style={styles.tipText}>
              Always choose busy, well-lit public locations for your first meetup
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>👥 Trust your instincts</Text>
            <Text style={styles.tipText}>
              If something feels off, don't hesitate to leave or report the user
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📱 Stay connected</Text>
            <Text style={styles.tipText}>
              Keep your phone charged and tell someone where you're going
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sosDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  checkInSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  activeCheckIn: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
    marginLeft: 8,
  },
  checkInButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveCheckIn: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});