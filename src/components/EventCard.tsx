import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { countryName, formatDate, sportLabel, type Language } from '../lib/i18n';
import { colors, radius, spacing } from '../lib/theme';
import type { SportEvent } from '../lib/types';
import { Icon, SPORT_ICONS } from './ui';

export function EventCard({
  event,
  lang,
  badge,
}: {
  event: SportEvent;
  lang: Language;
  /** Small status label in the corner, e.g. "Signed up". */
  badge?: string;
}) {
  return (
    <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
      <Pressable style={styles.card}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Icon name={SPORT_ICONS[event.sport]} size={44} color={colors.primary} />
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.sport}>{sportLabel(lang, event.sport, event.sportName)}</Text>
            {badge ? <Text style={styles.badge}>{badge}</Text> : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.meta}>
            <Icon name="calendar" size={15} color={colors.muted} />
            <Text style={styles.metaText}>{formatDate(lang, event.date)}</Text>
          </View>
          <View style={styles.meta}>
            <Icon name="map-marker-outline" size={15} color={colors.muted} />
            <Text style={styles.metaText}>
              {[event.city, countryName(lang, event.countryCode, event.country)].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: 130 },
  imageFallback: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sport: { color: colors.primaryDark, fontWeight: '700', fontSize: 13, textTransform: 'uppercase' },
  badge: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.muted, fontSize: 14 },
});
