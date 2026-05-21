import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { patientsApi } from '@/api/patients';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { familyMemberSchema } from '@/utils/validators';

type FormData = { name: string };

export default function FamilyScreen(): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({ queryKey: ['family'], queryFn: patientsApi.listFamily });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: { name: '' },
  });

  const add = useMutation({
    mutationFn: (data: FormData) => patientsApi.addFamily({ name: data.name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] });
      reset({ name: '' });
      setShowForm(false);
    },
    onError: (e) => Alert.alert(t('errors.unknown'), (e as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => patientsApi.deleteFamily(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('profile.family'),
          headerRight: () => (
            <Pressable onPress={() => setShowForm(true)} accessibilityRole="button" hitSlop={8} style={{ marginRight: 12 }}>
              <Plus size={22} color={colors.darkTeal} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, gap: 10 }}>
        {!list.data || list.data.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            body={t('profile.noFamily')}
            ctaLabel={t('profile.addFamilyMember')}
            onCta={() => setShowForm(true)}
          />
        ) : (
          list.data.map((m) => (
            <Card key={m.id}>
              <View style={styles.row}>
                <Avatar name={m.name} size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  {m.dob ? <Text style={styles.sub}>{m.dob}</Text> : null}
                </View>
                <Pressable
                  onPress={() =>
                    Alert.alert(t('common.delete'), m.name, [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('common.delete'), style: 'destructive', onPress: () => remove.mutate(m.id) },
                    ])
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${t('common.delete')} ${m.name}`}
                  hitSlop={8}
                >
                  <Trash2 size={18} color={colors.danger} />
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.addFamilyMember')}</Text>
            <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
              <Text style={styles.modalClose}>{t('common.close')}</Text>
            </Pressable>
          </View>
          <View style={{ padding: spacing.screen, gap: spacing.md }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input label={t('auth.name')} value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />
            <Button label={t('common.save')} loading={add.isPending} onPress={handleSubmit((d) => add.mutate(d))} />
          </View>
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
  modal: { flex: 1, backgroundColor: colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.screen, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  modalTitle: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textPrimary },
  modalClose: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.darkTeal },
});
