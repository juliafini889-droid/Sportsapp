import type { Sport, SportEvent } from './types';

/**
 * Demo events published "in the app" by clubs and organisers.
 * They are made up so the feed looks alive before real organisers join.
 */
export const DEMO_EVENTS: SportEvent[] = [
  {
    id: 'demo-zurich-lake-run',
    title: 'Lake Zurich Sunrise Run 10K',
    sport: 'running',
    date: '2027-04-18',
    city: 'Zürich',
    countryCode: 'CH',
    country: 'Switzerland',
    organizer: 'LC Seebach (demo)',
    description: 'Flat 10K along the lake at sunrise. All levels welcome, finisher medal included.',
    price: 'CHF 45',
    source: 'app',
  },
  {
    id: 'demo-alpine-tri',
    title: 'Alpine Sprint Triathlon',
    sport: 'triathlon',
    date: '2027-06-27',
    city: 'Interlaken',
    countryCode: 'CH',
    country: 'Switzerland',
    organizer: 'Tri Club Berner Oberland (demo)',
    description: '750 m swim, 20 km bike, 5 km run with mountain views. Relay teams possible.',
    price: 'CHF 89',
    source: 'app',
  },
  {
    id: 'demo-berlin-night-ride',
    title: 'Berlin Night Ride 60',
    sport: 'cycling',
    date: '2027-05-22',
    city: 'Berlin',
    countryCode: 'DE',
    country: 'Germany',
    organizer: 'RSV Spree (demo)',
    description: 'A 60 km group ride through the city at night. Lights required!',
    price: 'EUR 25',
    source: 'app',
  },
  {
    id: 'demo-munich-5k',
    title: 'Englischer Garten Charity 5K',
    sport: 'running',
    date: '2027-03-14',
    city: 'München',
    countryCode: 'DE',
    country: 'Germany',
    organizer: 'TSV Schwabing (demo)',
    description: 'Fun run for a good cause. Kids race at 10:00, main race at 11:00.',
    source: 'app',
  },
  {
    id: 'demo-vienna-swim',
    title: 'Danube Open Water 2K',
    sport: 'swimming',
    date: '2027-07-10',
    city: 'Wien',
    countryCode: 'AT',
    country: 'Austria',
    organizer: 'SC Donau (demo)',
    description: 'Open water swim in the Old Danube. Wetsuits allowed below 24 °C.',
    price: 'EUR 35',
    source: 'app',
  },
  {
    id: 'demo-london-futsal',
    title: 'London Futsal Cup',
    sport: 'football',
    date: '2027-02-06',
    city: 'London',
    countryCode: 'GB',
    country: 'United Kingdom',
    organizer: 'East London Futsal League (demo)',
    description: 'One-day 5-a-side tournament for amateur teams. Sign up as a team captain.',
    price: 'GBP 120 per team',
    source: 'app',
  },
  {
    id: 'demo-nyc-hoops',
    title: 'Brooklyn 3x3 Hoops Classic',
    sport: 'basketball',
    date: '2027-08-14',
    city: 'New York',
    countryCode: 'US',
    country: 'United States',
    organizer: 'BK Hoops Collective (demo)',
    description: 'Outdoor 3x3 streetball tournament with open, women and U18 divisions.',
    price: 'USD 60 per team',
    source: 'app',
  },
  {
    id: 'demo-sydney-ocean',
    title: 'Bondi Ocean Mile',
    sport: 'swimming',
    date: '2027-01-24',
    city: 'Sydney',
    countryCode: 'AU',
    country: 'Australia',
    organizer: 'Bondi Swim Squad (demo)',
    description: 'A one-mile ocean swim along the beach. Surf lifesavers on site.',
    price: 'AUD 50',
    source: 'app',
  },
  {
    id: 'demo-st-moritz-xc',
    title: 'Engadin Night Cross-Country',
    sport: 'skiing',
    date: '2027-01-30',
    city: 'St. Moritz',
    countryCode: 'CH',
    country: 'Switzerland',
    organizer: 'Skiclub Engadin (demo)',
    description: '15 km classic cross-country race under floodlights.',
    price: 'CHF 55',
    source: 'app',
  },
  {
    id: 'demo-paris-tennis',
    title: 'Paris Amateur Clay Open',
    sport: 'tennis',
    date: '2027-05-08',
    city: 'Paris',
    countryCode: 'FR',
    country: 'France',
    organizer: 'TC Paris 15 (demo)',
    description: 'Singles and doubles for amateur players, grouped by level.',
    price: 'EUR 40',
    source: 'app',
  },
];

const TICKETMASTER_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;

export function hasTicketmasterKey(): boolean {
  return Boolean(TICKETMASTER_KEY);
}

function mapGenreToSport(genre?: string): Sport {
  const g = (genre ?? '').toLowerCase();
  if (g.includes('soccer') || g.includes('football')) return 'football';
  if (g.includes('basketball')) return 'basketball';
  if (g.includes('tennis')) return 'tennis';
  if (g.includes('cycling')) return 'cycling';
  if (g.includes('swim')) return 'swimming';
  if (g.includes('ski')) return 'skiing';
  if (g.includes('triathlon')) return 'triathlon';
  if (g.includes('running') || g.includes('athletics') || g.includes('marathon')) return 'running';
  return 'other';
}

/* Minimal shape of the Ticketmaster Discovery API response that we read. */
interface TmEvent {
  id: string;
  name: string;
  url?: string;
  info?: string;
  images?: { url: string; width: number }[];
  dates?: { start?: { localDate?: string; dateTime?: string } };
  classifications?: { genre?: { name?: string } }[];
  priceRanges?: { min?: number; currency?: string }[];
  promoter?: { name?: string };
  _embedded?: {
    venues?: { city?: { name?: string }; country?: { name?: string; countryCode?: string } }[];
  };
}

/**
 * Loads upcoming sport events from the Ticketmaster Discovery API.
 * Needs EXPO_PUBLIC_TICKETMASTER_API_KEY (free key from developer.ticketmaster.com).
 */
export async function fetchTicketmasterEvents(countryCode?: string): Promise<SportEvent[]> {
  if (!TICKETMASTER_KEY) return [];
  const params = new URLSearchParams({
    apikey: TICKETMASTER_KEY,
    classificationName: 'Sports',
    size: '50',
    sort: 'date,asc',
  });
  if (countryCode) params.set('countryCode', countryCode);

  const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
  if (!res.ok) throw new Error(`Ticketmaster responded ${res.status}`);
  const json = (await res.json()) as { _embedded?: { events?: TmEvent[] } };

  return (json._embedded?.events ?? []).map((e): SportEvent => {
    const venue = e._embedded?.venues?.[0];
    const price = e.priceRanges?.[0];
    const image = [...(e.images ?? [])].sort((a, b) => b.width - a.width)[0];
    return {
      id: `tm-${e.id}`,
      title: e.name,
      sport: mapGenreToSport(e.classifications?.[0]?.genre?.name),
      date: e.dates?.start?.dateTime ?? e.dates?.start?.localDate ?? '',
      city: venue?.city?.name ?? '',
      countryCode: venue?.country?.countryCode ?? '',
      country: venue?.country?.name ?? '',
      organizer: e.promoter?.name ?? 'Ticketmaster',
      description: e.info ?? '',
      imageUrl: image?.url,
      price: price?.min != null ? `${price.currency ?? ''} ${price.min}`.trim() : undefined,
      source: 'ticketmaster',
      externalUrl: e.url,
    };
  });
}

export function isUpcoming(iso: string): boolean {
  const day = iso.slice(0, 10);
  return day >= new Date().toISOString().slice(0, 10);
}

export function sortByDate<T extends { date: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
