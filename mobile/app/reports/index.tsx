import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reportsApi } from '@/api/reports';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDate } from '@/utils/format';

export default function ReportsList(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('reports.title') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 10 }}>
        {query.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={64} />)
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState title={t('reports.empty')} />
        ) : (
          query.data.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/reports/[id]', params: { id: String(r.id) } })}
              accessibilityRole="button"
              accessibilityLabel={r.title}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <FileText size={20} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{r.title}</Text>
                    <Text style={styles.body}>{t('reports.released', { date: formatDate(r.released_at) })}</Text>
                  </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.amberTint, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  body: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
});
