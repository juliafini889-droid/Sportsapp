import { supabase } from './supabase';
import type { Competition, Registration, Sport, SportEvent } from './types';

/* ---------- sport names ---------- */

// The database stores sport names as text (the existing Race Base data uses German names).
const SPORT_ALIASES: Record<Sport, string[]> = {
  running: ['laufen', 'running', 'run', 'trail', 'marathon'],
  cycling: ['radsport', 'velo', 'cycling', 'bike', 'rad'],
  triathlon: ['triathlon'],
  swimming: ['schwimmen', 'swimming', 'swim'],
  football: ['fussball', 'football', 'soccer'],
  tennis: ['tennis'],
  basketball: ['basketball'],
  skiing: ['ski', 'skiing', 'langlauf'],
  other: [],
};

const SPORT_DB_NAME: Record<Sport, string> = {
  running: 'Laufen',
  cycling: 'Radsport',
  triathlon: 'Triathlon',
  swimming: 'Schwimmen',
  football: 'Fussball',
  tennis: 'Tennis',
  basketball: 'Basketball',
  skiing: 'Ski',
  other: 'Andere',
};

export function sportFromDb(name: string | null | undefined): { sport: Sport; sportName?: string } {
  const n = (name ?? '').trim().toLowerCase();
  for (const [sport, aliases] of Object.entries(SPORT_ALIASES) as [Sport, string[]][]) {
    if (aliases.includes(n)) return { sport };
  }
  return { sport: 'other', sportName: name?.trim() || undefined };
}

export function sportToDb(sport: Sport, sportName?: string): string {
  return sport === 'other' && sportName ? sportName : SPORT_DB_NAME[sport];
}

/* ---------- events ---------- */

interface EventRow {
  id: string;
  title: string;
  sport: string;
  description: string;
  starts_at: string;
  location: string;
  price_chf: number | string;
  capacity: number;
  categories: string[];
  country_code: string;
  source: string;
  source_handle: string;
  source_url: string;
  clubs: { name: string } | null;
}

const EVENT_COLUMNS =
  'id,title,sport,description,starts_at,location,price_chf,capacity,categories,country_code,source,source_handle,source_url,clubs(name)';

export function eventFromRow(row: EventRow): SportEvent {
  const price = Number(row.price_chf);
  return {
    id: row.id,
    title: row.title,
    ...sportFromDb(row.sport),
    date: row.starts_at,
    city: row.location,
    countryCode: row.country_code,
    country: row.country_code,
    organizer: row.clubs?.name || row.source_handle || row.source,
    description: row.description,
    price: price > 0 ? `CHF ${price}` : undefined,
    categories: row.categories,
    capacity: row.capacity,
    source: 'app',
    externalUrl: row.source_url || undefined,
  };
}

export async function loadEvents(): Promise<SportEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .gte('starts_at', new Date(Date.now() - 86_400_000).toISOString())
    .order('starts_at');
  if (error) throw error;
  return (data as unknown as EventRow[]).map(eventFromRow);
}

export async function publishEvent(
  userId: string,
  clubName: string,
  e: {
    title: string;
    sport: Sport;
    date: string;
    city: string;
    countryCode: string;
    price: number;
    description: string;
    categories: string[];
  },
): Promise<string> {
  // Events belong to a club. Use the user's club, or create one with the given name.
  const { data: clubs, error: clubError } = await supabase
    .from('clubs')
    .select('id,name')
    .eq('owner_id', userId)
    .limit(1);
  if (clubError) throw clubError;
  let clubId = clubs?.[0]?.id as string | undefined;
  if (!clubId) {
    const { data: club, error } = await supabase
      .from('clubs')
      .insert({ name: clubName, city: e.city, owner_id: userId })
      .select('id')
      .single();
    if (error) throw error;
    clubId = club.id as string;
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: e.title,
      sport: sportToDb(e.sport),
      description: e.description,
      starts_at: new Date(`${e.date}T09:00:00`).toISOString(),
      location: e.city,
      country_code: e.countryCode,
      price_chf: e.price,
      categories: e.categories.length ? e.categories : ['Standard'],
      source: 'club',
      club_id: clubId,
      created_by: userId,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

/* ---------- registrations (My Race) ---------- */

export async function loadRegistrations(userId: string): Promise<Registration[]> {
  const [regs, saved] = await Promise.all([
    supabase
      .from('registrations')
      .select(`id,event_id,category,created_at,events(${EVENT_COLUMNS})`)
      .eq('user_id', userId),
    supabase.from('saved_events').select('id,external_id,event,created_at').eq('user_id', userId),
  ]);
  if (regs.error) throw regs.error;
  if (saved.error) throw saved.error;

  const joined: Registration[] = (
    regs.data as unknown as {
      id: string;
      event_id: string;
      category: string;
      created_at: string;
      events: EventRow | null;
    }[]
  )
    .filter((r) => r.events)
    .map((r) => ({
      id: r.id,
      eventId: r.event_id,
      event: eventFromRow(r.events!),
      category: r.category,
      status: 'registered',
      createdAt: r.created_at,
    }));

  const external: Registration[] = (saved.data ?? []).map((s) => ({
    id: s.id as string,
    eventId: s.external_id as string,
    event: s.event as SportEvent,
    status: 'saved',
    createdAt: s.created_at as string,
  }));

  return [...joined, ...external];
}

export async function register(
  userId: string,
  event: SportEvent,
  details: { firstName: string; lastName: string; email: string; category: string },
) {
  const { error } = await supabase.from('registrations').insert({
    event_id: event.id,
    user_id: userId,
    category: details.category,
    first_name: details.firstName,
    last_name: details.lastName,
    email: details.email,
  });
  if (error) throw error;
}

export async function saveExternal(userId: string, event: SportEvent) {
  const { error } = await supabase
    .from('saved_events')
    .upsert({ user_id: userId, external_id: event.id, event }, { onConflict: 'user_id,external_id' });
  if (error) throw error;
}

export async function removeRegistration(reg: Registration) {
  if (reg.status === 'saved') {
    const { error } = await supabase.from('saved_events').delete().eq('id', reg.id);
    if (error) throw error;
    return;
  }
  // Signing up created a race in My Results. Drop it if it has no result yet, otherwise keep it.
  const drop = await supabase.from('races').delete().eq('registration_id', reg.id).eq('result', '');
  if (drop.error) throw drop.error;
  const unlink = await supabase.from('races').update({ registration_id: null }).eq('registration_id', reg.id);
  if (unlink.error) throw unlink.error;
  const { error } = await supabase.from('registrations').delete().eq('id', reg.id);
  if (error) throw error;
}

/* ---------- accounts ---------- */

export async function signUp(email: string, password: string, fullName: string) {
  // Race Base creates accounts through this database function (no confirmation email needed).
  const { error } = await supabase.rpc('create_account', {
    p_email: email,
    p_password: password,
    p_full_name: fullName,
    p_role: 'athlete',
    p_club_name: '',
    p_club_city: '',
  });
  if (error) throw error;
  await signIn(email, password);
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* ---------- races (My Results) ---------- */

interface RaceRow {
  id: string;
  title: string;
  sport: string;
  kind: string;
  starts_at: string;
  location: string;
  result: string;
  place: number | null;
  club: string;
  notes: string;
  registration_id: string | null;
}

export async function loadCompetitions(userId: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('races')
    .select('id,title,sport,kind,starts_at,location,result,place,club,notes,registration_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as RaceRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    ...sportFromDb(r.sport),
    date: r.starts_at.slice(0, 10),
    location: r.location,
    club: r.club,
    result: r.result,
    place: r.place ?? undefined,
    notes: r.notes,
    registrationId: r.registration_id ?? undefined,
  }));
}

export async function upsertCompetition(userId: string, c: Omit<Competition, 'id'> & { id?: string }) {
  const row = {
    user_id: userId,
    title: c.title,
    sport: sportToDb(c.sport, c.sportName),
    starts_at: new Date(`${c.date}T09:00:00`).toISOString(),
    location: c.location,
    club: c.club,
    result: c.result,
    place: c.place ?? null,
    notes: c.notes,
  };
  const { error } = c.id
    ? await supabase.from('races').update(row).eq('id', c.id)
    : await supabase.from('races').insert({ ...row, kind: 'Verein' });
  if (error) throw error;
}

export async function deleteCompetition(id: string) {
  const { error } = await supabase.from('races').delete().eq('id', id);
  if (error) throw error;
}

/* ---------- profile ---------- */

export async function loadProfile(userId: string, email: string) {
  const [profile, club] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase.from('clubs').select('name').eq('owner_id', userId).limit(1),
  ]);
  return {
    name: (profile.data?.full_name as string | undefined) ?? '',
    email,
    club: (club.data?.[0]?.name as string | undefined) ?? '',
  };
}

export async function saveProfileName(userId: string, name: string) {
  const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', userId);
  if (error) throw error;
}
