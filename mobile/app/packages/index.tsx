// Health Checkup Packages — list. Tap a package to view details and book.
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Sparkles } from 'lucide-react-native';
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

export default function PackagesList(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useQuery({ queryKey: ['packages'], queryFn: () => packagesApi.list() });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('packages.title') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 12 }}>
        <Text style={styles.subtitle}>{t('packages.subtitle')}</Text>
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={96} />)
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState title={t('common.empty')} />
        ) : (
          query.data.map((p) => (
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
                    <View style={styles.titleRow}>
                      <Text style={styles.name}>{p.name}</Text>
                      {p.is_featured ? (
                        <View style={styles.featured}>
                          <Sparkles size={11} color={colors.emerald} />
                          <Text style={styles.featuredText}>{t('packages.featured')}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.tests}>{t('packages.testCount', { count: p.inclusions.length })}</Text>
                    <Text style={styles.price}>{formatMoney(p.discounted_price)}</Text>
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
  subtitle: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textPrimary },
  featured: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.greenTint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  featuredText: { fontFamily: fontFamily.medium, fontSize: 9, color: colors.emerald, letterSpacing: 0.3 },
  tests: { marginTop: 3, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  price: { marginTop: 6, fontFamily: fontFamily.medium, fontSize: 16, color: colors.darkTeal },
});
