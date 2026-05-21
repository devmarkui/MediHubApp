import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';

const LEN = 6;

export default function OtpScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; otpId: string }>();
  const phone = params.phone ?? '';
  const otpId = Number(params.otpId ?? 0);

  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(60);
  const inputs = useRef<Array<TextInput | null>>([]);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const verify = useMutation({
    mutationFn: (code: string) => authApi.verifyOtp(phone, otpId, code),
    onSuccess: async (data) => {
      if (data.is_new) {
        router.replace({
          pathname: '/(auth)/register',
          params: { phone, otpId: String(otpId), code: digits.join('') },
        });
        return;
      }
      if (data.token && data.patient) {
        await setSession(data.token, data.patient);
        router.replace('/(tabs)/home');
      }
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      setError(msg);
    },
  });

  const resend = useMutation({
    mutationFn: () => authApi.requestOtp(phone),
    onSuccess: (data) => {
      router.setParams({ otpId: String(data.otp_id) });
      setDigits(Array(LEN).fill(''));
      setResendIn(60);
      inputs.current[0]?.focus();
    },
  });

  const handleChange = (idx: number, value: string): void => {
    const clean = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    if (error) setError(null);

    if (clean && idx < LEN - 1) {
      inputs.current[idx + 1]?.focus();
    }
    if (next.every((d) => d !== '')) {
      verify.mutate(next.join(''));
    }
  };

  const handleSubmit = (): void => {
    const code = digits.join('');
    if (code.length !== LEN) {
      setError(t('errors.invalidOtp'));
      return;
    }
    verify.mutate(code);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Text style={styles.title}>{t('auth.otpTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.otpSubtitle', { phone })}</Text>

        <View style={styles.boxes}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(ref) => {
                inputs.current[i] = ref;
              }}
              value={d}
              onChangeText={(v) => handleChange(i, v)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !d && i > 0) {
                  inputs.current[i - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              accessibilityLabel={`Digit ${i + 1}`}
              style={[styles.box, error ? styles.boxError : null, d ? styles.boxFilled : null]}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.resendWrap}>
          {resendIn > 0 ? (
            <Text style={styles.resendCountdown}>{t('auth.otpResendIn', { seconds: resendIn })}</Text>
          ) : (
            <Pressable onPress={() => resend.mutate()} accessibilityRole="button">
              <Text style={styles.resendCta}>{t('auth.otpResend')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <Button label={t('auth.verify')} onPress={handleSubmit} loading={verify.isPending} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.screen },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { marginTop: spacing.xs, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl, gap: spacing.xs },
  box: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.button,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  boxFilled: { borderColor: colors.darkTeal },
  boxError: { borderColor: colors.danger },
  errorText: { marginTop: spacing.md, fontFamily: fontFamily.regular, fontSize: 12, color: colors.danger },
  resendWrap: { marginTop: spacing.lg, alignItems: 'center' },
  resendCountdown: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  resendCta: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.darkTeal },
  ctaWrap: { padding: spacing.screen },
});
