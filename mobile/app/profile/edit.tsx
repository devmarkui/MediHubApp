import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  nic?: string;
  email?: string;
  dob?: string;
  gender?: Gender;
  address?: string;
  district?: string;
  postal_code?: string;
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
      nic: patient?.nic ?? '',
      email: patient?.email ?? '',
      dob: patient?.dob ?? '',
      gender: patient?.gender ?? undefined,
      address: patient?.address ?? '',
      district: patient?.district ?? '',
      postal_code: patient?.postal_code ?? '',
      blood_group: patient?.blood_group ?? undefined,
    },
  });

  const save = useMutation({
    mutationFn: (data: FormData) =>
      patientsApi.update({
        name: data.name,
        nic: data.nic && data.nic.length > 0 ? data.nic : null,
        email: data.email && data.email.length > 0 ? data.email : null,
        dob: data.dob && data.dob.length > 0 ? data.dob : null,
        gender: data.gender ?? null,
        address: data.address && data.address.length > 0 ? data.address : null,
        district: data.district && data.district.length > 0 ? data.district : null,
        postal_code: data.postal_code && data.postal_code.length > 0 ? data.postal_code : null,
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

  const textField = (
    name: keyof FormData,
    label: string,
    extra?: { keyboardType?: 'email-address' | 'default'; autoCapitalize?: 'none' | 'words'; placeholder?: string },
  ): React.ReactElement => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Input
          label={label}
          value={(value as string) ?? ''}
          onChangeText={onChange}
          keyboardType={extra?.keyboardType}
          autoCapitalize={extra?.autoCapitalize}
          placeholder={extra?.placeholder}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.editProfile') }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarRow}>
            <Avatar name={patient?.name ?? ''} uri={patient?.avatar_url ?? null} size={80} />
            <Pressable onPress={pickImage} accessibilityRole="button">
              <Text style={styles.avatarCta}>{uploadAvatar.isPending ? t('common.loading') : t('common.edit')}</Text>
            </Pressable>
          </View>

          <Text style={styles.group}>{t('profile.groupIdentity')}</Text>
          {textField('name', t('auth.name'), { autoCapitalize: 'words' })}
          {textField('nic', t('profile.nic'))}
          {textField('dob', t('auth.dob'), { placeholder: 'YYYY-MM-DD' })}

          <View>
            <Text style={styles.label}>{t('auth.gender')}</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {GENDER_OPTIONS.map((g) => (
                    <Pressable key={g} onPress={() => onChange(g)} style={[styles.chip, value === g && styles.chipActive]} accessibilityRole="button" accessibilityState={{ selected: value === g }}>
                      <Text style={[styles.chipText, value === g && styles.chipTextActive]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>

          <Text style={styles.group}>{t('profile.groupContact')}</Text>
          {textField('email', t('auth.email'), { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {textField('address', t('profile.address'))}
          {textField('district', t('profile.district'))}
          {textField('postal_code', t('profile.postalCode'))}

          <Text style={styles.group}>{t('home.blood')}</Text>
          <Controller
            control={control}
            name="blood_group"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {BLOOD_OPTIONS.map((bg) => (
                  <Pressable key={bg} onPress={() => onChange(bg)} style={[styles.chip, value === bg && styles.chipActive]} accessibilityRole="button" accessibilityState={{ selected: value === bg }}>
                    <Text style={[styles.chipText, value === bg && styles.chipTextActive]}>{bg}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <View style={{ height: spacing.sm }} />
          <Button
            label={t('common.save')}
            onPress={handleSubmit((data) => save.mutate(data))}
            disabled={!isDirty || save.isPending}
            loading={save.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  avatarRow: { alignItems: 'center', gap: spacing.xs },
  avatarCta: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.darkTeal, marginTop: spacing.xs },
  group: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary, marginTop: spacing.sm },
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
