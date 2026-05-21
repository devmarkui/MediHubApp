import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontFamily, radius } from '@/theme';

type Props = {
  label: string;
  value: string;
  valueColor: string;
  style?: ViewStyle;
};

export function StatTile({ label, value, valueColor, style }: Props): React.ReactElement {
  return (
    <View style={[styles.tile, style]} accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  value: {
    marginTop: 5,
    fontFamily: fontFamily.medium,
    fontSize: 17,
  },
});
