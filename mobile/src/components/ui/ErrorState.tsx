import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';

import { colors, fontFamily, spacing } from '@/theme';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: Props): React.ReactElement {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title ?? t('errors.unknown')}</Text>
      {message ? <Text style={styles.body}>{message}</Text> : null}
      {onRetry ? <Button label={t('common.retry')} onPress={onRetry} style={styles.cta} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  title: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary, textAlign: 'center' },
  body: { marginTop: spacing.xs, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  cta: { marginTop: spacing.md },
});
