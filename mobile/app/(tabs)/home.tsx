import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Bell,
  CalendarPlus,
  FileText,
  FlaskConical,
  Package,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatInTimeZone } from 'date-fns-tz';

import { appApi } from '@/api/app';
import { appointmentsApi } from '@/api/appointments';
import { notificationsApi } from '@/api/notifications';
import { packagesApi } from '@/api/packages';
import { passbookApi } from '@/api/passbook';
import { reportsApi } from '@/api/reports';
import { ActivityRow } from '@/components/home/ActivityRow';
import { LaunchBanner } from '@/components/home/LaunchBanner';
import { QuickAction } from '@/components/home/QuickAction';
import { StatTile } from '@/components/home/StatTile';
import { UpcomingCard } from '@/components/home/UpcomingCard';
import { PassbookCard } from '@/components/passbook/PassbookCard';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { initials } from '@/utils/format';

function greetingKey(): 'home.morning' | 'home.afternoon' | 'home.evening' {
  const hour = Number(formatInTimeZone(new Date(), 'Asia/Colombo', 'H'));
  if (hour < 12) return 'home.morning';
  if (hour < 17) return 'home.afternoon';
  return 'home.evening';
}

export default function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const patient = useAuthStore((s) => s.patient);

  const config = useQuery({ queryKey: ['app.config'], queryFn: appApi.config });
  const passbook = useQuery({
    queryKey: ['passbook', 'home'],
    queryFn: () => passbookApi.feed({ per_page: 5 }),
  });
  const upcoming = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentsApi.list('upcoming'),
  });
  const reports = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });
  const purchases = useQuery({
    queryKey: ['package-purchases'],
    queryFn: () => packagesApi.myPurchases(),
  });
  const unread = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list({ unread: true }),
  });

  const isLoading = passbook.isLoading || upcoming.isLoading;
  const refreshing = passbook.isFetching && !passbook.isLoading;

  const onRefresh = (): void => {
    void config.refetch();
    void passbook.refetch();
    void upcoming.refetch();
    void reports.refetch();
    void purchases.refetch();
    void unread.refetch();
  };

  const reportsCount = reports.data?.length ?? 0;
  const activePackages = (purchases.data ?? []).filter((p) => p.status === 'active').length;
  const unreadCount = unread.data?.length ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.darkTeal} />}
      >
        {/* 1. Greeting header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t(greetingKey())}</Text>
            <Text style={styles.name}>{patient?.name ?? ''}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('notifications.title')}
              onPress={() => router.push('/notifications' as never)}
              hitSlop={8}
              style={styles.bellWrap}
            >
              <Bell size={19} color={colors.darkTeal} />
              {unreadCount > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel={t('profile.title')}
              hitSlop={8}
            >
              <Avatar name={initials(patient?.name)} size={38} />
            </Pressable>
          </View>
        </View>

        {/* 2. Hero passbook card */}
        <PassbookCard
          passbookNo={patient?.passbook_no ?? null}
          memberName={patient?.name ?? '—'}
          memberSince={patient?.member_since ?? null}
          verifiedLabel={`● ${t('common.verified')}`}
          passbookLabel={t('home.passbookLabel')}
          memberLabel={t('home.member')}
          sinceLabel={t('home.since')}
        />

        {/* 3. Stats trio */}
        <View style={styles.stats}>
          <StatTile label={t('home.blood')} value={patient?.blood_group ?? '—'} valueColor={colors.danger} />
          <StatTile label={t('home.reports')} value={String(reportsCount)} valueColor={colors.darkTeal} />
          <StatTile label={t('home.packages')} value={String(activePackages)} valueColor={colors.emerald} />
        </View>

        {/* 4. Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionGrid}>
            <QuickAction
              label={t('home.actionBook')}
              background={colors.mintTint}
              icon={<CalendarPlus size={22} color={colors.darkTeal} />}
              onPress={() => router.push('/(tabs)/book')}
            />
            <QuickAction
              label={t('home.actionLabTests')}
              background={colors.greenTint}
              icon={<FlaskConical size={22} color={colors.emerald} />}
              onPress={() => router.push('/lab-tests')}
            />
            <QuickAction
              label={t('home.actionPackages')}
              background={colors.blueTint}
              icon={<Package size={22} color={colors.info} />}
              onPress={() => router.push('/(tabs)/packages')}
            />
            <QuickAction
              label={t('home.actionReports')}
              background={colors.amberTint}
              icon={<FileText size={22} color={colors.warning} />}
              onPress={() => router.push('/reports' as never)}
            />
          </View>
        </View>

        {/* 5. Launch banner */}
        {config.data?.banner ? (
          <LaunchBanner
            title={config.data.banner.title}
            subtitle={config.data.banner.subtitle}
            onPress={() => {
              const code = config.data?.banner.action_code;
              if (code) router.push({ pathname: '/packages/[code]', params: { code } });
            }}
          />
        ) : null}

        {/* 6. Upcoming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.upcoming')}</Text>
          {upcoming.isLoading ? (
            <Skeleton height={70} radius={radius.card} />
          ) : upcoming.data && upcoming.data.length > 0 ? (
            <UpcomingCard
              day={formatInTimeZone(new Date(upcoming.data[0]!.appointment_date), 'Asia/Colombo', 'd')}
              monthShort={formatInTimeZone(new Date(upcoming.data[0]!.appointment_date), 'Asia/Colombo', 'MMM')}
              doctorName={upcoming.data[0]!.doctor?.name ?? '—'}
              specialization={upcoming.data[0]!.doctor?.specialization ?? '—'}
              time={upcoming.data[0]!.appointment_time}
              onPress={() => router.push({ pathname: '/appointments/[id]', params: { id: String(upcoming.data![0]!.id) } })}
            />
          ) : (
            <Text style={styles.emptyInline}>{t('common.empty')}</Text>
          )}
        </View>

        {/* 7. Passbook entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{t('home.passbookEntries')}</Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/(tabs)/passbook')}
              hitSlop={8}
            >
              <Text style={styles.viewAll}>{t('common.viewAll')}</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={48} radius={12} />
              <Skeleton height={48} radius={12} />
              <Skeleton height={48} radius={12} />
            </View>
          ) : passbook.data && passbook.data.items.length > 0 ? (
            passbook.data.items.slice(0, 3).map((entry, idx, arr) => (
              <ActivityRow
                key={entry.id}
                type={entry.type}
                title={entry.title}
                subtitle={entry.subtitle}
                amount={entry.amount}
                status={entry.status}
                showBorder={idx < arr.length - 1}
                activeLabel={t('home.activeBadge')}
                onPress={() => routeForEntry(router, entry.type, entry.reference_id)}
              />
            ))
          ) : (
            <Text style={styles.emptyInline}>{t('common.empty')}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function routeForEntry(
  router: ReturnType<typeof useRouter>,
  type: 'consultation' | 'lab' | 'package',
  referenceId: number,
): void {
  if (type === 'consultation') router.push({ pathname: '/appointments/[id]', params: { id: String(referenceId) } });
  else if (type === 'lab') router.push({ pathname: '/lab-orders/[id]', params: { id: String(referenceId) } });
  else router.push('/(tabs)/packages');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  greeting: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  name: { fontFamily: fontFamily.medium, fontSize: 17, color: colors.textPrimary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.mintTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  stats: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.screen, marginBottom: spacing.lg },
  section: { paddingHorizontal: spacing.screen, marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary, marginBottom: 12 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  viewAll: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.darkTeal },
  actionGrid: { flexDirection: 'row', gap: 10 },
  emptyInline: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textTertiary, marginTop: spacing.xs },
});
