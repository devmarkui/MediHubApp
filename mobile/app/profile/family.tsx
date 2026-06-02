import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import type { BloodGroup, Gender, Patient } from '@/types/models';
import { familyMemberSchema } from '@/utils/validators';
import { formatDate } from '@/utils/format';

type FormData = {
  name: string;
  dob?: string;
  gender?: Gender;
  blood_group?: BloodGroup;
};

const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other'];
const BLOOD_OPTIONS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function FamilyScreen(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({ queryKey: ['family'], queryFn: patientsApi.listFamily });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: { name: '', dob: '', gender: undefined, blood_group: undefined },
  });

  const openAdd = (): void => {
    setEditing(null);
    reset({ name: '', dob: '', gender: undefined, blood_group: undefined });
    setShowForm(true);
  };

  const openEdit = (m: Patient): void => {
    setEditing(m);
    reset({
      name: m.name,
      dob: m.dob ?? '',
      gender: m.gender ?? undefined,
      blood_group: m.blood_group ?? undefined,
    });
    setShowForm(true);
  };

  const save = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        name: data.name,
        dob: data.dob && data.dob.length > 0 ? data.dob : undefined,
        gender: data.gender,
        blood_group: data.blood_group,
      };
      return editing ? patientsApi.updateFamily(editing.id, payload) : patientsApi.addFamily(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => Alert.alert(t('errors.unknown'), (e as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => patientsApi.deleteFamily(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  });

  const subtitle = (m: Patient): string =>
    [m.gender, m.blood_group, m.dob ? formatDate(m.dob) : null].filter(Boolean).join('  ·  ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('profile.family'),
          headerRight: () => (
            <Pressable onPress={openAdd} accessibilityRole="button" hitSlop={8} style={{ marginRight: 4 }}>
              <Plus size={22} color={colors.darkTeal} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 10 }}>
        {list.isLoading ? (
          <>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </>
        ) : !list.data || list.data.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            body={t('profile.noFamily')}
            ctaLabel={t('profile.addFamilyMember')}
            onCta={openAdd}
          />
        ) : (
          list.data.map((m) => (
            <Pressable key={m.id} onPress={() => openEdit(m)} accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <Card>
                <View style={styles.row}>
                  <Avatar name={m.name} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{m.name}</Text>
                    {subtitle(m) ? <Text style={styles.sub}>{subtitle(m)}</Text> : <Text style={styles.subMuted}>{t('family.tapToEdit')}</Text>}
                  </View>
                  <Pressable
                    onPress={() =>
                      Alert.alert(t('common.delete'), m.name, [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.delete'), style: 'destructive', onPress: () => remove.mutate(m.id) },
                      ])
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${t('common.delete')} ${m.name}`}
                    hitSlop={10}
                    style={styles.trash}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </Pressable>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editing ? t('family.editTitle') : t('profile.addFamilyMember')}</Text>
            <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
              <Text style={styles.modalClose}>{t('common.close')}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }} keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input label={t('auth.name')} value={value} onChangeText={onChange} autoCapitalize="words" error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, value } }) => (
                <Input label={t('auth.dob')} placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} error={errors.dob?.message} />
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
                      <Pressable key={g} onPress={() => onChange(value === g ? undefined : g)} style={[styles.chip, value === g && styles.chipActive]} accessibilityRole="button" accessibilityState={{ selected: value === g }}>
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
                      <Pressable key={bg} onPress={() => onChange(value === bg ? undefined : bg)} style={[styles.chip, value === bg && styles.chipActive]} accessibilityRole="button" accessibilityState={{ selected: value === bg }}>
                        <Text style={[styles.chipText, value === bg && styles.chipTextActive]}>{bg}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>
            <Button label={t('common.save')} loading={save.isPending} onPress={handleSubmit((d) => save.mutate(d))} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  sub: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  subMuted: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary },
  trash: { padding: 4 },
  modal: { flex: 1, backgroundColor: colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.screen, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  modalTitle: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  modalClose: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.darkTeal },
  label: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  chipText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.surface },
});
