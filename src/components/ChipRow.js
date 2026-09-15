import { Pressable, Text, View, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '../theme.js'

export default function ChipRow({ options, value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map(({ key, label }) => {
        const selected = value === key
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: '#E4E4E7', backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  chipSelected: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentSoft },
  chipText: { fontSize: 13, color: colors.ink },
  chipTextSelected: { color: colors.accent, fontWeight: '600' },
})
