import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ExternalLink, MessageCircle, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appApi } from '@/api/app';
import { Card } from '@/components/ui/Card';
import { colors, fontFamily, radius, spacing } from '@/theme';

const APP_VERSION = '1.0.0';

export default function AboutScreen(): React.ReactElement {
  const { t } = useTranslation();
  const config = useQuery({ queryKey: ['app.config'], queryFn: appApi.config });

  const open = async (url: string): Promise<void> => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('errors.unknown'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.about') }} />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: spacing.md }}>
        <Card>
          <Text style={styles.h1}>{config.data?.clinic_info.name ?? 'MediHub'}</Text>
          <Text style={styles.body}>{config.data?.clinic_info.address}</Text>
          <Text style={styles.body}>{config.data?.clinic_info.hours}</Text>
        </Card>

        {config.data ? (
          <>
            <Pressable
              onPress={() => open(`tel:${config.data!.support_phone}`)}
              accessibilityRole="button"
              accessibilityLabel={config.data.support_phone}
            >
              <Card>
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Phone size={20} color={colors.darkTeal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{t('profile.support')}</Text>
                    <Text style={styles.rowSub}>{config.data.support_phone}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => open(`https://wa.me/${config.data!.support_whatsapp.replace(/\D/g, '')}`)}
              accessibilityRole="button"
              accessibilityLabel="WhatsApp"
            >
              <Card>
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: colors.greenTint }]}>
                    <MessageCircle size={20} color={colors.emerald} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>WhatsApp</Text>
                    <Text style={styles.rowSub}>{config.data.support_whatsapp}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            <Pressable onPress={() => open(config.data!.terms_url)} accessibilityRole="link" accessibilityLabel="Terms">
              <Card>
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: colors.blueTint }]}>
                    <ExternalLink size={20} color={colors.info} />
                  </View>
                  <Text style={[styles.rowTitle, { flex: 1 }]}>Terms of Service</Text>
                </View>
              </Card>
            </Pressable>

            <Pressable onPress={() => open(config.data!.privacy_url)} accessibilityRole="link" accessibilityLabel="Privacy">
              <Card>
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: colors.blueTint }]}>
                    <ExternalLink size={20} color={colors.info} />
                  </View>
                  <Text style={[styles.rowTitle, { flex: 1 }]}>Privacy Policy</Text>
                </View>
              </Card>
            </Pressable>
          </>
        ) : null}

        <Text style={styles.version}>{t('profile.version', { version: APP_VERSION })}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  h1: { fontFamily: fontFamily.medium, fontSize: 17, color: colors.textPrimary },
  body: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: radius.button, backgroundColor: colors.mintTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  rowSub: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  version: { textAlign: 'center', fontFamily: fontFamily.regular, fontSize: 11, color: colors.textTertiary, marginTop: spacing.lg },
});
