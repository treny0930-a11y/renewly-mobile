import { useState } from 'react'
import { TextInput, Pressable, Text, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ChipRow from '../components/ChipRow.js'
import { colors, spacing } from '../theme.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const CATEGORIES = ['영상 · 엔터테인먼트', '생산성', '디자인 · 업무', '음악', '기타'].map((x) => ({ key: x, label: x }))
const DAYS = Array.from({ length: 31 }, (_, i) => ({ key: i + 1, label: `${i + 1}` }))

export default function AddScreen() {
  const navigation = useNavigation()
  const { add } = useSubscriptions()
  const [f, setF] = useState({ name: '', category: '기타', monthlyCost: '', billingDay: 1, frequency: 'medium', importance: 'medium', replaceability: 'medium', costBurden: 'medium', decision: 'keep', color: '#6366f1' })
  const change = (k, v) => setF({ ...f, [k]: v })

  const submit = () => {
    if (!f.name || !f.monthlyCost) return
    const stamped = add({ ...f, id: Date.now(), monthlyCost: Number(f.monthlyCost), billingDay: Number(f.billingDay), initial: f.name[0].toUpperCase() })
    navigation.replace('Detail', { id: stamped.id })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ 뒤로</Text></Pressable>
      <Text style={styles.eyebrow}>새 구독</Text>
      <Text style={styles.title}>구독 등록하기</Text>
      <Text style={styles.sub}>입력한 정보는 이 기기에만 저장돼요</Text>

      <Text style={styles.label}>서비스 이름</Text>
      <TextInput
        style={styles.input}
        placeholder="예: Spotify"
        value={f.name}
        onChangeText={(v) => change('name', v)}
        autoFocus
      />

      <Text style={styles.label}>카테고리</Text>
      <ChipRow options={CATEGORIES} value={f.category} onChange={(v) => change('category', v)} />

      <Text style={styles.label}>월 구독료</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="number-pad"
        value={f.monthlyCost}
        onChangeText={(v) => change('monthlyCost', v)}
      />

      <Text style={styles.label}>결제일</Text>
      <ChipRow options={DAYS} value={f.billingDay} onChange={(v) => change('billingDay', v)} />

      <Pressable style={[styles.submit, (!f.name || !f.monthlyCost) && styles.submitDisabled]} onPress={submit} disabled={!f.name || !f.monthlyCost}>
        <Text style={styles.submitText}>등록하고 평가하기</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  back: { color: colors.inkSecondary, fontSize: 13 },
  eyebrow: { fontSize: 13, fontWeight: '600', color: colors.accent },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 13, color: colors.inkSecondary, marginBottom: spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md, fontSize: 14, color: colors.ink, backgroundColor: colors.card },
  submit: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
