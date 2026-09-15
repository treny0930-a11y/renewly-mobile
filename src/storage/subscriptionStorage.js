const SUBSCRIPTIONS_KEY = 'renewly-subscriptions'
const EVENTS_KEY = 'renewly-events'
const ONBOARDED_KEY = 'renewly-onboarded'

export async function loadSubscriptions(storage) {
  try {
    const raw = await storage.getItem(SUBSCRIPTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveSubscriptions(storage, items) {
  await storage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(items))
}

export async function loadEvents(storage) {
  try {
    const raw = await storage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveEvents(storage, events) {
  await storage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export async function loadOnboarded(storage) {
  try {
    const raw = await storage.getItem(ONBOARDED_KEY)
    return raw === 'true'
  } catch {
    return false
  }
}

export async function saveOnboarded(storage, value) {
  await storage.setItem(ONBOARDED_KEY, value ? 'true' : 'false')
}
