import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

type Props = {
  label: string;
  tone?: 'emerald' | 'darkTeal' | 'warning' | 'danger' | 'neutral';
  style?: ViewStyle;
};

const tones = {
  emerald: { bg: colors.greenTint, fg: colors.emerald },
  darkTeal: { bg: colors.mintTint, fg: colors.darkTeal },
  warning: { bg: colors.amberTint, fg: colors.warning },
  danger: { bg: '#FEE2E2', fg: colors.danger },
  neutral: { bg: colors.surfaceTint, fg: colors.textSecondary },
} as const;

export function Pill({ label, tone = 'darkTeal', style }: Props): React.ReactElement {
  const t = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.label, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
});
