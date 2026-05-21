import { CalendarDays, FlaskConical, Package } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme';
import { formatMoney } from '@/utils/format';

type EntryType = 'consultation' | 'lab' | 'package';

type Props = {
  type: EntryType;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  showBorder?: boolean;
  activeLabel?: string;
  onPress?: () => void;
};

const TINTS: Record<EntryType, { bg: string; fg: string; icon: (size: number, color: string) => ReactNode; amountColor: string }> = {
  consultation: {
    bg: colors.mintTint,
    fg: colors.darkTeal,
    icon: (size, color) => <CalendarDays size={size} color={color} />,
    amountColor: colors.darkTeal,
  },
  lab: {
    bg: colors.greenTint,
    fg: colors.emerald,
    icon: (size, color) => <FlaskConical size={size} color={color} />,
    amountColor: colors.emerald,
  },
  package: {
    bg: colors.blueTint,
    fg: colors.info,
    icon: (size, color) => <Package size={size} color={color} />,
    amountColor: colors.info,
  },
};

export function ActivityRow({
  type,
  title,
  subtitle,
  amount,
  status,
  showBorder = true,
  activeLabel = 'Active',
  onPress,
}: Props): React.ReactElement {
  const t = TINTS[type];
  const isActivePackage = type === 'package' && status === 'active';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, ${subtitle}, ${isActivePackage ? activeLabel : formatMoney(amount)}`}
      style={({ pressed }) => [
        styles.row,
        showBorder ? styles.bordered : null,
        pressed ? { opacity: 0.7 } : null,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: t.bg }]}>{t.icon(16, t.fg)}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {isActivePackage ? (
        <View style={styles.activePill}>
          <Text style={styles.activeText}>{activeLabel}</Text>
        </View>
      ) : (
        <Text style={[styles.amount, { color: t.amountColor }]}>{formatMoney(amount)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  bordered: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBox: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
  subtitle: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textSecondary },
  amount: { fontFamily: fontFamily.medium, fontSize: 13, textAlign: 'right' },
  activePill: {
    backgroundColor: colors.greenTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeText: { color: colors.emerald, fontFamily: fontFamily.medium, fontSize: 11 },
});
