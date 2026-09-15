import { View, Text, StyleSheet } from 'react-native'
import { getPaymentHeatmap, getCalendarGrid } from '../domain/subscription.js'
import { colors, spacing, radius } from '../theme.js'
import { won } from '../utils/format.js'

function level(total, max) {
  if (!total) return 0
  const ratio = total / max
  if (ratio >= 1) return 4
  if (ratio > 0.6) return 3
  if (ratio > 0.3) return 2
  return 1
}

const LEVEL_BG = { 0: colors.neutralBg, 1: colors.heat1, 2: colors.heat2, 3: colors.heat3, 4: colors.heat4 }
const LEVEL_TEXT = { 0: colors.inkSecondary, 1: colors.inkSecondary, 2: '#3B3F9E', 3: '#fff', 4: '#fff' }

function compact(n) {
  return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만` : won(n)
}

const CELL_SIZE = `${100 / 7}%`

export default function Heatmap({ items }) {
  const now = new Date()
  const grid = getCalendarGrid(now)
  const totals = getPaymentHeatmap(items)
  const totalByDay = Object.fromEntries(totals.map((cell) => [cell.day, cell.total]))
  const max = Math.max(1, ...totals.map((cell) => cell.total))
  const today = now.getDate()

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>결제일 히트맵</Text>
        <Text style={styles.headSub}>{grid.year}년 {grid.month + 1}월</Text>
      </View>
      <View style={styles.weekRow}>
        {['일', '월', '화', '수', '목', '금', '토'].map((x) => <Text key={x} style={styles.weekLabel}>{x}</Text>)}
      </View>
      <View style={styles.grid}>
        {grid.cells.map(({ day }, index) => {
          if (!day) return <View key={index} style={styles.cellEmpty} />
          const total = totalByDay[day] || 0
          const lvl = level(total, max)
          const isToday = day === today
          return (
            <View key={index} style={[styles.cell, { backgroundColor: LEVEL_BG[lvl] }, isToday && styles.cellToday]}>
              <Text style={[styles.cellDay, { color: LEVEL_TEXT[lvl] }]}>{day}</Text>
              {total > 0 && <Text style={[styles.cellTotal, { color: LEVEL_TEXT[lvl] }]}>{compact(total)}</Text>}
              {isToday && <Text style={styles.cellTodayLabel}>오늘</Text>}
            </View>
          )
        })}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>적음</Text>
        {[0, 1, 2, 3, 4].map((lvl) => <View key={lvl} style={[styles.legendSwatch, { backgroundColor: LEVEL_BG[lvl] }]} />)}
        <Text style={styles.legendLabel}>많음</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginVertical: spacing.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  headSub: { fontSize: 11, color: colors.inkSecondary },
  weekRow: { flexDirection: 'row', marginTop: spacing.md },
  weekLabel: { width: CELL_SIZE, textAlign: 'center', fontSize: 11, color: colors.inkSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
  cell: { width: CELL_SIZE, height: 46, padding: 5, borderRadius: 8, justifyContent: 'space-between' },
  cellEmpty: { width: CELL_SIZE, height: 46 },
  cellToday: { borderWidth: 2, borderColor: colors.ink },
  cellDay: { fontSize: 9 },
  cellTotal: { fontSize: 9, fontWeight: '600' },
  cellTodayLabel: { fontSize: 8, fontWeight: '600', color: colors.ink },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: spacing.md },
  legendLabel: { fontSize: 11, color: colors.inkSecondary, marginHorizontal: 4 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
})
