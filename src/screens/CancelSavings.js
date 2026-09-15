import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '../theme.js'

export default function CancelSavingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>절감액 상세</Text>
      <Text style={styles.body}>Task 17에서 실제 화면으로 교체됩니다.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  body: { fontSize: 14, color: colors.inkSecondary, textAlign: 'center' },
})
