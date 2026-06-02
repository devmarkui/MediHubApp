import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell, CalendarCheck, FileText, Stethoscope } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatInTimeZone } from 'date-fns-tz';

import { appApi } from '@/api/app';
import { appointmentsApi } from '@/api/appointments';
import { notificationsApi } from '@/api/notifications';
import { reportsApi } from '@/api/reports';
import { OpeningHoursBanner } from '@/components/home/OpeningHoursBanner';
import { QuickAction } from '@/components/home/QuickAction';
import { StatTile } from '@/components/home/StatTile';
import { UpcomingCard } from '@/components/home/UpcomingCard';
import { PassbookCard } from '@/components/passbook/PassbookCard';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { bmiCategory, initials } from '@/utils/format';

function greetingKey(): 'home.morning' | 'home.afternoon' | 'home.evening' {
  const hour = Number(formatInTimeZone(new Date(), 'Asia/Colombo', 'H'));
  if (hour < 12) return 'home.morning';
  if (hour < 17) return 'home.afternoon';
  return 'home.evening';
}

// Local fallback for the open/closed pill when app config can't be fetched.
function isClinicOpenNow(): boolean {
  const hour = Number(formatInTimeZone(new Date(), 'Asia/Colombo', 'H'));
  return hour >= 8 && hour < 21;
}

export default function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const patient = useAuthStore((s) => s.patient);

  const config = useQuery({ queryKey: ['app.config'], queryFn: appApi.config });
  const upcoming = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentsApi.list('upcoming'),
  });
  const reports = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });
  const unread = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list({ unread: true }),
  });

  const refreshing = config.isFetching && !config.isLoading;
  const onRefresh = (): void => {
    void config.refetch();
    void upcoming.refetch();
    void reports.refetch();
    void unread.refetch();
  };

  const reportsCount = reports.data?.length ?? 0;
  const unreadCount = unread.data?.length ?? 0;
  const bmi = patient?.bmi ?? null;
  const bmiCat = bmiCategory(bmi, colors);
  const hours = config.data?.opening_hours;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.darkTeal} />}
      >
        {/* Greeting */}
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

        {/* Stage 4 — opening hours banner. Skeleton only while loading; never stuck. */}
        {hours ? (
          <OpeningHoursBanner
            title={t('home.openHoursTitle')}
            hours={`${hours.open_label} – ${hours.close_label} · ${hours.days_label}`}
            isOpen={hours.is_open_now}
            openLabel={t('home.openNow')}
            closedLabel={t('home.closedNow')}
          />
        ) : config.isLoading ? (
          <View style={{ marginHorizontal: spacing.screen, marginBottom: spacing.lg }}>
            <Skeleton height={72} radius={18} />
          </View>
        ) : (
          // Config failed (e.g. offline) — fall back to a static banner so it never hangs.
          <OpeningHoursBanner
            title={t('home.openHoursTitle')}
            hours="8:00 AM – 9:00 PM · Open every day"
            isOpen={isClinicOpenNow()}
            openLabel={t('home.openNow')}
            closedLabel={t('home.closedNow')}
          />
        )}

        {/* Health passbook identity card */}
        <PassbookCard
          passbookNo={patient?.passbook_no ?? null}
          memberName={patient?.name ?? '—'}
          memberSince={patient?.member_since ?? null}
          verifiedLabel={`● ${t('common.verified')}`}
          passbookLabel={t('home.passbookLabel')}
          memberLabel={t('home.member')}
          sinceLabel={t('home.since')}
        />

        {/* Stage 2 — stats incl. BMI */}
        <View style={styles.stats}>
          <StatTile label={t('home.blood')} value={patient?.blood_group ?? '—'} valueColor={colors.danger} />
          <StatTile label={t('home.reports')} value={String(reportsCount)} valueColor={colors.darkTeal} />
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/profile/health')} accessibilityRole="button">
            <StatTile
              label={t('home.bmiTitle')}
              value={bmi ? String(bmi) : '—'}
              valueColor={bmiCat?.color ?? colors.emerald}
            />
          </Pressable>
        </View>

        {/* Quick actions — the 5-stage focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionGrid}>
            <QuickAction
              label={t('home.actionBook')}
              background={colors.mintTint}
              icon={<Stethoscope size={22} color={colors.darkTeal} />}
              onPress={() => router.push('/(tabs)/book')}
            />
            <QuickAction
              label={t('home.actionAppointments')}
              background={colors.greenTint}
              icon={<CalendarCheck size={22} color={colors.emerald} />}
              onPress={() => router.push('/(tabs)/passbook')}
            />
            <QuickAction
              label={t('home.actionReports')}
              background={colors.amberTint}
              icon={<FileText size={22} color={colors.warning} />}
              onPress={() => router.push('/(tabs)/packages')}
            />
          </View>
        </View>

        {/* Upcoming appointment */}
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
      </ScrollView>
    </SafeAreaView>
  );
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
  actionGrid: { flexDirection: 'row', gap: 10 },
  emptyInline: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textTertiary, marginTop: spacing.xs },
});
