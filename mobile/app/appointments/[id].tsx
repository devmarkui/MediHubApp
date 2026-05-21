import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appointmentsApi } from '@/api/appointments';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDate, formatMoney, formatTime } from '@/utils/format';

export default function AppointmentDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.show(Number(id)),
    enabled: typeof id === 'string',
  });

  const cancel = useMutation({
    mutationFn: () => appointmentsApi.cancel(Number(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      void queryClient.invalidateQueries({ queryKey: ['passbook'] });
    },
  });

  if (query.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: spacing.screen }}>
          <Skeleton height={120} />
        </View>
      </SafeAreaView>
    );
  }
  if (query.isError || !query.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState onRetry={() => query.refetch()} />
      </SafeAreaView>
    );
  }

  const a = query.data;
  const canCancel = a.status === 'pending' || a.status === 'confirmed';
  const canPay = a.payment_status === 'unpaid' && a.status !== 'cancelled';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: a.appointment_no }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen }}>
        <Card style={styles.head}>
          <Avatar name={a.doctor?.name ?? '—'} uri={a.doctor?.avatar_url ?? null} size={56} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.doctor}>{a.doctor?.name ?? '—'}</Text>
            <Text style={styles.specialization}>{a.doctor?.specialization ?? '—'}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Row label={t('appointments.upcoming')} value={`${formatDate(a.appointment_date)} · ${formatTime(a.appointment_time)}`} />
          <Row label={t('common.confirm')} value={t(`appointments.status.${a.status}`)} />
          <Row label={t('doctors.fee')} value={formatMoney(a.consultation_fee)} />
        </Card>

        {a.notes ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.notesLabel}>{t('common.edit')}</Text>
            <Text style={styles.notes}>{a.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          {canPay ? (
            <Button
              label={t('payment.title')}
              variant="primary"
              onPress={() => router.push({ pathname: '/payment/[id]', params: { id: 'new', payable_type: 'appointment', payable_id: String(a.id) } })}
            />
          ) : null}
          {canCancel ? (
            <Button
              label={t('appointments.cancel')}
              variant="danger"
              loading={cancel.isPending}
              onPress={() =>
                Alert.alert(t('appointments.cancel'), t('appointments.cancelConfirm'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.confirm'), style: 'destructive', onPress: () => cancel.mutate() },
                ])
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  head: { flexDirection: 'row', alignItems: 'center' },
  doctor: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  specialization: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  rowValue: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
  notesLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  notes: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textPrimary },
  actions: { marginTop: spacing.lg, gap: 10 },
});
