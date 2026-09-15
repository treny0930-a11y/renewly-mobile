import { SubscriptionsProvider, useSubscriptions } from './src/context/SubscriptionsContext.js'
import RootNavigator from './src/navigation/RootNavigator.js'
import Toast from './src/components/Toast.js'

function Gate() {
  const { ready } = useSubscriptions()
  if (!ready) return null
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
