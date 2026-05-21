import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { profileSchema } from '@/utils/validators';
import type { BloodGroup, Gender } from '@/types/models';

type FormData = {
  name: string;
  email?: string;
  dob?: string;
  gender?: Gender;
  blood_group?: BloodGroup;
};

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other'];
const BLOOD_OPTIONS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const patient = useAuthStore((s) => s.patient);
  const updatePatient = useAuthStore((s) => s.updatePatient);

  const { control, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: patient?.name ?? '',
      email: patient?.email ?? '',
      gender: patient?.gender ?? undefined,
      blood_group: patient?.blood_group ?? undefined,
    },
  });

  const save = useMutation({
    mutationFn: (data: FormData) =>
      patientsApi.update({
        name: data.name,
        email: data.email && data.email.length > 0 ? data.email : null,
        gender: data.gender ?? null,
        blood_group: data.blood_group ?? null,
      }),
    onSuccess: async (next) => {
      await updatePatient(next);
      void queryClient.invalidateQueries({ queryKey: ['app.config'] });
      Alert.alert(t('profile.saved'));
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      Alert.alert(t('errors.unknown'), msg);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (uri: string) => patientsApi.uploadAvatar(uri),
    onSuccess: async (next) => {
      await updatePatient(next);
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      Alert.alert(t('errors.unknown'), msg);
    },
  });

  const pickImage = async (): Promise<void> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) {
      uploadAvatar.mutate(asset.uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.editProfile') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }}>
        <View style={styles.avatarRow}>
          <Avatar name={patient?.name ?? ''} uri={patient?.avatar_url ?? null} size={80} />
          <Pressable onPress={pickImage} accessibilityRole="button">
            <Text style={styles.avatarCta}>{uploadAvatar.isPending ? t('common.loading') : t('common.edit')}</Text>
          </Pressable>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label={t('auth.name')} value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />

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
            />
          )}
        />

        <View>
          <Text style={styles.label}>{t('auth.gender')}</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => onChange(g)}
                    style={[styles.chip, value === g && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === g }}
                  >
                    <Text style={[styles.chipText, value === g && styles.chipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        <View>
          <Text style={styles.label}>{t('home.blood')}</Text>
          <Controller
            control={control}
            name="blood_group"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {BLOOD_OPTIONS.map((bg) => (
                  <Pressable
                    key={bg}
                    onPress={() => onChange(bg)}
                    style={[styles.chip, value === bg && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === bg }}
                  >
                    <Text style={[styles.chipText, value === bg && styles.chipTextActive]}>{bg}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        <Button
          label={t('common.save')}
          onPress={handleSubmit((data) => save.mutate(data))}
          disabled={!isDirty || save.isPending}
          loading={save.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  avatarRow: { alignItems: 'center', gap: spacing.xs },
  avatarCta: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.darkTeal, marginTop: spacing.xs },
  label: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  chipText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.surface },
});
