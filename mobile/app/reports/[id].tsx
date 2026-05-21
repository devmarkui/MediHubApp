import { useMutation, useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reportsApi } from '@/api/reports';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { formatDate } from '@/utils/format';

export default function ReportDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.show(Number(id)),
    enabled: typeof id === 'string',
  });

  const open = useMutation({
    mutationFn: () => reportsApi.downloadUrl(Number(id)),
    onSuccess: async ({ url }) => {
      await WebBrowser.openBrowserAsync(url);
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      Alert.alert(t('errors.unknown'), msg);
    },
  });

  if (query.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: spacing.screen }}>
          <Skeleton height={120} />
        </View>
      </SafeAreaView>
    );
  }
  if (query.isError || !query.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState onRetry={() => query.refetch()} />
      </SafeAreaView>
    );
  }

  const r = query.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('reports.title') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen }}>
        <Card>
          <Text style={styles.title}>{r.title}</Text>
          <Text style={styles.subtitle}>{t('reports.released', { date: formatDate(r.released_at) })}</Text>
          <Text style={styles.subtitle}>{`${r.file_size_kb} KB`}</Text>
        </Card>
        <View style={{ marginTop: spacing.md }}>
          <Button label={t('reports.download')} loading={open.isPending} onPress={() => open.mutate()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  title: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  subtitle: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
});
