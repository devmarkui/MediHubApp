import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { setLanguage } from '@/utils/i18n';
import type { Language } from '@/types/models';

const OPTIONS: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function LanguageScreen(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const patient = useAuthStore((s) => s.patient);
  const updatePatient = useAuthStore((s) => s.updatePatient);
  const setUiLanguage = useUIStore((s) => s.setLanguage);
  const current = (patient?.language ?? (i18n.language as Language)) as Language;

  const change = useMutation({
    mutationFn: (lang: Language) => patientsApi.update({ language: lang }),
    onSuccess: async (next, lang) => {
      setLanguage(lang);
      setUiLanguage(lang);
      await updatePatient(next);
      void queryClient.invalidateQueries({ queryKey: ['app.config'] });
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.language') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 8 }}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.code}
            onPress={() => change.mutate(opt.code)}
            accessibilityRole="button"
            accessibilityState={{ selected: opt.code === current }}
            style={[styles.row, opt.code === current && styles.rowActive]}
          >
            <Text style={styles.label}>{opt.label}</Text>
            {opt.code === current ? <Check size={18} color={colors.emerald} /> : null}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.emerald, backgroundColor: colors.greenTint },
  label: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
});
