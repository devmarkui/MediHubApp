// Stage 3 — Medical Reports (EMR). Shows MediHub reports plus historical records
// pulled from the legacy EMR by phone number (when that API is configured).
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FileText, History } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reportsApi } from '@/api/reports';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDate } from '@/utils/format';

export default function ReportsTab(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('reports.title')}</Text>
        <Text style={styles.subtitle}>{t('reports.subtitle')}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: spacing.screen, paddingTop: 0, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.darkTeal} />
        }
      >
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={64} />)
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !query.data || query.data.length === 0 ? (
          <View style={{ paddingTop: spacing.xl }}>
            <EmptyState title={t('reports.empty')} />
          </View>
        ) : (
          query.data.map((r) => {
            const isLegacy = r.source === 'legacy';
            return (
              <Pressable
                key={String(r.id)}
                onPress={() => {
                  if (isLegacy) {
                    if (r.download_url) void Linking.openURL(r.download_url);
                  } else {
                    router.push({ pathname: '/reports/[id]', params: { id: String(r.id) } });
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={r.title}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              >
                <Card>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, isLegacy && styles.iconBoxLegacy]}>
                      {isLegacy ? (
                        <History size={20} color={colors.info} />
                      ) : (
                        <FileText size={20} color={colors.warning} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reportTitle}>{r.title}</Text>
                      <Text style={styles.body}>{t('reports.released', { date: formatDate(r.released_at) })}</Text>
                    </View>
                    {isLegacy ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t('reports.legacyBadge')}</Text>
                      </View>
                    ) : null}
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.xs, paddingBottom: spacing.md },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary },
  subtitle: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.amberTint, alignItems: 'center', justifyContent: 'center' },
  iconBoxLegacy: { backgroundColor: colors.blueTint },
  reportTitle: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  body: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  badge: { backgroundColor: colors.blueTint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.info },
});
