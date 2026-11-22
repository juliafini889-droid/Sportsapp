import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ColorValue, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '../lib/theme';
import type { Sport } from '../lib/types';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const SPORT_ICONS: Record<Sport, IconName> = {
  running: 'run',
  cycling: 'bike',
  triathlon: 'medal',
  swimming: 'swim',
  football: 'soccer',
  tennis: 'tennis',
  basketball: 'basketball',
  skiing: 'ski',
  other: 'trophy-outline',
};

export function Icon({ name, size = 18, color = colors.ink }: { name: IconName; size?: number; color?: ColorValue }) {
  return <MaterialCommunityIcons name={name} size={size} color={color as string} />;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

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
  const palette = {
    primary: { bg: colors.primary, fg: '#fff' },
    secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
    danger: { bg: '#FDECEC', fg: colors.danger },
    success: { bg: colors.successSoft, fg: colors.success },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, opacity: disabled && variant !== 'success' ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {icon ? <Icon name={icon} color={palette.fg} /> : null}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={40} color={colors.primary} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.ink, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#fff' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center' },
});
