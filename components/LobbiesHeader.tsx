import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus } from 'lucide-react-native';

interface LobbiesHeaderProps {
  onCreatePress: () => void;
}

export default function LobbiesHeader({ onCreatePress }: LobbiesHeaderProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={40} style={styles.blur}>
        <LinearGradient
          colors={['#8B7FFF', '#9D6FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Lobbyer 🎉</Text>
              <Text style={styles.subtitle}>Find folk til dine aktiviteter</Text>
            </View>

            <Pressable style={styles.fabContainer} onPress={onCreatePress}>
              <LinearGradient
                colors={['#FF8A5C', '#FF5D6C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fab}
              >
                <Plus size={28} color="#FFFFFF" strokeWidth={3} />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: 28,
  },
  gradient: {
    borderRadius: 28,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
  fabContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FF5D6C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
