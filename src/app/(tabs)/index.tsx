import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { Button, Chip, EmptyState, Icon, ScreenTitle } from '../../components/ui';
import { isUpcoming } from '../../lib/events';
import { countryName, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import { SPORTS, type Sport } from '../../lib/types';

export default function FeedScreen() {
  const { events, language, t, registrationFor, eventsError, refresh } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const upcoming = useMemo(() => events.filter((e) => isUpcoming(e.date)), [events]);

  // Only offer the countries that actually have events.
  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of upcoming)
      if (e.countryCode) map.set(e.countryCode, countryName(language, e.countryCode, e.country));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [upcoming, language]);

  const sportsWithEvents = SPORTS.filter((s) => upcoming.some((e) => e.sport === s));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return upcoming.filter(
      (e) =>
        (!sport || e.sport === sport) &&
        (!country || e.countryCode === country) &&
        (!q || [e.title, e.city, e.country, e.organizer].some((v) => v.toLowerCase().includes(q))),
    );
  }, [upcoming, query, sport, country]);

  const header = (
    <View>
      <ScreenTitle title={t('feed.title')} subtitle={t('feed.subtitle')} />
      <View style={styles.search}>
        <Icon name="magnify" color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('feed.search')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={t('feed.allSports')} active={!sport} onPress={() => setSport(null)} />
        {sportsWithEvents.map((s) => (
          <Chip key={s} label={sportLabel(language, s)} active={sport === s} onPress={() => setSport(s)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={t('feed.allCountries')} active={!country} onPress={() => setCountry(null)} />
        {countries.map(([code, name]) => (
          <Chip key={code} label={name} active={country === code} onPress={() => setCountry(code)} />
        ))}
      </ScrollView>
      {eventsError ? <Text style={styles.warning}>{t('feed.loadError')}</Text> : null}
      <View style={styles.addWrap}>
        <Button label={t('feed.addEvent')} icon="plus" variant="secondary" onPress={() => router.push('/event/new')} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState icon="magnify" text={t('feed.empty')} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            onRefresh={() => {
              setRefreshing(true);
              refresh().finally(() => setRefreshing(false));
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const reg = registrationFor(item.id);
          const badge = reg
            ? reg.status === 'registered'
              ? t('myRace.statusRegistered')
              : t('myRace.statusSaved')
            : undefined;
          return <EventCard event={item} lang={language} badge={badge} />;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.ink },
  chips: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  warning: { color: colors.danger, marginHorizontal: spacing.lg, marginTop: spacing.md },
  addWrap: { marginHorizontal: spacing.lg, marginVertical: spacing.lg },
});
