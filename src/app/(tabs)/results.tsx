import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, ScreenTitle, SPORT_ICONS } from '../../components/ui';
import { sortByDate } from '../../lib/events';
import { formatDate, sportLabel } from '../../lib/i18n';
import { useApp } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

export default function ResultsScreen() {
  const { competitions, language, t } = useApp();

  const list = useMemo(() => sortByDate(competitions).reverse(), [competitions]);

  const stats = useMemo(() => {
    const places = competitions.map((c) => c.place).filter((p): p is number => typeof p === 'number' && p > 0);
    return {
      count: competitions.length,
      podiums: places.filter((p) => p <= 3).length,
      best: places.length ? Math.min(...places) : undefined,
    };
  }, [competitions]);

  const header = (
    <View>
      <ScreenTitle title={t('comp.title')} subtitle={t('comp.subtitle')} />
      <View style={styles.stats}>
        <Stat label={t('comp.stats.count')} value={String(stats.count)} />
        <Stat label={t('comp.stats.podiums')} value={String(stats.podiums)} />
        <Stat label={t('comp.stats.best')} value={stats.best ? `#${stats.best}` : '–'} />
      </View>
      <View style={styles.addWrap}>
        <Button label={t('comp.add')} icon="plus" onPress={() => router.push('/competition/edit')} />
      </View>
    </View>
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
          <Pressable
            onPress={() => router.push({ pathname: '/competition/edit', params: { id: item.id } })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.rowIcon}>
              <Icon name={SPORT_ICONS[item.sport]} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {formatDate(language, item.date)} · {sportLabel(language, item.sport)}
                {item.location ? ` · ${item.location}` : ''}
              </Text>
              {item.result ? <Text style={styles.rowResult}>{item.result}</Text> : null}
            </View>
            {item.place ? (
              <View style={[styles.place, item.place <= 3 && styles.podium]}>
                <Text style={[styles.placeText, item.place <= 3 && { color: '#fff' }]}>#{item.place}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  stats: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2, textAlign: 'center' },
  addWrap: { margin: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  rowMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  rowResult: { fontSize: 14, color: colors.ink, marginTop: 4, fontWeight: '600' },
  place: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
  },
  podium: { backgroundColor: colors.primary },
  placeText: { fontWeight: '800', color: colors.primaryDark },
});
