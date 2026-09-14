const DAY_MS = 24 * 60 * 60 * 1000
const disengagementScore = { low: 2, medium: 1, high: 0 }
const replaceabilityScore = { hard: 0, medium: 1, easy: 2 }
const costBurdenScore = { low: 0, medium: 1, high: 2 }

export function getRecommendationDetails({ frequency, importance, replaceability, costBurden }) {
  const score = disengagementScore[frequency]
    + disengagementScore[importance]
    + replaceabilityScore[replaceability]
    + costBurdenScore[costBurden]

  if (score >= 5) return { recommendation: 'cancel', score, reason: '사용량과 중요도에 비해 비용 부담이 큰 서비스예요.' }
  if (score >= 3) return { recommendation: 'review', score, reason: '계속 유지할 가치가 있는지 한 번 더 확인해 보세요.' }
  return { recommendation: 'keep', score, reason: '자주 사용하고 업무에 중요한 서비스예요.' }
}

export function getRecommendation(values) {
  return getRecommendationDetails(values).recommendation
}

export function getCalendarGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const offset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1
    return { day: day > 0 && day <= daysInMonth ? day : null }
  })
  return { year, month, offset, daysInMonth, cells }
}

export function getSavingsSummary(subscriptions) {
  const currentCost = subscriptions.reduce((sum, item) => sum + Number(item.monthlyCost || 0), 0)
  const saving = subscriptions
    .filter((item) => item.decision === 'cancel')
    .reduce((sum, item) => sum + Number(item.monthlyCost || 0), 0)

  return { currentCost, saving, projectedCost: currentCost - saving }
}

export function getPaymentHeatmap(items) {
  const totalsByDay = {}
  for (const item of items) {
    const day = item.billingDay
    totalsByDay[day] = (totalsByDay[day] || 0) + Number(item.monthlyCost || 0)
  }
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1
    return { day, total: totalsByDay[day] || 0 }
  })
}

export function getReviewStaleness(item, today = new Date()) {
  if (!item.lastEvaluatedAt) return true
  const elapsedDays = Math.floor((today - new Date(item.lastEvaluatedAt)) / DAY_MS)
  return elapsedDays >= 30
}

export function needsAttention(item, today = new Date()) {
  if (item.decision === 'cancel') return true
  if (item.decision !== 'review') return false
  const daysUntilBilling = typeof item.billingDay === 'number' ? item.billingDay - today.getDate() : null
  const billingDueSoon = daysUntilBilling !== null && daysUntilBilling >= 0 && daysUntilBilling <= 7
  return billingDueSoon || getReviewStaleness(item, today)
}

function daysAgo(at, today) {
  return Math.floor((today - new Date(at)) / DAY_MS)
}

function groupForAge(diff) {
  if (diff <= 0) return '오늘'
  if (diff <= 7) return '지난 7일'
  if (diff <= 14) return '지난주'
  return null
}

export function getUpcomingNotifications(items, events = [], today = new Date()) {
  const derived = []
  for (const item of items) {
    if (typeof item.billingDay === 'number' && item.billingDay - today.getDate() === 7) {
      derived.push({
        id: `billing-${item.id}`,
        type: 'billing',
        text: `${item.name} 결제 7일 전`,
        sub: `${item.billingDay}일 · ${Number(item.monthlyCost || 0).toLocaleString('ko-KR')}원 결제 예정`,
        at: today.toISOString(),
      })
    }
    if (item.decision === 'review' && getReviewStaleness(item, today)) {
      derived.push({
        id: `stale-${item.id}`,
        type: 'stale',
        text: '재검토한 구독을 다시 확인할 때예요',
        sub: `${item.name} · 마지막 평가 30일 경과`,
        at: today.toISOString(),
      })
    }
  }
  const grouped = { 오늘: [], '지난 7일': [], 지난주: [] }
  for (const entry of [...derived, ...events]) {
    const group = groupForAge(daysAgo(entry.at, today))
    if (group) grouped[group].push(entry)
  }
  return grouped
}
