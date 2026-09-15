import { View, Text, Switch, Pressable, StyleSheet } from 'react-native'
import Page from '../components/Page.js'
import ChipRow from '../components/ChipRow.js'
import { colors, spacing, radius } from '../theme.js'
import { useSubscriptions } from '../context/SubscriptionsContext.js'

const REMINDER_OPTIONS = [3, 7, 14].map((x) => ({ key: x, label: `${x}일 전` }))

export default function SettingsScreen() {
  const { notify, settings, updateSettings } = useSubscriptions()

  return (
    <Page eyebrow="앱 설정" title="알림 설정" sub="결제일을 놓치지 않게 앱에서 알려드려요">
      <View style={styles.section}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>결제일 알림</Text>
          <Text style={styles.sectionSub}>결제 예정 구독을 홈 화면에서 알려드려요</Text>
        </View>
        <Switch
          value={settings.billingAlertsEnabled}
          onValueChange={(value) => updateSettings({ ...settings, billingAlertsEnabled: value })}
          trackColor={{ true: colors.accent }}
        />
      </View>

      <View style={styles.sectionVertical}>
        <Text style={styles.sectionTitle}>미리 알림</Text>
        <Text style={styles.sectionSub}>결제일 며칠 전에 확인할까요?</Text>
        <View style={{ marginTop: spacing.md }}>
          <ChipRow
            options={REMINDER_OPTIONS}
            value={settings.reminderDays}
            onChange={(value) => updateSettings({ ...settings, reminderDays: value })}
          />
        </View>
      </View>

      <View style={styles.local}>
        <Text style={styles.localIcon}>✦</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.localTitle}>내 데이터는 이렇게 저장돼요</Text>
          <Text style={styles.localText}>로그인 없이 이 기기에만 저장돼요. 서버로 보내지 않고, 다른 기기에서는 다시 보이지 않아요. 앱을 삭제하면 데이터도 함께 사라져요.</Text>
        </View>
      </View>

      <Pressable style={styles.saveButton} onPress={() => notify('설정이 저장되었어요.')}>
        <Text style={styles.saveButtonText}>설정 저장</Text>
      </Pressable>
    </Page>
  )
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md },
  sectionVertical: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.ink },
  sectionSub: { fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  local: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.accentSoft, borderRadius: 12, padding: spacing.lg, marginVertical: spacing.md },
  localIcon: { fontSize: 16, color: colors.accent },
  localTitle: { fontSize: 13, fontWeight: '600', color: colors.accent, marginBottom: 3 },
  localText: { fontSize: 12, color: 'rgba(79,70,229,0.85)', lineHeight: 18 },
  saveButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing.md },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
