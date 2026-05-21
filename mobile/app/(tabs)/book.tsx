import { useRouter } from 'expo-router';
import { CalendarPlus, FlaskConical, Package } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function BookScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();

  const tiles = [
    {
      key: 'consultant',
      icon: <CalendarPlus size={22} color={colors.darkTeal} />,
      bg: colors.mintTint,
      title: t('book.consultantTitle'),
      body: t('book.consultantBody'),
      go: () => router.push('/doctors' as never),
    },
    {
      key: 'lab',
      icon: <FlaskConical size={22} color={colors.emerald} />,
      bg: colors.greenTint,
      title: t('book.labTitle'),
      body: t('book.labBody'),
      go: () => router.push('/lab-tests'),
    },
    {
      key: 'package',
      icon: <Package size={22} color={colors.info} />,
      bg: colors.blueTint,
      title: t('book.packageTitle'),
      body: t('book.packageBody'),
      go: () => router.push('/(tabs)/packages'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{t('book.title')}</Text>
      <View style={styles.list}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.key}
            onPress={tile.go}
            accessibilityRole="button"
            accessibilityLabel={tile.title}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: tile.bg }]}>{tile.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{tile.title}</Text>
                <Text style={styles.cardBody}>{tile.body}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint, paddingHorizontal: spacing.screen },
  title: { fontFamily: fontFamily.medium, fontSize: 22, color: colors.textPrimary, paddingTop: spacing.xs, paddingBottom: spacing.md },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  cardBody: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
});
