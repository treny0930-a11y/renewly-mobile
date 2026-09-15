import { SubscriptionsProvider, useSubscriptions } from './src/context/SubscriptionsContext.js'
import RootNavigator from './src/navigation/RootNavigator.js'
import Toast from './src/components/Toast.js'
import OnboardingScreen from './src/screens/Onboarding.js'

function Gate() {
  const { ready, onboarded, completeOnboarding } = useSubscriptions()
  if (!ready) return null
  if (!onboarded) return <OnboardingScreen onDone={completeOnboarding} />
  return (
    <>
      <RootNavigator />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <SubscriptionsProvider>
      <Gate />
    </SubscriptionsProvider>
  )
}
