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

/** Where an event comes from. */
export type EventSource = 'app' | 'ticketmaster';

export interface SportEvent {
  id: string;
  title: string;
  sport: Sport;
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
  source: EventSource;
  /** Link to the organiser's page. Used for events that can't be joined in the app. */
  externalUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  /** Snapshot of the event, so My Race still works if the feed changes. */
  event: SportEvent;
  name: string;
  email: string;
  /** "registered" = joined in the app, "saved" = external event the user saved. */
  status: 'registered' | 'saved';
  createdAt: string;
}

export interface Competition {
  id: string;
  title: string;
  sport: Sport;
  date: string;
  location: string;
  club: string;
  /** Free text result, e.g. "42:13" or "3-1 win". */
  result: string;
  /** Final rank, if there is one. */
  place?: number;
  notes: string;
}

export interface Profile {
  name: string;
  email: string;
  club: string;
}
