import { Tabs } from 'expo-router';
import { BookMarked, CalendarPlus, Home, Package, User } from 'lucide-react-native';
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
      <Tabs.Screen
        name="passbook"
        options={{
          title: t('tabs.passbook'),
          tabBarIcon: ({ color }) => <BookMarked size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: t('tabs.book'),
          tabBarIcon: ({ color }) => <CalendarPlus size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: t('tabs.packages'),
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
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
