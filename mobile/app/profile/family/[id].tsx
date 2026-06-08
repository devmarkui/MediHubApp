import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import type { Patient } from '@/types/models';
import { formatDate } from '@/utils/format';

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function InfoRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function FamilyMemberDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Read from the same account-scoped family list — the API only ever returns
  // members owned by the logged-in user, so a member not in this list is not
  // accessible to them.
  const list = useQuery({ queryKey: ['family'], queryFn: patientsApi.listFamily });
  const member: Patient | undefined = list.data?.find((m) => String(m.id) === String(id));

  const remove = useMutation({
    mutationFn: () => patientsApi.deleteFamily(Number(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] });
      router.back();
    },
    onError: (e) => Alert.alert(t('errors.unknown'), (e as Error).message),
  });

  const confirmRemove = (): void => {
    Alert.alert(t('family.removeTitle'), t('family.removeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => remove.mutate() },
    ]);
  };

  if (list.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen
          options={{ headerShown: true, title: t('family.detailsTitle'), animation: 'slide_from_right' }}
        />
        <View style={{ padding: spacing.screen, gap: spacing.md }}>
          <Skeleton height={120} />
          <Skeleton height={140} />
        </View>
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen
          options={{ headerShown: true, title: t('family.detailsTitle'), animation: 'slide_from_right' }}
        />
        <EmptyState title={t('family.notFound')} body={t('family.notFoundBody')} />
      </SafeAreaView>
    );
  }

  const age = calcAge(member.dob);
  const hasMedical =
    !!member.allergies || !!member.chronic_conditions || !!member.emergency_contact_name;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('family.detailsTitle') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }}>
        {/* Profile header */}
        <Card style={styles.headerCard}>
          <Avatar name={member.name} size={72} />
          <Text style={styles.name}>{member.name}</Text>
          <View style={styles.badgeRow}>
            {age !== null ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{`${age} ${t('family.yearsShort')}`}</Text>
              </View>
            ) : null}
            {member.gender ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cap(member.gender)}</Text>
              </View>
            ) : null}
            {member.blood_group ? (
              <View style={[styles.badge, styles.bloodBadge]}>
                <Text style={[styles.badgeText, styles.bloodText]}>{member.blood_group}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.viewOnly}>
            <Lock size={12} color={colors.textSecondary} />
            <Text style={styles.viewOnlyText}>{t('family.viewOnly')}</Text>
          </View>
        </Card>

        {/* Personal information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('family.personalInfo')}</Text>
          <Card>
            <InfoRow
              label={t('family.dobLabel')}
              value={member.dob ? formatDate(member.dob) : '—'}
            />
            <View style={styles.divider} />
            <InfoRow label={t('family.age')} value={age !== null ? `${age} ${t('family.yearsShort')}` : '—'} />
            <View style={styles.divider} />
            <InfoRow label={t('auth.gender')} value={member.gender ? cap(member.gender) : '—'} />
            <View style={styles.divider} />
            <InfoRow label={t('home.blood')} value={member.blood_group ?? '—'} />
          </Card>
        </View>

        {/* Medical information (only when something is recorded) */}
        {hasMedical ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('family.medicalInfo')}</Text>
            <Card>
              {member.allergies ? (
                <InfoRow label={t('family.allergies')} value={member.allergies} />
              ) : null}
              {member.allergies && (member.chronic_conditions || member.emergency_contact_name) ? (
                <View style={styles.divider} />
              ) : null}
              {member.chronic_conditions ? (
                <InfoRow label={t('family.conditions')} value={member.chronic_conditions} />
              ) : null}
              {member.chronic_conditions && member.emergency_contact_name ? (
                <View style={styles.divider} />
              ) : null}
              {member.emergency_contact_name ? (
                <InfoRow
                  label={t('family.emergency')}
                  value={[member.emergency_contact_name, member.emergency_contact_phone]
                    .filter(Boolean)
                    .join(' · ')}
                />
              ) : null}
            </Card>
          </View>
        ) : null}

        {/* Account-owner action: remove this family member */}
        <Button
          variant="danger"
          label={t('family.removeMember')}
          loading={remove.isPending}
          leftIcon={<Trash2 size={18} color={colors.surface} />}
          onPress={confirmRemove}
          style={{ marginTop: spacing.xs }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  headerCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  name: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: colors.textPrimary,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badgeText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  bloodBadge: { backgroundColor: colors.greenTint, borderColor: colors.brandTeal },
  bloodText: { color: colors.darkTeal },
  viewOnly: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  viewOnlyText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  section: { gap: spacing.xs },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.xxs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  infoLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  infoValue: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
