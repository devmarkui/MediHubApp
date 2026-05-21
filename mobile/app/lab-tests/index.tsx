import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { labTestsApi } from '@/api/labTests';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCartStore } from '@/stores/cartStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function LabTestsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [category, setCategory] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ['lab-tests', category],
    queryFn: () => labTestsApi.list(category ?? undefined),
  });

  const cart = useCartStore();

  const categories = useMemo(() => {
    if (!list.data) return [] as string[];
    return Array.from(new Set(list.data.map((t) => t.category)));
  }, [list.data]);

  const filtered = useMemo(() => {
    if (!list.data) return [];
    return category ? list.data.filter((t) => t.category === category) : list.data;
  }, [list.data, category]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('lab.title'),
          headerRight: () =>
            cart.items.length > 0 ? (
              <Pressable
                onPress={() => router.push('/lab-tests/cart')}
                accessibilityRole="button"
                accessibilityLabel={t('lab.cart')}
                style={styles.cartButton}
              >
                <ShoppingCart size={20} color={colors.darkTeal} />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
                </View>
              </Pressable>
            ) : null,
        }}
      />

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Pressable
            onPress={() => setCategory(null)}
            style={[styles.filter, category === null && styles.filterActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: category === null }}
          >
            <Text style={[styles.filterText, category === null && styles.filterTextActive]}>All</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.filter, category === c && styles.filterActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: category === c }}
            >
              <Text style={[styles.filterText, category === c && styles.filterTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {list.isLoading ? (
        <View style={{ padding: spacing.screen, gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={64} />
          ))}
        </View>
      ) : list.isError ? (
        <ErrorState onRetry={() => list.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.empty')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ padding: spacing.screen, gap: 10, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const inCart = cart.has(item.id);
            return (
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                  </View>
                  <Text style={styles.price}>{formatMoney(item.price)}</Text>
                </View>
                <View style={{ marginTop: 8 }}>
                  <Button
                    label={inCart ? t('lab.remove') : t('lab.addToCart')}
                    variant={inCart ? 'ghost' : 'secondary'}
                    onPress={() => (inCart ? cart.remove(item.id) : cart.add(item))}
                  />
                </View>
              </Card>
            );
          }}
        />
      )}

      {cart.items.length > 0 ? (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>
              {cart.items.length} {cart.items.length === 1 ? 'test' : 'tests'}
            </Text>
            <Text style={styles.footerTotal}>{formatMoney(cart.total())}</Text>
          </View>
          <Button label={t('lab.checkout')} onPress={() => router.push('/lab-tests/cart')} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  filters: { paddingHorizontal: spacing.screen, paddingVertical: spacing.sm, gap: 8 },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterActive: { backgroundColor: colors.darkTeal, borderColor: colors.darkTeal },
  filterText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  filterTextActive: { color: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  category: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary },
  price: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.darkTeal },
  cartButton: { marginRight: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBadge: { backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: colors.surface, fontFamily: fontFamily.medium, fontSize: 11 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.screen,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 12,
  },
  footerLabel: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  footerTotal: { fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
});
