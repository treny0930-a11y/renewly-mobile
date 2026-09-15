import { View, Text, StyleSheet } from 'react-native'
import Page from '../components/Page.js'
import { colors, spacing } from '../theme.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const ICONS = {
  billing: { bg: colors.accentSoft, color: colors.accent, glyph: '₩' },
  stale: { bg: colors.reviewBg, color: colors.review, glyph: '↻' },
  register: { bg: colors.keepBg, color: colors.keep, glyph: '＋' },
  'billing-edit': { bg: colors.neutralBg, color: colors.neutralText, glyph: '✓' },
}
const DECISION_BG = { cancel: colors.cancelBg, review: colors.reviewBg, keep: colors.keepBg }
const DECISION_COLOR = { cancel: colors.cancel, review: colors.review, keep: colors.keep }

function iconFor(entry) {
  if (entry.type === 'decision') {
    return { bg: DECISION_BG[entry.decision] || colors.neutralBg, color: DECISION_COLOR[entry.decision] || colors.neutralText, glyph: entry.initial || '•' }
  }
  return ICONS[entry.type] || { bg: colors.neutralBg, color: colors.neutralText, glyph: '•' }
}

function relativeTime(at) {
  const diffMs = Date.now() - new Date(at).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

function NotifRow({ entry, isLast }) {
  const icon = iconFor(entry)
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={[styles.icon, { backgroundColor: icon.bg }]}><Text style={{ color: icon.color, fontWeight: '700' }}>{icon.glyph}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowText}>{entry.text}</Text>
        {entry.sub ? <Text style={styles.rowSub}>{entry.sub}</Text> : null}
        <Text style={styles.rowTime}>{relativeTime(entry.at)}</Text>
      </View>
    </View>
  )
}

export default function NotificationsScreen() {
  const { notifGroups } = useSubscriptions()
  const order = ['오늘', '이번 주', '지난 7일']
  const keyFor = { 오늘: '오늘', '이번 주': '지난 7일', '지난 7일': '지난주' }
  const hasAny = Object.values(notifGroups).some((g) => g.length > 0)

  return (
    <Page title="알림" sub="결제·결정 관련 소식을 모아둬요" right={<Text style={styles.readAll}>모두 읽음</Text>}>
      {!hasAny && <Text style={styles.empty}>아직 알림이 없어요.</Text>}
      {order.map((label) => {
        const entries = notifGroups[keyFor[label]]
        if (!entries || entries.length === 0) return null
        return (
          <View key={label} style={styles.group}>
            <Text style={styles.groupTitle}>{label}</Text>
            <View style={styles.card}>
              {entries.map((entry, i) => <NotifRow key={entry.id} entry={entry} isLast={i === entries.length - 1} />)}
            </View>
          </View>
        )
      })}
      <Text style={styles.footer}>인앱에서만 알려드려요. 외부(이메일·푸시) 발송은 하지 않아요.</Text>
    </Page>
  )
}

const styles = StyleSheet.create({
  readAll: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 13, color: '#AAAAAA' },
  group: { marginTop: spacing.xl },
  groupTitle: { fontSize: 12, fontWeight: '600', color: colors.inkSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLast: { borderBottomWidth: 0 },
  icon: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  rowSub: { fontSize: 12, color: colors.inkSecondary },
  rowTime: { fontSize: 11, color: '#A0A0A8' },
  footer: { textAlign: 'center', fontSize: 11, color: '#A0A0A8', marginTop: spacing.xl },
})
