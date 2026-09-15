import { useState } from 'react'
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Page from '../components/Page.js'
import Icon from '../components/Icon.js'
import Time from '../components/Time.js'
import EmptyState from '../components/EmptyState.js'
import { colors, spacing, radius, hitSlop } from '../theme.js'
import { won } from '../utils/format.js'
import { getCalendarGrid } from '../domain/subscription.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const MIN_CURSOR = 2020 * 12
const MAX_CURSOR = 2030 * 12 + 11
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function chunkIntoWeeks(cells) {
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function CalendarScreen() {
  const navigation = useNavigation()
  const { items } = useSubscriptions()
  const insets = useSafeAreaInsets()
  const now = new Date()
  const [cursor, setCursor] = useState(now.getFullYear() * 12 + now.getMonth())
  const viewYear = Math.floor(cursor / 12)
  const viewMonth = cursor % 12
  const grid = getCalendarGrid(new Date(viewYear, viewMonth, 1))
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()
  const today = now.getDate()
  const [picking, setPicking] = useState(false)
  const [pickYear, setPickYear] = useState(viewYear)

  const atMin = cursor === MIN_CURSOR
  const atMax = cursor === MAX_CURSOR
  const prevMonth = () => setCursor((c) => Math.max(MIN_CURSOR, c - 1))
  const nextMonth = () => setCursor((c) => Math.min(MAX_CURSOR, c + 1))
  const startPicking = () => { setPickYear(viewYear); setPicking(true) }
  const pickMonth = (monthIndex) => { setCursor(pickYear * 12 + monthIndex); setPicking(false) }
  const open = (id) => navigation.navigate('Detail', { id })
  const startEdit = (item) => navigation.navigate('BillingEdit', { id: item.id })

  const upcoming = [...items].filter((x) => x.billingDay <= grid.daysInMonth).sort((a, b) => a.billingDay - b.billingDay)

  return (
    <Page eyebrow="결제 관리" title={`${grid.month + 1}월 결제 일정`} sub="정기 결제를 놓치지 않게 미리 챙겨요">
      <View style={styles.navCard}>
        <Pressable disabled={atMin} onPress={prevMonth} hitSlop={hitSlop}><Text style={[styles.navArrow, atMin && styles.navArrowDisabled]}>‹</Text></Pressable>
        <Pressable onPress={startPicking} hitSlop={hitSlop}><Text style={styles.navLabel}>{grid.year}년 {grid.month + 1}월</Text></Pressable>
        <Pressable disabled={atMax} onPress={nextMonth} hitSlop={hitSlop}><Text style={[styles.navArrow, atMax && styles.navArrowDisabled]}>›</Text></Pressable>
      </View>

      <View style={styles.weekRow}>{WEEKDAYS.map((x) => <Text key={x} style={styles.weekLabel}>{x}</Text>)}</View>
      <View style={styles.daysGrid}>
        {chunkIntoWeeks(grid.cells).map((week, w) => (
          <View key={w} style={styles.weekCells}>
            {week.map(({ day: cellDay }, i) => {
              const hit = items.find((x) => x.billingDay === cellDay)
              const isToday = cellDay === today && isCurrentMonth
              return (
                <View key={w * 7 + i} style={[styles.dayCell, isToday && styles.dayCellToday]}>
                  {cellDay ? (
                    <>
                      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{cellDay}</Text>
                      {hit && <View style={[styles.dot, { backgroundColor: isToday ? '#fff' : hit.color }]} />}
                    </>
                  ) : null}
                </View>
              )
            })}
          </View>
        ))}
      </View>

      <View style={styles.schedule}>
        <Text style={styles.scheduleTitle}>이번 달 예정</Text>
        <Text style={styles.scheduleSub}>결제일 순으로 정리했어요</Text>
        {items.length === 0 ? (
          <EmptyState text="등록된 결제 일정이 없어요." />
        ) : upcoming.length === 0 ? (
          <EmptyState text="이번 달 예정된 결제가 없어요." />
        ) : upcoming.map((x) => (
          <View key={x.id} style={styles.rowWithAction}>
            <Pressable style={styles.scheduleRow} onPress={() => open(x.id)}>
              <Time item={x} monthLabel={`${grid.month + 1}월`} />
              <Icon item={x} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleName}>{x.name}</Text>
                <Text style={styles.scheduleCost}>{won(x.monthlyCost)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable onPress={() => startEdit(x)} hitSlop={hitSlop}><Text style={styles.link}>결제일 수정</Text></Pressable>
          </View>
        ))}
      </View>

      <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.overlay} onPress={() => setPicking(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>날짜 이동</Text>
              <Pressable onPress={() => setPicking(false)} hitSlop={hitSlop}><Text style={styles.close}>✕</Text></Pressable>
            </View>
            <View style={styles.yearRow}>
              <Pressable disabled={pickYear <= 2020} onPress={() => setPickYear((y) => Math.max(2020, y - 1))} hitSlop={hitSlop}>
                <Text style={[styles.navArrow, pickYear <= 2020 && styles.navArrowDisabled]}>‹</Text>
              </Pressable>
              <Text style={styles.yearLabel}>{pickYear}년</Text>
              <Pressable disabled={pickYear >= 2030} onPress={() => setPickYear((y) => Math.min(2030, y + 1))} hitSlop={hitSlop}>
                <Text style={[styles.navArrow, pickYear >= 2030 && styles.navArrowDisabled]}>›</Text>
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              {Array.from({ length: 12 }, (_, i) => i).map((m) => {
                const cursorValue = pickYear * 12 + m
                const disabled = cursorValue < MIN_CURSOR || cursorValue > MAX_CURSOR
                const selected = pickYear === viewYear && m === viewMonth
                return (
                  <Pressable
                    key={m}
                    disabled={disabled}
                    onPress={() => pickMonth(m)}
                    style={[styles.monthCell, selected && styles.monthCellSelected, disabled && styles.monthCellDisabled]}
                  >
                    <Text style={[styles.monthCellText, selected && styles.monthCellTextSelected]}>{m + 1}월</Text>
                  </Pressable>
                )
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Page>
  )
}

const styles = StyleSheet.create({
  navCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  navArrow: { fontSize: 16, color: colors.inkSecondary, paddingHorizontal: spacing.sm },
  navArrowDisabled: { color: colors.border },
  navLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  weekRow: { flexDirection: 'row' },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#A0A0A8', paddingBottom: spacing.sm },
  daysGrid: {},
  weekCells: { flexDirection: 'row' },
  dayCell: { flex: 1, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 3 },
  dayCellToday: { backgroundColor: colors.accent },
  dayNumber: { fontSize: 13, color: colors.ink },
  dayNumberToday: { color: '#fff', fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  schedule: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.xl, marginTop: spacing.xl },
  scheduleTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  scheduleSub: { fontSize: 12, color: colors.inkSecondary, marginBottom: spacing.sm },
  rowWithAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.sm },
  scheduleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scheduleName: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  scheduleCost: { fontSize: 12, color: colors.inkSecondary },
  chevron: { fontSize: 18, color: '#AAAAAA' },
  link: { color: colors.accent, fontSize: 13 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,30,0.4)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  close: { fontSize: 16, color: colors.inkSecondary },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  yearLabel: { fontSize: 15, color: colors.ink },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  monthCell: { width: '31%', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  monthCellSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  monthCellDisabled: { opacity: 0.4 },
  monthCellText: { fontSize: 13, color: colors.ink },
  monthCellTextSelected: { color: colors.accent, fontWeight: '700' },
})
