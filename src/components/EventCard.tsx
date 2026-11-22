import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { countdownLabel, countryName, daysUntil, formatDate, sportLabel, type Language } from '../lib/i18n';
import { colors, radius, spacing, type } from '../lib/theme';
import type { SportEvent } from '../lib/types';
import { PressableScale, PulseDot } from './motion';
import { DateBlock, Icon, SPORT_ICONS } from './ui';

function place(lang: Language, e: SportEvent) {
  return [e.city, countryName(lang, e.countryCode, e.country)].filter(Boolean).join(', ');
}

function open(event: SportEvent) {
  router.push({ pathname: '/event/[id]', params: { id: event.id } });
}

function a11yLabel(lang: Language, e: SportEvent, badge?: string) {
  return [e.title, sportLabel(lang, e.sport, e.sportName), formatDate(lang, e.date), place(lang, e), badge]
    .filter(Boolean)
    .join(', ');
}

/** The event photo, or a night-sky placeholder with the sport icon when there is none. */
export function EventArt({
  event,
  style,
  iconSize = 64,
}: {
  event: SportEvent;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}) {
  if (event.imageUrl) {
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </View>
    );
  }
  return (
    <LinearGradient
      colors={['#1D4FB0', '#102A5C', colors.card]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[style, styles.artFallback]}
    >
      <View style={styles.artIcon}>
        <Icon name={SPORT_ICONS[event.sport]} size={iconSize * 2.4} color="rgba(255,255,255,0.08)" />
      </View>
      <Icon name={SPORT_ICONS[event.sport]} size={iconSize} color={colors.electric} />
    </LinearGradient>
  );
}

/** "In 12 days" pill. Pulses when the event is this week. */
export function Countdown({ lang, iso, onImage }: { lang: Language; iso: string; onImage?: boolean }) {
  const soon = daysUntil(iso) <= 7;
  return (
    <View style={[styles.countdown, onImage && styles.countdownOnImage, soon && styles.countdownSoon]}>
      {soon ? <PulseDot color={colors.onPrimary} size={6} /> : null}
      <Text style={[styles.countdownText, soon && { color: colors.onPrimary }]}>{countdownLabel(lang, iso)}</Text>
    </View>
  );
}

/** Ticket-style list row: date stub, title, place, price. Used in the feed list and My Race. */
export function EventCard({ event, lang, badge }: { event: SportEvent; lang: Language; badge?: string }) {
  return (
    <PressableScale
      onPress={() => open(event)}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel(lang, event, badge)}
      style={styles.row}
    >
      <DateBlock lang={lang} iso={event.date} />
      <View style={styles.rowBody}>
        <Text style={styles.rowSport}>{sportLabel(lang, event.sport, event.sportName)}</Text>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.meta}>
          <Icon name="map-marker-outline" size={14} color={colors.muted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {place(lang, event)}
          </Text>
        </View>
        {badge || event.price ? (
          <View style={styles.rowFoot}>
            {event.price ? <Text style={styles.price}>{event.price}</Text> : <View />}
            {badge ? (
              <View style={styles.badge}>
                <Icon name="check" size={12} color={colors.success} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <Icon name="chevron-right" size={22} color={colors.muted} />
    </PressableScale>
  );
}

/** Big poster card for the featured carousel at the top of the feed. */
export function FeaturedCard({ event, lang, width }: { event: SportEvent; lang: Language; width: number }) {
  return (
    <PressableScale
      onPress={() => open(event)}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel(lang, event)}
      scaleTo={0.98}
      style={[styles.featured, { width }]}
    >
      <EventArt event={event} style={StyleSheet.absoluteFill} iconSize={72} />
      <LinearGradient
        colors={['rgba(7,20,48,0)', 'rgba(7,20,48,0.55)', 'rgba(7,20,48,0.96)']}
        locations={[0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredTop}>
        <View style={styles.sportTag}>
          <Icon name={SPORT_ICONS[event.sport]} size={14} color={colors.ink} />
          <Text style={styles.sportTagText}>{sportLabel(lang, event.sport, event.sportName)}</Text>
        </View>
        <Countdown lang={lang} iso={event.date} onImage />
      </View>
      <View style={styles.featuredBottom}>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.featuredMetaRow}>
          <View style={styles.meta}>
            <Icon name="calendar-blank-outline" size={15} color={colors.ink} />
            <Text style={styles.featuredMeta}>{formatDate(lang, event.date)}</Text>
          </View>
          <View style={styles.meta}>
            <Icon name="map-marker-outline" size={15} color={colors.ink} />
            <Text style={styles.featuredMeta} numberOfLines={1}>
              {place(lang, event)}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

/** Compact card for the horizontal "coming up soon" rail. */
export function RailCard({ event, lang }: { event: SportEvent; lang: Language }) {
  return (
    <PressableScale
      onPress={() => open(event)}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel(lang, event)}
      style={styles.rail}
    >
      <EventArt event={event} style={styles.railArt} iconSize={36} />
      <View style={styles.railBody}>
        <Countdown lang={lang} iso={event.date} />
        <Text style={styles.railTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {event.city || place(lang, event)}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  artFallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artIcon: { position: 'absolute', right: -30, bottom: -40, transform: [{ rotate: '-12deg' }] },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowBody: { flex: 1, gap: 3 },
  rowSport: { ...type.caption, color: colors.electric },
  rowTitle: { ...type.headline, color: colors.ink },
  rowFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...type.footnote, color: colors.muted, flexShrink: 1 },
  price: { ...type.footnote, fontWeight: '700', color: colors.ink },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { ...type.caption, color: colors.success },

  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.electricSoft,
  },
  countdownOnImage: { backgroundColor: 'rgba(7,20,48,0.7)' },
  countdownSoon: { backgroundColor: colors.primary },
  countdownText: { ...type.caption, color: colors.ink, fontVariant: ['tabular-nums'] },

  featured: {
    height: 260,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    justifyContent: 'space-between',
  },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(7,20,48,0.7)',
  },
  sportTagText: { ...type.caption, color: colors.ink },
  featuredBottom: { padding: spacing.lg, gap: 4 },
  featuredTitle: { ...type.title1, color: '#FFFFFF' },
  featuredMetaRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 2 },
  featuredMeta: { ...type.subhead, color: colors.ink, opacity: 0.9, flexShrink: 1 },

  rail: {
    width: 200,
    marginRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  railArt: { height: 104 },
  railBody: { padding: spacing.md, gap: 6 },
  railTitle: { ...type.headline, fontSize: 16, color: colors.ink, minHeight: 42 },
});
