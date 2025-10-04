import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, CreditCard as Edit, LogOut, Star, Users, MapPin, Moon, Sun, Monitor } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOut'),
      'Er du sikker på at du vil logge ud?',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Log ud',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Fejl', error.message);
            } else {
              router.replace('/(auth)/signin');
            }
          },
        },
      ]
    );
  };

  const stats = [
    { label: t('profile.statsLabels.connectionsMade'), value: '12', icon: Users },
    { label: t('profile.statsLabels.meetupsAttended'), value: '8', icon: MapPin },
    { label: t('profile.statsLabels.safetyRating'), value: '5.0', icon: Star },
  ];

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: any }> = [
    { value: 'light', label: t('profile.theme.light'), icon: Sun },
    { value: 'dark', label: t('profile.theme.dark'), icon: Moon },
    { value: 'system', label: t('profile.theme.system'), icon: Monitor },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' }} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: colors.text }]}>Sarah</Text>
              <Text style={[styles.age, { color: colors.textSecondary }]}>{t('profile.yearsOld', { age: '28' })}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
              </View>
            </View>
            <Pressable style={styles.editButton}>
              <Edit size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.statsSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.stats')}</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.chipBackground }]}>
                <stat.icon size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.activitiesSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.activities')}</Text>
          <View style={styles.activities}>
            {['coffee', 'reading', 'gaming', 'movies'].map((activity) => (
              <View key={activity} style={[styles.activityTag, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.activityText, { color: colors.primary }]}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.settingsSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.themeOption,
                  { borderColor: colors.border },
                  theme === option.value && styles.themeOptionActive,
                ]}
                onPress={() => setTheme(option.value)}
              >
                {theme === option.value ? (
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeOptionGradient}
                  >
                    <option.icon size={24} color="#FFFFFF" />
                    <Text style={styles.themeOptionTextActive}>{option.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.themeOptionContent}>
                    <option.icon size={24} color={colors.textSecondary} />
                    <Text style={[styles.themeOptionText, { color: colors.textSecondary }]}>{option.label}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.settingsSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.pushNotifications')}</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.locationSharing')}</Text>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={locationSharing ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.cardBackground }]}>
          <Pressable style={styles.menuItem}>
            <Settings size={20} color={colors.textSecondary} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.settings')}</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleSignOut}>
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>{t('profile.signOut')}</Text>
          </Pressable>
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FEF3E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  activitiesSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTag: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activityText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  themeOptionActive: {
    borderColor: 'transparent',
  },
  themeOptionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  themeOptionContent: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeOptionTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuTextDanger: {
    color: '#DC2626',
  },
});