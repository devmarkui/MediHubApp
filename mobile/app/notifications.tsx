import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { notificationsApi } from '@/api/notifications';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontFamily, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';

export default function NotificationsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['notifications', 'all'], queryFn: () => notificationsApi.list() });
  const markAll = useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const markOne = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('notifications.title'),
          headerRight: () =>
            query.data && query.data.some((n) => !n.is_read) ? (
              <Pressable onPress={() => markAll.mutate()} hitSlop={8} style={{ marginRight: 12 }}>
                <Text style={styles.markAll}>{t('notifications.markAllRead')}</Text>
              </Pressable>
            ) : null,
        }}
      />
      {query.isLoading ? (
        <View style={{ padding: spacing.screen, gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={80} />
          ))}
        </View>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : !query.data || query.data.length === 0 ? (
        <EmptyState title={t('notifications.empty')} />
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ padding: spacing.screen, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => (item.is_read ? undefined : markOne.mutate(item.id))}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <Card style={!item.is_read ? styles.unread : undefined}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.timestamp}>{formatDateTime(item.sent_at)}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  unread: { borderColor: colors.darkTeal },
  title: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  body: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  timestamp: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary },
  markAll: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.darkTeal },
});
