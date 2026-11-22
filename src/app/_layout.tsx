import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from '../lib/store';
import { colors } from '../lib/theme';

function RootStack() {
  const { t } = useApp();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ title: '' }} />
      <Stack.Screen name="event/new" options={{ title: t('newEvent.title'), presentation: 'modal' }} />
      <Stack.Screen name="competition/edit" options={{ title: t('comp.edit'), presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppProvider>
  );
}
