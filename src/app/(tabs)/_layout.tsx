import Tabs from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '../../components/ui';
import { useApp } from '../../lib/store';
import { colors } from '../../lib/theme';

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => <Icon name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  const { t } = useApp();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tab.feed'), tabBarIcon: tabIcon('compass-outline') }} />
      <Tabs.Screen name="my-race" options={{ title: t('tab.myRace'), tabBarIcon: tabIcon('flag-checkered') }} />
      <Tabs.Screen name="results" options={{ title: t('tab.competitions'), tabBarIcon: tabIcon('podium') }} />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tab.profile'), tabBarIcon: tabIcon('account-circle-outline') }}
      />
    </Tabs>
  );
}
