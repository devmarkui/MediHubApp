// Stage 5 — My Appointments. Lists the patient's appointment requests + status.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CalendarPlus, ChevronRight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appointmentsApi } from '@/api/appointments';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Appointment } from '@/types/models';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDate, formatTime } from '@/utils/format';

type Filter = 'upcoming' | 'past' | 'all';

const STATUS_COLORS: Record<Appointment['status'], string> = {
  pending: colors.warning,
  confirmed: colors.emerald,
  completed: colors.textSecondary,
  cancelled: colors.danger,
  no_show: colors.danger,
};

export default function AppointmentsTab(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('upcoming');

  const query = useQuery({
    queryKey: ['appointments', filter],
    queryFn: () => appointmentsApi.list(filter),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const filters: Filter[] = ['upcoming', 'past', 'all'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('appointments.title')}</Text>
        <View style={styles.tabs}>
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
              style={[styles.chip, filter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {t(`appointments.${f}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.screen, paddingTop: 0, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.darkTeal} />
        }
      >
        {query.isLoading ? (
          <>
            <Skeleton height={74} />
            <Skeleton height={74} />
          </>
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !query.data || query.data.length === 0 ? (
          <View style={{ paddingTop: spacing.xl }}>
            <EmptyState title={t('appointments.empty')} />
            <View style={{ height: spacing.md }} />
            <Button label={t('doctors.bookCta')} onPress={() => router.push('/(tabs)/book')} />
          </View>
        ) : (
          query.data.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => router.push({ pathname: '/appointments/[id]', params: { id: String(a.id) } })}
              accessibilityRole="button"
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{formatDate(a.appointment_date, 'd')}</Text>
                    <Text style={styles.dateMon}>{formatDate(a.appointment_date, 'MMM')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{a.doctor?.name ?? '—'}</Text>
                    <Text style={styles.spec}>{a.doctor?.specialization ?? '—'}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.time}>{formatTime(a.appointment_time)}</Text>
                      <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[a.status]}1A` }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[a.status] }]}>
                          {t(`appointments.status.${a.status}`)}
                        </Text>
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

      <Pressable
        onPress={() => router.push('/(tabs)/book')}
        accessibilityRole="button"
        accessibilityLabel={t('doctors.bookCta')}
        style={styles.fab}
      >
        <CalendarPlus size={22} color={colors.surface} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary },
  tabs: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  chipText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.mintTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: { fontFamily: fontFamily.medium, fontSize: 18, color: colors.darkTeal },
  dateMon: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.darkTeal, letterSpacing: 0.5 },
  name: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textPrimary },
  spec: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  time: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textPrimary },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusText: { fontFamily: fontFamily.medium, fontSize: 11 },
  fab: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.screen,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
