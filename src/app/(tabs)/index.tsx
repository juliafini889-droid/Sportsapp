import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventCard, FeaturedCard, RailCard } from '../../components/EventCard';
import { Enter, haptic, nativeDriver, PressableScale } from '../../components/motion';
import { Button, Chip, EmptyState, Icon, ScreenTitle, SectionHeader, SPORT_ICONS } from '../../components/ui';
import { isUpcoming, sortByDate } from '../../lib/events';
import { countryName, daysUntil, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, HIT, radius, spacing, type } from '../../lib/theme';
import { SPORTS, type Sport, type SportEvent } from '../../lib/types';

const GUTTER = spacing.lg;
const CARD_GAP = spacing.md;

export default function FeedScreen() {
  const { events, language, t, registrationFor, eventsError, refresh } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const upcoming = useMemo(() => sortByDate(events.filter((e) => isUpcoming(e.date))), [events]);

  // Only offer the countries that actually have events.
  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of upcoming)
      if (e.countryCode) map.set(e.countryCode, countryName(language, e.countryCode, e.country));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [upcoming, language]);

  const sportsWithEvents = SPORTS.filter((s) => upcoming.some((e) => e.sport === s));

  const filtering = !!query.trim() || !!sport || !!country;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return upcoming.filter(
      (e) =>
        (!sport || e.sport === sport) &&
        (!country || e.countryCode === country) &&
        (!q || [e.title, e.city, e.country, e.organizer].some((v) => v.toLowerCase().includes(q))),
    );
  }, [upcoming, query, sport, country]);

  // Featured: events with a photo first, then the next ones by date.
  const featured = useMemo(
    () => [...upcoming.filter((e) => e.imageUrl), ...upcoming.filter((e) => !e.imageUrl)].slice(0, 5),
    [upcoming],
  );
  const soon = useMemo(() => {
    const ids = new Set(featured.map((e) => e.id));
    const rest = upcoming.filter((e) => !ids.has(e.id));
    const thisMonth = rest.filter((e) => daysUntil(e.date) <= 30);
    return (thisMonth.length >= 3 ? thisMonth : rest).slice(0, 8);
  }, [upcoming, featured]);

  const clearFilters = () => {
    setQuery('');
    setSport(null);
    setCountry(null);
  };

  const cardWidth = Math.min(width - GUTTER * 2, 560);

  const header = (
    <View>
      <Enter index={0}>
        <ScreenTitle
          title={t('tab.feed')}
          subtitle={t('feed.subtitle')}
          right={
            <PressableScale
              onPress={() => router.push('/event/new')}
              accessibilityRole="button"
              accessibilityLabel={t('feed.addEvent')}
              style={styles.roundButton}
            >
              <Icon name="plus" size={24} color={colors.onPrimary} />
            </PressableScale>
          }
        />
        <View style={styles.search}>
          <Icon name="magnify" size={20} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('feed.search')}
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            keyboardAppearance="dark"
            accessibilityLabel={t('feed.search')}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" hitSlop={12}>
              <Icon name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </Enter>

      <Enter index={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportRail}>
          <SportTile label={t('feed.allSports')} icon="lightning-bolt" active={!sport} onPress={() => setSport(null)} />
          {sportsWithEvents.map((s) => (
            <SportTile
              key={s}
              label={sportLabel(language, s)}
              icon={SPORT_ICONS[s]}
              active={sport === s}
              onPress={() => setSport(sport === s ? null : s)}
            />
          ))}
        </ScrollView>
      </Enter>

      {eventsError ? (
        <View style={styles.warning}>
          <Icon name="wifi-off" size={18} color={colors.danger} />
          <Text style={styles.warningText}>{t('feed.loadError')}</Text>
        </View>
      ) : null}

      {!filtering && featured.length > 0 ? (
        <Enter index={2}>
          <SectionHeader title={t('feed.featured')} />
          <Carousel events={featured} cardWidth={cardWidth} />
        </Enter>
      ) : null}

      {!filtering && soon.length > 0 ? (
        <Enter index={3}>
          <SectionHeader title={t('feed.soon')} />
          <FlatList
            horizontal
            data={soon}
            keyExtractor={(e) => e.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: GUTTER }}
            renderItem={({ item }) => <RailCard event={item} lang={language} />}
          />
        </Enter>
      ) : null}

      <SectionHeader title={t('feed.all')} detail={t('feed.results', { count: filtered.length })} />
      {countries.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t('feed.allCountries')} active={!country} onPress={() => setCountry(null)} />
          {countries.map(([code, name]) => (
            <Chip key={code} label={name} active={country === code} onPress={() => setCountry(code)} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  const footer = (
    <View style={styles.organise}>
      <Icon name="flag-checkered" size={28} color={colors.primary} />
      <Text style={styles.organiseTitle}>{t('feed.organiseTitle')}</Text>
      <Text style={styles.organiseText}>{t('feed.organiseText')}</Text>
      <Button label={t('feed.addEvent')} icon="plus" variant="secondary" onPress={() => router.push('/event/new')} />
    </View>
  );

  // Compact title bar that fades in once the large title scrolls away (like iOS).
  const barOpacity = scrollY.interpolate({ inputRange: [40, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Animated.FlatList
        data={filtered}
        keyExtractor={(e: SportEvent) => e.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <EmptyState
            icon="magnify"
            text={t('feed.empty')}
            action={filtering ? <Button label={t('feed.clearFilters')} variant="ghost" onPress={clearFilters} /> : null}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: nativeDriver,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            colors={[colors.primary]}
            onRefresh={() => {
              setRefreshing(true);
              haptic('light');
              refresh().finally(() => setRefreshing(false));
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item, index }: { item: SportEvent; index: number }) => {
          const reg = registrationFor(item.id);
          const badge = reg
            ? reg.status === 'registered'
              ? t('myRace.statusRegistered')
              : t('myRace.statusSaved')
            : undefined;
          const card = <EventCard event={item} lang={language} badge={badge} />;
          // Only the first screenful arrives with the staggered start; later rows just appear.
          return index < 6 ? <Enter index={filtering ? 0 : index + 4}>{card}</Enter> : card;
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.bar, { paddingTop: insets.top, height: insets.top + 44, opacity: barOpacity }]}
      >
        <Text style={styles.barTitle}>{t('tab.feed')}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function SportTile({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]['name'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      hapticKind="selection"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={styles.tile}
    >
      <View style={[styles.tileCircle, active && styles.tileCircleActive]}>
        <Icon name={icon} size={26} color={active ? colors.onPrimary : colors.ink} />
      </View>
      <Text style={[styles.tileLabel, active && { color: colors.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Paging poster carousel with a progress indicator that stretches as you swipe. */
function Carousel({ events, cardWidth }: { events: SportEvent[]; cardWidth: number }) {
  const { language } = useApp();
  const x = useRef(new Animated.Value(0)).current;
  const step = cardWidth + CARD_GAP;

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: CARD_GAP }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {events.map((e, i) => {
          const range = [(i - 1) * step, i * step, (i + 1) * step];
          return (
            <Animated.View
              key={e.id}
              style={{
                transform: [{ scale: x.interpolate({ inputRange: range, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' }) }],
                opacity: x.interpolate({ inputRange: range, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' }),
              }}
            >
              <FeaturedCard event={e} lang={language} width={cardWidth} />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      {events.length > 1 ? (
        <View style={styles.dots} accessible={false}>
          {events.map((e, i) => {
            const range = [(i - 1) * step, i * step, (i + 1) * step];
            return (
              <Animated.View
                key={e.id}
                style={[
                  styles.dot,
                  {
                    width: x.interpolate({ inputRange: range, outputRange: [6, 22, 6], extrapolate: 'clamp' }),
                    backgroundColor: x.interpolate({
                      inputRange: range,
                      outputRange: [colors.border, colors.primary, colors.border],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  roundButton: {
    width: HIT,
    height: HIT,
    borderRadius: HIT / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: GUTTER,
    paddingHorizontal: spacing.md,
    minHeight: HIT,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 17, color: colors.ink },
  sportRail: { paddingHorizontal: GUTTER, paddingTop: spacing.lg, gap: spacing.md },
  tile: { alignItems: 'center', width: 68, gap: 6 },
  tileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tileLabel: { ...type.caption, color: colors.muted },
  chips: { paddingHorizontal: GUTTER, paddingBottom: spacing.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  dot: { height: 6, borderRadius: 3 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: GUTTER,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  warningText: { ...type.footnote, color: colors.danger, flex: 1 },
  organise: {
    margin: GUTTER,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: spacing.sm,
  },
  organiseTitle: { ...type.title3, color: colors.ink, textAlign: 'center' },
  organiseText: { ...type.subhead, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7,20,48,0.94)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { ...type.headline, color: colors.ink },
});
