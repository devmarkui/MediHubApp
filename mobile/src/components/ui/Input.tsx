import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  /** Show a green border to signal the value passed validation. */
  valid?: boolean;
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, valid, containerStyle, style, ...rest },
  ref,
) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error ? styles.inputError : valid ? styles.inputValid : null,
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={label ?? rest.accessibilityLabel}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  input: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  inputValid: {
    borderWidth: 1,
    borderColor: colors.darkTeal,
  },
  error: {
    marginTop: spacing.xxs,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.danger,
  },
});
