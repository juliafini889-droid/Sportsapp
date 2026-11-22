import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../lib/store';
import { colors, spacing } from '../lib/theme';
import { Button, Card, Field, Icon } from './ui';

/** Sign-in / create-account form. Shown wherever an action needs an account. */
export function AuthForm({ onDone }: { onDone?: () => void }) {
  const { t, signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (mode === 'signUp') await signUp(email.trim(), password, name.trim());
      else await signIn(email.trim(), password);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Icon name="flag-checkered" size={34} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t('auth.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
      <Card>
        {mode === 'signUp' ? (
          <Field label={t('auth.name')} value={name} onChangeText={setName} autoComplete="name" />
        ) : null}
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={mode === 'signUp' ? t('auth.signUp') : t('auth.signIn')}
          icon="check-circle"
          onPress={submit}
          disabled={busy}
        />
      </Card>
      <Pressable
        onPress={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          setError('');
        }}
        style={styles.switch}
        accessibilityRole="button"
      >
        <Text style={styles.switchText}>{mode === 'signIn' ? t('auth.toSignUp') : t('auth.toSignIn')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
  switch: { alignSelf: 'center', padding: spacing.sm },
  switchText: { color: colors.primaryDark, fontWeight: '700' },
});
