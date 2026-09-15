import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSubscriptions, saveSubscriptions, loadEvents, saveEvents, loadOnboarded, saveOnboarded, loadUserName, saveUserName } from './subscriptionStorage.js'

function fakeStorage() {
  const store = new Map()
  return {
    async getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    async setItem(key, value) {
      store.set(key, value)
    },
  }
}

test('loadSubscriptions returns an empty array when nothing is stored', async () => {
  const storage = fakeStorage()
  assert.deepStrictEqual(await loadSubscriptions(storage), [])
})

test('saveSubscriptions then loadSubscriptions round-trips the data', async () => {
  const storage = fakeStorage()
  const items = [{ id: '1', name: 'Figma', monthlyCost: 15000, decision: 'keep' }]
  await saveSubscriptions(storage, items)
  assert.deepStrictEqual(await loadSubscriptions(storage), items)
})

test('loadSubscriptions returns an empty array when stored value is corrupt JSON', async () => {
  const storage = fakeStorage()
  await storage.setItem('renewly-subscriptions', '{not-json')
  assert.deepStrictEqual(await loadSubscriptions(storage), [])
})

test('loadEvents returns an empty array when nothing is stored', async () => {
  const storage = fakeStorage()
  assert.deepStrictEqual(await loadEvents(storage), [])
})

test('saveEvents then loadEvents round-trips the data', async () => {
  const storage = fakeStorage()
  const events = [{ id: 'a', text: '새 구독 Spotify가 등록됐어요', at: '2026-09-10T00:00:00.000Z' }]
  await saveEvents(storage, events)
  assert.deepStrictEqual(await loadEvents(storage), events)
})

test('loadOnboarded returns false when nothing is stored', async () => {
  const storage = fakeStorage()
  assert.strictEqual(await loadOnboarded(storage), false)
})

test('saveOnboarded then loadOnboarded round-trips true', async () => {
  const storage = fakeStorage()
  await saveOnboarded(storage, true)
  assert.strictEqual(await loadOnboarded(storage), true)
})

test('saveOnboarded then loadOnboarded round-trips false', async () => {
  const storage = fakeStorage()
  await saveOnboarded(storage, true)
  await saveOnboarded(storage, false)
  assert.strictEqual(await loadOnboarded(storage), false)
})

test('loadUserName returns an empty string when nothing is stored', async () => {
  const storage = fakeStorage()
  assert.strictEqual(await loadUserName(storage), '')
})

test('saveUserName then loadUserName round-trips the name', async () => {
  const storage = fakeStorage()
  await saveUserName(storage, '건호')
  assert.strictEqual(await loadUserName(storage), '건호')
})
