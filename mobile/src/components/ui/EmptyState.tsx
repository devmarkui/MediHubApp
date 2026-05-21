import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';

import { colors, fontFamily, spacing } from '@/theme';

type Props = {
  icon?: ReactNode;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ icon, title, body, ctaLabel, onCta }: Props): React.ReactElement {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {ctaLabel && onCta ? (
        <Button variant="secondary" label={ctaLabel} onPress={onCta} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  icon: { marginBottom: spacing.md },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cta: { marginTop: spacing.md },
});
