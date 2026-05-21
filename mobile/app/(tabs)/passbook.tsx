import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { passbookApi, type PassbookType } from '@/api/passbook';
import { ActivityRow } from '@/components/home/ActivityRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function PassbookScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [type, setType] = useState<PassbookType>('all');

  const query = useInfiniteQuery({
    queryKey: ['passbook', type],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => passbookApi.feed({ type, page: pageParam, per_page: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });

  const items = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  const filters: Array<{ key: PassbookType; label: string }> = [
    { key: 'all', label: t('passbook.filterAll') },
    { key: 'consultation', label: t('passbook.filterConsultation') },
    { key: 'lab', label: t('passbook.filterLab') },
    { key: 'package', label: t('passbook.filterPackage') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('passbook.title')}</Text>
      </View>

      <View style={styles.filters}>
        {filters.map((f) => {
          const active = type === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setType(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filter, active && styles.filterActive]}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {query.isLoading ? (
        <View style={{ paddingHorizontal: spacing.screen, gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={48} radius={12} />
          ))}
        </View>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={t('common.empty')} body={t('passbook.empty')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => (
            <ActivityRow
              type={item.type}
              title={item.title}
              subtitle={item.subtitle}
              amount={item.amount}
              status={item.status}
              showBorder={index < items.length - 1}
              activeLabel={t('home.activeBadge')}
              onPress={() => {
                if (item.type === 'consultation') router.push({ pathname: '/appointments/[id]', params: { id: String(item.reference_id) } });
                else if (item.type === 'lab') router.push({ pathname: '/lab-orders/[id]', params: { id: String(item.reference_id) } });
                else router.push('/(tabs)/packages');
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={query.isFetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={colors.darkTeal} />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: spacing.screen, marginBottom: spacing.md },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  filterLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  filterLabelActive: { color: colors.surface },
});
