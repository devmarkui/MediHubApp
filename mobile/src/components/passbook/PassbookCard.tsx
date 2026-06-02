import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';
import { passbookDisplay } from '@/utils/format';

type Props = {
  passbookNo: string | null | undefined;
  memberName: string;
  memberSince: string | null;
  verifiedLabel?: string;
  passbookLabel?: string;
  memberLabel?: string;
  sinceLabel?: string;
  // When set, replaces the mono passbook number with custom large text.
  centerText?: string;
  // When set, the whole card becomes tappable.
  onPress?: () => void;
};

export function PassbookCard({
  passbookNo,
  memberName,
  memberSince,
  verifiedLabel = '● VERIFIED',
  passbookLabel = 'HEALTH PASSBOOK',
  memberLabel = 'MEMBER',
  sinceLabel = 'SINCE',
  centerText,
  onPress,
}: Props): React.ReactElement {
  const since = memberSince ? memberSince.slice(0, 4) : '—';

  const body = (
    <>
      <View style={[styles.deco, styles.dec1]} />
      <View style={[styles.deco, styles.dec2]} />
      <View style={[styles.deco, styles.dec3]} />

      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>+</Text>
          </View>
          <Text style={styles.brandLabel}>{passbookLabel}</Text>
        </View>
        <View style={styles.verifiedPill}>
          <Text style={styles.verifiedText}>{verifiedLabel}</Text>
        </View>
      </View>

      {centerText !== undefined ? (
        <Text style={styles.centerText}>{centerText}</Text>
      ) : (
        <Text style={styles.passbookNo}>{passbookDisplay(passbookNo)}</Text>
      )}

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.caption}>{memberLabel}</Text>
          <Text style={styles.value}>{memberName.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.caption}>{sinceLabel}</Text>
          <Text style={styles.value}>{since}</Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.card}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    backgroundColor: colors.deepTeal,
    borderRadius: radius.hero,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  deco: { position: 'absolute', borderRadius: 999 },
  dec1: { width: 110, height: 110, top: -30, right: -30, backgroundColor: colors.brandTeal, opacity: 0.18 },
  dec2: { width: 120, height: 120, bottom: -40, right: 30, backgroundColor: colors.emerald, opacity: 0.1 },
  dec3: { width: 60, height: 60, top: 50, left: -20, backgroundColor: colors.skyBlue, opacity: 0.08 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: {
    width: 28,
    height: 22,
    borderRadius: 5,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.deepTeal },
  brandLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.8,
  },
  verifiedPill: {
    backgroundColor: 'rgba(16,185,129,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#6EE7B7',
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  passbookNo: {
    fontFamily: 'Courier',
    fontSize: 15,
    letterSpacing: 4,
    color: colors.surface,
    marginBottom: 18,
  },
  centerText: {
    fontFamily: fontFamily.medium,
    fontSize: 26,
    letterSpacing: 0.5,
    color: colors.surface,
    marginBottom: 18,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
  },
  value: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.surface,
    letterSpacing: 0.5,
  },
});
