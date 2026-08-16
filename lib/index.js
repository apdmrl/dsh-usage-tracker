/**
 * dsh-usage-tracker — host half.
 *
 * Listens to the `llm/stream` waterfall and records every model call (any
 * provider: DeepSeek, Codex/ChatGPT-subscription, OpenAI, Anthropic, ...),
 * attributes it to a model and a session, prices it (DeepSeek peak/off-peak
 * Beijing time, everyone else a flat multi-vendor USD row), and serves the
 * aggregate at GET /usage-tracker/stats. Stats persist to
 * ~/.dsh/usage-tracker.json so they survive restarts. A first-load backfill
 * rebuilds history from the durable session logs through `sessionQuery`.
 *
 * @module dsh-usage-tracker
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  add,
  beijingTime,
  bucket,
  emptyStats,
  extractUsage,
  normalizeUsage,
  pickModel,
  roundCost,
  sessionBucket,
} from './core/aggregate.js'
import {
  PEAK_WINDOWS,
  TIMEZONE,
  classifyProvider,
  costUsd,
  priceAt,
} from './core/pricing.js'

export const name = 'usage-tracker'
export const inject = ['webServer']

/** Stats document location: the dsh home, alongside settings/sessions. */
const STATS_FILE = join(homedir(), '.dsh', 'usage-tracker.json')

/** Max recent-call entries retained in memory and on disk. */
const RECENT_LIMIT = 50

export function apply(ctx) {
  const webServer = ctx.webServer
  const agents = ctx.get('agents')
  const sessionQuery = ctx.get('sessionQuery')

  const diag = { statsFile: STATS_FILE, lastError: '', backfill: null }
  let stats = loadStats()
  let saveTimer = null

  function loadStats() {
    try {
      if (!existsSync(STATS_FILE)) return emptyStats()
      const parsed = JSON.parse(readFileSync(STATS_FILE, 'utf8'))
      if (!parsed || parsed.version !== 1 || !parsed.total || !parsed.byBand || !parsed.byProvider) {
        return emptyStats()
      }
      for (const key of ['peak', 'offPeak', 'flat']) {
        if (!parsed.byBand[key]) parsed.byBand[key] = bucket()
      }
      if (!parsed.byModel || typeof parsed.byModel !== 'object') parsed.byModel = {}
      if (!parsed.bySession || typeof parsed.bySession !== 'object') parsed.bySession = {}
      if (!parsed.byDay || typeof parsed.byDay !== 'object') parsed.byDay = {}
      if (!Array.isArray(parsed.recent)) parsed.recent = []
      if (!parsed.meta || typeof parsed.meta !== 'object') parsed.meta = {}
      return parsed
    } catch (error) {
      diag.lastError = 'load failed: ' + (error && error.message ? error.message : String(error))
      return emptyStats()
    }
  }

  function saveNow() {
    try {
      mkdirSync(dirname(STATS_FILE), { recursive: true })
      writeFileSync(STATS_FILE, JSON.stringify(stats))
      diag.lastError = ''
      return true
    } catch (error) {
      diag.lastError = 'save failed: ' + (error && error.message ? error.message : String(error))
      return false
    }
  }

  function scheduleSave() {
    if (saveTimer) return
    saveTimer = setTimeout(() => { saveTimer = null; saveNow() }, 1500)
  }

  function providerBucket(provider) {
    if (!stats.byProvider[provider]) stats.byProvider[provider] = bucket()
    return stats.byProvider[provider]
  }

  function modelBucket(model) {
    if (!stats.byModel[model]) stats.byModel[model] = bucket()
    return stats.byModel[model]
  }

  function currentSessionId() {
    try {
      const initiator = agents && typeof agents.currentInitiator === 'function' ? agents.currentInitiator() : undefined
      return initiator && initiator.session && typeof initiator.session.id === 'string' ? initiator.session.id : undefined
    } catch {
      return undefined
    }
  }

  function recordUsage(modelName, usage, ts, sessionId) {
    const provider = classifyProvider(modelName)
    const price = priceAt(modelName, ts)
    const cost = roundCost(costUsd(usage, price))
    const entry = {
      calls: 1,
      input: usage.input,
      cacheHit: usage.cacheHit,
      cacheMiss: usage.cacheMiss,
      output: usage.output,
      cost,
    }

    add(stats.total, entry)
    add(stats.byBand[price.mode], entry)
    add(providerBucket(provider), entry)
    add(modelBucket(modelName), entry)

    const sid = typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : 'unknown'
    if (!stats.bySession[sid]) stats.bySession[sid] = sessionBucket()
    const sb = stats.bySession[sid]
    add(sb, entry)
    if (ts > sb.lastAt) sb.lastAt = ts

    const day = beijingTime(ts).slice(0, 10)
    if (!stats.byDay[day]) stats.byDay[day] = bucket()
    add(stats.byDay[day], entry)

    stats.recent.unshift({
      ts,
      time: beijingTime(ts),
      model: modelName,
      provider,
      band: price.mode,
      sessionId: sid,
      input: usage.input,
      cacheHit: usage.cacheHit,
      cacheMiss: usage.cacheMiss,
      output: usage.output,
      cost,
    })
    if (stats.recent.length > RECENT_LIMIT) stats.recent.length = RECENT_LIMIT
    stats.updatedAt = ts
    scheduleSave()
  }

  // Capture usage for every model call, any provider.
  ctx.on('llm/stream', (options, next) => {
    const modelName = pickModel(options)
    const stream = next()
    const acc = { input: 0, cacheHit: 0, cacheMiss: 0, output: 0, seen: false }
    return (async function* () {
      try {
        for await (const chunk of stream) {
          const u = extractUsage(chunk)
          if (u) {
            acc.seen = true
            if (u.input > acc.input) acc.input = u.input
            if (u.cacheHit > acc.cacheHit) acc.cacheHit = u.cacheHit
            if (u.cacheMiss > acc.cacheMiss) acc.cacheMiss = u.cacheMiss
            if (u.output > acc.output) acc.output = u.output
          }
          yield chunk
        }
      } finally {
        if (acc.seen && (acc.input > 0 || acc.output > 0)) {
          recordUsage(modelName, acc, Date.now(), currentSessionId())
        }
      }
    })()
  })

  // Flush on unload.
  ctx.on('dispose', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
    saveNow()
  })

  function json(res, status, value) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(value))
  }

  async function backfill() {
    if (!sessionQuery || typeof sessionQuery.listSessions !== 'function') {
      return { ok: false, error: 'sessionQuery unavailable' }
    }
    let records = []
    try {
      records = await sessionQuery.listSessions()
    } catch (error) {
      return { ok: false, error: 'listSessions failed: ' + (error && error.message ? error.message : String(error)) }
    }
    let scanned = 0
    let found = 0
    for (const rec of records) {
      const id = rec && rec.header && typeof rec.header.id === 'string' ? rec.header.id : undefined
      if (!id) continue
      let snap = null
      try {
        snap = await sessionQuery.readSession(id)
      } catch {
        continue
      }
      scanned++
      const events = snap && Array.isArray(snap.events) ? snap.events : []
      let currentModel = 'unknown'
      for (const ev of events) {
        if (!ev || typeof ev !== 'object') continue
        if (ev.type === 'request/header') {
          const m = ev.data && ev.data.header && ev.data.header.config && ev.data.header.config.model
          if (typeof m === 'string' && m.length > 0) currentModel = m
          continue
        }
        if (ev.type === 'assistant/message') {
          const usage = ev.data && ev.data.usage
          if (!usage) continue
          const norm = normalizeUsage(usage)
          if (!norm) continue
          found++
          recordUsage(currentModel, norm, typeof ev.time === 'number' ? ev.time : Date.now(), id)
        }
      }
      try {
        const t = await sessionQuery.readTitle(id)
        if (t && typeof t.title === 'string' && t.title.length > 0 && stats.bySession[id]) {
          stats.bySession[id].title = t.title
        }
      } catch {
        // Title fetch is best-effort.
      }
    }
    stats.recent.sort((a, b) => b.ts - a.ts)
    if (stats.recent.length > RECENT_LIMIT) stats.recent.length = RECENT_LIMIT
    stats.meta.lastBackfillAt = Date.now()
    stats.meta.lastBackfillFound = found
    stats.meta.sessionAttribution = true
    saveNow()
    return { ok: true, sessions: scanned, found }
  }

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: '/usage-tracker/stats',
    handler: async (req, res) => {
      try {
        if (req.method === 'POST') {
          const url = new URL(req.url, 'http://localhost')
          const action = url.searchParams.get('action')
          if (action === 'backfill') {
            json(res, 200, await backfill())
            return
          }
          if (action === 'clear') {
            stats = emptyStats()
            saveNow()
            json(res, 200, { ok: true })
            return
          }
        }
        json(res, 200, {
          stats,
          peakWindows: PEAK_WINDOWS,
          timezone: TIMEZONE,
          saved: existsSync(STATS_FILE),
          diag,
        })
      } catch (error) {
        json(res, 500, { error: error && error.message ? error.message : String(error) })
      }
    },
  }), 'usage-tracker: stats route')

  // First load with no live data: rebuild from the durable logs once.
  if (stats.total.calls === 0) {
    backfill().then((result) => {
      diag.backfill = result
      if (result && result.ok) console.log('[usage-tracker] auto-backfill: sessions=' + result.sessions + ' found=' + result.found)
      else console.log('[usage-tracker] auto-backfill:', result && result.error ? result.error : result)
    }).catch((error) => {
      console.error('[usage-tracker] auto-backfill failed:', error)
    })
  }
}
