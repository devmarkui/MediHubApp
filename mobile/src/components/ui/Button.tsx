import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  style,
  accessibilityLabel,
}: Props): React.ReactElement {
  const variantStyle = variantStyles[variant];
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        isInactive && styles.inactive,
        pressed && !isInactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.label.color} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={{ marginRight: spacing.xs }}>{leftIcon}</View> : null}
          <Text style={[styles.label, variantStyle.label]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  inactive: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

const variantStyles = {
  primary: {
    container: { backgroundColor: colors.darkTeal },
    label: { color: colors.surface },
  },
  secondary: {
    container: { backgroundColor: colors.mintTint },
    label: { color: colors.darkTeal },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.darkTeal },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: colors.surface },
  },
} as const;
