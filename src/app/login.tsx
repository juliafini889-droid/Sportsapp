import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { AuthForm } from '../components/AuthForm';

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AuthForm onDone={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
