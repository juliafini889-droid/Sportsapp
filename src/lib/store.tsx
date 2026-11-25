import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as db from './db';
import { fetchTicketmasterEvents, sortByDate } from './events';
import { deviceCountry, deviceLanguage, translate, type Language, type TranslationKey } from './i18n';
import { supabase } from './supabase';
import type { Competition, Profile, Registration, SportEvent } from './types';

const SETTINGS_KEY = 'sportsapp/settings/v1';

/** Small things that stay on the phone: language and the default club for new results. */
interface LocalSettings {
  language: Language;
  club: string;
}

type CompetitionInput = Omit<Competition, 'id'> & { id?: string };

interface AppContextValue {
  ready: boolean;
  language: Language;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;

  /** Signed-in user, or null when browsing as a guest. */
  user: { id: string; email: string } | null;
  profile: Profile;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;

  events: SportEvent[];
  eventsError: boolean;
  registrations: Registration[];
  competitions: Competition[];
  refresh: () => Promise<void>;

  register: (
    event: SportEvent,
    d: { firstName: string; lastName: string; email: string; category: string },
  ) => Promise<void>;
  saveExternal: (event: SportEvent) => Promise<void>;
  removeRegistration: (reg: Registration) => Promise<void>;
  registrationFor: (eventId: string) => Registration | undefined;
  upsertCompetition: (c: CompetitionInput) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  publishEvent: (e: Parameters<typeof db.publishEvent>[2] & { organizer: string }) => Promise<string>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LocalSettings>({ language: deviceLanguage(), club: '' });
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const [appEvents, setAppEvents] = useState<SportEvent[]>([]);
  const [externalEvents, setExternalEvents] = useState<SportEvent[]>([]);
  const [eventsError, setEventsError] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [profileName, setProfileName] = useState('');

  const user = session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null;
  const userId = user?.id;

  // Load local settings and the saved login once.
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SETTINGS_KEY)
        .then((raw) => raw && setSettings((s) => ({ ...s, ...(JSON.parse(raw) as Partial<LocalSettings>) })))
        .catch(() => {}),
      supabase.auth.getSession().then(({ data }) => setSession(data.session)),
    ]).finally(() => setReady(true));

    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const loadEvents = useCallback(async () => {
    try {
      setAppEvents(await db.loadEvents());
      setEventsError(false);
    } catch {
      setEventsError(true);
    }
  }, []);

  const loadMine = useCallback(async () => {
    if (!userId) {
      setRegistrations([]);
      setCompetitions([]);
      setProfileName('');
      return;
    }
    const [regs, comps, prof] = await Promise.all([
      db.loadRegistrations(userId),
      db.loadCompetitions(userId),
      db.loadProfile(userId, ''),
    ]);
    setRegistrations(regs);
    setCompetitions(comps);
    setProfileName(prof.name);
    if (prof.club) setSettings((s) => (s.club ? s : { ...s, club: prof.club }));
  }, [userId]);

  useEffect(() => {
    loadEvents();
    // Ticketmaster events only load when an API key is configured.
    fetchTicketmasterEvents()
      .then(setExternalEvents)
      .catch(() => {});
  }, [loadEvents]);

  useEffect(() => {
    if (ready) loadMine().catch(() => {});
  }, [ready, loadMine]);

  const refresh = useCallback(async () => {
    await Promise.all([loadEvents(), loadMine().catch(() => {})]);
  }, [loadEvents, loadMine]);

  const events = useMemo(() => {
    const home = deviceCountry();
    const all = sortByDate([...appEvents, ...externalEvents]);
    // Events in the athlete's own country first, then the rest of the world.
    return home ? [...all.filter((e) => e.countryCode === home), ...all.filter((e) => e.countryCode !== home)] : all;
  }, [appEvents, externalEvents]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(settings.language, key, params),
    [settings.language],
  );

  const requireUser = () => {
    if (!userId) throw new Error(t('auth.required'));
    return userId;
  };

  const value: AppContextValue = {
    ready,
    language: settings.language,
    t,
    setLanguage: (language) => setSettings((s) => ({ ...s, language })),

    user,
    profile: { name: profileName, email: user?.email ?? '', club: settings.club },
    signIn: db.signIn,
    signUp: db.signUp,
    signOut: db.signOut,
    saveProfile: async (p) => {
      setSettings((s) => ({ ...s, club: p.club }));
      if (userId && p.name !== profileName) {
        await db.saveProfileName(userId, p.name);
        setProfileName(p.name);
      }
    },

    events,
    eventsError,
    registrations,
    competitions,
    refresh,

    register: async (event, d) => {
      await db.register(requireUser(), event, d);
      await loadMine();
    },
    saveExternal: async (event) => {
      await db.saveExternal(requireUser(), event);
      await loadMine();
    },
    removeRegistration: async (reg) => {
      await db.removeRegistration(reg);
      await loadMine();
    },
    registrationFor: (eventId) => registrations.find((r) => r.eventId === eventId),
    upsertCompetition: async (c) => {
      await db.upsertCompetition(requireUser(), c);
      await loadMine();
    },
    deleteCompetition: async (id) => {
      await db.deleteCompetition(id);
      await loadMine();
    },
    publishEvent: async ({ organizer, ...e }) => {
      const id = await db.publishEvent(requireUser(), organizer, e);
      await loadEvents();
      return id;
    },
  };

  // Wait for settings and login, so screens start with the right values.
  if (!ready) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
