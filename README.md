# Sportsapp

A mobile app that brings the sports bubble together, for athletes all over the world.

1. **Discover**: one feed with sport events from everywhere, filterable by sport and country. Events in your own country come first.
2. **Sign up and My Race**: sign up for events directly in the app. All your sign-ups land in the **My Race** folder.
3. **My Results**: track the competitions you do with your club (result, place, notes) and see your stats.

Clubs and organisers can publish their own events in the app (**Add your event**).

The app is in English and German. It follows the phone's language and can be switched in the profile.

## Run it on your phone

1. Install [Node.js](https://nodejs.org) (version 20 or newer).
2. Install the **Expo Go** app on your iPhone or Android phone.
3. In this folder run:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code with your phone camera (iPhone) or with Expo Go (Android).

## Ticketmaster events (optional)

Without a key the feed shows the demo events and events published in the app.
To add real sport events from Ticketmaster:

1. Get a free API key at <https://developer.ticketmaster.com>.
2. Create a file `.env.local` next to `package.json`:

   ```
   EXPO_PUBLIC_TICKETMASTER_API_KEY=your-key-here
   ```

3. Restart `npx expo start`.

Ticketmaster events can't be joined inside the app yet. The app links to the ticket page and lets you save the event in My Race.

## What this first version does not do yet

- **Accounts and sync**: all data is stored on the phone only (AsyncStorage). The next step is a backend (planned: Supabase) so sign-ups reach the organisers and published events are visible to everyone.
- **Payments** for paid events.
- **Partner sign-ups** with platforms like Ticketmaster.
- **Computer version**: Expo can run the same app in the browser later (`npx expo start --web`).

## Code structure

```
src/app/            screens (Expo Router, every file is a route)
  (tabs)/           Discover, My Race, My Results, Profile
  event/[id].tsx    event details and sign-up
  event/new.tsx     publish an event
  competition/      add or edit a competition
src/components/     shared UI
src/lib/            data, translations, storage, Ticketmaster client
```

Checks: `npx tsc --noEmit`
