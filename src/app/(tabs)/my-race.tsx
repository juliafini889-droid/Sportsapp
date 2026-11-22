import { useMemo } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '../../components/AuthForm';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { EventCard } from '../../components/EventCard';
import { Enter, PressableScale, PulseDot } from '../../components/motion';
import { Button, EmptyState, Icon, ScreenTitle } from '../../components/ui';
import { isUpcoming, sortByDate } from '../../lib/events';
import { countdownLabel, daysUntil, formatDate } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, HIT, radius, spacing, type } from '../../lib/theme';
import type { Registration } from '../../lib/types';

export default function MyRaceScreen() {
  const { user, registrations, language, t, removeRegistration } = useApp();

  const sections = useMemo(() => {
    const withDate = registrations.map((r) => ({ ...r, date: r.event.date }));
    const upcoming = sortByDate(withDate.filter((r) => isUpcoming(r.date)));
    const past = sortByDate(withDate.filter((r) => !isUpcoming(r.date))).reverse();
    return [
      { title: t('myRace.upcoming'), data: upcoming },
      { title: t('myRace.past'), data: past },
    ].filter((s) => s.data.length > 0);
  }, [registrations, t]);

  const next = sections.find((s) => s.title === t('myRace.upcoming'))?.data[0];

  const badge = (r: Registration) =>
    r.status === 'registered' ? t('myRace.statusRegistered') : t('myRace.statusSaved');

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <AuthForm />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={
          <Enter>
            <ScreenTitle title={t('myRace.title')} subtitle={t('myRace.subtitle')} />
            {next ? <NextStart registration={next} /> : null}
          </Enter>
        }
        ListEmptyComponent={
          <EmptyState
            icon="ticket-confirmation-outline"
            text={t('myRace.empty')}
            action={<Button label={t('tab.feed')} icon="compass-outline" onPress={() => router.push('/')} />}
          />
        }
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View>
            <EventCard event={item.event} lang={language} badge={badge(item)} />
            <Pressable
              onPress={() => removeRegistration(item).catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel={`${t('myRace.cancel')}: ${item.event.title}`}
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

/** The race bib: your next start, big and counting down. */
function NextStart({ registration }: { registration: Registration }) {
  const { language, t } = useApp();
  const days = daysUntil(registration.event.date);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: registration.eventId } })}
      accessibilityRole="link"
      accessibilityLabel={`${t('myRace.next')}: ${registration.event.title}, ${countdownLabel(language, registration.event.date)}`}
      style={styles.bibWrap}
    >
      <LinearGradient colors={[colors.primary, '#FF3D6E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bib}>
        <View style={styles.bibTop}>
          <PulseDot color={colors.onPrimary} />
          <Text style={styles.bibLabel}>{t('myRace.next')}</Text>
        </View>
        <Text style={styles.bibDays}>{days <= 1 ? countdownLabel(language, registration.event.date) : days}</Text>
        {days > 1 ? <Text style={styles.bibUnit}>{t('when.daysToGo')}</Text> : null}
        <Text style={styles.bibTitle} numberOfLines={2}>
          {registration.event.title}
        </Text>
        <Text style={styles.bibMeta}>
          {formatDate(language, registration.event.date)}
          {registration.category ? `   ${registration.category}` : ''}
        </Text>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bibWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  bib: { borderRadius: radius.xl, padding: spacing.xl, gap: 2 },
  bibTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  bibLabel: { ...type.footnote, fontWeight: '700', color: colors.onPrimary },
  bibDays: {
    fontSize: 72,
    lineHeight: 76,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
    color: colors.onPrimary,
    fontVariant: ['tabular-nums'],
  },
  bibUnit: { ...type.headline, color: colors.onPrimary, marginTop: -4 },
  bibTitle: { ...type.title3, color: colors.onPrimary, marginTop: spacing.md },
  bibMeta: { ...type.subhead, color: colors.onPrimary, opacity: 0.8 },
  screen: { flex: 1, backgroundColor: colors.background },
  section: {
    ...type.title2,
    color: colors.ink,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    minHeight: HIT,
    marginRight: spacing.lg,
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  removeText: { ...type.footnote, color: colors.muted },
});
