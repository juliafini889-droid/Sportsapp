import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ColorValue, type TextInputProps } from 'react-native';

import { dateParts, type Language } from '../lib/i18n';
import { colors, HIT, radius, spacing, type } from '../lib/theme';
import type { Sport } from '../lib/types';
import { haptic, PressableScale } from './motion';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const SPORT_ICONS: Record<Sport, IconName> = {
  running: 'run-fast',
  cycling: 'bike-fast',
  triathlon: 'medal-outline',
  swimming: 'swim',
  football: 'soccer',
  tennis: 'tennis',
  basketball: 'basketball',
  skiing: 'ski',
  other: 'trophy-outline',
};

/**
 * iOS-style glyphs. Callers keep using the familiar names; where Ionicons (drawn to match
 * Apple's SF Symbols) has an equivalent we show that, otherwise the original icon.
 */
const IOS_GLYPHS: Partial<Record<IconName, ComponentProps<typeof Ionicons>['name']>> = {
  'compass-outline': 'compass-outline',
  compass: 'compass',
  'ticket-confirmation-outline': 'ticket-outline',
  'ticket-confirmation': 'ticket',
  podium: 'podium-outline',
  'podium-gold': 'podium',
  'account-circle-outline': 'person-circle-outline',
  'account-circle': 'person-circle',
  plus: 'add',
  magnify: 'search',
  'map-marker-outline': 'location-outline',
  'calendar-blank-outline': 'calendar-outline',
  'check-circle': 'checkmark-circle',
  check: 'checkmark',
  'chevron-right': 'chevron-forward',
  'close-circle': 'close-circle',
  'wifi-off': 'cloud-offline-outline',
  'trash-can-outline': 'trash-outline',
  'open-in-new': 'open-outline',
  'lightning-bolt': 'flash',
  'flag-checkered': 'flag',
  'bookmark-outline': 'bookmark-outline',
  'account-group-outline': 'people-outline',
  cash: 'cash-outline',
  medal: 'medal',
  'medal-outline': 'medal-outline',
  'check-decagram': 'checkmark-done-circle',
  'trophy-outline': 'trophy-outline',
  'bike-fast': 'bicycle',
  swim: 'water',
  soccer: 'football',
  tennis: 'tennisball',
  basketball: 'basketball',
  ski: 'snow',
};

export function Icon({ name, size = 18, color = colors.ink }: { name: IconName; size?: number; color?: ColorValue }) {
  const ios = IOS_GLYPHS[name];
  if (ios) return <Ionicons name={ios} size={size} color={color as string} />;
  return <MaterialCommunityIcons name={name} size={size} color={color as string} />;
}

/** Apple-style large title at the top of a tab, with an optional button on the right. */
export function ScreenTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.titleWrap}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Heading above a group of content, with an optional small action on the right. */
export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && !active && styles.chipPressed]}
    >
      {icon ? <Icon name={icon} size={16} color={active ? colors.onPrimary : colors.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

const BUTTON_PALETTE: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  success: { bg: colors.successSoft, fg: colors.success },
  ghost: { bg: 'transparent', fg: colors.ink, border: colors.border },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
}) {
  const palette = BUTTON_PALETTE[variant];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hapticKind={variant === 'primary' ? 'medium' : 'light'}
      style={[
        styles.button,
        { backgroundColor: palette.bg, opacity: disabled && variant !== 'success' ? 0.45 : 1 },
        palette.border ? { borderWidth: 1, borderColor: palette.border } : null,
      ]}
    >
      {icon ? <Icon name={icon} color={palette.fg} size={20} /> : null}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </PressableScale>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        keyboardAppearance="dark"
        accessibilityLabel={label}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({ icon, text, action }: { icon: IconName; text: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={styles.emptyText}>{text}</Text>
      {action}
    </View>
  );
}

/** Ticket-stub date: weekday, big day number, month. The visual anchor of every event row. */
export function DateBlock({ lang, iso, size = 'md' }: { lang: Language; iso: string; size?: 'md' | 'lg' }) {
  const { weekday, day, month } = dateParts(lang, iso);
  const big = size === 'lg';
  return (
    <View style={[styles.dateBlock, big && styles.dateBlockLg]} accessible={false}>
      <Text style={styles.dateWeekday}>{weekday}</Text>
      <Text style={[styles.dateDay, big && { fontSize: 30, lineHeight: 34 }]}>{day}</Text>
      <Text style={styles.dateMonth}>{month}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { ...type.largeTitle, color: colors.ink, flexShrink: 1 },
  subtitle: { ...type.subhead, color: colors.muted, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.title2, color: colors.ink },
  sectionDetail: { ...type.footnote, color: colors.muted },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    marginRight: spacing.sm,
  },
  chipPressed: { opacity: 0.7 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...type.subhead, color: colors.ink, fontWeight: '500' },
  chipTextActive: { color: colors.onPrimary, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
  },
  buttonText: { ...type.headline },
  field: { marginBottom: spacing.md },
  label: { ...type.footnote, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  input: {
    minHeight: HIT,
    backgroundColor: colors.fill,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { ...type.callout, color: colors.muted, textAlign: 'center', maxWidth: 300 },
  dateBlock: {
    width: 56,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.raised,
    alignItems: 'center',
  },
  dateBlockLg: { width: 68, paddingVertical: 10 },
  dateWeekday: { ...type.caption, color: colors.primaryDark },
  dateDay: { fontSize: 24, lineHeight: 28, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
  dateMonth: { ...type.caption, color: colors.muted },
});
