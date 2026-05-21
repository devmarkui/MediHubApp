import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { toE164 } from '@/utils/validators';

export default function PhoneScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (e164: string) => authApi.requestOtp(e164),
    onSuccess: (data, e164) => {
      Keyboard.dismiss();
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: e164, otpId: String(data.otp_id) },
      });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      setError(msg);
    },
  });

  const handleSubmit = (): void => {
    setError(null);
    const local = phone.replace(/\D/g, '').replace(/^0+/, '');
    if (!/^7\d{8}$/.test(local)) {
      setError(t('errors.invalidPhone'));
      return;
    }
    mutation.mutate(toE164(local));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.title}>{t('auth.phoneTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.phoneSubtitle')}</Text>

          <View style={styles.row}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>{t('auth.phonePrefix')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label={t('auth.phoneLabel')}
                placeholder="7XXXXXXXX"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={(v) => {
                  setPhone(v.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                error={error ?? undefined}
                accessibilityHint={t('auth.phoneSubtitle')}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <Button
            label={t('auth.sendOtp')}
            onPress={handleSubmit}
            loading={mutation.isPending}
            disabled={phone.length < 9}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.screen },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { marginTop: spacing.xs, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.xl, gap: spacing.xs },
  prefix: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  prefixText: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  ctaWrap: { padding: spacing.screen },
});
