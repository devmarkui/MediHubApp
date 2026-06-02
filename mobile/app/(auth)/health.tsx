import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import type { BloodGroup } from '@/types/models';
import { bmiCategory } from '@/utils/format';

const BLOOD_OPTIONS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Stage 2 — collected right after sign-up. Everything is optional and skippable;
// the same fields live under Profile > Health details for later.
export default function HealthOnboardingScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const updatePatient = useAuthStore((s) => s.updatePatient);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>(undefined);
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');

  const livePreview = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 30 || w < 1) return null;
    const m = h / 100;
    return Math.round((w / (m * m)) * 10) / 10;
  }, [height, weight]);

  const category = bmiCategory(livePreview, colors);

  const save = useMutation({
    mutationFn: () =>
      patientsApi.update({
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        blood_group: bloodGroup ?? null,
        allergies: allergies.trim() || null,
        chronic_conditions: chronic.trim() || null,
      }),
    onSuccess: async (patient) => {
      await updatePatient(patient);
      router.replace('/(tabs)/home');
    },
    onError: (e: unknown) => {
      // Non-blocking — let the user into the app regardless.
      void (e instanceof ApiError);
      router.replace('/(tabs)/home');
    },
  });

  const goHome = (): void => router.replace('/(tabs)/home');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('health.title')}</Text>
          <Text style={styles.subtitle}>{t('health.subtitle')}</Text>

          <View style={{ height: spacing.lg }} />

          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Input label={t('health.heightLabel')} placeholder="170" keyboardType="decimal-pad" value={height} onChangeText={(v) => setHeight(v.replace(/[^\d.]/g, ''))} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label={t('health.weightLabel')} placeholder="65" keyboardType="decimal-pad" value={weight} onChangeText={(v) => setWeight(v.replace(/[^\d.]/g, ''))} />
            </View>
          </View>

          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>{t('health.bmiLabel')}</Text>
            <Text style={[styles.bmiValue, category ? { color: category.color } : null]}>{livePreview ?? '—'}</Text>
            {category ? <Text style={[styles.bmiCat, { color: category.color }]}>{category.label}</Text> : null}
          </View>

          <Text style={styles.label}>{t('home.blood')}</Text>
          <View style={styles.chipRow}>
            {BLOOD_OPTIONS.map((bg) => (
              <Pressable
                key={bg}
                onPress={() => setBloodGroup((cur) => (cur === bg ? undefined : bg))}
                accessibilityRole="button"
                accessibilityState={{ selected: bloodGroup === bg }}
                style={[styles.chip, bloodGroup === bg && styles.chipActive]}
              >
                <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: spacing.md }} />
          <Input label={t('health.allergies')} placeholder={t('health.allergiesHint')} value={allergies} onChangeText={setAllergies} multiline style={styles.multiline} />
          <View style={{ height: spacing.md }} />
          <Input label={t('health.chronic')} placeholder={t('health.chronicHint')} value={chronic} onChangeText={setChronic} multiline style={styles.multiline} />

          <Text style={styles.note}>{t('health.optionalNote')}</Text>

          <View style={{ height: spacing.lg }} />
          <Button label={t('health.save')} onPress={() => save.mutate()} loading={save.isPending} />
          <Pressable onPress={goHome} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>{t('health.skip')}</Text>
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
  subtitle: { marginTop: spacing.xs, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  fieldRow: { flexDirection: 'row', gap: spacing.sm },
  bmiCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  bmiLabel: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5 },
  bmiValue: { marginTop: 4, fontFamily: fontFamily.medium, fontSize: 34, color: colors.textPrimary },
  bmiCat: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 13 },
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
  multiline: { minHeight: 60, paddingTop: 12, textAlignVertical: 'top' },
  note: { marginTop: spacing.lg, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary, textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textSecondary },
});
