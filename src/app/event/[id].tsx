import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, EmptyState, Field, Icon, SPORT_ICONS } from '../../components/ui';
import { countryName, formatDate, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, registrations, profile, user, language, t, register, saveExternal, registrationFor } = useApp();

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

  if (!event) return <EmptyState icon="magnify" text={t('event.notFound')} />;

  const isExternal = event.source !== 'app';

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setShowForm(false);
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

  const needLogin = !user;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Icon name={SPORT_ICONS[event.sport]} size={72} color={colors.primary} />
          </View>
        )}

        <Text style={styles.sport}>{sportLabel(language, event.sport, event.sportName)}</Text>
        <Text style={styles.title}>{event.title}</Text>

        <Card>
          <InfoRow icon="calendar" text={formatDate(language, event.date)} />
          <InfoRow
            icon="map-marker-outline"
            text={[event.city, countryName(language, event.countryCode, event.country)].filter(Boolean).join(', ')}
          />
          <InfoRow icon="account-circle-outline" text={`${t('event.organizer')}: ${event.organizer}`} />
          <InfoRow icon="trophy-outline" text={`${t('event.price')}: ${event.price ?? t('event.free')}`} />
        </Card>

        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

        <View style={styles.actions}>
          {needLogin ? (
            <Button
              label={t('register.loginFirst')}
              icon="account-circle-outline"
              onPress={() => router.push('/login')}
            />
          ) : isExternal ? (
            <>
              <Text style={styles.hint}>{t('event.externalHint', { source: 'Ticketmaster' })}</Text>
              {event.externalUrl ? (
                <Button
                  label={t('event.openExternal')}
                  icon="open-in-new"
                  onPress={() => Linking.openURL(event.externalUrl!)}
                />
              ) : null}
              <Button
                label={registration ? t('event.saved') : t('event.save')}
                icon={registration ? 'check-circle' : 'bookmark-outline'}
                variant={registration ? 'success' : 'secondary'}
                disabled={!!registration || busy}
                onPress={() => run(() => saveExternal(event))}
              />
            </>
          ) : registration ? (
            <Button
              label={
                registration.category ? `${t('event.registered')} · ${registration.category}` : t('event.registered')
              }
              icon="check-circle"
              variant="success"
              onPress={() => {}}
              disabled
            />
          ) : showForm ? (
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
                <Button label={t('common.cancel')} variant="secondary" onPress={() => setShowForm(false)} />
              </View>
            </Card>
          ) : (
            <Button label={t('event.register')} icon="flag-checkered" onPress={() => setShowForm(true)} />
          )}
          {error && !showForm ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ icon, text }: { icon: Parameters<typeof Icon>[0]['name']; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} color={colors.primaryDark} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },
  hero: { width: '100%', height: 190, borderRadius: radius.lg },
  heroFallback: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sport: { color: colors.primaryDark, fontWeight: '700', textTransform: 'uppercase', marginTop: spacing.sm },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  infoText: { fontSize: 15, color: colors.ink, flexShrink: 1 },
  description: { fontSize: 16, lineHeight: 23, color: colors.ink },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  formTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
});
