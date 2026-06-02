import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { toE164 } from '@/utils/validators';

export default function LoginScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ e164, pw }: { e164: string; pw: string }) => authApi.login(e164, pw),
    onSuccess: async ({ token, patient }) => {
      Keyboard.dismiss();
      await setSession(token, patient);
      router.replace('/(tabs)/home');
    },
    onError: (e: unknown) => {
      setError(e instanceof ApiError ? e.message : t('errors.unknown'));
    },
  });

  const handleSubmit = (): void => {
    setError(null);
    const local = phone.replace(/\D/g, '').replace(/^0+/, '');
    if (!/^7\d{8}$/.test(local)) {
      setError(t('errors.invalidPhone'));
      return;
    }
    if (password.length < 1) {
      setError(t('errors.required'));
      return;
    }
    mutation.mutate({ e164: toE164(local), pw: password });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>＋</Text>
            </View>
            <Text style={styles.appName}>{t('common.appName')}</Text>
          </View>

          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

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
                accessibilityLabel={t('auth.phoneLabel')}
              />
            </View>
          </View>

          <View style={{ height: spacing.md }} />

          <Input
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            accessibilityLabel={t('auth.password')}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <View style={{ height: spacing.xl }} />

          <Button label={t('auth.signIn')} onPress={handleSubmit} loading={mutation.isPending} />

          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            accessibilityRole="button"
            style={styles.switchRow}
          >
            <Text style={styles.switchText}>{t('auth.noAccount')} </Text>
            <Text style={styles.switchCta}>{t('auth.createAccount')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.screen, flexGrow: 1 },
  brand: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.darkTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { color: colors.surface, fontSize: 30, fontFamily: fontFamily.medium, marginTop: -2 },
  appName: { marginTop: spacing.sm, fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
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
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  switchText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  switchCta: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.darkTeal },
});
