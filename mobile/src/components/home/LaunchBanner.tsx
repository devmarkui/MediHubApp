import { ArrowRight, HeartPulse } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function LaunchBanner({ title, subtitle, onPress }: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [styles.banner, pressed && onPress ? { opacity: 0.92 } : null]}
    >
      <View style={[styles.deco, styles.dec1]} />
      <View style={[styles.deco, styles.dec2]} />
      <View style={styles.iconBox}>
        <HeartPulse size={22} color={colors.surface} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>{title}</Text>
        <Text style={styles.headline}>{subtitle}</Text>
      </View>
      <ArrowRight size={18} color={colors.surface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    backgroundColor: colors.emerald,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  deco: { position: 'absolute', borderRadius: 999 },
  dec1: { width: 90, height: 90, top: -25, right: -25, backgroundColor: colors.brandTeal, opacity: 0.32 },
  dec2: { width: 60, height: 60, bottom: -30, right: 40, backgroundColor: colors.skyBlue, opacity: 0.18 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.button,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.4,
  },
  headline: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.surface,
  },
});
