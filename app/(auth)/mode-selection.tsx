import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Users, UsersRound } from 'lucide-react-native';

export default function ModeSelectionScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>('');

  const modes = [
    {
      id: 'solo',
      title: 'Solo',
      description: 'Meet one person at a time',
      icon: User,
      subtitle: '1 ↔ 1',
    },
    {
      id: 'duo',
      title: 'Duo',
      description: 'You and a friend meet another duo',
      icon: Users,
      subtitle: '2 ↔ 2',
    },
    {
      id: 'group',
      title: 'Group',
      description: 'Meet other small groups (3-6 people)',
      icon: UsersRound,
      subtitle: '3-6 people',
    },
  ];

  const handleContinue = () => {
    if (!selectedMode) return;
    router.push('/(auth)/activities');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How do you want to meet?</Text>
        <Text style={styles.subtitle}>Choose your preferred meetup style</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {modes.map((mode) => (
          <Pressable
            key={mode.id}
            style={[
              styles.modeCard,
              selectedMode === mode.id && styles.modeCardSelected
            ]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <View style={styles.modeHeader}>
              <View style={[
                styles.iconContainer,
                selectedMode === mode.id && styles.iconContainerSelected
              ]}>
                <mode.icon 
                  size={24} 
                  color={selectedMode === mode.id ? '#FFFFFF' : '#F97316'} 
                />
              </View>
              <View style={styles.modeInfo}>
                <Text style={[
                  styles.modeTitle,
                  selectedMode === mode.id && styles.modeTitleSelected
                ]}>
                  {mode.title}
                </Text>
                <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
              </View>
            </View>
            <Text style={[
              styles.modeDescription,
              selectedMode === mode.id && styles.modeDescriptionSelected
            ]}>
              {mode.description}
            </Text>
          </Pressable>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 You can change this later in settings
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, !selectedMode && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedMode}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modeCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  modeCardSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#F97316',
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modeTitleSelected: {
    color: '#F97316',
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modeDescriptionSelected: {
    color: '#92400E',
  },
  note: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
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