import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

type Props = {
  title: string;
  hours: string;
  isOpen: boolean;
  openLabel: string;
  closedLabel: string;
};

// Stage 4 — clinic opening-hours banner (8:00 AM – 9:00 PM, every day).
export function OpeningHoursBanner({
  title,
  hours,
  isOpen,
  openLabel,
  closedLabel,
}: Props): React.ReactElement {
  return (
    <View style={styles.banner}>
      <View style={[styles.deco, styles.dec1]} />
      <View style={[styles.deco, styles.dec2]} />
      <View style={styles.iconBox}>
        <Clock size={22} color={colors.surface} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>{title}</Text>
        <Text style={styles.headline}>{hours}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: isOpen ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)' }]}>
        <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.surface : colors.amberTint }]} />
        <Text style={styles.statusText}>{isOpen ? openLabel : closedLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    backgroundColor: colors.darkTeal,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  deco: { position: 'absolute', borderRadius: 999 },
  dec1: { width: 100, height: 100, top: -30, right: -20, backgroundColor: colors.brandTeal, opacity: 0.3 },
  dec2: { width: 64, height: 64, bottom: -28, right: 60, backgroundColor: colors.skyBlue, opacity: 0.18 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.button,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { fontFamily: fontFamily.medium, fontSize: 11, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.4 },
  headline: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 15, color: colors.surface },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.surface },
});
