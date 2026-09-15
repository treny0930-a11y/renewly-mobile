import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Page from '../components/Page.js'
import Row from '../components/Row.js'
import Icon from '../components/Icon.js'
import Heatmap from '../components/Heatmap.js'
import EmptyState from '../components/EmptyState.js'
import { colors, spacing, radius, hitSlop } from '../theme.js'
import { won } from '../utils/format.js'
import { copy } from '../utils/statusCopy.js'
import { getReviewStaleness } from '../domain/subscription.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

function lastEvaluatedLabel(item, now) {
  if (!item.lastEvaluatedAt) return '평가 기록 없음'
  const days = Math.floor((now - new Date(item.lastEvaluatedAt)) / 86400000)
  if (days <= 0) return '오늘 평가함'
  return `마지막 평가 ${days}일 전`
}

function KpiCard({ items, summary }) {
  const now = new Date()
  const confirmedCount = items.filter((x) => x.decision !== 'review').length
  const reviewCount = items.filter((x) => x.decision === 'review').length
  const upcomingDiffs = items.map((x) => x.billingDay - now.getDate()).filter((d) => d >= 0)
  const earliestD = upcomingDiffs.length ? Math.min(...upcomingDiffs) : null
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHead}>
        <Text style={styles.kpiHeadText}>이번 달 결제 예정</Text>
        {earliestD !== null && <Text style={styles.kpiHeadText}>가장 이른 결제 D-{earliestD}</Text>}
      </View>
      <Text style={styles.kpiAmount}>{won(summary.currentCost)}</Text>
      <View style={styles.kpiPills}>
        <Text style={styles.pillMini}>확정 {confirmedCount}건</Text>
        {reviewCount > 0 && <Text style={[styles.pillMini, styles.pillAccent]}>검토 {reviewCount}건</Text>}
      </View>
    </View>
  )
}

function InsightCard({ item, action }) {
  const isCancel = item.decision === 'cancel'
  const statusColor = item.decision === 'review' ? { color: colors.review, backgroundColor: colors.reviewBg } : { color: colors.keep, backgroundColor: colors.keepBg }
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightRow}>
        <Icon item={item} />
        <View style={{ flex: 1 }}>
          <Text style={styles.insightName}>{item.name}</Text>
          <Text style={styles.insightCategory}>{item.category}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.insightCost}>{won(item.monthlyCost)}</Text>
          <Text style={styles.insightDay}>{item.billingDay}일 결제</Text>
        </View>
      </View>
      <View style={styles.insightFooter}>
        {isCancel
          ? <Text style={styles.insightSave}>해지 시 연 {won(item.monthlyCost * 12)} 절약</Text>
          : <Text style={[styles.status, statusColor]}>{(copy[item.decision] || copy.review)[0]}</Text>}
        <Pressable style={styles.insightCta} hitSlop={hitSlop} onPress={action}><Text style={styles.insightCtaText}>{isCancel ? '해지 검토' : '비교'}</Text></Pressable>
      </View>
    </View>
  )
}

function InsightSection({ items, open, viewSavings }) {
  const cancelItems = items.filter((x) => x.decision === 'cancel')
  const reviewItems = items.filter((x) => x.decision === 'review')
  const picks = [...cancelItems, ...reviewItems].slice(0, 2)
  if (picks.length === 0) return null
  return (
    <View style={styles.insightSection}>
      <Text style={styles.insightSectionTitle}>결정이 필요해요</Text>
      <Text style={styles.insightSectionSub}>사용 패턴을 바탕으로 정리했어요</Text>
      {picks.map((x) => <InsightCard key={x.id} item={x} action={() => (x.decision === 'cancel' ? viewSavings() : open(x.id))} />)}
    </View>
  )
}

function WeekSummary({ items }) {
  const now = new Date()
  const inWeek = items.filter((x) => { const diff = x.billingDay - now.getDate(); return diff >= 0 && diff <= 7 })
  if (inWeek.length === 0) return null
  const total = inWeek.reduce((sum, x) => sum + Number(x.monthlyCost || 0), 0)
  return (
    <View style={styles.weekCard}>
      <View style={styles.weekIcon}><Text>◫</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.weekTitle}>이번 주 결제 예정 {inWeek.length}건</Text>
        <Text style={styles.weekNames} numberOfLines={1}>{inWeek.map((x) => x.name).join(' · ')}</Text>
      </View>
      <Text style={styles.weekTotal}>{won(total)}</Text>
    </View>
  )
}

const STATUS_STYLE = {
  cancel: { color: colors.cancel, backgroundColor: colors.cancelBg },
  review: { color: colors.review, backgroundColor: colors.reviewBg },
  keep: { color: colors.keep, backgroundColor: colors.keepBg },
}

export default function DecisionsScreen() {
  const navigation = useNavigation()
  const { items, summary } = useSubscriptions()
  const open = (id) => navigation.navigate('Detail', { id })
  const viewSavings = () => navigation.navigate('CancelSavings')
  const addNew = () => navigation.navigate('Add')
  const startEdit = (item) => navigation.navigate('DecisionChange', { id: item.id })
  const now = new Date()

  return (
    <Page eyebrow="내 결정 모아보기" title="결정함" sub="구독별로 내린 결정을 확인하고 바꿀 수 있어요.">
      <View style={styles.summary}>
        <View><Text style={styles.summaryLabel}>현재 총비용</Text><Text style={styles.summaryAmount}>{won(summary.currentCost)}</Text></View>
        <Text style={styles.summaryArrow}>→</Text>
        <View>
          <Text style={styles.summaryLabel}>해지후보 반영 시</Text>
          <Text style={styles.summaryAmount}>{won(summary.projectedCost)}</Text>
          <Text style={styles.summarySaving}>월 {won(summary.saving)} 절약</Text>
        </View>
      </View>
      <Pressable onPress={viewSavings} hitSlop={hitSlop}><Text style={styles.link}>절감액 계산 상세 →</Text></Pressable>

      {items.length > 0 && <KpiCard items={items} summary={summary} />}
      {items.length > 0 && <Heatmap items={items} />}
      {items.length > 0 && <InsightSection items={items} open={open} viewSavings={viewSavings} />}
      {items.length > 0 && <WeekSummary items={items} />}

      {items.length === 0 ? (
        <EmptyState text="구독을 등록하면 결정 상태별로 모아볼 수 있어요." cta="첫 구독 등록하기" onAction={addNew} />
      ) : (
        <View>
          {['cancel', 'review', 'keep'].map((key) => {
            const group = items.filter((x) => x.decision === key)
            return (
              <View key={key} style={styles.group}>
                <View style={styles.groupHead}>
                  <Text style={[styles.status, STATUS_STYLE[key]]}>{(copy[key] || copy.review)[0]}</Text>
                  <Text style={styles.groupCount}>{group.length}</Text>
                </View>
                {group.length ? group.map((x) => (
                  <View key={x.id}>
                    <View style={styles.rowWithAction}>
                      <View style={{ flex: 1 }}><Row item={x} open={open} /></View>
                      <Pressable style={styles.pillChange} hitSlop={hitSlop} onPress={() => startEdit(x)}><Text style={styles.pillChangeText}>변경</Text></Pressable>
                    </View>
                    {key === 'review' && (
                      <Text style={getReviewStaleness(x, now) ? styles.staleBadge : styles.lastEvaluated}>{lastEvaluatedLabel(x, now)}</Text>
                    )}
                  </View>
                )) : <Text style={styles.empty}>아직 없어요.</Text>}
              </View>
            )
          })}
        </View>
      )}
      {items.length > 0 && (
        <Pressable style={styles.addInline} onPress={addNew}><Text style={styles.addInlineText}>＋ 구독 추가</Text></Pressable>
      )}
    </Page>
  )
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.sm },
  summaryLabel: { fontSize: 12, color: colors.inkSecondary },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 4 },
  summaryArrow: { color: '#AFB0BF' },
  summarySaving: { fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 2 },
  link: { color: colors.accent, fontSize: 13, marginBottom: spacing.lg },
  kpiCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.xl, marginVertical: spacing.md },
  kpiHead: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiHeadText: { fontSize: 13, color: colors.inkSecondary },
  kpiAmount: { fontSize: 30, fontWeight: '700', color: colors.ink, marginVertical: spacing.sm },
  kpiPills: { flexDirection: 'row', gap: spacing.sm },
  pillMini: { backgroundColor: colors.neutralBg, color: colors.neutralText, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, fontSize: 11, fontWeight: '600', overflow: 'hidden' },
  pillAccent: { backgroundColor: colors.accentSoft, color: colors.accent },
  insightSection: { marginVertical: spacing.md },
  insightSectionTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  insightSectionSub: { fontSize: 12, color: colors.inkSecondary, marginBottom: spacing.sm },
  insightCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  insightName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  insightCategory: { fontSize: 12, color: colors.inkSecondary },
  insightCost: { fontSize: 14, fontWeight: '600', color: colors.ink },
  insightDay: { fontSize: 11, color: colors.inkSecondary },
  insightFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md },
  insightSave: { fontSize: 12, color: colors.keep },
  insightCta: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  insightCtaText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  weekCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.lg },
  weekIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.neutralBg, alignItems: 'center', justifyContent: 'center' },
  weekTitle: { fontSize: 14, fontWeight: '600', color: colors.ink },
  weekNames: { fontSize: 12, color: colors.inkSecondary },
  weekTotal: { fontSize: 14, fontWeight: '600', color: colors.ink },
  group: { marginBottom: spacing.xl },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.sm },
  groupCount: { fontSize: 12, color: colors.accent, backgroundColor: colors.accentSoft, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 7, overflow: 'hidden' },
  status: { fontSize: 11, fontWeight: '700', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, overflow: 'hidden' },
  rowWithAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pillChange: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 10 },
  pillChangeText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  staleBadge: { backgroundColor: colors.reviewBg, color: colors.review, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, fontSize: 12, alignSelf: 'flex-start', marginVertical: spacing.sm, overflow: 'hidden' },
  lastEvaluated: { color: colors.inkSecondary, fontSize: 12, marginVertical: spacing.xs },
  empty: { fontSize: 13, color: '#AAAAAA' },
  addInline: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.accent, borderStyle: 'dashed', borderRadius: 12, padding: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  addInlineText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
})
