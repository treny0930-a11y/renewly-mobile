import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '../theme.js'

export default function Page({ eyebrow, title, sub, right, children }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {sub ? <Text style={styles.sub}>{sub}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: spacing.xs },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: spacing.xs },
  sub: { fontSize: 13, color: colors.inkSecondary },
})
