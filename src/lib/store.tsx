import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEMO_EVENTS, fetchTicketmasterEvents, newId, sortByDate } from './events';
import { deviceCountry, deviceLanguage, translate, type Language, type TranslationKey } from './i18n';
import type { Competition, Profile, Registration, SportEvent } from './types';

const STORAGE_KEY = 'sportsapp/state/v1';

/** Everything we keep on the phone. Accounts and cloud sync come in a later version. */
interface PersistedState {
  language: Language;
  profile: Profile;
  registrations: Registration[];
  competitions: Competition[];
  myEvents: SportEvent[];
}

const initialState: PersistedState = {
  language: deviceLanguage(),
  profile: { name: '', email: '', club: '' },
  registrations: [],
  competitions: [],
  myEvents: [],
};

interface AppContextValue extends PersistedState {
  ready: boolean;
  events: SportEvent[];
  externalLoadFailed: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
  saveProfile: (profile: Profile) => void;
  register: (event: SportEvent, name: string, email: string) => void;
  saveExternal: (event: SportEvent) => void;
  removeRegistration: (id: string) => void;
  registrationFor: (eventId: string) => Registration | undefined;
  upsertCompetition: (c: Omit<Competition, 'id'> & { id?: string }) => void;
  deleteCompetition: (id: string) => void;
  publishEvent: (e: Omit<SportEvent, 'id' | 'source'>) => SportEvent;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);
  const [externalEvents, setExternalEvents] = useState<SportEvent[]>([]);
  const [externalLoadFailed, setExternalLoadFailed] = useState(false);

  // Load saved data once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<PersistedState>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Save whenever something changes (after the first load).
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  // Ticketmaster events (only when an API key is configured).
  useEffect(() => {
    fetchTicketmasterEvents()
      .then(setExternalEvents)
      .catch(() => setExternalLoadFailed(true));
  }, []);

  const events = useMemo(() => {
    const home = deviceCountry();
    const all = sortByDate([...state.myEvents, ...DEMO_EVENTS, ...externalEvents]);
    // Events in the athlete's own country first, then the rest of the world.
    return home ? [...all.filter((e) => e.countryCode === home), ...all.filter((e) => e.countryCode !== home)] : all;
  }, [state.myEvents, externalEvents]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(state.language, key, params),
    [state.language],
  );

  const value: AppContextValue = {
    ...state,
    ready,
    events,
    externalLoadFailed,
    t,
    setLanguage: (language) => setState((s) => ({ ...s, language })),
    saveProfile: (profile) => setState((s) => ({ ...s, profile })),
    register: (event, name, email) =>
      setState((s) => ({
        ...s,
        registrations: [
          ...s.registrations.filter((r) => r.eventId !== event.id),
          {
            id: newId('reg'),
            eventId: event.id,
            event,
            name,
            email,
            status: 'registered',
            createdAt: new Date().toISOString(),
          },
        ],
      })),
    saveExternal: (event) =>
      setState((s) =>
        s.registrations.some((r) => r.eventId === event.id)
          ? s
          : {
              ...s,
              registrations: [
                ...s.registrations,
                {
                  id: newId('reg'),
                  eventId: event.id,
                  event,
                  name: s.profile.name,
                  email: s.profile.email,
                  status: 'saved',
                  createdAt: new Date().toISOString(),
                },
              ],
            },
      ),
    removeRegistration: (id) =>
      setState((s) => ({ ...s, registrations: s.registrations.filter((r) => r.id !== id) })),
    registrationFor: (eventId) => state.registrations.find((r) => r.eventId === eventId),
    upsertCompetition: (c) =>
      setState((s) => {
        const competition: Competition = { ...c, id: c.id ?? newId('comp') };
        const exists = s.competitions.some((x) => x.id === competition.id);
        return {
          ...s,
          competitions: exists
            ? s.competitions.map((x) => (x.id === competition.id ? competition : x))
            : [...s.competitions, competition],
        };
      }),
    deleteCompetition: (id) =>
      setState((s) => ({ ...s, competitions: s.competitions.filter((c) => c.id !== id) })),
    publishEvent: (e) => {
      const event: SportEvent = { ...e, id: newId('evt'), source: 'app' };
      setState((s) => ({ ...s, myEvents: [...s.myEvents, event] }));
      return event;
    },
  };

  // Wait for saved data, so screens start with the right values.
  if (!ready) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
