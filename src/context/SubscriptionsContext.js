import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getSavingsSummary, getUpcomingNotifications } from '../domain/subscription.js'
import { loadSubscriptions, saveSubscriptions, loadEvents, saveEvents, loadOnboarded, saveOnboarded } from '../storage/subscriptionStorage.js'
import { copy } from '../utils/statusCopy.js'
import { won } from '../utils/format.js'

const SubscriptionsContext = createContext(null)

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext)
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionsProvider')
  return ctx
}

export function SubscriptionsProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [items, setItems] = useState([])
  const [events, setEvents] = useState([])
  const [onboarded, setOnboarded] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([loadSubscriptions(AsyncStorage), loadEvents(AsyncStorage), loadOnboarded(AsyncStorage)]).then(([loadedItems, loadedEvents, loadedOnboarded]) => {
      if (cancelled) return
      setItems(loadedItems)
      setEvents(loadedEvents)
      setOnboarded(loadedOnboarded)
      setReady(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => { if (ready) saveSubscriptions(AsyncStorage, items) }, [ready, items])
  useEffect(() => { if (ready) saveEvents(AsyncStorage, events) }, [ready, events])

  const pushEvent = (entry) => setEvents((all) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), ...entry }, ...all])
  const notify = (text) => { setToast(text); setTimeout(() => setToast(''), 2200) }
  const update = (item) => setItems((all) => all.map((old) => old.id === item.id ? item : old))
  const remove = (itemId) => setItems((all) => all.filter((item) => item.id !== itemId))
  const add = (item) => {
    const stamped = { ...item, lastEvaluatedAt: new Date().toISOString() }
    setItems((all) => [...all, stamped])
    pushEvent({ type: 'register', initial: item.initial, text: `새 구독 ${item.name}가 등록됐어요`, sub: `${item.category} · ${won(item.monthlyCost)}` })
    return stamped
  }
  const changeDecision = (item, decision, reason) => {
    const next = { ...item, decision, lastEvaluatedAt: new Date().toISOString() }
    update(next)
    pushEvent({ type: 'decision', decision, initial: item.initial, text: `${item.name}을(를) '${copy[decision][0]}'(으)로 옮겼어요`, sub: reason || `반영 시 월 ${won(item.monthlyCost)} 절약` })
    notify(reason ? `${item.name}을(를) '${copy[decision][0]}'(으)로 저장했어요 · ${reason}` : `${item.name}을(를) '${copy[decision][0]}'(으)로 저장했어요`)
  }
  const editBilling = (item, billingDay) => {
    update({ ...item, billingDay })
    pushEvent({ type: 'billing-edit', text: `${item.name} 결제일을 ${billingDay}일로 바꿨어요`, sub: `${won(item.monthlyCost)} / 월` })
    notify(`${item.name} 결제일을 ${billingDay}일로 바꿨어요.`)
  }
  const completeOnboarding = () => {
    setOnboarded(true)
    saveOnboarded(AsyncStorage, true)
  }

  const summary = useMemo(() => getSavingsSummary(items), [items])
  const notifGroups = useMemo(() => getUpcomingNotifications(items, events), [items, events])

  const value = { ready, items, events, onboarded, summary, notifGroups, toast, add, update, remove, changeDecision, editBilling, notify, completeOnboarding }
  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>
}
