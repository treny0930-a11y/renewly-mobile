import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, spacing } from '../theme.js'

export default function EmptyState({ text, cta, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {cta ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{cta}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xxl, alignItems: 'center' },
  text: { fontSize: 13, color: colors.inkSecondary, marginBottom: spacing.md },
  button: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
