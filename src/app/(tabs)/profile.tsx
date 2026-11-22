import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, Field, ScreenTitle } from '../../components/ui';
import { LANGUAGES, type Language } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';

export default function ProfileScreen() {
  const { profile, language, t, saveProfile, setLanguage } = useApp();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [club, setClub] = useState(profile.club);
  const [saved, setSaved] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
          <ScreenTitle title={t('profile.title')} />
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
                label={t('profile.email')}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setSaved(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Field
                label={t('profile.club')}
                value={club}
                onChangeText={(v) => {
                  setClub(v);
                  setSaved(false);
                }}
              />
              <Button
                label={saved ? t('profile.saved') : t('profile.save')}
                icon="check-circle"
                variant={saved ? 'success' : 'primary'}
                onPress={() => {
                  saveProfile({ name: name.trim(), email: email.trim(), club: club.trim() });
                  setSaved(true);
                }}
              />
            </Card>

            <Text style={styles.label}>{t('profile.language')}</Text>
            <View style={styles.chips}>
              {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
                <Chip
                  key={lang}
                  label={LANGUAGES[lang]}
                  active={language === lang}
                  onPress={() => setLanguage(lang)}
                />
              ))}
            </View>

            <Text style={styles.note}>{t('profile.localNote')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: spacing.lg, gap: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: spacing.md },
  chips: { flexDirection: 'row' },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: spacing.md },
});
