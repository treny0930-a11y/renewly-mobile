import { useState } from 'react'
import { Text, Pressable, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import BottomSheetScreen from '../components/BottomSheetScreen.js'
import ChipRow from '../components/ChipRow.js'
import { colors, spacing } from '../theme.js'
import { won } from '../utils/format.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ key: i + 1, label: `${i + 1}일` }))

export default function BillingEditScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { items, editBilling } = useSubscriptions()
  const item = items.find((x) => x.id === route.params.id)
  const [day, setDay] = useState(item ? item.billingDay : 1)

  if (!item) return null

  const save = () => { editBilling(item, day); navigation.goBack() }

  return (
    <BottomSheetScreen title={`${item.name} 결제일 수정`}>
      <ChipRow options={DAY_OPTIONS} value={day} onChange={setDay} />
      <Text style={styles.cost}>월 {won(item.monthlyCost)}</Text>
      <Pressable style={styles.saveButton} onPress={save}><Text style={styles.saveButtonText}>저장</Text></Pressable>
    </BottomSheetScreen>
  )
}

const styles = StyleSheet.create({
  cost: { fontSize: 13, color: colors.inkSecondary, marginTop: spacing.lg },
  saveButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing.lg },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
