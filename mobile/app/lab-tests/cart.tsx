import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { labTestsApi } from '@/api/labTests';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/stores/cartStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { ApiError } from '@/types/api';
import { formatMoney } from '@/utils/format';

export default function CartScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useCartStore();
  const [collectionType, setCollectionType] = useState<'walk_in' | 'home'>('walk_in');

  const submit = useMutation({
    mutationFn: () =>
      labTestsApi.createOrder({
        test_ids: cart.items.map((t) => t.id),
        collection_type: collectionType,
      }),
    onSuccess: (order) => {
      cart.clear();
      void queryClient.invalidateQueries({ queryKey: ['passbook'] });
      router.replace({ pathname: '/lab-orders/[id]', params: { id: String(order.id) } });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : t('errors.unknown');
      Alert.alert(t('errors.unknown'), msg);
    },
  });

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: t('lab.cart') }} />
        <EmptyState title={t('common.empty')} body={t('lab.emptyCart')} ctaLabel={t('lab.title')} onCta={() => router.replace('/lab-tests')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('lab.cart') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 10 }}>
        {cart.items.map((test) => (
          <Card key={test.id}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{test.name}</Text>
                <Text style={styles.category}>{test.category}</Text>
              </View>
              <Text style={styles.price}>{formatMoney(test.price)}</Text>
              <Pressable onPress={() => cart.remove(test.id)} hitSlop={8} accessibilityLabel={t('lab.remove')}>
                <Text style={styles.remove}>{t('lab.remove')}</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        <View style={styles.collectionRow}>
          <Pressable
            onPress={() => setCollectionType('walk_in')}
            style={[styles.choice, collectionType === 'walk_in' && styles.choiceActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: collectionType === 'walk_in' }}
          >
            <Text style={[styles.choiceText, collectionType === 'walk_in' && styles.choiceTextActive]}>{t('lab.walkIn')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setCollectionType('home')}
            style={[styles.choice, collectionType === 'home' && styles.choiceActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: collectionType === 'home' }}
          >
            <Text style={[styles.choiceText, collectionType === 'home' && styles.choiceTextActive]}>{t('lab.home')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(cart.total())}</Text>
        </View>
        <Button label={t('lab.checkout')} loading={submit.isPending} onPress={() => submit.mutate()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  category: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary },
  price: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.darkTeal },
  remove: { marginLeft: 8, fontFamily: fontFamily.medium, fontSize: 12, color: colors.danger },
  collectionRow: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
  choice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  choiceActive: { backgroundColor: colors.mintTint, borderColor: colors.darkTeal },
  choiceText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textSecondary },
  choiceTextActive: { color: colors.darkTeal },
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
  totalLabel: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  totalValue: { fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
});
