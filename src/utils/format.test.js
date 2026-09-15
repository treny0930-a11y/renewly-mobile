import test from 'node:test'
import assert from 'node:assert/strict'
import { won } from './format.js'

test('won formats a number as Korean currency with thousands separators', () => {
  assert.strictEqual(won(15000), '15,000원')
  assert.strictEqual(won(0), '0원')
  assert.strictEqual(won(1234567), '1,234,567원')
})
