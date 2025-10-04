import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeContext, useThemeManager } from '@/hooks/useTheme';

export default function RootLayout() {
  useFrameworkReady();
  const themeManager = useThemeManager();

  return (
    <ThemeContext.Provider value={themeManager}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={themeManager.isDark ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
}
