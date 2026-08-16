/**
 * Pure aggregation helpers (no dependencies, no I/O).
 *
 * Owns the stats document shape, the token-bucket fold, and the normalization
 * of provider usage payloads into the canonical
 * `{ input, cacheHit, cacheMiss, output }` tuple. The `input` field is the
 * total input tokens (cacheHit + cacheMiss); pricing consumes the split fields.
 */

/** One empty token/cost bucket. */
export function bucket() {
  return { calls: 0, input: 0, cacheHit: 0, cacheMiss: 0, output: 0, cost: 0 }
}

/** One empty per-session bucket (adds recency + title). */
export function sessionBucket() {
  return { ...bucket(), lastAt: 0, title: null }
}

/** The empty stats document, versioned. */
export function emptyStats() {
  return {
    version: 1,
    updatedAt: 0,
    meta: { liveSince: Date.now(), lastBackfillAt: 0, lastBackfillFound: 0, sessionAttribution: false },
    total: bucket(),
    byBand: { peak: bucket(), offPeak: bucket(), flat: bucket() },
    byProvider: {},
    byModel: {},
    bySession: {},
    byDay: {},
    recent: [],
  }
}

/** Add entry `e` into bucket `b` (mutates and returns `b`). */
export function add(b, e) {
  b.calls += e.calls
  b.input += e.input
  b.cacheHit += e.cacheHit
  b.cacheMiss += e.cacheMiss
  b.output += e.output
  b.cost += e.cost
  return b
}

/** Round a cost to micro-dollars (6 decimal places). */
export function roundCost(c) {
  return Math.round(c * 1e6) / 1e6
}

/**
 * Normalize a provider usage payload into the canonical tuple, or `null` when
 * it carries no tokens. Handles the harness-native camelCase fields and the
 * OpenAI/Anthropic snake_case completion shapes.
 * @param {unknown} u - a raw usage object.
 * @returns {{input: number, cacheHit: number, cacheMiss: number, output: number}|null}
 */
export function normalizeUsage(u) {
  if (!u || typeof u !== 'object') return null
  let uncached = 0
  let cached = 0
  let output = 0

  if (typeof u.inputTokens === 'number') {
    uncached = u.inputTokens
  } else if (typeof u.prompt_tokens === 'number') {
    let hit = 0
    if (typeof u.prompt_cache_hit_tokens === 'number') hit = u.prompt_cache_hit_tokens
    else if (u.prompt_tokens_details && typeof u.prompt_tokens_details === 'object' && typeof u.prompt_tokens_details.cached_tokens === 'number') {
      hit = u.prompt_tokens_details.cached_tokens
    }
    uncached = Math.max(0, u.prompt_tokens - hit)
    cached = hit
  }

  if (typeof u.cacheReadTokens === 'number') cached += u.cacheReadTokens
  if (typeof u.cacheWriteTokens === 'number') cached += u.cacheWriteTokens

  if (typeof u.outputTokens === 'number') output = u.outputTokens
  else if (typeof u.completion_tokens === 'number') output = u.completion_tokens

  if (uncached <= 0 && cached <= 0 && output <= 0) return null
  return { input: uncached + cached, cacheHit: cached, cacheMiss: uncached, output }
}

/**
 * Extract a normalized usage tuple from one stream chunk. Usage may live at
 * `chunk.usage`, `chunk.delta.usage`, or `chunk.message_delta.usage`.
 * @param {unknown} chunk - one streamed completion chunk.
 * @returns {{input: number, cacheHit: number, cacheMiss: number, output: number}|null}
 */
export function extractUsage(chunk) {
  if (!chunk || typeof chunk !== 'object') return null
  let u = null
  if (chunk.usage && typeof chunk.usage === 'object') u = chunk.usage
  else if (chunk.delta && chunk.delta.usage && typeof chunk.delta.usage === 'object') u = chunk.delta.usage
  else if (chunk.message_delta && chunk.message_delta.usage && typeof chunk.message_delta.usage === 'object') u = chunk.message_delta.usage
  if (!u) return null
  return normalizeUsage(u)
}

/**
 * Pick a model id from an `llm/stream` options object (best effort across
 * request shapes). Returns 'unknown' when nothing names a model.
 * @param {unknown} options - the `llm/stream` options.
 * @returns {string}
 */
export function pickModel(options) {
  if (!options || typeof options !== 'object') return 'unknown'
  const cands = [options.model, options.config?.model, options.request?.model]
  for (const cand of cands) {
    if (typeof cand === 'string' && cand.length > 0) return cand
  }
  return 'unknown'
}

/** Beijing date key 'YYYY-MM-DD' for an epoch-ms timestamp. */
export function beijingDateKey(ts) {
  const d = new Date(ts + 8 * 3600 * 1000)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate())
}

/** Beijing wall-clock 'YYYY-MM-DD HH:mm:ss' for an epoch-ms timestamp. */
export function beijingTime(ts) {
  const d = new Date(ts + 8 * 3600 * 1000)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return beijingDateKey(ts) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds())
}
