import test from 'node:test'
import assert from 'node:assert/strict'
import { copy } from './statusCopy.js'

test('copy maps each decision to a Korean label and a CSS-safe style key', () => {
  assert.deepStrictEqual(copy.keep, ['유지', 'keep'])
  assert.deepStrictEqual(copy.cancel, ['해지 후보', 'cancel'])
  assert.deepStrictEqual(copy.review, ['재검토 필요', 'review'])
})
