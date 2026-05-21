import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  UserCircle,
  Users,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/auth';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { passbookDisplay } from '@/utils/format';

type ItemKey = 'edit' | 'family' | 'language' | 'notifications' | 'support' | 'about' | 'signOut';

export default function ProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const patient = useAuthStore((s) => s.patient);
  const signOut = useAuthStore((s) => s.signOut);

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await signOut();
      router.replace('/(auth)/phone');
    },
  });

  const items: Array<{ key: ItemKey; icon: React.ReactNode; label: string; onPress: () => void; danger?: boolean }> = [
    { key: 'edit', icon: <UserCircle size={20} color={colors.darkTeal} />, label: t('profile.editProfile'), onPress: () => router.push('/profile/edit') },
    { key: 'family', icon: <Users size={20} color={colors.darkTeal} />, label: t('profile.family'), onPress: () => router.push('/profile/family') },
    { key: 'language', icon: <Globe size={20} color={colors.darkTeal} />, label: t('profile.language'), onPress: () => router.push('/profile/language') },
    { key: 'notifications', icon: <Bell size={20} color={colors.darkTeal} />, label: t('profile.notifications'), onPress: () => router.push('/notifications' as never) },
    { key: 'support', icon: <HelpCircle size={20} color={colors.darkTeal} />, label: t('profile.support'), onPress: () => router.push('/profile/about') },
    { key: 'about', icon: <Info size={20} color={colors.darkTeal} />, label: t('profile.about'), onPress: () => router.push('/profile/about') },
    {
      key: 'signOut',
      icon: <LogOut size={20} color={colors.danger} />,
      label: t('profile.signOut'),
      onPress: () => {
        Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('profile.signOut'), style: 'destructive', onPress: () => logoutMutation.mutate() },
        ]);
      },
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.heroWrap}>
          <Avatar name={patient?.name ?? ''} size={64} />
          <Text style={styles.name}>{patient?.name ?? ''}</Text>
          <Text style={styles.passbook}>{passbookDisplay(patient?.passbook_no)}</Text>
        </View>

        <View style={styles.menu}>
          {items.map((it) => (
            <Pressable
              key={it.key}
              onPress={it.onPress}
              accessibilityRole="button"
              accessibilityLabel={it.label}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.itemIcon, it.danger ? { backgroundColor: '#FEE2E2' } : null]}>{it.icon}</View>
              <Text style={[styles.itemLabel, it.danger ? { color: colors.danger } : null]}>{it.label}</Text>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  heroWrap: { alignItems: 'center', padding: spacing.lg, gap: 8 },
  name: { fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary, marginTop: spacing.sm },
  passbook: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, letterSpacing: 3 },
  menu: { paddingHorizontal: spacing.screen, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 12,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.mintTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
});
