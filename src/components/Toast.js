import { Text, StyleSheet } from 'react-native'
import { useSubscriptions } from '../context/SubscriptionsContext.js'
import { colors, spacing, radius } from '../theme.js'

export default function Toast() {
  const { toast } = useSubscriptions()
  if (!toast) return null
  return <Text style={styles.toast}>✓ {toast}</Text>
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: '#272936', color: '#fff', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.card, fontSize: 13, overflow: 'hidden' },
})
