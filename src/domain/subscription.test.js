import test from 'node:test'
import assert from 'node:assert/strict'
import { getCalendarGrid, getPaymentHeatmap, getRecommendation, getRecommendationDetails, getReviewStaleness, getSavingsSummary, getUpcomingNotifications, needsAttention } from './subscription.js'

test('비용 부담이 높고 사용 빈도가 낮은 구독은 해지 검토를 제안한다', () => {
  assert.equal(
    getRecommendation({ frequency: 'low', importance: 'medium', replaceability: 'hard', costBurden: 'high' }),
    'cancel',
  )
})

test('상충되는 평가가 있으나 총 해지 점수가 높은 구독은 해지 검토를 제안한다', () => {
  assert.equal(
    getRecommendation({ frequency: 'low', importance: 'high', replaceability: 'easy', costBurden: 'high' }),
    'cancel',
  )
})

test('사용량이 낮고 부담이 있는 구독은 재검토를 제안한다', () => {
  assert.equal(
    getRecommendation({ frequency: 'low', importance: 'medium', replaceability: 'hard', costBurden: 'medium' }),
    'review',
  )
})

test('낮은 해지 점수는 유지로 추천한다', () => {
  assert.deepEqual(
    getRecommendationDetails({ frequency: 'high', importance: 'high', replaceability: 'hard', costBurden: 'low' }),
    { recommendation: 'keep', score: 0, reason: '자주 사용하고 업무에 중요한 서비스예요.' },
  )
})

test('경계 점수 3은 재검토로, 6은 해지 후보로 분류한다', () => {
  assert.equal(getRecommendationDetails({ frequency: 'medium', importance: 'medium', replaceability: 'medium', costBurden: 'low' }).recommendation, 'review')
  assert.equal(getRecommendationDetails({ frequency: 'low', importance: 'low', replaceability: 'medium', costBurden: 'medium' }).recommendation, 'cancel')
})

test('월간 달력은 실제 시작 요일의 앞 칸과 31일을 모두 포함한다', () => {
  const grid = getCalendarGrid(new Date(2026, 7, 1))
  assert.equal(grid.offset, 6)
  assert.equal(grid.daysInMonth, 31)
  assert.equal(grid.cells.length, 42)
  assert.equal(grid.cells[6].day, 1)
  assert.equal(grid.cells[36].day, 31)
})

test('절감 예상액에는 해지 후보만 포함한다', () => {
  assert.deepEqual(
    getSavingsSummary([
      { monthlyCost: 19000, decision: 'cancel' },
      { monthlyCost: 12000, decision: 'review' },
      { monthlyCost: 4500, decision: 'keep' },
    ]),
    { currentCost: 35500, saving: 19000, projectedCost: 16500 },
  )
})

test('getPaymentHeatmap sums cost per billing day and covers all 31 days', () => {
  const items = [
    { billingDay: 14, monthlyCost: 17000 },
    { billingDay: 14, monthlyCost: 3000 },
    { billingDay: 1, monthlyCost: 5000 },
  ]
  const result = getPaymentHeatmap(items)
  assert.strictEqual(result.length, 31)
  assert.deepStrictEqual(result[0], { day: 1, total: 5000 })
  assert.deepStrictEqual(result[13], { day: 14, total: 20000 })
  assert.deepStrictEqual(result[1], { day: 2, total: 0 })
})

test('getPaymentHeatmap returns all-zero grid for empty input', () => {
  const result = getPaymentHeatmap([])
  assert.strictEqual(result.length, 31)
  assert.ok(result.every((cell) => cell.total === 0))
})

test('getReviewStaleness is true when lastEvaluatedAt is missing', () => {
  assert.strictEqual(getReviewStaleness({}), true)
})

test('getReviewStaleness boundary at exactly 30 days is stale', () => {
  const today = new Date('2026-09-30T00:00:00.000Z')
  const item29 = { lastEvaluatedAt: '2026-09-01T00:00:00.000Z' }
  const item30 = { lastEvaluatedAt: '2026-08-31T00:00:00.000Z' }
  assert.strictEqual(getReviewStaleness(item29, today), false)
  assert.strictEqual(getReviewStaleness(item30, today), true)
})

test('getUpcomingNotifications derives D-7 billing and stale-review entries into today', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const items = [
    { id: 1, name: 'Figma', billingDay: 21, monthlyCost: 15000, decision: 'keep' },
    { id: 2, name: 'Adobe Creative Cloud', decision: 'review', lastEvaluatedAt: '2026-08-01T00:00:00.000Z' },
  ]
  const result = getUpcomingNotifications(items, [], today)
  assert.strictEqual(result['오늘'].length, 2)
  assert.ok(result['오늘'].some((entry) => entry.text.includes('Figma') && entry.text.includes('7일 전')))
  assert.ok(result['오늘'].some((entry) => entry.sub.includes('Adobe Creative Cloud') && entry.sub.includes('30일')))
})

test('getUpcomingNotifications respects a custom reminderDays setting', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const items = [{ id: 1, name: 'Figma', billingDay: 24, monthlyCost: 15000, decision: 'keep' }] // 10 days out
  const resultDefault = getUpcomingNotifications(items, [], today)
  assert.strictEqual(resultDefault['오늘'].length, 0)
  const resultCustom = getUpcomingNotifications(items, [], today, { reminderDays: 10 })
  assert.strictEqual(resultCustom['오늘'].length, 1)
  assert.ok(resultCustom['오늘'][0].text.includes('10일 전'))
})

test('getUpcomingNotifications suppresses billing reminders when billingAlertsEnabled is false', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const items = [{ id: 1, name: 'Figma', billingDay: 21, monthlyCost: 15000, decision: 'keep' }]
  const result = getUpcomingNotifications(items, [], today, { billingAlertsEnabled: false })
  assert.strictEqual(result['오늘'].length, 0)
})

test('getUpcomingNotifications groups past events by age and drops entries older than 14 days', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const events = [
    { id: 'a', text: '새 구독 Spotify가 등록됐어요', at: '2026-09-10T00:00:00.000Z' }, // 4 days ago -> 지난 7일
    { id: 'b', text: 'Netflix를 해지 후보로 옮겼어요', at: '2026-09-03T00:00:00.000Z' }, // 11 days ago -> 지난주
    { id: 'c', text: '너무 오래된 이벤트', at: '2026-08-01T00:00:00.000Z' }, // dropped
  ]
  const result = getUpcomingNotifications([], events, today)
  assert.strictEqual(result['지난 7일'].length, 1)
  assert.strictEqual(result['지난 7일'][0].id, 'a')
  assert.strictEqual(result['지난주'].length, 1)
  assert.strictEqual(result['지난주'][0].id, 'b')
  assert.strictEqual(result['오늘'].length, 0)
})

test('needsAttention: cancel-decision items always need attention', () => {
  assert.strictEqual(needsAttention({ decision: 'cancel' }), true)
})

test('needsAttention: keep-decision items never need attention', () => {
  assert.strictEqual(needsAttention({ decision: 'keep', billingDay: 1 }), false)
})

test('needsAttention: review item needs attention when billing is due within 7 days', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const dueSoon = { decision: 'review', billingDay: 21, lastEvaluatedAt: today.toISOString() }
  const dueLater = { decision: 'review', billingDay: 22, lastEvaluatedAt: today.toISOString() }
  assert.strictEqual(needsAttention(dueSoon, today), true)
  assert.strictEqual(needsAttention(dueLater, today), false)
})

test('needsAttention: review item needs attention when stale, even if billing is far away', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const stale = { decision: 'review', billingDay: 1, lastEvaluatedAt: '2026-08-01T00:00:00.000Z' }
  assert.strictEqual(needsAttention(stale, today), true)
})

test('needsAttention: review item recently evaluated with distant billing date does not need attention', () => {
  const today = new Date('2026-09-14T00:00:00.000Z')
  const settled = { decision: 'review', billingDay: 1, lastEvaluatedAt: today.toISOString() }
  assert.strictEqual(needsAttention(settled, today), false)
})
