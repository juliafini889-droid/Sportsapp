import Tabs from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, type ColorValue } from 'react-native';

import { haptic } from '../../components/motion';
import { Icon, type IconName } from '../../components/ui';
import { useApp } from '../../lib/store';
import { colors } from '../../lib/theme';

/** Outline icon when idle, filled icon when selected (Apple tab bar convention). */
function tabIcon(idle: IconName, selected: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon name={focused ? selected : idle} color={color} size={26} />
  );
}

export default function TabsLayout() {
  const { t } = useApp();
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic('selection') }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarBackground: () => <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />,
        tabBarStyle: {
          backgroundColor: 'rgba(7,20,48,0.8)',
          borderTopColor: colors.separator,
          ...(Platform.OS === 'web' ? { height: 64, paddingBottom: 8 } : null),
        },
        sceneStyle: { backgroundColor: colors.background },
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tab.feed'), tabBarIcon: tabIcon('compass-outline', 'compass') }} />
      <Tabs.Screen
        name="my-race"
        options={{ title: t('tab.myRace'), tabBarIcon: tabIcon('ticket-confirmation-outline', 'ticket-confirmation') }}
      />
      <Tabs.Screen name="results" options={{ title: t('tab.competitions'), tabBarIcon: tabIcon('podium', 'podium-gold') }} />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tab.profile'), tabBarIcon: tabIcon('account-circle-outline', 'account-circle') }}
      />
    </Tabs>
  );
}
