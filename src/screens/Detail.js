import { useState } from 'react'
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import ChipRow from '../components/ChipRow.js'
import { colors, spacing, radius } from '../theme.js'
import { won } from '../utils/format.js'
import { getRecommendationDetails, getReviewStaleness } from '../domain/subscription.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const SCALE_OPTIONS = [
  { key: 'low', label: '낮음' },
  { key: 'medium', label: '보통' },
  { key: 'high', label: '높음' },
]
const REPLACEABILITY_OPTIONS = [
  { key: 'hard', label: '어려움' },
  { key: 'medium', label: '보통' },
  { key: 'easy', label: '쉬움' },
]
const SHORT_LABEL = { keep: '유지', review: '재검토', cancel: '해지 후보' }

function Score({ name, help, value, change, options }) {
  return (
    <View style={styles.score}>
      <Text style={styles.scoreName}>{name}</Text>
      <Text style={styles.scoreHelp}>{help}</Text>
      <ChipRow options={options} value={value} onChange={change} />
    </View>
  )
}

export default function DetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { items, update, remove, notify } = useSubscriptions()
  const original = items.find((x) => x.id === route.params.id)
  const [form, setForm] = useState(original)

  if (!original) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>구독을 찾을 수 없어요.</Text>
        <Text style={styles.missingSub}>삭제되었거나 더 이상 사용할 수 없는 항목입니다.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
          <Text style={styles.primaryButtonText}>홈으로 돌아가기</Text>
        </Pressable>
      </View>
    )
  }

  const result = getRecommendationDetails(form)
  const field = (key, value) => setForm({ ...form, [key]: value })
  const decide = (decision) => {
    const next = { ...form, decision, lastEvaluatedAt: new Date().toISOString() }
    setForm(next)
    update(next)
    notify('결정이 저장되었어요.')
  }
  const confirmDelete = () => {
    Alert.alert(`${form.name}을(를) 삭제할까요?`, undefined, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { remove(form.id); navigation.navigate('MainTabs', { screen: 'Home' }) } },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ 뒤로</Text></Pressable>
      <Text style={styles.eyebrow}>{form.category}</Text>
      <Text style={styles.title}>{form.name}</Text>
      <Text style={styles.sub}>매월 {won(form.monthlyCost)} · 매월 {form.billingDay}일 결제</Text>

      {form.decision === 'review' && getReviewStaleness(form) && (
        <Text style={styles.staleBadge}>마지막 평가 30일 경과 · 다시 확인해 보세요</Text>
      )}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>이 구독, 나에게 얼마나 가치 있나요?</Text>
        <Text style={styles.panelSub}>솔직하게 평가할수록 판단이 정확해져요</Text>
        <Score name="사용 빈도" help="얼마나 자주 쓰나요?" value={form.frequency} change={(x) => field('frequency', x)} options={SCALE_OPTIONS} />
        <Score name="업무 중요도" help="일이나 공부에 꼭 필요한가요?" value={form.importance} change={(x) => field('importance', x)} options={SCALE_OPTIONS} />
        <Score name="대체 가능성" help="다른 서비스로 바꾸기 쉬운가요?" value={form.replaceability} change={(x) => field('replaceability', x)} options={REPLACEABILITY_OPTIONS} />
        <Score name="비용 부담" help="가격이 부담스럽나요?" value={form.costBurden} change={(x) => field('costBurden', x)} options={SCALE_OPTIONS} />
      </View>

      <View style={styles.recommend}>
        <Text style={styles.recommendKicker}>✦ 평가 결과</Text>
        <Text style={styles.recommendTitle}>{SHORT_LABEL[result.recommendation]}를 제안해요</Text>
        <Text style={styles.recommendReason}>{result.reason}</Text>
        <View style={styles.recommendButtons}>
          {['keep', 'review', 'cancel'].map((x) => (
            <Pressable key={x} style={[styles.recommendButton, form.decision === x && styles.recommendButtonSelected]} onPress={() => decide(x)}>
              <Text style={[styles.recommendButtonText, form.decision === x && styles.recommendButtonTextSelected]}>{SHORT_LABEL[x]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={confirmDelete}><Text style={styles.delete}>이 구독 삭제하기</Text></Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  missing: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  missingTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  missingSub: { fontSize: 13, color: colors.inkSecondary, marginBottom: spacing.lg },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  back: { color: colors.inkSecondary, fontSize: 13, marginBottom: spacing.lg },
  eyebrow: { fontSize: 13, fontWeight: '600', color: colors.accent },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginTop: 2 },
  sub: { fontSize: 13, color: colors.inkSecondary, marginTop: 4, marginBottom: spacing.lg },
  staleBadge: { backgroundColor: colors.reviewBg, color: colors.review, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, fontSize: 12, alignSelf: 'flex-start', marginBottom: spacing.md, overflow: 'hidden' },
  panel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.xl, marginBottom: spacing.lg },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  panelSub: { fontSize: 12, color: colors.inkSecondary, marginBottom: spacing.lg },
  score: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  scoreName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  scoreHelp: { fontSize: 12, color: colors.inkSecondary, marginBottom: spacing.xs },
  recommend: { backgroundColor: colors.accentSoft, borderRadius: 14, padding: spacing.lg, marginBottom: spacing.lg },
  recommendKicker: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  recommendTitle: { fontSize: 16, color: colors.ink, fontWeight: '700', marginTop: 2 },
  recommendReason: { fontSize: 12, color: 'rgba(79,70,229,0.85)', marginTop: spacing.xs },
  recommendButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  recommendButton: { flex: 1, borderWidth: 1, borderColor: '#C7C9F0', backgroundColor: colors.card, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  recommendButtonSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  recommendButtonText: { fontSize: 13, fontWeight: '600', color: colors.accent },
  recommendButtonTextSelected: { color: '#fff' },
  delete: { color: '#A4A6B3', textDecorationLine: 'underline', fontSize: 12, marginTop: spacing.md },
})
