import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthForm } from '../../components/AuthForm';
import { Button, Chip, Field } from '../../components/ui';
import { sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';
import { SPORTS, type Sport } from '../../lib/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function NewEventScreen() {
  const { user, profile, language, t, publishEvent } = useApp();
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<Sport>('running');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [organizer, setOrganizer] = useState(profile.club);
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthForm />
      </ScrollView>
    );
  }

  const publish = async () => {
    const code = countryCode.trim().toUpperCase();
    const priceNumber = price.trim() ? Number(price.replace(',', '.')) : 0;
    if (
      title.trim().length < 3 ||
      !DATE_RE.test(date.trim()) ||
      !city.trim() ||
      !/^[A-Z]{2}$/.test(code) ||
      !Number.isFinite(priceNumber) ||
      priceNumber < 0
    ) {
      setError(t('newEvent.invalid'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const id = await publishEvent({
        title: title.trim(),
        sport,
        date: date.trim(),
        city: city.trim(),
        countryCode: code,
        price: priceNumber,
        description: description.trim(),
        categories: categories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        organizer: organizer.trim() || profile.name || title.trim(),
      });
      router.replace({ pathname: '/event/[id]', params: { id } });
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>{t('newEvent.hint')}</Text>
        <Field label={t('newEvent.name')} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>{t('comp.form.sport')}</Text>
        <View style={styles.chips}>
          {SPORTS.map((s) => (
            <Chip key={s} label={sportLabel(language, s)} active={sport === s} onPress={() => setSport(s)} />
          ))}
        </View>
        <Field label={t('comp.form.date')} value={date} onChangeText={setDate} placeholder="2027-05-31" />
        <Field label={t('newEvent.city')} value={city} onChangeText={setCity} />
        <Field
          label={t('newEvent.country')}
          value={countryCode}
          onChangeText={setCountryCode}
          autoCapitalize="characters"
          maxLength={2}
        />
        <Field label={t('newEvent.organizer')} value={organizer} onChangeText={setOrganizer} />
        <Field
          label={t('newEvent.price')}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0"
        />
        <Field
          label={t('newEvent.categories')}
          value={categories}
          onChangeText={setCategories}
          placeholder="5 km, 10 km"
        />
        <Field
          label={t('newEvent.description')}
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={t('newEvent.publish')} icon="check-circle" onPress={publish} disabled={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
});
