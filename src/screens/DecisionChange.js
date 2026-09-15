import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import BottomSheetScreen from '../components/BottomSheetScreen.js'
import ChipRow from '../components/ChipRow.js'
import { colors, spacing } from '../theme.js'
import { won } from '../utils/format.js'
import { copy } from '../utils/statusCopy.js'
import { getSavingsSummary } from '../domain/subscription.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const DECISION_OPTIONS = [
  { key: 'keep', label: copy.keep[0] },
  { key: 'review', label: copy.review[0] },
  { key: 'cancel', label: copy.cancel[0] },
]
const REASONS = ['사용 빈도 낮음', '더 저렴한 대안', '업무에 불필요']

export default function DecisionChangeScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { items, changeDecision } = useSubscriptions()
  const item = items.find((x) => x.id === route.params.id)
  const [pendingDecision, setPendingDecision] = useState(item ? item.decision : 'keep')
  const [reason, setReason] = useState('')

  if (!item) return null

  const previewSummary = getSavingsSummary(items.map((x) => x.id === item.id ? { ...x, decision: pendingDecision } : x))
  const save = () => { changeDecision(item, pendingDecision, reason); navigation.goBack() }

  return (
    <BottomSheetScreen title="결정 바꾸기">
      <ChipRow options={DECISION_OPTIONS} value={pendingDecision} onChange={setPendingDecision} />
      <Text style={styles.label}>변경 이유 (선택)</Text>
      <ChipRow options={REASONS.map((r) => ({ key: r, label: r }))} value={reason} onChange={(r) => setReason(reason === r ? '' : r)} />
      <View style={styles.preview}>
        <Text style={styles.previewText}>반영하면 매달 {won(previewSummary.saving)} 남아요</Text>
      </View>
      <Pressable style={styles.saveButton} onPress={save}><Text style={styles.saveButtonText}>변경 저장</Text></Pressable>
    </BottomSheetScreen>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.inkSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  preview: { backgroundColor: colors.accentSoft, borderRadius: 12, padding: spacing.md, marginVertical: spacing.md },
  previewText: { color: colors.accent, fontWeight: '600' },
  saveButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
