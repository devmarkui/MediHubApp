import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { signupSchema, toE164 } from '@/utils/validators';

type FormData = { name: string; password: string; confirmPassword: string };

export default function SignupScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { name: '', password: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      authApi.register({
        phone: toE164(phone.replace(/\D/g, '').replace(/^0+/, '')),
        name: form.name,
        password: form.password,
      }),
    onSuccess: async ({ token, patient }) => {
      Keyboard.dismiss();
      await setSession(token, patient);
      // Stage 2 — collect optional BMI basics next.
      router.replace('/(auth)/health');
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError && e.errors) {
        for (const [field, messages] of Object.entries(e.errors)) {
          const message = messages[0];
          if (field === 'phone') {
            setPhoneError(message ?? null);
          } else if (message) {
            setFormError(field as keyof FormData, { message });
          }
        }
        if (!e.errors.phone && e.message) setPhoneError(e.message);
      } else {
        setPhoneError(e instanceof ApiError ? e.message : t('errors.unknown'));
      }
    },
  });

  const onSubmit = (form: FormData): void => {
    setPhoneError(null);
    const local = phone.replace(/\D/g, '').replace(/^0+/, '');
    if (!/^7\d{8}$/.test(local)) {
      setPhoneError(t('errors.invalidPhone'));
      return;
    }
    mutation.mutate(form);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('auth.signupTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.name')}
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                error={errors.name?.message}
              />
            )}
          />

          <View style={{ height: spacing.md }} />

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
                  if (phoneError) setPhoneError(null);
                }}
                error={phoneError ?? undefined}
              />
            </View>
          </View>

          <View style={{ height: spacing.md }} />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.password')}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <View style={{ height: spacing.md }} />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.confirmPassword')}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <View style={{ height: spacing.xl }} />

          <Button
            label={t('auth.create')}
            onPress={handleSubmit(onSubmit)}
            loading={mutation.isPending}
          />

          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
            style={styles.switchRow}
          >
            <Text style={styles.switchText}>{t('auth.haveAccount')} </Text>
            <Text style={styles.switchCta}>{t('auth.signIn')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.screen, flexGrow: 1 },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, marginTop: spacing.lg },
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
