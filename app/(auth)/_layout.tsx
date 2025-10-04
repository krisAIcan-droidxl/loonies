import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="mode-selection" />
      <Stack.Screen name="activities" />
      <Stack.Screen name="location-permission" />
    </Stack>
  );
}