import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appApi } from '@/api/app';
import { packagesApi } from '@/api/packages';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { formatMoney } from '@/utils/format';

const FALLBACK_WHATSAPP = '+94752977591';

function openWhatsApp(numberE164: string, message: string): void {
  const digits = numberE164.replace(/\D/g, '');
  const appUrl = `whatsapp://send?phone=${digits}&text=${encodeURIComponent(message)}`;
  const webUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  void Linking.canOpenURL(appUrl).then((supported) =>
    Linking.openURL(supported ? appUrl : webUrl).catch(() => {
      void Linking.openURL(webUrl);
    }),
  );
}

export default function PackageDetail(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { code } = useLocalSearchParams<{ code: string }>();
  const patient = useAuthStore((s) => s.patient);

  const query = useQuery({
    queryKey: ['package', code],
    queryFn: () => packagesApi.show(String(code)),
    enabled: typeof code === 'string',
  });
  const config = useQuery({ queryKey: ['app.config'], queryFn: appApi.config });

  const book = useMutation({
    mutationFn: () => packagesApi.purchase(query.data!.id),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['package-purchases'] });

      // Notify the clinic on WhatsApp with the booking details.
      const number = config.data?.appointment_whatsapp ?? FALLBACK_WHATSAPP;
      const p = query.data;
      const message =
        `*New package booking — MediHub*\n` +
        `Patient: ${patient?.name ?? '—'} (${patient?.phone ?? '—'})\n` +
        `Passbook: ${patient?.passbook_no ?? '—'}\n` +
        `Package: ${p?.name ?? '—'}\n` +
        `Price: ${formatMoney(p?.discounted_price)}\n` +
        `Ref: ${created.purchase_no}`;
      openWhatsApp(number, message);

      Alert.alert(t('packages.bookedTitle'), t('packages.bookedBody'), [
        { text: t('common.ok'), onPress: () => router.replace('/(tabs)/home') },
      ]);
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
  const hasDiscount = p.discount_percent > 0 && p.original_price > p.discounted_price;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: p.name }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, paddingBottom: 120 }}>
        <Card>
          {p.is_featured ? <Text style={styles.eyebrow}>{t('packages.featured')}</Text> : null}
          <Text style={styles.name}>{p.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceNow}>{formatMoney(p.discounted_price)}</Text>
            {hasDiscount ? (
              <>
                <Text style={styles.priceOld}>{formatMoney(p.original_price)}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>{`-${p.discount_percent}%`}</Text>
                </View>
              </>
            ) : null}
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

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.note}>{p.description}</Text>
        </Card>
      </ScrollView>

      <View style={styles.cta}>
        <Text style={styles.whatsappNote}>{t('packages.whatsappNote')}</Text>
        <Button label={t('packages.book')} loading={book.isPending} onPress={() => book.mutate()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  eyebrow: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald, letterSpacing: 0.5 },
  name: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
  priceRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceNow: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.darkTeal },
  priceOld: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: colors.greenTint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  discountText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald },
  validity: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary },
  heading: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.sm },
  inclusionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald },
  inclusionText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textPrimary },
  note: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  cta: { padding: spacing.screen, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  whatsappNote: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary, marginBottom: spacing.sm, textAlign: 'center' },
});
