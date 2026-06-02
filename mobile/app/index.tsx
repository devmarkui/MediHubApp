import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function Index(): React.ReactElement {
  const token = useAuthStore((s) => s.token);
  const onboardingComplete = useUIStore((s) => s.onboardingComplete);
  if (token) return <Redirect href="/(tabs)/home" />;
  return <Redirect href={onboardingComplete ? '/(auth)/login' : '/(auth)/onboarding'} />;
}
