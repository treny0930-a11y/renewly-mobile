import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, radius, hitSlop } from '../theme.js'
import { won } from '../utils/format.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

export default function CancelSavingsScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { items, summary } = useSubscriptions()
  const cancelItems = items.filter((x) => x.decision === 'cancel')

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: spacing.xl + insets.top, paddingBottom: spacing.xxl * 2 + insets.bottom }]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={hitSlop}><Text style={styles.back}>‹ 뒤로</Text></Pressable>
      <Text style={styles.eyebrow}>해지 후보 모아보기</Text>
      <Text style={styles.title}>절감액 계산 상세</Text>
      <Text style={styles.sub}>반영하면 매달 얼마가 남는지 확인해요.</Text>

      <View style={styles.summary}>
        <View><Text style={styles.summaryLabel}>현재</Text><Text style={styles.summaryAmount}>{won(summary.currentCost)}</Text></View>
        <Text style={styles.summaryArrow}>→</Text>
        <View>
          <Text style={styles.summaryLabel}>반영 후</Text>
          <Text style={styles.summaryAmount}>{won(summary.projectedCost)}</Text>
          <Text style={styles.summarySaving}>−{won(summary.saving)}/월</Text>
        </View>
      </View>

      {cancelItems.length === 0 ? (
        <Text style={styles.empty}>해지 후보로 표시된 구독이 없어요.</Text>
      ) : (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>계산 내역</Text>
          {cancelItems.map((x) => (
            <View key={x.id} style={styles.row}>
              <View>
                <Text style={styles.rowName}>{x.name}</Text>
                <Text style={styles.rowCategory}>{x.category}</Text>
              </View>
              <Text style={styles.rowAmount}>− {won(x.monthlyCost)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.note}>재검토 상태 구독은 아직 결정이 확정되지 않아 절감액 계산에서 제외돼요. 여러 통화는 합산하지 않아요.</Text>

      {cancelItems.length > 0 && (
        <Pressable style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>해지 후보 {cancelItems.length}건 해지하기</Text>
        </Pressable>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  back: { color: colors.inkSecondary, fontSize: 13, marginBottom: spacing.lg },
  eyebrow: { fontSize: 13, fontWeight: '600', color: colors.accent },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginTop: 2 },
  sub: { fontSize: 13, color: colors.inkSecondary, marginTop: 4, marginBottom: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.lg },
  summaryLabel: { fontSize: 12, color: colors.inkSecondary },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 4 },
  summaryArrow: { color: '#AFB0BF' },
  summarySaving: { fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 2 },
  empty: { fontSize: 13, color: '#AAAAAA' },
  group: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg },
  groupTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  rowName: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  rowCategory: { fontSize: 12, color: colors.inkSecondary },
  rowAmount: { fontSize: 14, fontWeight: '700', color: colors.ink },
  note: { fontSize: 13, color: colors.inkSecondary, marginTop: spacing.lg },
  confirmButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
