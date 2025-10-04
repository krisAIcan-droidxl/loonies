import { useState, useEffect, createContext, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryGradient: readonly [string, string, ...string[]];
  secondaryGradient: readonly [string, string, ...string[]];
  paidGradient: readonly [string, string, ...string[]];
  shadow: string;
  success: string;
  successBackground: string;
  error: string;
  warning: string;
  warningBackground: string;
  inputBackground: string;
  chipBackground: string;
  chipBorder: string;
  tabBarBackground: string;
  modalBackground: string;
}

const lightColors: ThemeColors = {
  background: '#F5F3FF',
  cardBackground: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#667EEA',
  primaryLight: '#E0E7FF',
  primaryGradient: ['#667EEA', '#764BA2'] as const,
  secondaryGradient: ['#FF6B6B', '#FFB347'] as const,
  paidGradient: ['#FF6B6B', '#FFB347'] as const,
  shadow: '#667EEA',
  success: '#4ADE80',
  successBackground: '#D1FAE5',
  error: '#FF6B6B',
  warning: '#FFB347',
  warningBackground: '#FEF3C7',
  inputBackground: '#F9FAFB',
  chipBackground: '#F5F3FF',
  chipBorder: '#E0E7FF',
  tabBarBackground: '#FFFFFF',
  modalBackground: '#FFFFFF',
};

const darkColors: ThemeColors = {
  background: '#0F0F1E',
  cardBackground: '#1A1A2E',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  border: '#2D3748',
  primary: '#8B7FFF',
  primaryLight: '#2D1F47',
  primaryGradient: ['#8B7FFF', '#9D6FFF'] as const,
  secondaryGradient: ['#FF6B6B', '#FFB347'] as const,
  paidGradient: ['#FF6B6B', '#FFB347'] as const,
  shadow: '#000000',
  success: '#4ADE80',
  successBackground: '#1E3A2E',
  error: '#FF6B6B',
  warning: '#FFB347',
  warningBackground: '#3E2A1A',
  inputBackground: '#252538',
  chipBackground: '#252538',
  chipBorder: '#3D3D5C',
  tabBarBackground: '#1A1A2E',
  modalBackground: '#1A1A2E',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  setTheme: () => {},
  colors: darkColors,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeManager() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const isDark = theme === 'system'
    ? systemTheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return {
    theme,
    isDark,
    setTheme,
    colors,
  };
}
