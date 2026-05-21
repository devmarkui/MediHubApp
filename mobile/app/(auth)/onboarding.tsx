import { useRouter } from 'expo-router';
import { HeartPulse, FileText, CalendarPlus } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { colors, fontFamily, radius, spacing } from '@/theme';

type Slide = {
  iconKey: 'heart' | 'calendar' | 'file';
  titleKey: string;
  bodyKey: string;
};

const SLIDES: Slide[] = [
  { iconKey: 'heart', titleKey: 'auth.onboardingTitle1', bodyKey: 'auth.onboardingBody1' },
  { iconKey: 'calendar', titleKey: 'auth.onboardingTitle2', bodyKey: 'auth.onboardingBody2' },
  { iconKey: 'file', titleKey: 'auth.onboardingTitle3', bodyKey: 'auth.onboardingBody3' },
];

function renderIcon(key: Slide['iconKey']): React.ReactElement {
  const size = 44;
  const color = colors.surface;
  if (key === 'heart') return <HeartPulse size={size} color={color} />;
  if (key === 'calendar') return <CalendarPlus size={size} color={color} />;
  return <FileText size={size} color={color} />;
}

export default function Onboarding(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const completeOnboarding = useUIStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);

  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;

  const handleNext = (): void => {
    if (isLast) {
      completeOnboarding();
      router.replace('/(auth)/phone');
      return;
    }
    setIndex(index + 1);
  };

  const handleSkip = (): void => {
    completeOnboarding();
    router.replace('/(auth)/phone');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <View style={{ flex: 1 }} />
        {!isLast ? (
          <Button label={t('common.skip')} variant="ghost" onPress={handleSkip} />
        ) : null}
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.iconCircle}>{renderIcon(slide.iconKey)}</View>
      </View>

      <View style={styles.copyWrap}>
        <Text style={styles.title}>{t(slide.titleKey)}</Text>
        <Text style={styles.body}>{t(slide.bodyKey)}</Text>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <Button label={isLast ? t('auth.getStarted') : t('common.next')} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.emerald },
  skipRow: { flexDirection: 'row', paddingHorizontal: spacing.screen, paddingTop: spacing.xs },
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  copyWrap: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.darkTeal, width: 24 },
  ctaWrap: { backgroundColor: colors.surface, padding: spacing.screen },
});
