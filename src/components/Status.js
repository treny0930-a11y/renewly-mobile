import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme.js'
import { copy } from '../utils/statusCopy.js'

const STYLE = {
  keep: { color: colors.keep, backgroundColor: colors.keepBg },
  review: { color: colors.review, backgroundColor: colors.reviewBg },
  cancel: { color: colors.cancel, backgroundColor: colors.cancelBg },
}

export default function Status({ item }) {
  const [label, key] = copy[item.decision]
  return (
    <View style={[styles.badge, { backgroundColor: STYLE[key].backgroundColor }]}>
      <Text style={[styles.label, { color: STYLE[key].color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8, alignSelf: 'flex-start' },
  label: { fontSize: 11, fontWeight: '700' },
})
