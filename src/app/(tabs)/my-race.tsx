import { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { EmptyState, Icon, ScreenTitle } from '../../components/ui';
import { isUpcoming, sortByDate } from '../../lib/events';
import { useApp } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';
import type { Registration } from '../../lib/types';

export default function MyRaceScreen() {
  const { registrations, language, t, removeRegistration } = useApp();

  const sections = useMemo(() => {
    const withDate = registrations.map((r) => ({ ...r, date: r.event.date }));
    const upcoming = sortByDate(withDate.filter((r) => isUpcoming(r.date)));
    const past = sortByDate(withDate.filter((r) => !isUpcoming(r.date))).reverse();
    return [
      { title: t('myRace.upcoming'), data: upcoming },
      { title: t('myRace.past'), data: past },
    ].filter((s) => s.data.length > 0);
  }, [registrations, t]);

  const badge = (r: Registration) =>
    r.status === 'registered' ? t('myRace.statusRegistered') : t('myRace.statusSaved');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={<ScreenTitle title={t('myRace.title')} subtitle={t('myRace.subtitle')} />}
        ListEmptyComponent={<EmptyState icon="flag-checkered" text={t('myRace.empty')} />}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View>
            <EventCard event={item.event} lang={language} badge={badge(item)} />
            <Pressable
              onPress={() => removeRegistration(item.id)}
              accessibilityRole="button"
              style={styles.remove}
            >
              <Icon name="trash-can-outline" size={16} color={colors.muted} />
              <Text style={styles.removeText}>{t('myRace.cancel')}</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  section: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginRight: spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  removeText: { color: colors.muted, fontSize: 13 },
});
