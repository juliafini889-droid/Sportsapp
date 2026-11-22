import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, Field } from '../../components/ui';
import { sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';
import { SPORTS, type Sport } from '../../lib/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function EditCompetitionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { competitions, profile, language, t, upsertCompetition, deleteCompetition } = useApp();
  const existing = id ? competitions.find((c) => c.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [sport, setSport] = useState<Sport>(existing?.sport ?? 'running');
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState(existing?.location ?? '');
  const [club, setClub] = useState(existing?.club ?? profile.club);
  const [result, setResult] = useState(existing?.result ?? '');
  const [place, setPlace] = useState(existing?.place ? String(existing.place) : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');

  const save = () => {
    if (!title.trim() || !DATE_RE.test(date.trim())) {
      setError(t('comp.form.invalid'));
      return;
    }
    const placeNumber = parseInt(place, 10);
    upsertCompetition({
      id: existing?.id,
      title: title.trim(),
      sport,
      date: date.trim(),
      location: location.trim(),
      club: club.trim(),
      result: result.trim(),
      place: Number.isFinite(placeNumber) && placeNumber > 0 ? placeNumber : undefined,
      notes: notes.trim(),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label={t('comp.form.title')} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>{t('comp.form.sport')}</Text>
        <View style={styles.chips}>
          {SPORTS.map((s) => (
            <Chip key={s} label={sportLabel(language, s)} active={sport === s} onPress={() => setSport(s)} />
          ))}
        </View>
        <Field label={t('comp.form.date')} value={date} onChangeText={setDate} placeholder="2027-05-31" />
        <Field label={t('comp.form.location')} value={location} onChangeText={setLocation} />
        <Field label={t('comp.form.club')} value={club} onChangeText={setClub} />
        <View style={styles.twoCols}>
          <View style={{ flex: 2 }}>
            <Field label={t('comp.form.result')} value={result} onChangeText={setResult} placeholder="42:13" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={t('comp.form.place')} value={place} onChangeText={setPlace} keyboardType="number-pad" />
          </View>
        </View>
        <Field
          label={t('comp.form.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ gap: spacing.sm }}>
          <Button label={t('comp.form.save')} icon="check-circle" onPress={save} />
          {existing ? (
            <Button
              label={t('comp.form.delete')}
              icon="trash-can-outline"
              variant="danger"
              onPress={() => {
                deleteCompetition(existing.id);
                router.back();
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, marginBottom: spacing.md },
  twoCols: { flexDirection: 'row', gap: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
});
