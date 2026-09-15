import { Pressable, View, Text, StyleSheet } from 'react-native'
import Icon from './Icon.js'
import Status from './Status.js'
import { colors, spacing } from '../theme.js'
import { won } from '../utils/format.js'

export default function Row({ item, open }) {
  return (
    <Pressable style={styles.row} onPress={() => open(item.id)}>
      <Icon item={item} />
      <View style={styles.middle}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <Status item={item} />
      <Text style={styles.cost}>{won(item.monthlyCost)}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  middle: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  category: { fontSize: 12, color: colors.inkSecondary },
  cost: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  chevron: { fontSize: 18, color: '#AAAAAA' },
})
