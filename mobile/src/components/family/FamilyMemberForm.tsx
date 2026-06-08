import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { colors, fontFamily, spacing } from '@/theme';
import type { BloodGroup, Gender } from '@/types/models';
import { familyMemberSchema } from '@/utils/validators';

export type FamilyFormValues = {
  name: string;
  dob: string;
  gender?: Gender;
  blood_group?: BloodGroup;
};

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other'];
const BLOOD_OPTIONS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type Props = {
  defaultValues?: Partial<FamilyFormValues>;
  onSubmit: (values: FamilyFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
};

/**
 * Reusable add/edit form for a family member. Owns its own validation state so
 * the Save button stays disabled until every field is valid.
 */
export function FamilyMemberForm({
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel,
}: Props): React.ReactElement {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FamilyFormValues>({
    resolver: zodResolver(familyMemberSchema),
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name ?? '',
      dob: defaultValues?.dob ?? '',
      gender: defaultValues?.gender,
      blood_group: defaultValues?.blood_group,
    },
  });

  return (
    <View style={{ gap: spacing.md }}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('auth.name')}
            placeholder={t('family.namePlaceholder')}
            value={value}
            onChangeText={onChange}
            // Collapse doubled spaces and trim edges once the user leaves the field.
            onBlur={() => {
              onChange((value ?? '').replace(/\s+/g, ' ').trim());
              onBlur();
            }}
            autoCapitalize="words"
            error={errors.name?.message}
            valid={!errors.name && !!value && value.trim().length >= 2}
          />
        )}
      />
      <Controller
        control={control}
        name="dob"
        render={({ field: { onChange, value } }) => (
          <DatePicker
            label={t('family.dobLabel')}
            placeholder={t('family.selectDob')}
            value={value && value.length > 0 ? value : undefined}
            onChange={onChange}
            error={errors.dob?.message}
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
                  onPress={() => onChange(value === g ? undefined : g)}
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
                  onPress={() => onChange(value === bg ? undefined : bg)}
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
        label={submitLabel ?? t('common.save')}
        loading={submitting}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
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
