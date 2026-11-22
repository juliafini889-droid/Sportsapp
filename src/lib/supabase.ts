import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Project "Race Base". The publishable key is meant to be public: Row Level Security protects the data.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://parjthqktebpswjmeqzi.supabase.co';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_ZA_Wj0anDktGfUnhVb2aSA_k8SJrs0P';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // During a static web export there is no window, so skip storage there.
    storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
