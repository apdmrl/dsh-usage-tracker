/**
 * Pure pricing engine (no dependencies, no I/O).
 *
 * Two pricing worlds, chosen by provider:
 *  - DeepSeek: official peak / off-peak schedule, Beijing time. Peak windows
 *    are 09:00-12:00 and 14:00-18:00 (Asia/Shanghai); before 2026-08-17 the
 *    V4 models were flat-priced. Rates are USD per 1M tokens, curated from the
 *    DeepSeek official pricing page (api-docs.deepseek.com).
 *  - Every other provider: a flat multi-vendor USD table (input / cache-read /
 *    output per 1M tokens), resolved by exact match then longest `-`-delimited
 *    prefix. Codex / ChatGPT-subscription models are usage-tracked with an
 *    API-equivalent estimate; their real billing is a flat subscription.
 *
 * Semantic convention (matches the provider adapters):
 *  - input      = cache-miss input tokens
 *  - cacheRead  = cache-hit (cached) input tokens
 *  - output     = output tokens
 */

/** Peak windows (Beijing local hour, [start, end)). */
export const PEAK_WINDOWS = [[9, 12], [14, 18]]

/** Default timezone for peak/off-peak classification. */
export const TIMEZONE = 'Asia/Shanghai'

/** DeepSeek official policy schedule (USD per 1M tokens), newest wins. */
export const DEEPSEEK_POLICIES = [
  {
    since: '2025-02-09T00:00:00+08:00',
    label: 'standard',
    prices: {
      'deepseek-chat': { input: 0.28, cacheRead: 0.028, output: 0.42 },
      'deepseek-reasoner': { input: 0.55, cacheRead: 0.055, output: 1.68 },
      '*': { input: 0.28, cacheRead: 0.028, output: 0.42 },
    },
  },
  {
    since: '2026-05-22T00:00:00+08:00',
    label: 'v4-flat',
    prices: {
      'deepseek-v4-flash': { input: 0.14, cacheRead: 0.0028, output: 0.28 },
      'deepseek-v4-pro': { input: 0.435, cacheRead: 0.003625, output: 0.87 },
      '*': { input: 0.14, cacheRead: 0.0028, output: 0.28 },
    },
  },
  {
    since: '2026-08-17T00:00:00+08:00',
    label: 'v4-peak-offpeak',
    peak: {
      'deepseek-v4-flash': { input: 0.44, cacheRead: 0.014, output: 1.32 },
      'deepseek-v4-pro': { input: 1.32, cacheRead: 0.044, output: 3.96 },
      '*': { input: 0.44, cacheRead: 0.014, output: 1.32 },
    },
    offPeak: {
      'deepseek-v4-flash': { input: 0.22, cacheRead: 0.007, output: 0.66 },
      'deepseek-v4-pro': { input: 0.66, cacheRead: 0.022, output: 1.98 },
      '*': { input: 0.22, cacheRead: 0.007, output: 0.66 },
    },
  },
]

/** Fallback price for models absent from the table (USD per 1M tokens). */
export const DEFAULT_PRICE = { input: 0.27, cacheRead: 0.07, output: 1.1 }

/**
 * Multi-vendor USD price rows (input / cacheRead / output per 1M tokens).
 * Curated from vendor pricing pages; OpenAI and Kiro/Codex rows cover the
 * ChatGPT-subscription and Codex CLI models DSH can route to.
 */
export const MODEL_PRICES = {
  // OpenAI (ChatGPT / GPT models)
  'gpt-4o': { input: 2.5, cacheRead: 1.25, output: 10 },
  'gpt-4o-mini': { input: 0.15, cacheRead: 0.075, output: 0.6 },
  'gpt-4.1': { input: 2, cacheRead: 0.5, output: 8 },
  'gpt-4.1-mini': { input: 0.4, cacheRead: 0.1, output: 1.6 },
  'gpt-4.1-nano': { input: 0.1, cacheRead: 0.025, output: 0.4 },
  'o3': { input: 2, cacheRead: 0.5, output: 8 },
  'o3-mini': { input: 1.1, cacheRead: 0.275, output: 4.4 },
  'o4-mini': { input: 1.1, cacheRead: 0.275, output: 4.4 },
  'gpt-5': { input: 1.25, cacheRead: 0.125, output: 10 },
  'gpt-5-mini': { input: 0.25, cacheRead: 0.025, output: 2 },
  'gpt-5-nano': { input: 0.05, cacheRead: 0.005, output: 0.4 },
  'gpt-5.1': { input: 1.25, cacheRead: 0.125, output: 10 },
  'gpt-5.1-mini': { input: 0.25, cacheRead: 0.025, output: 2 },
  'gpt-5.1-nano': { input: 0.05, cacheRead: 0.005, output: 0.4 },

  // Codex (Kiro custom agent; ChatGPT-subscription / Codex CLI)
  'kiro-agent': { input: 3, cacheRead: 0.3, output: 15 },
  'kiro-cli-agent': { input: 3, cacheRead: 0.3, output: 15 },

  // Anthropic Claude
  'claude-3-5-haiku': { input: 0.8, cacheRead: 0.08, output: 4 },
  'claude-3-5-sonnet': { input: 3, cacheRead: 0.3, output: 15 },
  'claude-3-7-sonnet': { input: 3, cacheRead: 0.3, output: 15 },
  'claude-sonnet-4': { input: 3, cacheRead: 0.3, output: 15 },
  'claude-sonnet-4-5': { input: 3, cacheRead: 0.3, output: 15 },
  'claude-sonnet-5': { input: 3, cacheRead: 0.3, output: 15 },
  'claude-opus-4': { input: 15, cacheRead: 1.5, output: 75 },
  'claude-opus-4-1': { input: 15, cacheRead: 1.5, output: 75 },
  'claude-haiku-4-5': { input: 1, cacheRead: 0.1, output: 5 },

  // Google Gemini
  'gemini-2.5-flash': { input: 0.3, cacheRead: 0.075, output: 2.5 },
  'gemini-2.5-pro': { input: 1.25, cacheRead: 0.3125, output: 10 },
  'gemini-3-flash-preview': { input: 0.3, cacheRead: 0.075, output: 2.5 },
  'gemini-3-pro-preview': { input: 2, cacheRead: 0.5, output: 12 },

  // xAI Grok
  'grok-3': { input: 3, cacheRead: 0.3, output: 15 },
  'grok-4': { input: 3, cacheRead: 0.75, output: 15 },
  'grok-4-fast': { input: 0.2, cacheRead: 0.05, output: 0.5 },
  'grok-4.5': { input: 2, cacheRead: 0.5, output: 6 },
  'grok-code-fast': { input: 0.2, cacheRead: 0.05, output: 0.5 },
  'grok-code-reasoner': { input: 3, cacheRead: 0.75, output: 15 },

  // Alibaba Qwen
  'qwen3-max': { input: 1.28, cacheRead: 0.16, output: 6.4 },
  'qwen3-coder': { input: 0.22, cacheRead: 0.0275, output: 0.88 },

  // Zhipu GLM
  'glm-4.5': { input: 0.6, cacheRead: 0.11, output: 2.2 },
  'glm-4.6': { input: 0.6, cacheRead: 0.11, output: 2.2 },
  'glm-5': { input: 1, cacheRead: 0.2, output: 3.2 },

  // Moonshot Kimi
  'kimi-k2': { input: 0.6, cacheRead: 0.15, output: 2 },
  'kimi-k2-thinking': { input: 0.6, cacheRead: 0.15, output: 2 },
  'kimi-k2.5': { input: 0.6, cacheRead: 0.15, output: 2 },
  'kimi-k3': { input: 3, cacheRead: 0.3, output: 15 },

  // MiniMax
  'minimax-m1': { input: 0.2, cacheRead: 0.025, output: 1.1 },
  'minimax-m2': { input: 0.3, cacheRead: 0.0375, output: 1.2 },
}

/** Provider bucket keys, ordered for stable display. */
export const PROVIDER_KEYS = [
  'deepseek', 'codex', 'openai', 'anthropic', 'google', 'xai', 'qwen', 'glm', 'kimi', 'minimax', 'other',
]

/**
 * Classify a model id into a provider bucket.
 * @param {unknown} model - the model id from a request header.
 * @returns {string} one of PROVIDER_KEYS.
 */
export function classifyProvider(model) {
  if (typeof model !== 'string' || model.length === 0) return 'other'
  const n = model.toLowerCase()
  if (n.includes('deepseek')) return 'deepseek'
  if (n.includes('codex') || n.includes('kiro')) return 'codex'
  if (n.includes('claude')) return 'anthropic'
  if (n.includes('gemini')) return 'google'
  if (n.includes('grok')) return 'xai'
  if (n.includes('qwen')) return 'qwen'
  if (n.includes('glm')) return 'glm'
  if (n.includes('kimi') || n === 'k3') return 'kimi'
  if (n.includes('minimax')) return 'minimax'
  if (n.startsWith('gpt-') || n.startsWith('o1') || n.startsWith('o3') || n.startsWith('o4')) return 'openai'
  return 'other'
}

/** True when `prefix` is a `-`-delimited prefix of `model`. */
function isPrefix(prefix, model) {
  return model.length > prefix.length && model.startsWith(prefix) && model[prefix.length] === '-'
}

/**
 * Resolve a flat multi-vendor price row for a (non-DeepSeek) model id.
 * Exact match first, then longest `-`-delimited prefix, then the default.
 * @param {string} model - model id.
 * @returns {{input: number, cacheRead: number, output: number}}
 */
export function flatPriceFor(model) {
  if (MODEL_PRICES[model] !== undefined) return MODEL_PRICES[model]
  let best = { key: '', len: -1 }
  for (const key of Object.keys(MODEL_PRICES)) {
    if (isPrefix(key, model) && key.length > best.len) best = { key, len: key.length }
  }
  if (best.len >= 0) return MODEL_PRICES[best.key]
  return DEFAULT_PRICE
}

/** Get the Beijing local hour (0-23) for an epoch-ms timestamp. */
export function beijingHour(ts) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      hour12: false,
      hour: 'numeric',
    }).formatToParts(new Date(ts))
    const raw = parts.find((part) => part.type === 'hour')?.value ?? '0'
    return Number(raw) % 24
  } catch {
    return -1
  }
}

/** Whether an epoch-ms timestamp falls in a DeepSeek peak window. */
export function isPeak(ts) {
  const hour = beijingHour(ts)
  return PEAK_WINDOWS.some(([start, end]) => hour >= start && hour < end)
}

/**
 * Pick the DeepSeek policy table active at a timestamp.
 * @param {number} ts - epoch ms.
 * @returns {object} the newest policy whose `since` is <= ts.
 */
function activeDeepSeekPolicy(ts) {
  let active = DEEPSEEK_POLICIES[0]
  for (const policy of DEEPSEEK_POLICIES) {
    const since = Date.parse(policy.since)
    if (Number.isFinite(since) && ts >= since) active = policy
  }
  return active
}

/**
 * Resolve the DeepSeek unit price for a model at a timestamp.
 * @param {string} model - model id (deepseek-*).
 * @param {number} ts - epoch ms.
 * @returns {{input: number, cacheRead: number, output: number, mode: string, label: string}}
 *   mode is 'peak' | 'offPeak' | 'flat'.
 */
export function deepseekPriceAt(model, ts) {
  const policy = activeDeepSeekPolicy(ts)
  const hasBands = policy.peak !== undefined && policy.offPeak !== undefined
  const table = hasBands ? (isPeak(ts) ? policy.peak : policy.offPeak) : policy.prices
  const unit = table[model] ?? table['*'] ?? DEFAULT_PRICE
  return {
    ...unit,
    mode: hasBands ? (isPeak(ts) ? 'peak' : 'offPeak') : 'flat',
    label: policy.label,
  }
}

/**
 * Resolve the effective unit price for any model at a timestamp.
 * DeepSeek models get peak/off-peak/flat; every other provider gets a flat
 * multi-vendor row.
 * @param {string} model - model id.
 * @param {number} ts - epoch ms.
 * @returns {{input: number, cacheRead: number, output: number, provider: string, mode: string, label: string}}
 */
export function priceAt(model, ts) {
  const provider = classifyProvider(model)
  if (provider === 'deepseek') {
    const unit = deepseekPriceAt(model, ts)
    return { ...unit, provider }
  }
  const flat = flatPriceFor(model)
  return { ...flat, provider, mode: 'flat', label: 'flat' }
}

/**
 * Compute USD cost for one usage observation under a unit price.
 * @param {{cacheMiss: number, cacheHit: number, output: number}} usage - normalized usage.
 * @param {{input: number, cacheRead: number, output: number}} unit - per-1M price row.
 * @returns {number} cost in USD, rounded to micro-dollars.
 */
export function costUsd(usage, unit) {
  const miss = usage.cacheMiss ?? 0
  const hit = usage.cacheHit ?? 0
  const out = usage.output ?? 0
  const cost = (miss * unit.input + hit * unit.cacheRead + out * unit.output) / 1e6
  return Math.round(cost * 1e6) / 1e6
}
