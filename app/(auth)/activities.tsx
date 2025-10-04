import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Coffee, Gamepad2, Film, ChefHat, MapPin, Music, Book, Dumbbell } from 'lucide-react-native';

export default function ActivitiesScreen() {
  const router = useRouter();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const activities = [
    { id: 'coffee', title: 'Coffee', icon: Coffee, color: '#92400E' },
    { id: 'gaming', title: 'Gaming', icon: Gamepad2, color: '#7C3AED' },
    { id: 'movies', title: 'Movies', icon: Film, color: '#DC2626' },
    { id: 'cooking', title: 'Cooking', icon: ChefHat, color: '#EA580C' },
    { id: 'walking', title: 'Walking', icon: MapPin, color: '#059669' },
    { id: 'music', title: 'Music', icon: Music, color: '#DB2777' },
    { id: 'reading', title: 'Reading', icon: Book, color: '#7C2D12' },
    { id: 'fitness', title: 'Fitness', icon: Dumbbell, color: '#1D4ED8' },
  ];

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleContinue = () => {
    if (selectedActivities.length < 3) return;
    router.push('/(auth)/location-permission');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What do you enjoy?</Text>
        <Text style={styles.subtitle}>Pick 3-7 activities you'd like to do with others</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <Pressable
              key={activity.id}
              style={[
                styles.activityCard,
                selectedActivities.includes(activity.id) && styles.activityCardSelected
              ]}
              onPress={() => toggleActivity(activity.id)}
            >
              <View style={[
                styles.activityIcon,
                { backgroundColor: `${activity.color}20` },
                selectedActivities.includes(activity.id) && { backgroundColor: activity.color }
              ]}>
                <activity.icon 
                  size={24} 
                  color={selectedActivities.includes(activity.id) ? '#FFFFFF' : activity.color} 
                />
              </View>
              <Text style={[
                styles.activityTitle,
                selectedActivities.includes(activity.id) && styles.activityTitleSelected
              ]}>
                {activity.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {selectedActivities.length}/7 selected (minimum 3)
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, selectedActivities.length < 3 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={selectedActivities.length < 3}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  activityCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activityCardSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activityTitleSelected: {
    color: '#F97316',
  },
  counter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  counterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});