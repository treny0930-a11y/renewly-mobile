import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing } from '../theme.js'

export default function BottomSheetScreen({ title, children }) {
  const navigation = useNavigation()
  const close = () => navigation.goBack()
  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={close}><Text style={styles.close}>✕</Text></Pressable>
        </View>
        <ScrollView>{children}</ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,30,0.4)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },
  close: { fontSize: 16, color: colors.inkSecondary },
})
