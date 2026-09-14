import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, spacing } from '../theme.js'
import { loadSubscriptions } from '../storage/subscriptionStorage.js'

export default function HomeScreen() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadSubscriptions(AsyncStorage).then((items) => {
      if (!cancelled) setCount(items.length)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈</Text>
      <Text style={styles.body}>
        {count === null ? '불러오는 중...' : `구독 ${count}개 저장됨`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  body: { fontSize: 14, color: colors.inkSecondary, textAlign: 'center' },
})
