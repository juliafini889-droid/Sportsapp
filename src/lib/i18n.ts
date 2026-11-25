import { getLocales } from 'expo-localization';

import type { Sport } from './types';

const en = {
  'tab.feed': 'Discover',
  'tab.myRace': 'My Race',
  'tab.competitions': 'My Results',
  'tab.profile': 'Profile',

  'feed.title': 'Sport events worldwide',
  'feed.subtitle': 'Find your next race, match or tournament',
  'feed.search': 'Search events or cities',
  'feed.allSports': 'All sports',
  'feed.allCountries': 'All countries',
  'feed.empty': 'No events match your filters yet.',
  'feed.addEvent': 'Add your event',
  'feed.loadError': 'Could not load events. Please check your internet connection.',
  'feed.featured': 'Featured races',
  'feed.soon': 'Coming up soon',
  'feed.all': 'All events',
  'feed.results': '{count} events',
  'feed.organiseTitle': 'Running your own race?',
  'feed.organiseText': 'Publish it here and athletes sign up in the app.',
  'feed.clearFilters': 'Clear filters',
  'when.today': 'Today',
  'when.tomorrow': 'Tomorrow',
  'when.inDays': 'In {count} days',
  'when.daysToGo': 'days to go',
  'myRace.next': 'Your next start',
  'event.details': 'Details',
  'event.about': 'About this event',

  'event.register': 'Sign up now',
  'event.registered': 'You are signed up 🎉',
  'event.save': 'Save to My Race',
  'event.saved': 'Saved in My Race',
  'event.openExternal': 'Get tickets on the organiser site',
  'event.externalHint':
    'This event comes from {source}. Sign-up happens on their site, but you can keep it in My Race.',
  'event.organizer': 'Organiser',
  'event.price': 'Price',
  'event.free': 'Free',
  'event.notFound': 'Event not found.',

  'register.title': 'Sign up',
  'register.name': 'Full name',
  'register.email': 'Email',
  'register.submit': 'Confirm sign-up',
  'register.missing': 'Please enter your name and a valid email.',

  'myRace.title': 'My Race',
  'myRace.subtitle': 'All your sign-ups in one place',
  'myRace.empty': 'No sign-ups yet. Find an event in Discover!',
  'myRace.upcoming': 'Upcoming',
  'myRace.past': 'Past',
  'myRace.statusRegistered': 'Signed up',
  'myRace.statusSaved': 'Saved',
  'myRace.cancel': 'Remove',

  'comp.title': 'My Results',
  'comp.subtitle': 'Track the competitions you do with your club',
  'comp.add': 'Add competition',
  'comp.empty': 'No competitions yet. Add your first one!',
  'comp.stats.count': 'Competitions',
  'comp.stats.podiums': 'Podiums',
  'comp.stats.best': 'Best place',
  'comp.form.title': 'Name of the competition',
  'comp.form.sport': 'Sport',
  'comp.form.date': 'Date (YYYY-MM-DD)',
  'comp.form.location': 'Location',
  'comp.form.club': 'Club',
  'comp.form.result': 'Result (time, score…)',
  'comp.form.place': 'Place',
  'comp.form.notes': 'Notes',
  'comp.form.save': 'Save',
  'comp.form.delete': 'Delete',
  'comp.form.invalid': 'Please enter a name and a date like 2026-05-31.',
  'comp.edit': 'Edit competition',

  'newEvent.title': 'Add an event',
  'newEvent.hint': 'Clubs and organisers can publish their events here. Athletes sign up directly in the app.',
  'newEvent.name': 'Event name',
  'newEvent.city': 'City',
  'newEvent.country': 'Country code (e.g. CH, DE, US)',
  'newEvent.organizer': 'Organiser / club',
  'newEvent.price': 'Price in CHF (0 = free)',
  'newEvent.description': 'Description',
  'newEvent.publish': 'Publish event',
  'newEvent.invalid': 'Please fill in name, date, city and a 2-letter country code.',

  'profile.title': 'Profile',
  'profile.name': 'Name',
  'profile.email': 'Email',
  'profile.club': 'Club',
  'profile.language': 'Language',
  'profile.save': 'Save profile',
  'profile.saved': 'Saved!',
  'profile.localNote': 'Your sign-ups and results are saved in your account, so they are safe on every phone.',

  'common.cancel': 'Cancel',
  'auth.title': 'Welcome to Sportsapp',
  'auth.subtitle': 'Sign in to sign up for events and track your results.',
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Create account',
  'auth.toSignUp': 'New here? Create an account',
  'auth.toSignIn': 'Already have an account? Sign in',
  'auth.name': 'Your name',
  'auth.email': 'Email',
  'auth.password': 'Password (at least 8 characters)',
  'auth.required': 'Please sign in first.',
  'auth.signOut': 'Sign out',
  'auth.signedInAs': 'Signed in as {email}',
  'register.firstName': 'First name',
  'register.lastName': 'Last name',
  'register.category': 'Category',
  'register.loginFirst': 'Sign in to sign up',
  'comp.upcoming': 'Upcoming',
  'comp.addResult': 'Add your result',
  'newEvent.categories': 'Categories, separated by commas (e.g. 5 km, 10 km)',
  'common.error': 'Something went wrong. Please try again.',

  'sport.running': 'Running',
  'sport.cycling': 'Cycling',
  'sport.triathlon': 'Triathlon',
  'sport.swimming': 'Swimming',
  'sport.football': 'Football',
  'sport.tennis': 'Tennis',
  'sport.basketball': 'Basketball',
  'sport.skiing': 'Skiing',
  'sport.other': 'Other',
} as const;

export type TranslationKey = keyof typeof en;

const de: Record<TranslationKey, string> = {
  'tab.feed': 'Entdecken',
  'tab.myRace': 'My Race',
  'tab.competitions': 'Meine Resultate',
  'tab.profile': 'Profil',

  'feed.title': 'Sportevents weltweit',
  'feed.subtitle': 'Finde dein nächstes Rennen, Spiel oder Turnier',
  'feed.search': 'Events oder Orte suchen',
  'feed.allSports': 'Alle Sportarten',
  'feed.allCountries': 'Alle Länder',
  'feed.empty': 'Keine Events passen zu deinen Filtern.',
  'feed.addEvent': 'Event eintragen',
  'feed.loadError': 'Events konnten nicht geladen werden. Bitte prüfe deine Internetverbindung.',
  'feed.featured': 'Top Rennen',
  'feed.soon': 'Bald am Start',
  'feed.all': 'Alle Events',
  'feed.results': '{count} Events',
  'feed.organiseTitle': 'Du organisierst ein Rennen?',
  'feed.organiseText': 'Trag es hier ein und Sportler melden sich direkt in der App an.',
  'feed.clearFilters': 'Filter zurücksetzen',
  'when.today': 'Heute',
  'when.tomorrow': 'Morgen',
  'when.inDays': 'In {count} Tagen',
  'when.daysToGo': 'Tage bis zum Start',
  'myRace.next': 'Dein nächster Start',
  'event.details': 'Details',
  'event.about': 'Über dieses Event',

  'event.register': 'Jetzt anmelden',
  'event.registered': 'Du bist angemeldet 🎉',
  'event.save': 'In My Race speichern',
  'event.saved': 'In My Race gespeichert',
  'event.openExternal': 'Tickets beim Veranstalter holen',
  'event.externalHint':
    'Dieses Event kommt von {source}. Die Anmeldung läuft auf deren Seite, aber du kannst es in My Race behalten.',
  'event.organizer': 'Veranstalter',
  'event.price': 'Preis',
  'event.free': 'Gratis',
  'event.notFound': 'Event nicht gefunden.',

  'register.title': 'Anmelden',
  'register.name': 'Vor- und Nachname',
  'register.email': 'E-Mail',
  'register.submit': 'Anmeldung bestätigen',
  'register.missing': 'Bitte gib deinen Namen und eine gültige E-Mail ein.',

  'myRace.title': 'My Race',
  'myRace.subtitle': 'Alle deine Anmeldungen an einem Ort',
  'myRace.empty': 'Noch keine Anmeldungen. Finde ein Event unter Entdecken!',
  'myRace.upcoming': 'Kommend',
  'myRace.past': 'Vorbei',
  'myRace.statusRegistered': 'Angemeldet',
  'myRace.statusSaved': 'Gespeichert',
  'myRace.cancel': 'Entfernen',

  'comp.title': 'Meine Resultate',
  'comp.subtitle': 'Tracke die Wettkämpfe mit deinem Verein',
  'comp.add': 'Wettkampf eintragen',
  'comp.empty': 'Noch keine Wettkämpfe. Trag deinen ersten ein!',
  'comp.stats.count': 'Wettkämpfe',
  'comp.stats.podiums': 'Podestplätze',
  'comp.stats.best': 'Bester Platz',
  'comp.form.title': 'Name des Wettkampfs',
  'comp.form.sport': 'Sportart',
  'comp.form.date': 'Datum (JJJJ-MM-TT)',
  'comp.form.location': 'Ort',
  'comp.form.club': 'Verein',
  'comp.form.result': 'Resultat (Zeit, Score…)',
  'comp.form.place': 'Platz',
  'comp.form.notes': 'Notizen',
  'comp.form.save': 'Speichern',
  'comp.form.delete': 'Löschen',
  'comp.form.invalid': 'Bitte gib einen Namen und ein Datum wie 2026-05-31 ein.',
  'comp.edit': 'Wettkampf bearbeiten',

  'newEvent.title': 'Event eintragen',
  'newEvent.hint':
    'Vereine und Veranstalter können hier ihre Events veröffentlichen. Sportler melden sich direkt in der App an.',
  'newEvent.name': 'Name des Events',
  'newEvent.city': 'Stadt',
  'newEvent.country': 'Ländercode (z.B. CH, DE, US)',
  'newEvent.organizer': 'Veranstalter / Verein',
  'newEvent.price': 'Preis in CHF (0 = gratis)',
  'newEvent.description': 'Beschreibung',
  'newEvent.publish': 'Event veröffentlichen',
  'newEvent.invalid': 'Bitte Name, Datum, Stadt und einen 2-stelligen Ländercode ausfüllen.',

  'profile.title': 'Profil',
  'profile.name': 'Name',
  'profile.email': 'E-Mail',
  'profile.club': 'Verein',
  'profile.language': 'Sprache',
  'profile.save': 'Profil speichern',
  'profile.saved': 'Gespeichert!',
  'profile.localNote': 'Deine Anmeldungen und Resultate sind in deinem Konto gespeichert, also auf jedem Handy sicher.',

  'common.cancel': 'Abbrechen',
  'auth.title': 'Willkommen bei Sportsapp',
  'auth.subtitle': 'Melde dich an, um dich für Events anzumelden und deine Resultate zu tracken.',
  'auth.signIn': 'Einloggen',
  'auth.signUp': 'Konto erstellen',
  'auth.toSignUp': 'Neu hier? Konto erstellen',
  'auth.toSignIn': 'Schon ein Konto? Einloggen',
  'auth.name': 'Dein Name',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort (mindestens 8 Zeichen)',
  'auth.required': 'Bitte zuerst einloggen.',
  'auth.signOut': 'Ausloggen',
  'auth.signedInAs': 'Eingeloggt als {email}',
  'register.firstName': 'Vorname',
  'register.lastName': 'Nachname',
  'register.category': 'Kategorie',
  'register.loginFirst': 'Zum Anmelden einloggen',
  'comp.upcoming': 'Kommend',
  'comp.addResult': 'Resultat eintragen',
  'newEvent.categories': 'Kategorien, mit Komma getrennt (z.B. 5 km, 10 km)',
  'common.error': 'Da ist etwas schiefgelaufen. Bitte versuch es nochmal.',

  'sport.running': 'Laufen',
  'sport.cycling': 'Radsport',
  'sport.triathlon': 'Triathlon',
  'sport.swimming': 'Schwimmen',
  'sport.football': 'Fussball',
  'sport.tennis': 'Tennis',
  'sport.basketball': 'Basketball',
  'sport.skiing': 'Ski',
  'sport.other': 'Andere',
};

export const LANGUAGES = { en: 'English', de: 'Deutsch' } as const;
export type Language = keyof typeof LANGUAGES;

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, de };

/** English is the default; German if the phone is set to German. */
export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'de' ? 'de' : 'en';
}

/** Two-letter country of the phone, used to show nearby events first. */
export function deviceCountry(): string | undefined {
  return getLocales()[0]?.regionCode ?? undefined;
}

export function translate(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = dictionaries[lang][key] ?? en[key];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }
  return text;
}

export function sportLabel(lang: Language, sport: Sport, sportName?: string): string {
  if (sport === 'other' && sportName) return sportName;
  return translate(lang, `sport.${sport}` as TranslationKey);
}

/** Country name in the app language, from a 2-letter code. Falls back to the given name. */
export function countryName(lang: Language, code: string, fallback = code): string {
  if (!code) return fallback;
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

export function formatDate(lang: Language, iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toDate(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
}

/** Parts for a ticket-style date block, e.g. { weekday: "Sat", day: "14", month: "Nov" }. */
export function dateParts(lang: Language, iso: string) {
  const date = toDate(iso);
  const locale = lang === 'de' ? 'de-CH' : 'en-GB';
  if (Number.isNaN(date.getTime())) return { weekday: '', day: '?', month: '' };
  return {
    weekday: date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', ''),
    day: String(date.getDate()),
    month: date.toLocaleDateString(locale, { month: 'short' }).replace('.', ''),
  };
}

/** Whole days from today until the event (0 = today). */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = toDate(iso.slice(0, 10));
  day.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

/** "Today", "Tomorrow" or "In 12 days". */
export function countdownLabel(lang: Language, iso: string): string {
  const days = daysUntil(iso);
  if (days <= 0) return translate(lang, 'when.today');
  if (days === 1) return translate(lang, 'when.tomorrow');
  return translate(lang, 'when.inDays', { count: days });
}
