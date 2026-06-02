import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/utils/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { colors, fontFamily } from '@/theme';
import { setLanguage } from '@/utils/i18n';

// A consistent, always-working back button for every stacked screen. Falls back
// to Home when there is no screen to pop (e.g. screens opened via replace).
function HeaderBack(): React.ReactElement {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
    >
      <ChevronLeft size={24} color={colors.textPrimary} />
    </Pressable>
  );
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

function useAuthGuard(hydrated: boolean): void {
  const token = useAuthStore((s) => s.token);
  const onboardingComplete = useUIStore((s) => s.onboardingComplete);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const first = segments[0];
    const inAuth = first === '(auth)';
    const inTabs = first === '(tabs)';

    if (!token) {
      if (!inAuth) {
        router.replace(onboardingComplete ? '/(auth)/login' : '/(auth)/onboarding');
      }
      return;
    }
    if (token && (inAuth || !first)) {
      router.replace('/(tabs)/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, segments.join('/'), onboardingComplete]);
}

export default function RootLayout(): React.ReactElement | null {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const patient = useAuthStore((s) => s.patient);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (patient?.language) setLanguage(patient.language);
  }, [patient?.language]);

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  useAuthGuard(ready);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
    [],
  );

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surfaceTint }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              headerStyle: { backgroundColor: colors.surface },
              headerTitleStyle: { fontFamily: fontFamily.medium, fontSize: 17, color: colors.textPrimary },
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerTintColor: colors.textPrimary,
              headerLeft: () => <HeaderBack />,
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
});
