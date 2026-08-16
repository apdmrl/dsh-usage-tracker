import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_PRICE,
  PEAK_WINDOWS,
  classifyProvider,
  costUsd,
  deepseekPriceAt,
  flatPriceFor,
  isPeak,
  priceAt,
} from '../lib/core/pricing.js'

test('classifyProvider buckets model ids', () => {
  assert.equal(classifyProvider('deepseek-v4-pro'), 'deepseek')
  assert.equal(classifyProvider('deepseek-v4-flash'), 'deepseek')
  assert.equal(classifyProvider('gpt-5.1-codex'), 'codex')
  assert.equal(classifyProvider('kiro-agent'), 'codex')
  assert.equal(classifyProvider('gpt-4o'), 'openai')
  assert.equal(classifyProvider('o3'), 'openai')
  assert.equal(classifyProvider('claude-sonnet-4-5'), 'anthropic')
  assert.equal(classifyProvider('gemini-2.5-pro'), 'google')
  assert.equal(classifyProvider('grok-4'), 'xai')
  assert.equal(classifyProvider('qwen3-max'), 'qwen')
  assert.equal(classifyProvider('glm-4.6'), 'glm')
  assert.equal(classifyProvider('kimi-k2'), 'kimi')
  assert.equal(classifyProvider('minimax-m1'), 'minimax')
  assert.equal(classifyProvider('foo-bar'), 'other')
  assert.equal(classifyProvider(123), 'other')
  assert.equal(classifyProvider(undefined), 'other')
})

test('isPeak uses Beijing time windows', () => {
  // 2026-08-17 10:00 Beijing = 02:00 UTC → peak (09:00-12:00).
  assert.equal(isPeak(Date.UTC(2026, 7, 17, 2, 0, 0)), true)
  // 2026-08-17 15:00 Beijing = 07:00 UTC → peak (14:00-18:00).
  assert.equal(isPeak(Date.UTC(2026, 7, 17, 7, 0, 0)), true)
  // 2026-08-17 03:00 Beijing = 19:00 UTC (prev day) → off-peak.
  assert.equal(isPeak(Date.UTC(2026, 7, 16, 19, 0, 0)), false)
  // 2026-08-17 20:00 Beijing = 12:00 UTC → off-peak.
  assert.equal(isPeak(Date.UTC(2026, 7, 17, 12, 0, 0)), false)
  assert.deepEqual(PEAK_WINDOWS, [[9, 12], [14, 18]])
})

test('deepseekPriceAt resolves peak / off-peak / flat schedules', () => {
  const peak = deepseekPriceAt('deepseek-v4-pro', Date.UTC(2026, 7, 17, 2, 0, 0))
  assert.equal(peak.mode, 'peak')
  assert.deepEqual(
    { input: peak.input, cacheRead: peak.cacheRead, output: peak.output },
    { input: 1.32, cacheRead: 0.044, output: 3.96 },
  )

  const offPeak = deepseekPriceAt('deepseek-v4-pro', Date.UTC(2026, 7, 16, 19, 0, 0))
  assert.equal(offPeak.mode, 'offPeak')
  assert.deepEqual(
    { input: offPeak.input, cacheRead: offPeak.cacheRead, output: offPeak.output },
    { input: 0.66, cacheRead: 0.022, output: 1.98 },
  )

  // Before the 2026-08-17 peak/off-peak switch: flat V4 price.
  const flat = deepseekPriceAt('deepseek-v4-pro', Date.UTC(2026, 6, 1, 0, 0, 0))
  assert.equal(flat.mode, 'flat')
  assert.deepEqual(
    { input: flat.input, cacheRead: flat.cacheRead, output: flat.output },
    { input: 0.435, cacheRead: 0.003625, output: 0.87 },
  )
})

test('flatPriceFor matches exactly, then by longest prefix, then default', () => {
  assert.deepEqual(flatPriceFor('gpt-4o'), { input: 2.5, cacheRead: 1.25, output: 10 })
  assert.deepEqual(flatPriceFor('gpt-4o-2024-11-20'), { input: 2.5, cacheRead: 1.25, output: 10 })
  assert.deepEqual(flatPriceFor('claude-sonnet-4-5'), { input: 3, cacheRead: 0.3, output: 15 })
  assert.deepEqual(flatPriceFor('no-such-model'), DEFAULT_PRICE)
})

test('priceAt routes DeepSeek to bands and others to flat rows', () => {
  const ts = Date.UTC(2026, 7, 17, 2, 0, 0) // Beijing peak
  const ds = priceAt('deepseek-v4-pro', ts)
  assert.equal(ds.provider, 'deepseek')
  assert.equal(ds.mode, 'peak')

  const gpt = priceAt('gpt-4o', ts)
  assert.equal(gpt.provider, 'openai')
  assert.equal(gpt.mode, 'flat')
  assert.equal(gpt.input, 2.5)
})

test('costUsd splits cache hit/miss input and output', () => {
  assert.equal(
    costUsd({ cacheMiss: 1_000_000, cacheHit: 0, output: 0 }, { input: 1.32, cacheRead: 0.044, output: 3.96 }),
    1.32,
  )
  assert.equal(
    costUsd({ cacheMiss: 1_000_000, cacheHit: 1_000_000, output: 1_000_000 }, { input: 1, cacheRead: 0.5, output: 2 }),
    3.5,
  )
  assert.equal(
    costUsd({ cacheMiss: 0, cacheHit: 0, output: 0 }, { input: 1, cacheRead: 0.5, output: 2 }),
    0,
  )
})
