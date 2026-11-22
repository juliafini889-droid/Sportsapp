/**
 * Design tokens: "Night race".
 *
 * A deep navy night sky, with one hot start-signal orange for everything you can act on
 * and an electric blue for sport and info details. Type is the system font (SF Pro on iPhone),
 * on the Apple text-style scale. Only big titles get the heavy italic "race" treatment.
 */
export const colors = {
  /** Screen background. */
  background: '#071430',
  /** Cards, inputs, tab bar. */
  card: '#0F2247',
  /** Pressed or highlighted surfaces, image placeholders. */
  raised: '#17305E',
  /** Hairlines between surfaces. */
  border: '#1F3766',

  /** Start-signal orange: the one colour for actions. */
  primary: '#FF6A3D',
  /** Orange that is readable as text on navy. */
  primaryDark: '#FF9472',
  /** Soft orange wash for secondary buttons and selected states. */
  primarySoft: 'rgba(255, 106, 61, 0.16)',
  /** Text and icons placed on the orange. */
  onPrimary: '#071430',

  /** Electric blue for sport labels, links and info icons. */
  electric: '#5B9BFF',
  electricSoft: 'rgba(91, 155, 255, 0.16)',

  ink: '#EEF3FF',
  muted: '#93A5C8',

  success: '#3DDC97',
  successSoft: 'rgba(61, 220, 151, 0.16)',
  danger: '#FF6B7A',
  dangerSoft: 'rgba(255, 107, 122, 0.16)',

  gold: '#FFC94D',
  silver: '#C9D4E8',
  bronze: '#E09A62',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** Apple text styles (default "Large" Dynamic Type size). */
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.6 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '500' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

/** Apple's minimum touch target. */
export const HIT = 44;

/** Shared motion timing, so every animation feels like one family. */
export const motion = {
  spring: { friction: 7, tension: 140 },
  enter: 420,
  stagger: 55,
};
