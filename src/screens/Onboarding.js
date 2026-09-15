import { useRef, useState } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../theme.js'

const PAGES = [
  {
    kicker: '여러 구독, 흩어진 결정',
    title: 'Renewly가 정리해 드려요',
    body: '넷플릭스, 어도비, 노션… 하나씩은 작아도 모이면 큰 지출이에요. Renewly는 등록한 구독을 한눈에 모아 보여줘요.',
  },
  {
    kicker: '4가지 기준으로 평가',
    title: '유지 · 재검토 · 해지 후보',
    body: '사용 빈도, 업무 중요도, 대체 가능성, 비용 부담 — 4가지를 답하면 지금 이 구독을 계속 쓸지 판단하는 데 도움을 드려요.',
  },
  {
    kicker: '내 데이터는',
    title: '이 기기에만 저장돼요',
    body: '로그인 없이 이 기기에만 저장돼요. 서버로 보내지 않아요. 앱을 삭제하면 데이터도 함께 사라져요.',
  },
]

export default function OnboardingScreen({ onDone }) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef(null)
  const [page, setPage] = useState(0)
  const [name, setName] = useState('')
  const isLastPage = page === PAGES.length - 1
  const canFinish = !isLastPage || name.trim().length > 0

  const handleScrollEnd = (e) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width)
    if (next !== page) setPage(next)
  }

  const goNext = () => {
    if (!isLastPage) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true })
      setPage(page + 1)
    } else if (name.trim().length > 0) {
      onDone(name.trim())
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        keyboardShouldPersistTaps="handled"
      >
        {PAGES.map((p, i) => (
          <View key={i} style={[styles.page, { width }]}>
            <Text style={styles.kicker}>{p.kicker}</Text>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.body}>{p.body}</Text>
            {i === PAGES.length - 1 && (
              <View style={styles.nameField}>
                <Text style={styles.nameLabel}>어떻게 불러드릴까요?</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="이름 또는 별명"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="done"
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={[styles.button, !canFinish && styles.buttonDisabled]} onPress={goNext} disabled={!canFinish}>
          <Text style={styles.buttonText}>{isLastPage ? '시작하기' : '다음'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, justifyContent: 'center', padding: spacing.xxl },
  kicker: { fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: spacing.sm },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: spacing.md },
  body: { fontSize: 15, color: colors.inkSecondary, lineHeight: 22 },
  nameField: { marginTop: spacing.xl },
  nameLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: spacing.sm },
  nameInput: { borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md, fontSize: 15, color: colors.ink, backgroundColor: colors.card },
  footer: { padding: spacing.xl, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent, width: 20 },
  button: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
