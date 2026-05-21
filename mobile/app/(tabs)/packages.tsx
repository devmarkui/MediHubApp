import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { packagesApi } from '@/api/packages';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function PackagesScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const list = useQuery({ queryKey: ['packages'], queryFn: () => packagesApi.list() });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{t('packages.title')}</Text>

      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 12 }}>
        {list.isLoading ? (
          <>
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </>
        ) : list.isError ? (
          <ErrorState onRetry={() => list.refetch()} />
        ) : !list.data || list.data.length === 0 ? (
          <EmptyState title={t('common.empty')} />
        ) : (
          list.data.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/packages/[code]', params: { code: p.code } })}
              accessibilityRole="button"
              accessibilityLabel={p.name}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    {p.is_featured ? <Text style={styles.featuredEyebrow}>{t('packages.featured')}</Text> : null}
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.body} numberOfLines={2}>{p.description}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceNow}>{formatMoney(p.discounted_price)}</Text>
                      <Text style={styles.priceOld}>{formatMoney(p.original_price)}</Text>
                      <View style={styles.discountPill}>
                        <Text style={styles.discountText}>{`-${p.discount_percent}%`}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, paddingHorizontal: spacing.screen, paddingTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featuredEyebrow: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald, letterSpacing: 0.5, marginBottom: 2 },
  name: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textPrimary },
  body: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  priceRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceNow: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  priceOld: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: colors.greenTint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  discountText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.emerald },
});
