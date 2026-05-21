import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { labTestsApi } from '@/api/labTests';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDateTime, formatMoney } from '@/utils/format';

const STEPS: Array<{ key: string; tKey: string }> = [
  { key: 'ordered', tKey: 'lab.orderStatus.ordered' },
  { key: 'sample_collected', tKey: 'lab.orderStatus.sample_collected' },
  { key: 'processing', tKey: 'lab.orderStatus.processing' },
  { key: 'ready', tKey: 'lab.orderStatus.ready' },
  { key: 'delivered', tKey: 'lab.orderStatus.delivered' },
];

export default function LabOrderDetail(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['lab-order', id],
    queryFn: () => labTestsApi.showOrder(Number(id)),
    enabled: typeof id === 'string',
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

  const o = query.data;
  const currentIdx = STEPS.findIndex((s) => s.key === o.status);
  const canPay = o.payment_status === 'unpaid';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: o.order_no }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }}>
        <Card>
          <Text style={styles.heading}>{t('lab.title')}</Text>
          {o.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.test?.name ?? '—'}</Text>
                {item.result_value ? (
                  <Text style={[styles.itemResult, item.is_abnormal && { color: colors.danger }]}>
                    {`${item.result_value} ${item.result_unit ?? ''} ${item.result_normal_range ? `(${item.result_normal_range})` : ''}`}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(o.total_amount)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.heading}>Status</Text>
          {STEPS.map((step, i) => {
            const done = i <= currentIdx;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={[styles.stepDot, done && styles.stepDotDone]} />
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{t(step.tKey)}</Text>
              </View>
            );
          })}
          {o.ordered_at ? <Text style={styles.timestamp}>{`Ordered ${formatDateTime(o.ordered_at)}`}</Text> : null}
        </Card>

        {canPay ? (
          <Button
            label={t('payment.title')}
            onPress={() => router.push({ pathname: '/payment/[id]', params: { id: 'new', payable_type: 'lab_order', payable_id: String(o.id) } })}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  heading: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 12 },
  itemName: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
  itemResult: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.darkTeal },
  itemPrice: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm },
  totalLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  totalValue: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotDone: { backgroundColor: colors.emerald },
  stepLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  stepLabelDone: { color: colors.textPrimary, fontFamily: fontFamily.medium },
  timestamp: { marginTop: spacing.sm, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary },
});
