import { Tabs } from 'expo-router';
import { CalendarCheck, FileText, Home, Stethoscope, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { colors, fontFamily } from '@/theme';

export default function TabsLayout(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      {/* file: book.tsx — repurposed as the Specialist Doctors list (Stage 5) */}
      <Tabs.Screen
        name="book"
        options={{
          title: t('tabs.doctors'),
          tabBarIcon: ({ color }) => <Stethoscope size={22} color={color} />,
        }}
      />
      {/* file: passbook.tsx — repurposed as My Appointments (Stage 5) */}
      <Tabs.Screen
        name="passbook"
        options={{
          title: t('tabs.appointments'),
          tabBarIcon: ({ color }) => <CalendarCheck size={22} color={color} />,
        }}
      />
      {/* file: packages.tsx — repurposed as Medical Reports / EMR (Stage 3) */}
      <Tabs.Screen
        name="packages"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
