import type { Sport, SportEvent } from './types';

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
