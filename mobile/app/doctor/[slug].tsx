import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDays, format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appApi } from '@/api/app';
import { appointmentsApi } from '@/api/appointments';
import { doctorsApi } from '@/api/doctors';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { formatMoney, formatTime } from '@/utils/format';

// Stage 5 — fallback WhatsApp number if app config hasn't loaded yet.
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

export default function DoctorDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patient = useAuthStore((s) => s.patient);

  const doctor = useQuery({
    queryKey: ['doctor', slug],
    queryFn: () => doctorsApi.show(String(slug)),
    enabled: typeof slug === 'string',
  });

  const config = useQuery({ queryKey: ['app.config'], queryFn: appApi.config });

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(format(dates[0]!, 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const slots = useQuery({
    queryKey: ['doctor-slots', doctor.data?.id, selectedDate],
    queryFn: () => doctorsApi.slots(doctor.data!.id, selectedDate),
    enabled: Boolean(doctor.data?.id),
  });

  const book = useMutation({
    mutationFn: () =>
      appointmentsApi.create({
        doctor_id: doctor.data!.id,
        date: selectedDate,
        time: selectedTime!,
      }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['passbook'] });

      // Stage 5 — the request is now saved (admin sees it). Also notify MediHub
      // on WhatsApp with the details for confirmation.
      const number = config.data?.appointment_whatsapp ?? FALLBACK_WHATSAPP;
      const d = doctor.data;
      const message =
        `*New appointment request — MediHub*\n` +
        `Patient: ${patient?.name ?? '—'} (${patient?.phone ?? '—'})\n` +
        `Passbook: ${patient?.passbook_no ?? '—'}\n` +
        `Doctor: ${d?.name ?? '—'} (${d?.specialization ?? '—'})\n` +
        `Date: ${selectedDate}\n` +
        `Time: ${formatTime(selectedTime)}\n` +
        `Ref: ${created.appointment_no}`;
      openWhatsApp(number, message);

      router.replace({ pathname: '/appointments/[id]', params: { id: String(created.id) } });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('doctors.bookingFailed');
      Alert.alert(t('doctors.bookingFailed'), msg);
    },
  });

  if (doctor.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: spacing.screen }}>
          <Skeleton height={120} />
        </View>
      </SafeAreaView>
    );
  }
  if (doctor.isError || !doctor.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState onRetry={() => doctor.refetch()} />
      </SafeAreaView>
    );
  }

  const d = doctor.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: d.name }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, paddingBottom: spacing.xxl + 60 }}>
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={d.name} uri={d.avatar_url} size={64} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{d.name}</Text>
              <Text style={styles.specialization}>{d.specialization}</Text>
              <Text style={styles.qualifications}>{d.qualifications}</Text>
            </View>
          </View>
          {d.bio ? <Text style={styles.bio}>{d.bio}</Text> : null}
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('doctors.fee')}</Text>
            <Text style={styles.feeValue}>{formatMoney(d.consultation_fee)}</Text>
          </View>
        </Card>

        <Text style={styles.heading}>{t('doctors.pickDate')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {dates.map((dt) => {
            const value = format(dt, 'yyyy-MM-dd');
            const active = selectedDate === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  setSelectedDate(value);
                  setSelectedTime(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.dateChip, active && styles.dateChipActive]}
              >
                <Text style={[styles.dateMonth, active && styles.dateOnTeal]}>{format(dt, 'MMM').toUpperCase()}</Text>
                <Text style={[styles.dateDay, active && styles.dateOnTeal]}>{format(dt, 'd')}</Text>
                <Text style={[styles.dateWeek, active && styles.dateOnTeal]}>{format(dt, 'EEE')}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.heading}>{t('doctors.pickSlot')}</Text>
        {slots.isLoading ? (
          <Skeleton height={120} />
        ) : !slots.data || slots.data.slots.length === 0 ? (
          <Text style={styles.empty}>{t('doctors.noSlots')}</Text>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.data.slots.map((slot) => {
              const active = selectedTime === slot.time;
              return (
                <Pressable
                  key={slot.time}
                  disabled={!slot.available}
                  onPress={() => setSelectedTime(slot.time)}
                  accessibilityRole="button"
                  accessibilityLabel={formatTime(slot.time)}
                  accessibilityState={{ selected: active, disabled: !slot.available }}
                  style={[
                    styles.slot,
                    !slot.available && styles.slotDisabled,
                    active && styles.slotActive,
                  ]}
                >
                  <Text style={[
                    styles.slotText,
                    !slot.available && styles.slotTextDisabled,
                    active && styles.slotTextActive,
                  ]}>{formatTime(slot.time)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <Text style={styles.whatsappNote}>{t('doctors.whatsappNote')}</Text>
        <Button
          label={t('doctors.bookCta')}
          disabled={!selectedTime}
          loading={book.isPending}
          onPress={() => {
            if (selectedTime) book.mutate();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  profileCard: { padding: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  specialization: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  qualifications: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary },
  bio: { marginTop: spacing.sm, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textPrimary, lineHeight: 19 },
  feeRow: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  feeValue: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.darkTeal },
  heading: { marginTop: spacing.lg, marginBottom: spacing.sm, fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  dateChip: {
    width: 60,
    paddingVertical: 10,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dateChipActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  dateMonth: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
  dateDay: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
  dateWeek: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary },
  dateOnTeal: { color: colors.surface },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  slotActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  slotDisabled: { backgroundColor: colors.surfaceTint, opacity: 0.5 },
  slotText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textPrimary },
  slotTextActive: { color: colors.surface },
  slotTextDisabled: { color: colors.textTertiary },
  empty: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textTertiary, marginTop: spacing.xs },
  cta: { padding: spacing.screen, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  whatsappNote: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary, marginBottom: spacing.sm, textAlign: 'center' },
});
