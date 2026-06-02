import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { bmiCategory } from '@/utils/format';

export default function HealthDetailsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const patient = useAuthStore((s) => s.patient);
  const updatePatient = useAuthStore((s) => s.updatePatient);

  const [height, setHeight] = useState(patient?.height_cm ? String(patient.height_cm) : '');
  const [weight, setWeight] = useState(patient?.weight_kg ? String(patient.weight_kg) : '');
  const [allergies, setAllergies] = useState(patient?.allergies ?? '');
  const [chronic, setChronic] = useState(patient?.chronic_conditions ?? '');
  const [medications, setMedications] = useState(patient?.current_medications ?? '');
  const [surgeries, setSurgeries] = useState(patient?.past_surgeries ?? '');
  const [ecName, setEcName] = useState(patient?.emergency_contact_name ?? '');
  const [ecPhone, setEcPhone] = useState(patient?.emergency_contact_phone ?? '');

  const preview = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 30 || w < 1) return null;
    const m = h / 100;
    return Math.round((w / (m * m)) * 10) / 10;
  }, [height, weight]);

  const category = bmiCategory(preview, colors);

  const save = useMutation({
    mutationFn: () =>
      patientsApi.update({
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        allergies: allergies.trim() || null,
        chronic_conditions: chronic.trim() || null,
        current_medications: medications.trim() || null,
        past_surgeries: surgeries.trim() || null,
        emergency_contact_name: ecName.trim() || null,
        emergency_contact_phone: ecPhone.trim() || null,
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.health') }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>{t('health.subtitle')}</Text>

          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>{t('health.bmiLabel')}</Text>
            <Text style={[styles.bmiValue, category ? { color: category.color } : null]}>{preview ?? '—'}</Text>
            {category ? <Text style={[styles.bmiCat, { color: category.color }]}>{category.label}</Text> : null}
          </View>

          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Input label={t('health.heightLabel')} placeholder="170" keyboardType="decimal-pad" value={height} onChangeText={(v) => setHeight(v.replace(/[^\d.]/g, ''))} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label={t('health.weightLabel')} placeholder="65" keyboardType="decimal-pad" value={weight} onChangeText={(v) => setWeight(v.replace(/[^\d.]/g, ''))} />
            </View>
          </View>

          <Text style={styles.group}>{t('health.medicalGroup')}</Text>
          <Input label={t('health.allergies')} placeholder={t('health.allergiesHint')} value={allergies} onChangeText={setAllergies} multiline style={styles.multiline} />
          <Input label={t('health.chronic')} placeholder={t('health.chronicHint')} value={chronic} onChangeText={setChronic} multiline style={styles.multiline} />
          <Input label={t('health.medications')} value={medications} onChangeText={setMedications} multiline style={styles.multiline} />
          <Input label={t('health.surgeries')} value={surgeries} onChangeText={setSurgeries} multiline style={styles.multiline} />

          <Text style={styles.group}>{t('health.emergencyGroup')}</Text>
          <Input label={t('health.ecName')} value={ecName} onChangeText={setEcName} autoCapitalize="words" />
          <Input label={t('health.ecPhone')} value={ecPhone} onChangeText={setEcPhone} keyboardType="phone-pad" />

          <View style={{ height: spacing.sm }} />
          <Button label={t('health.save')} onPress={() => save.mutate()} loading={save.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  subtitle: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textSecondary },
  bmiCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  bmiLabel: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5 },
  bmiValue: { marginTop: 4, fontFamily: fontFamily.medium, fontSize: 34, color: colors.textPrimary },
  bmiCat: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 13 },
  fieldRow: { flexDirection: 'row', gap: spacing.sm },
  group: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary, marginTop: spacing.sm },
  multiline: { minHeight: 64, paddingTop: 12, textAlignVertical: 'top' },
});
