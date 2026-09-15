import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme.js'

export default function Time({ item }) {
  return (
    <View style={styles.time}>
      <Text style={styles.month}>9월</Text>
      <Text style={styles.day}>{item.billingDay}일</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  time: { width: 40, alignItems: 'center' },
  month: { fontSize: 10, color: colors.inkSecondary },
  day: { fontSize: 18, color: colors.ink, fontWeight: '600' },
})
