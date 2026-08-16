import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Build a minimal cordis-like ctx for the host half. */
function makeCtx() {
  const listeners = {}
  const routes = []
  const ctx = {
    webServer: {
      register(route) { routes.push(route); return () => {} },
    },
    get() { return undefined },
    on(event, listener) { (listeners[event] ||= []).push(listener); return () => {} },
    effect(fn) { fn(); return () => {} },
  }
  return { ctx, listeners, routes }
}

test('host half records llm/stream usage and serves it over the stats route', async () => {
  const home = mkdtempSync(join(tmpdir(), 'utt-host-'))
  process.env.HOME = home
  const { apply, name, inject } = await import('../lib/index.js')

  assert.equal(name, 'usage-tracker')
  assert.deepEqual(inject, ['webServer'])

  const { ctx, listeners, routes } = makeCtx()
  apply(ctx)

  assert.equal(routes.length, 1)
  assert.equal(routes[0].path, '/usage-tracker/stats')

  // Drive one llm/stream call through the listener.
  const streamListener = listeners['llm/stream'][0]
  const options = { model: 'deepseek-v4-pro' }
  const inner = (async function* () {
    yield { usage: { inputTokens: 1000, outputTokens: 100 } }
    yield { usage: { inputTokens: 1200, outputTokens: 300 } }
  })()
  const wrapped = streamListener(options, () => inner)
  for await (const _chunk of wrapped) { /* consume to reach the finally */ }

  // Flush the debounced save and assert the route payload.
  listeners['dispose']?.[0]?.()

  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v }, end(s) { this.body = s } }
  await routes[0].handler({ method: 'GET', url: '/usage-tracker/stats' }, res)
  const payload = JSON.parse(res.body)

  assert.equal(res.statusCode, 200)
  assert.equal(payload.stats.total.calls, 1)
  assert.equal(payload.stats.total.input, 1200)
  assert.equal(payload.stats.total.output, 300)
  assert.equal(payload.stats.byProvider.deepseek.calls, 1)
  assert.equal(payload.stats.byModel['deepseek-v4-pro'].calls, 1)
  assert.ok(payload.stats.total.cost > 0)
  // Exactly one pricing band is non-zero for a single call.
  const bandTotals = ['peak', 'offPeak', 'flat'].filter((k) => payload.stats.byBand[k].calls > 0)
  assert.equal(bandTotals.length, 1)
  // The signal the footer dot consumes.
  assert.ok(payload.currentBand === 'peak' || payload.currentBand === 'offPeak')
})

test('host half persists to the stats file and reloads it', async () => {
  const home = mkdtempSync(join(tmpdir(), 'utt-host2-'))
  process.env.HOME = home
  const mod = await import('../lib/index.js?persist=' + Math.random())

  const { ctx, listeners } = makeCtx()
  mod.apply(ctx)

  const streamListener = listeners['llm/stream'][0]
  const inner = (async function* () {
    yield { usage: { inputTokens: 500, outputTokens: 50 } }
  })()
  for await (const _chunk of streamListener({ model: 'gpt-4o' }, () => inner)) { /* consume */ }
  listeners['dispose']?.[0]?.()

  const { existsSync, readFileSync } = await import('node:fs')
  const file = join(home, '.dsh', 'usage-tracker.json')
  assert.ok(existsSync(file))
  const saved = JSON.parse(readFileSync(file, 'utf8'))
  assert.equal(saved.total.calls, 1)
  assert.equal(saved.byProvider.openai.calls, 1)
})
