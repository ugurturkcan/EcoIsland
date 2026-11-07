import { InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold,
  });

  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'slide_from_right', gestureEnabled: true }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        {/* Ekleme akışı alttan açılır, kendi içinde sağa doğru ilerler. */}
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom', contentStyle: { backgroundColor: colors.ink } }} />
        <Stack.Screen name="result" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
