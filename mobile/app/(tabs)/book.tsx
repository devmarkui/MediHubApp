// Stage 5 — Specialist Doctors list. Tapping a doctor opens the booking screen,
// which saves an appointment request and notifies MediHub on WhatsApp.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { doctorsApi } from '@/api/doctors';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function DoctorsTab(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const list = useQuery({ queryKey: ['doctors'], queryFn: doctorsApi.list });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('doctors.title')}</Text>
        <Text style={styles.subtitle}>{t('doctors.subtitle')}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.screen, paddingTop: 0, gap: 12 }}>
        {list.isLoading ? (
          <>
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </>
        ) : list.isError ? (
          <ErrorState onRetry={() => list.refetch()} />
        ) : !list.data || list.data.length === 0 ? (
          <EmptyState title={t('common.empty')} />
        ) : (
          list.data.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/doctor/[slug]', params: { slug: d.slug } })}
              accessibilityRole="button"
              accessibilityLabel={d.name}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <Avatar name={d.name} uri={d.avatar_url} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{d.name}</Text>
                    <Text style={styles.spec}>{d.specialization}</Text>
                    <Text style={styles.fee}>{`${t('doctors.fee')}: ${formatMoney(d.consultation_fee)}`}</Text>
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
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.xs, paddingBottom: spacing.md },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary },
  subtitle: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textPrimary },
  spec: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  fee: { marginTop: 4, fontFamily: fontFamily.medium, fontSize: 12, color: colors.darkTeal },
});
