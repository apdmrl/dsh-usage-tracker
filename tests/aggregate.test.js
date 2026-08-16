import test from 'node:test'
import assert from 'node:assert/strict'
import {
  add,
  bucket,
  emptyStats,
  extractUsage,
  normalizeUsage,
  pickModel,
  roundCost,
} from '../lib/core/aggregate.js'

test('bucket starts at zero', () => {
  assert.deepEqual(bucket(), { calls: 0, input: 0, cacheHit: 0, cacheMiss: 0, output: 0, cost: 0 })
})

test('emptyStats has the expected shape', () => {
  const s = emptyStats()
  assert.equal(s.version, 1)
  assert.equal(s.total.calls, 0)
  assert.deepEqual(Object.keys(s.byBand).sort(), ['flat', 'offPeak', 'peak'])
  assert.deepEqual(s.byProvider, {})
  assert.deepEqual(s.byModel, {})
  assert.deepEqual(s.bySession, {})
  assert.deepEqual(s.byDay, {})
  assert.deepEqual(s.recent, [])
})

test('add folds entry fields into a bucket', () => {
  const b = bucket()
  add(b, { calls: 2, input: 100, cacheHit: 40, cacheMiss: 60, output: 25, cost: 0.5 })
  add(b, { calls: 1, input: 50, cacheHit: 20, cacheMiss: 30, output: 10, cost: 0.25 })
  assert.deepEqual(b, { calls: 3, input: 150, cacheHit: 60, cacheMiss: 90, output: 35, cost: 0.75 })
})

test('normalizeUsage handles harness-native camelCase fields', () => {
  assert.deepEqual(normalizeUsage({ inputTokens: 100, outputTokens: 50 }), {
    input: 100, cacheHit: 0, cacheMiss: 100, output: 50,
  })
})

test('normalizeUsage handles OpenAI snake_case prompt/completion fields', () => {
  assert.deepEqual(normalizeUsage({ prompt_tokens: 100, completion_tokens: 50, prompt_cache_hit_tokens: 20 }), {
    input: 100, cacheHit: 20, cacheMiss: 80, output: 50,
  })
  assert.deepEqual(normalizeUsage({ prompt_tokens: 100, completion_tokens: 50, prompt_tokens_details: { cached_tokens: 10 } }), {
    input: 100, cacheHit: 10, cacheMiss: 90, output: 50,
  })
})

test('normalizeUsage returns null for empty payloads', () => {
  assert.equal(normalizeUsage({}), null)
  assert.equal(normalizeUsage(null), null)
  assert.equal(normalizeUsage({ inputTokens: 0, outputTokens: 0 }), null)
})

test('extractUsage finds usage at chunk.usage / delta.usage / message_delta.usage', () => {
  assert.deepEqual(extractUsage({ usage: { inputTokens: 10, outputTokens: 5 } }), {
    input: 10, cacheHit: 0, cacheMiss: 10, output: 5,
  })
  assert.deepEqual(extractUsage({ delta: { usage: { inputTokens: 10, outputTokens: 5 } } }), {
    input: 10, cacheHit: 0, cacheMiss: 10, output: 5,
  })
  assert.deepEqual(extractUsage({ message_delta: { usage: { inputTokens: 10, outputTokens: 5 } } }), {
    input: 10, cacheHit: 0, cacheMiss: 10, output: 5,
  })
  assert.equal(extractUsage({}), null)
})

test('pickModel reads model across request shapes', () => {
  assert.equal(pickModel({ model: 'deepseek-v4-pro' }), 'deepseek-v4-pro')
  assert.equal(pickModel({ config: { model: 'gpt-5' } }), 'gpt-5')
  assert.equal(pickModel({ request: { model: 'claude-sonnet-4' } }), 'claude-sonnet-4')
  assert.equal(pickModel({}), 'unknown')
  assert.equal(pickModel(null), 'unknown')
})

test('roundCost rounds to micro-dollars', () => {
  assert.equal(roundCost(1.23456789), 1.234568)
  assert.equal(roundCost(0.1 + 0.2), 0.3)
})
