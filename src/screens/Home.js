import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Page from '../components/Page.js'
import Row from '../components/Row.js'
import Icon from '../components/Icon.js'
import Time from '../components/Time.js'
import EmptyState from '../components/EmptyState.js'
import { colors, spacing } from '../theme.js'
import { won } from '../utils/format.js'
import { needsAttention } from '../domain/subscription.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

function Panel({ title, count, sub, onSeeAll, children }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <View style={{ flex: 1 }}>
          <View style={styles.panelTitleRow}>
            <Text style={styles.panelTitle}>{title}</Text>
            {count !== null && <Text style={styles.panelCount}>{count}</Text>}
          </View>
          <Text style={styles.panelSub}>{sub}</Text>
        </View>
        <Pressable onPress={onSeeAll}><Text style={styles.seeAll}>전체 보기 →</Text></Pressable>
      </View>
      {children}
    </View>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const { items, summary } = useSubscriptions()
  const now = new Date()
  const need = items.filter((x) => needsAttention(x, now))
  const upcoming = [...items].sort((a, b) => a.billingDay - b.billingDay)
  const upcomingDiffs = items.map((x) => x.billingDay - now.getDate()).filter((d) => d >= 0)
  const earliestD = upcomingDiffs.length ? Math.min(...upcomingDiffs) : null
  const open = (id) => navigation.navigate('Detail', { id })
  const goAdd = () => navigation.navigate('Add')
  const goToDecisions = () => navigation.navigate('MainTabs', { screen: 'Decisions' })
  const goToCalendar = () => navigation.navigate('MainTabs', { screen: 'Calendar' })

  return (
    <Page
      eyebrow="2026년 9월"
      title="안녕하세요, 건호님 👋"
      sub="이번 달 구독 현황이에요"
      right={<Pressable style={styles.addButton} onPress={goAdd}><Text style={styles.addButtonText}>＋ 새 구독 등록</Text></Pressable>}
    >
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>이번 달 총 구독 비용</Text>
        <View style={styles.heroAmountRow}>
          <Text style={styles.heroAmount}>{won(summary.currentCost)}</Text>
          <Text style={styles.heroUnit}>/ 월</Text>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroFoot}>
          <Text style={styles.heroFootText}>구독 {items.length}개{earliestD !== null ? ` · 가장 이른 결제 D-${earliestD}` : ''}</Text>
          <Text style={styles.heroSave}>해지 후보 반영 시 {won(summary.projectedCost)}</Text>
        </View>
      </View>

      <Panel title="검토가 필요해요" count={need.length} sub="내 사용 패턴에 맞는지 확인해 보세요." onSeeAll={goToDecisions}>
        {items.length === 0
          ? <EmptyState text="아직 등록된 구독이 없어요." cta="첫 구독 등록하기" onAction={goAdd} />
          : need.length === 0
            ? <Text style={styles.empty}>지금은 확인할 게 없어요.</Text>
            : need.map((x) => <Row key={x.id} item={x} open={open} />)}
      </Panel>

      <Panel title="다가오는 결제일" count={null} sub="결제일 전에 미리 확인해요." onSeeAll={goToCalendar}>
        {items.length === 0
          ? <EmptyState text="등록하면 결제일을 여기서 확인할 수 있어요." />
          : upcoming.map((x) => (
            <Pressable key={x.id} style={styles.upcomingRow} onPress={() => open(x.id)}>
              <Time item={x} />
              <Icon item={x} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upcomingName}>{x.name}</Text>
                <Text style={styles.upcomingCost}>{won(x.monthlyCost)} / 월</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
      </Panel>
    </Page>
  )
}

const styles = StyleSheet.create({
  addButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  hero: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: spacing.xl, marginBottom: spacing.xl },
  heroLabel: { fontSize: 12, color: colors.inkSecondary },
  heroAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginVertical: spacing.sm },
  heroAmount: { fontSize: 32, fontWeight: '700', color: colors.ink },
  heroUnit: { fontSize: 14, color: colors.inkSecondary },
  heroDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  heroFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  heroFootText: { fontSize: 12, color: colors.inkSecondary },
  heroSave: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  panel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.xl, marginBottom: spacing.lg },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  panelTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  panelCount: { fontSize: 12, color: colors.accent, backgroundColor: colors.accentSoft, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 7, overflow: 'hidden' },
  panelSub: { fontSize: 12, color: colors.faint },
  seeAll: { fontSize: 12, fontWeight: '700', color: colors.accent },
  empty: { fontSize: 13, color: '#AAAAAA' },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  upcomingName: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  upcomingCost: { fontSize: 12, color: colors.inkSecondary },
  chevron: { fontSize: 18, color: '#AAAAAA' },
})
