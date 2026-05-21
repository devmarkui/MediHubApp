import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { packagesApi } from '@/api/packages';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { formatMoney } from '@/utils/format';

export default function PackageDetail(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { code } = useLocalSearchParams<{ code: string }>();

  const query = useQuery({
    queryKey: ['package', code],
    queryFn: () => packagesApi.show(String(code)),
    enabled: typeof code === 'string',
  });

  const purchase = useMutation({
    mutationFn: () => packagesApi.purchase(query.data!.id),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['package-purchases'] });
      void queryClient.invalidateQueries({ queryKey: ['passbook'] });
      router.replace({
        pathname: '/payment/[id]',
        params: { id: 'new', payable_type: 'package_purchase', payable_id: String(created.id) },
      });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      Alert.alert(t('errors.unknown'), msg);
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

  const p = query.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: p.name }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, paddingBottom: 120 }}>
        <Card>
          {p.is_featured ? <Text style={styles.eyebrow}>{t('packages.featured')}</Text> : null}
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.body}>{p.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceNow}>{formatMoney(p.discounted_price)}</Text>
            <Text style={styles.priceOld}>{formatMoney(p.original_price)}</Text>
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>{`-${p.discount_percent}%`}</Text>
            </View>
          </View>
          <Text style={styles.validity}>{t('packages.validity', { days: p.validity_days })}</Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.heading}>{t('packages.inclusions')}</Text>
          {p.inclusions.map((inc, i) => (
            <View key={i} style={styles.inclusionRow}>
              <View style={styles.bullet} />
              <Text style={styles.inclusionText}>{inc}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View style={styles.cta}>
        <Button label={t('packages.purchase')} loading={purchase.isPending} onPress={() => purchase.mutate()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  eyebrow: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald, letterSpacing: 0.5 },
  name: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
  body: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  priceRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceNow: { fontFamily: fontFamily.medium, fontSize: 20, color: colors.textPrimary },
  priceOld: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: colors.greenTint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  discountText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald },
  validity: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary },
  heading: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.sm },
  inclusionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.darkTeal },
  inclusionText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textPrimary },
  cta: { padding: spacing.screen, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
