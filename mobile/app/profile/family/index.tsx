import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Plus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FamilyMemberForm, FamilyFormValues } from '@/components/family/FamilyMemberForm';
import { colors, fontFamily, spacing } from '@/theme';
import type { Patient } from '@/types/models';
import { formatDate } from '@/utils/format';

export default function FamilyListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const list = useQuery({ queryKey: ['family'], queryFn: patientsApi.listFamily });

  const add = useMutation({
    mutationFn: (data: FamilyFormValues) =>
      patientsApi.addFamily({
        name: data.name,
        dob: data.dob && data.dob.length > 0 ? data.dob : undefined,
        gender: data.gender,
        blood_group: data.blood_group,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] });
      setShowAdd(false);
    },
    onError: (e) => Alert.alert(t('errors.unknown'), (e as Error).message),
  });

  const subtitle = (m: Patient): string =>
    [m.gender, m.blood_group, m.dob ? formatDate(m.dob) : null].filter(Boolean).join('  ·  ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('profile.family'),
          headerRight: () => (
            <Pressable
              onPress={() => setShowAdd(true)}
              accessibilityRole="button"
              accessibilityLabel={t('profile.addFamilyMember')}
              hitSlop={8}
              style={{ marginRight: 4 }}
            >
              <Plus size={22} color={colors.darkTeal} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 10 }}>
        {list.isLoading ? (
          <>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </>
        ) : !list.data || list.data.length === 0 ? (
          <EmptyState
            icon={<Users size={40} color={colors.darkTeal} />}
            title={t('family.emptyTitle')}
            body={t('family.emptyBody')}
            ctaLabel={t('profile.addFamilyMember')}
            onCta={() => setShowAdd(true)}
          />
        ) : (
          list.data.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push(`/profile/family/${m.id}`)}
              accessibilityRole="button"
              accessibilityLabel={m.name}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <Avatar name={m.name} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{m.name}</Text>
                    {subtitle(m) ? (
                      <Text style={styles.sub}>{subtitle(m)}</Text>
                    ) : (
                      <Text style={styles.subMuted}>{t('family.tapToView')}</Text>
                    )}
                  </View>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAdd}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdd(false)}
      >
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.addFamilyMember')}</Text>
            <Pressable onPress={() => setShowAdd(false)} hitSlop={8}>
              <Text style={styles.modalClose}>{t('common.close')}</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ padding: spacing.screen }}
            keyboardShouldPersistTaps="handled"
          >
            <FamilyMemberForm onSubmit={(d) => add.mutate(d)} submitting={add.isPending} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceTint },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textPrimary },
  sub: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary },
  subMuted: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textTertiary },
  modal: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.screen,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  modalClose: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.darkTeal },
});
