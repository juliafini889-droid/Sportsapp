import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '../../components/AuthForm';
import { Enter, PressableScale } from '../../components/motion';
import { Button, EmptyState, Icon, ScreenTitle, SPORT_ICONS } from '../../components/ui';
import { isUpcoming, sortByDate } from '../../lib/events';
import { formatDate, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing, type } from '../../lib/theme';

const MEDAL = [colors.gold, colors.silver, colors.bronze];

export default function ResultsScreen() {
  const { user, competitions, language, t } = useApp();

  const list = useMemo(() => sortByDate(competitions).reverse(), [competitions]);

  const stats = useMemo(() => {
    const places = competitions.map((c) => c.place).filter((p): p is number => typeof p === 'number' && p > 0);
    return {
      count: competitions.length,
      podiums: places.filter((p) => p <= 3).length,
      best: places.length ? Math.min(...places) : undefined,
    };
  }, [competitions]);

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <AuthForm />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const header = (
    <Enter>
      <ScreenTitle title={t('comp.title')} subtitle={t('comp.subtitle')} />
      <View style={styles.stats}>
        <Stat label={t('comp.stats.count')} value={String(stats.count)} />
        <View style={styles.statDivider} />
        <Stat label={t('comp.stats.podiums')} value={String(stats.podiums)} />
        <View style={styles.statDivider} />
        <Stat label={t('comp.stats.best')} value={stats.best ? `#${stats.best}` : '–'} highlight={!!stats.best && stats.best <= 3} />
      </View>
      <View style={styles.addWrap}>
        <Button label={t('comp.add')} icon="plus" onPress={() => router.push('/competition/edit')} />
      </View>
    </Enter>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState icon="podium" text={t('comp.empty')} />}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <PressableScale
            onPress={() => router.push({ pathname: '/competition/edit', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={[item.title, formatDate(language, item.date), item.result, item.place ? `#${item.place}` : '']
              .filter(Boolean)
              .join(', ')}
            style={styles.row}
          >
            <View style={styles.rowIcon}>
              <Icon name={SPORT_ICONS[item.sport]} size={24} color={colors.electric} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {formatDate(language, item.date)} · {sportLabel(language, item.sport, item.sportName)}
                {item.location ? ` · ${item.location}` : ''}
              </Text>
              {item.result ? (
                <Text style={styles.rowResult}>{item.result}</Text>
              ) : (
                <Text style={styles.rowHint}>{isUpcoming(item.date) ? t('comp.upcoming') : t('comp.addResult')}</Text>
              )}
            </View>
            {item.place ? (
              <View style={[styles.place, item.place <= 3 && { backgroundColor: MEDAL[item.place - 1] }]}>
                {item.place <= 3 ? <Icon name="medal" size={14} color={colors.onPrimary} /> : null}
                <Text style={[styles.placeText, item.place <= 3 && { color: colors.onPrimary }]}>#{item.place}</Text>
              </View>
            ) : null}
          </PressableScale>
        )}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.statValue, highlight && { color: colors.gold }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
  },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.separator },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  statValue: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { ...type.caption, color: colors.muted, marginTop: 2, textAlign: 'center' },
  addWrap: { margin: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.electricSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { ...type.headline, color: colors.ink },
  rowMeta: { ...type.footnote, color: colors.muted, marginTop: 2 },
  rowHint: { ...type.footnote, color: colors.primaryDark, marginTop: 4, fontWeight: '700' },
  rowResult: { ...type.subhead, color: colors.ink, marginTop: 4, fontWeight: '700', fontVariant: ['tabular-nums'] },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.raised,
  },
  placeText: { fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
});
