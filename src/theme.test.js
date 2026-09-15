import test from 'node:test'
import assert from 'node:assert/strict'
import { colors, radius, spacing, hitSlop } from './theme.js'

test('colors match the design tokens from the Saas-nex-app web CSS variables', () => {
  assert.strictEqual(colors.bg, '#FAFAFA')
  assert.strictEqual(colors.card, '#FFFFFF')
  assert.strictEqual(colors.border, '#ECECEC')
  assert.strictEqual(colors.ink, '#1A1A1E')
  assert.strictEqual(colors.inkSecondary, '#8A8A93')
  assert.strictEqual(colors.accent, '#4F46E5')
  assert.strictEqual(colors.accentSoft, '#EEF0FF')
  assert.strictEqual(colors.keep, '#067647')
  assert.strictEqual(colors.keepBg, '#ECFDF3')
  assert.strictEqual(colors.review, '#B54708')
  assert.strictEqual(colors.reviewBg, '#FFFAEB')
  assert.strictEqual(colors.cancel, '#B42318')
  assert.strictEqual(colors.cancelBg, '#FEF3F2')
})

test('radius and spacing values are numbers usable directly in RN StyleSheet', () => {
  assert.strictEqual(radius.card, 14)
  assert.strictEqual(radius.pill, 999)
  assert.strictEqual(spacing.xs, 4)
  assert.strictEqual(spacing.sm, 8)
  assert.strictEqual(spacing.md, 12)
  assert.strictEqual(spacing.lg, 16)
  assert.strictEqual(spacing.xl, 20)
  assert.strictEqual(spacing.xxl, 24)
})

test('extended neutral and heatmap tokens are present for Plan B screens', () => {
  assert.strictEqual(colors.neutralBg, '#F2F2F3')
  assert.strictEqual(colors.neutralText, '#71717A')
  assert.strictEqual(colors.faint, '#A0A0A8')
  assert.strictEqual(colors.heat0, '#F2F2F3')
  assert.strictEqual(colors.heat1, '#E4E5FB')
  assert.strictEqual(colors.heat2, '#C3C7F5')
  assert.strictEqual(colors.heat3, '#9098EE')
  assert.strictEqual(colors.heat4, '#5B63E3')
})

test('hitSlop expands compact touch targets toward the ~48px accessibility minimum on every side', () => {
  assert.strictEqual(hitSlop.top, 14)
  assert.strictEqual(hitSlop.bottom, 14)
  assert.strictEqual(hitSlop.left, 14)
  assert.strictEqual(hitSlop.right, 14)
})
