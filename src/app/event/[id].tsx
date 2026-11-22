import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Countdown, EventArt } from '../../components/EventCard';
import { haptic, nativeDriver, Pop } from '../../components/motion';
import { Button, Card, Chip, DateBlock, EmptyState, Field, Icon, SPORT_ICONS } from '../../components/ui';
import { countryName, formatDate, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing, type } from '../../lib/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HERO = 340;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, registrations, profile, user, language, t, register, saveExternal, registrationFor } = useApp();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fall back to My Race, so past or removed events still open.
  const event = events.find((e) => e.id === id) ?? registrations.find((r) => r.eventId === id)?.event;
  const registration = id ? registrationFor(id) : undefined;

  const [firstName, ...rest] = profile.name.split(' ');
  const [showForm, setShowForm] = useState(false);
  const [first, setFirst] = useState(firstName ?? '');
  const [last, setLast] = useState(rest.join(' '));
  const [email, setEmail] = useState(profile.email);
  const [category, setCategory] = useState(event?.categories?.[0] ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [justDone, setJustDone] = useState(false);

  if (!event) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState icon="magnify" text={t('event.notFound')} />
      </View>
    );
  }

  const isExternal = event.source !== 'app';
  const where = [event.city, countryName(language, event.countryCode, event.country)].filter(Boolean).join(', ');

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setShowForm(false);
      setJustDone(true);
      haptic('success');
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!first.trim() || !last.trim() || !EMAIL_RE.test(email.trim())) {
      setError(t('register.missing'));
      return;
    }
    run(() =>
      register(event, {
        firstName: first.trim(),
        lastName: last.trim(),
        email: email.trim(),
        category: category || event.categories?.[0] || 'Standard',
      }),
    );
  };

  // Stretchy header: pulls bigger when you overscroll, drifts slower than the content when you scroll.
  const heroStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-HERO, 0, HERO],
          outputRange: [-HERO / 2, 0, HERO * 0.45],
          extrapolateRight: 'clamp' as const,
        }),
      },
      { scale: scrollY.interpolate({ inputRange: [-HERO, 0], outputRange: [2, 1], extrapolateRight: 'clamp' as const }) },
    ],
  };

  // The one action that matters on this screen lives in a bar at the bottom, in thumb reach.
  let action: ReactNode;
  if (!user) {
    action = <Button label={t('register.loginFirst')} icon="account-circle-outline" onPress={() => router.push('/login')} />;
  } else if (isExternal) {
    action = (
      <View style={styles.actionRow}>
        {event.externalUrl ? (
          <Button label={t('event.openExternal')} icon="open-in-new" onPress={() => Linking.openURL(event.externalUrl!)} />
        ) : null}
        <Button
          label={registration ? t('event.saved') : t('event.save')}
          icon={registration ? 'check-circle' : 'bookmark-outline'}
          variant={registration ? 'success' : 'secondary'}
          disabled={!!registration || busy}
          onPress={() => run(() => saveExternal(event))}
        />
      </View>
    );
  } else if (registration) {
    action = (
      <Button
        label={registration.category ? `${t('event.registered')}  ${registration.category}` : t('event.registered')}
        icon="check-circle"
        variant="success"
        onPress={() => router.push('/my-race')}
      />
    );
  } else if (!showForm) {
    action = <Button label={t('event.register')} icon="flag-checkered" onPress={() => setShowForm(true)} />;
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: nativeDriver })}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.hero, heroStyle]}>
          <EventArt event={event} style={StyleSheet.absoluteFill} iconSize={96} />
          <LinearGradient
            colors={['rgba(7,20,48,0.55)', 'rgba(7,20,48,0)', 'rgba(7,20,48,0.4)', colors.background]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={styles.body}>
          <View style={styles.tags}>
            <View style={styles.sportTag}>
              <Icon name={SPORT_ICONS[event.sport]} size={14} color={colors.electric} />
              <Text style={styles.sportTagText}>{sportLabel(language, event.sport, event.sportName)}</Text>
            </View>
            <Countdown lang={language} iso={event.date} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {event.title}
          </Text>

          <View style={styles.ticket}>
            <DateBlock lang={language} iso={event.date} size="lg" />
            <View style={styles.ticketBody}>
              <Text style={styles.ticketDate}>{formatDate(language, event.date)}</Text>
              <View style={styles.inline}>
                <Icon name="map-marker-outline" size={15} color={colors.muted} />
                <Text style={styles.ticketPlace}>{where}</Text>
              </View>
            </View>
          </View>
          <View style={styles.perforation} />
          <View style={styles.facts}>
            <Fact icon="account-group-outline" label={t('event.organizer')} value={event.organizer} />
            <Fact icon="cash" label={t('event.price')} value={event.price ?? t('event.free')} />
          </View>

          {justDone ? (
            <Pop style={styles.success}>
              <Icon name="check-decagram" size={28} color={colors.success} />
              <Text style={styles.successText}>{isExternal ? t('event.saved') : t('event.registered')}</Text>
            </Pop>
          ) : null}

          {event.description ? (
            <>
              <Text style={styles.h2}>{t('event.about')}</Text>
              <Text style={styles.description}>{event.description}</Text>
            </>
          ) : null}

          {isExternal && user ? (
            <Text style={styles.hint}>{t('event.externalHint', { source: 'Ticketmaster' })}</Text>
          ) : null}

          {showForm && !registration ? (
            <Card>
              <Text style={styles.formTitle}>{t('register.title')}</Text>
              {event.categories && event.categories.length > 1 ? (
                <>
                  <Text style={styles.label}>{t('register.category')}</Text>
                  <View style={styles.chips}>
                    {event.categories.map((c) => (
                      <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
                    ))}
                  </View>
                </>
              ) : null}
              <Field label={t('register.firstName')} value={first} onChangeText={setFirst} autoComplete="given-name" />
              <Field label={t('register.lastName')} value={last} onChangeText={setLast} autoComplete="family-name" />
              <Field
                label={t('register.email')}
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={{ gap: spacing.sm }}>
                <Button label={t('register.submit')} icon="check-circle" onPress={submit} disabled={busy} />
                <Button label={t('common.cancel')} variant="ghost" onPress={() => setShowForm(false)} />
              </View>
            </Card>
          ) : null}
          {error && !showForm ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </Animated.ScrollView>

      {/* Bar behind the back button that fades in once the photo scrolls away, so text never runs under it. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.topBar,
          {
            height: insets.top + 56,
            opacity: scrollY.interpolate({ inputRange: [HERO - 160, HERO - 90], outputRange: [0, 1], extrapolate: 'clamp' }),
          },
        ]}
      />

      {action ? (
        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>{action}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function Fact({ icon, label, value }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={20} color={colors.electric} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { height: HERO, backgroundColor: colors.card },
  body: { paddingHorizontal: spacing.lg, marginTop: -spacing.xxl, gap: spacing.md },
  tags: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.electricSoft,
  },
  sportTagText: { ...type.caption, color: colors.electric },
  title: { ...type.largeTitle, color: colors.ink },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  ticketBody: { flex: 1, gap: 4 },
  ticketDate: { ...type.headline, color: colors.ink },
  ticketPlace: { ...type.subhead, color: colors.muted, flexShrink: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  perforation: {
    marginTop: -spacing.md,
    marginHorizontal: spacing.lg,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.background,
  },
  facts: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginTop: -spacing.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  fact: { flex: 1, gap: 2 },
  factLabel: { ...type.caption, color: colors.muted, marginTop: 4 },
  factValue: { ...type.callout, color: colors.ink, fontWeight: '700' },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },
  successText: { ...type.headline, color: colors.success, flex: 1 },
  h2: { ...type.title3, color: colors.ink, marginTop: spacing.md },
  description: { ...type.body, color: colors.ink, opacity: 0.9 },
  hint: { ...type.footnote, color: colors.muted },
  formTitle: { ...type.title2, color: colors.ink, marginBottom: spacing.md },
  label: { ...type.footnote, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, marginBottom: spacing.md },
  error: { ...type.subhead, color: colors.danger, marginBottom: spacing.md },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(7,20,48,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionRow: { gap: spacing.sm },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7,20,48,0.96)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
