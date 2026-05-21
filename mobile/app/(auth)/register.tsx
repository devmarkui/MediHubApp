import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { registerSchema } from '@/utils/validators';

type FormData = {
  name: string;
  email?: string;
};

export default function RegisterScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; otpId: string; code: string }>();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      authApi.register({
        phone: params.phone ?? '',
        otp_id: Number(params.otpId ?? 0),
        code: params.code ?? '',
        name: form.name,
        email: form.email && form.email.length > 0 ? form.email : undefined,
      }),
    onSuccess: async ({ token, patient }) => {
      await setSession(token, patient);
      router.replace('/(tabs)/home');
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError && e.errors) {
        for (const [field, messages] of Object.entries(e.errors)) {
          const message = messages[0];
          if (message) setFormError(field as keyof FormData, { message });
        }
      }
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

          <View style={{ height: spacing.xl }} />

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
                accessibilityLabel={t('auth.name')}
              />
            )}
          />

          <View style={{ height: spacing.md }} />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.email')}
                value={value ?? ''}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
                accessibilityLabel={t('auth.email')}
              />
            )}
          />
        </ScrollView>

        <View style={styles.ctaWrap}>
          <Button
            label={t('auth.create')}
            onPress={handleSubmit((d) => mutation.mutate(d))}
            loading={mutation.isPending}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.screen },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { marginTop: spacing.xs, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  ctaWrap: { padding: spacing.screen },
});
