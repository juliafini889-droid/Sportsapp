import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '../../components/AuthForm';
import { Button, Card, Chip, Field, ScreenTitle } from '../../components/ui';
import { LANGUAGES, type Language } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, profile, language, t, setLanguage } = useApp();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
          {user ? <ProfileForm key={user.id + (profile.name ? '-loaded' : '')} /> : <AuthForm />}
          <View style={styles.body}>
            <Text style={styles.label}>{t('profile.language')}</Text>
            <View style={styles.chips}>
              {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
                <Chip key={lang} label={LANGUAGES[lang]} active={language === lang} onPress={() => setLanguage(lang)} />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileForm() {
  const { profile, t, saveProfile, signOut } = useApp();
  const [name, setName] = useState(profile.name);
  const [club, setClub] = useState(profile.club);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    try {
      await saveProfile({ name: name.trim(), email: profile.email, club: club.trim() });
      setSaved(true);
    } catch {
      setError(t('common.error'));
    }
  };

  return (
    <>
      <ScreenTitle title={t('profile.title')} subtitle={t('auth.signedInAs', { email: profile.email })} />
      <View style={styles.body}>
        <Card>
          <Field
            label={t('profile.name')}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setSaved(false);
            }}
            autoComplete="name"
          />
          <Field
            label={t('profile.club')}
            value={club}
            onChangeText={(v) => {
              setClub(v);
              setSaved(false);
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={saved ? t('profile.saved') : t('profile.save')}
            icon="check-circle"
            variant={saved ? 'success' : 'primary'}
            onPress={save}
          />
        </Card>
        <Text style={styles.note}>{t('profile.localNote')}</Text>
        <Button label={t('auth.signOut')} variant="secondary" onPress={() => signOut()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: spacing.lg, gap: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: spacing.md },
  chips: { flexDirection: 'row' },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  error: { color: colors.danger, marginBottom: spacing.md },
});
