export type Sport =
  | 'running'
  | 'cycling'
  | 'triathlon'
  | 'swimming'
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'skiing'
  | 'other';

export const SPORTS: Sport[] = [
  'running',
  'cycling',
  'triathlon',
  'swimming',
  'football',
  'tennis',
  'basketball',
  'skiing',
  'other',
];

/** Where an event comes from. "app" events live in our database and can be joined in the app. */
export type EventSource = 'app' | 'ticketmaster';

export interface SportEvent {
  id: string;
  title: string;
  sport: Sport;
  /** Sport name as written by the organiser, e.g. "Padel". Shown when sport is "other". */
  sportName?: string;
  /** ISO date string (YYYY-MM-DD or full ISO timestamp). */
  date: string;
  city: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "CH". */
  countryCode: string;
  country: string;
  organizer: string;
  description: string;
  imageUrl?: string;
  /** Price text as shown to the user, e.g. "CHF 45". */
  price?: string;
  /** Start categories, e.g. ["10 km", "21 km"]. Athletes pick one when they sign up. */
  categories?: string[];
  capacity?: number;
  source: EventSource;
  /** Link to the organiser's page. Used for events that can't be joined in the app. */
  externalUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  /** The event, so My Race still works if the feed changes. */
  event: SportEvent;
  category?: string;
  /** "registered" = joined in the app, "saved" = external event the user saved. */
  status: 'registered' | 'saved';
  createdAt: string;
}

export interface Competition {
  id: string;
  title: string;
  sport: Sport;
  sportName?: string;
  date: string;
  location: string;
  club: string;
  /** Free text result, e.g. "42:13" or "3-1 win". */
  result: string;
  /** Final rank, if there is one. */
  place?: number;
  notes: string;
  /** Set when the competition was created by signing up for an event in the app. */
  registrationId?: string;
}

export interface Profile {
  name: string;
  email: string;
  club: string;
}
