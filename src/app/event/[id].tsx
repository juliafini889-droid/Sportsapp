import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Field, Icon, SPORT_ICONS } from '../../components/ui';
import { countryName, formatDate, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, registrations, profile, language, t, register, saveExternal, registrationFor } = useApp();

  // Fall back to the snapshot in My Race, so past or removed events still open.
  const event = events.find((e) => e.id === id) ?? registrations.find((r) => r.eventId === id)?.event;
  const registration = id ? registrationFor(id) : undefined;

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [error, setError] = useState('');

  if (!event) return <EmptyState icon="magnify" text={t('event.notFound')} />;

  const isExternal = event.source !== 'app';

  const submit = () => {
    if (!name.trim() || !EMAIL_RE.test(email.trim())) {
      setError(t('register.missing'));
      return;
    }
    register(event, name.trim(), email.trim());
    setShowForm(false);
    setError('');
  };

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

        <Text style={styles.sport}>{sportLabel(language, event.sport)}</Text>
        <Text style={styles.title}>{event.title}</Text>

        <Card>
          <InfoRow icon="calendar" text={formatDate(language, event.date)} />
          <InfoRow icon="map-marker-outline" text={[event.city, countryName(language, event.countryCode, event.country)].filter(Boolean).join(', ')} />
          <InfoRow icon="account-circle-outline" text={`${t('event.organizer')}: ${event.organizer}`} />
          <InfoRow icon="trophy-outline" text={`${t('event.price')}: ${event.price ?? t('event.free')}`} />
        </Card>

        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

        <View style={styles.actions}>
          {isExternal ? (
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
                disabled={!!registration}
                onPress={() => saveExternal(event)}
              />
            </>
          ) : registration?.status === 'registered' && !showForm ? (
            <Button label={t('event.registered')} icon="check-circle" variant="success" onPress={() => {}} disabled />
          ) : showForm ? (
            <Card>
              <Text style={styles.formTitle}>{t('register.title')}</Text>
              <Field label={t('register.name')} value={name} onChangeText={setName} autoComplete="name" />
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
                <Button label={t('register.submit')} icon="check-circle" onPress={submit} />
                <Button label={t('common.cancel')} variant="secondary" onPress={() => setShowForm(false)} />
              </View>
            </Card>
          ) : (
            <Button label={t('event.register')} icon="flag-checkered" onPress={() => setShowForm(true)} />
          )}
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
  error: { color: colors.danger, marginBottom: spacing.md },
});
