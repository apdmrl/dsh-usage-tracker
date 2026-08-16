window.__ModuleLoader__.load({
  id: 'dsh-usage-tracker',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    let react = require('react')

    // ------------------------------------------------------------------
    // i18n dictionaries (en / tr / zh). Binds to the locale service when
    // present; otherwise falls back to English.
    // ------------------------------------------------------------------
    const DICTS = {
      en: {
        'btn.label': 'Usage',
        'btn.open': 'Usage ▲',
        'btn.tooltip': 'Usage & cost (all sessions)',
        'btn.closeTooltip': 'Close usage panel',
        'ov.title': 'Usage & Cost',
        'ov.close': 'Close',
        'ov.loading': 'Loading…',
        'ov.total': 'Total cost',
        'ov.calls': 'Calls',
        'ov.thisSession': 'This session',
        'ov.bands': 'DeepSeek peak / off-peak',
        'ov.models': 'By provider',
        'ov.recent': 'Recent calls',
        'band.peak': 'Peak',
        'band.offPeak': 'Off-peak',
        'band.flat': 'Flat',
        'prov.deepseek': 'DeepSeek',
        'prov.codex': 'Codex / ChatGPT',
        'prov.openai': 'OpenAI',
        'prov.anthropic': 'Claude',
        'prov.google': 'Gemini',
        'prov.xai': 'Grok',
        'prov.qwen': 'Qwen',
        'prov.glm': 'GLM',
        'prov.kimi': 'Kimi',
        'prov.minimax': 'MiniMax',
        'prov.other': 'Other',
        'dock.thisSession': 'This session',
        'dock.calls': 'calls',
        'dock.in': 'in',
        'dock.out': 'out',
        'set.title': 'Usage & Cost',
        'set.refresh': 'Refresh',
        'set.backfill': 'Backfill history',
        'set.backfilling': 'Backfilling…',
        'set.clear': 'Clear',
        'set.confirmClear': 'Click again to confirm',
        'set.total': 'Total cost',
        'set.calls': 'Calls',
        'set.input': 'Input tokens',
        'set.output': 'Output tokens',
        'set.hit': 'hit',
        'set.miss': 'miss',
        'set.bands': 'DeepSeek peak / off-peak',
        'set.models': 'By provider',
        'set.sessions': 'By session (top 8)',
        'set.recent': 'Recent calls',
        'set.time': 'Time',
        'set.model': 'Model',
        'set.band': 'Band',
        'set.cost': 'Cost',
        'set.noRecent': 'No calls recorded yet',
        'set.note': 'Peak windows 09:00–12:00 / 14:00–18:00 Beijing time. Non-DeepSeek providers use a flat USD estimate; Codex/ChatGPT is a subscription.',
        'set.backfillHint': 'Only calls made while the plugin is enabled are recorded live; click "Backfill history" to rebuild from session logs.',
        'set.persist': 'Data persisted to {file}',
        'set.persistErr': '⚠ Persistence failed: {error}',
        'set.backfillDone': 'Backfilled: {sessions} sessions, {found} calls',
        'set.backfillFailed': 'Backfill failed',
        'set.clearDone': 'Cleared',
        'set.unknownError': 'Unknown error',
        'common.loadFailed': 'Load failed',
      },
      tr: {
        'btn.label': 'Kullanım',
        'btn.open': 'Kullanım ▲',
        'btn.tooltip': 'Kullanım ve maliyet (tüm oturumlar)',
        'btn.closeTooltip': 'Kullanım panelini kapat',
        'ov.title': 'Kullanım ve Maliyet',
        'ov.close': 'Kapat',
        'ov.loading': 'Yükleniyor…',
        'ov.total': 'Toplam maliyet',
        'ov.calls': 'Çağrı',
        'ov.thisSession': 'Bu oturum',
        'ov.bands': 'DeepSeek peak / off-peak',
        'ov.models': 'Sağlayıcıya göre',
        'ov.recent': 'Son çağrılar',
        'band.peak': 'Peak',
        'band.offPeak': 'Off-peak',
        'band.flat': 'Sabit',
        'prov.deepseek': 'DeepSeek',
        'prov.codex': 'Codex / ChatGPT',
        'prov.openai': 'OpenAI',
        'prov.anthropic': 'Claude',
        'prov.google': 'Gemini',
        'prov.xai': 'Grok',
        'prov.qwen': 'Qwen',
        'prov.glm': 'GLM',
        'prov.kimi': 'Kimi',
        'prov.minimax': 'MiniMax',
        'prov.other': 'Diğer',
        'dock.thisSession': 'Bu oturum',
        'dock.calls': 'çağrı',
        'dock.in': 'giriş',
        'dock.out': 'çıkış',
        'set.title': 'Kullanım ve Maliyet',
        'set.refresh': 'Yenile',
        'set.backfill': 'Geçmişi geri yükle',
        'set.backfilling': 'Geri yükleniyor…',
        'set.clear': 'Temizle',
        'set.confirmClear': 'Onaylamak için tekrar tıkla',
        'set.total': 'Toplam maliyet',
        'set.calls': 'Çağrı',
        'set.input': 'Giriş token',
        'set.output': 'Çıkış token',
        'set.hit': 'isabet',
        'set.miss': 'kaçan',
        'set.bands': 'DeepSeek peak / off-peak',
        'set.models': 'Sağlayıcıya göre',
        'set.sessions': 'Oturuma göre (ilk 8)',
        'set.recent': 'Son çağrılar',
        'set.time': 'Zaman',
        'set.model': 'Model',
        'set.band': 'Dilim',
        'set.cost': 'Maliyet',
        'set.noRecent': 'Henüz çağrı kaydı yok',
        'set.note': 'Peak pencereleri 09:00–12:00 / 14:00–18:00 Pekin saati. DeepSeek dışı sağlayıcılar sabit USD tahmini kullanır; Codex/ChatGPT aboneliktir.',
        'set.backfillHint': 'Yalnızca eklenti etkinken yapılan çağrılar canlı kaydedilir; geçmişi oturum kayıtlarından yeniden kurmak için "Geçmişi geri yükle"ye tıkla.',
        'set.persist': 'Veriler şuraya yazıldı: {file}',
        'set.persistErr': '⚠ Kalıcılık hatası: {error}',
        'set.backfillDone': 'Geri yüklendi: {sessions} oturum, {found} çağrı',
        'set.backfillFailed': 'Geri yükleme başarısız',
        'set.clearDone': 'Temizlendi',
        'set.unknownError': 'Bilinmeyen hata',
        'common.loadFailed': 'Yükleme başarısız',
      },
      zh: {
        'btn.label': '用量',
        'btn.open': '用量 ▲',
        'btn.tooltip': '用量与消费（全部会话）',
        'btn.closeTooltip': '关闭用量面板',
        'ov.title': '用量与消费',
        'ov.close': '关闭',
        'ov.loading': '加载中…',
        'ov.total': '总费用',
        'ov.calls': '调用次数',
        'ov.thisSession': '本会话',
        'ov.bands': 'DeepSeek 峰谷分段',
        'ov.models': '按提供商',
        'ov.recent': '最近调用',
        'band.peak': '高峰',
        'band.offPeak': '空闲',
        'band.flat': '固定',
        'prov.deepseek': 'DeepSeek',
        'prov.codex': 'Codex / ChatGPT',
        'prov.openai': 'OpenAI',
        'prov.anthropic': 'Claude',
        'prov.google': 'Gemini',
        'prov.xai': 'Grok',
        'prov.qwen': 'Qwen',
        'prov.glm': 'GLM',
        'prov.kimi': 'Kimi',
        'prov.minimax': 'MiniMax',
        'prov.other': '其他',
        'dock.thisSession': '本会话',
        'dock.calls': '次调用',
        'dock.in': '输入',
        'dock.out': '输出',
        'set.title': '用量与消费',
        'set.refresh': '刷新',
        'set.backfill': '回填历史',
        'set.backfilling': '回填中…',
        'set.clear': '清空',
        'set.confirmClear': '再点一次确认清空',
        'set.total': '总费用',
        'set.calls': '调用次数',
        'set.input': '输入 tokens',
        'set.output': '输出 tokens',
        'set.hit': '命中',
        'set.miss': '未命中',
        'set.bands': 'DeepSeek 峰谷分段',
        'set.models': '按提供商',
        'set.sessions': '按会话（Top 8）',
        'set.recent': '最近调用',
        'set.time': '时间',
        'set.model': '模型',
        'set.band': '时段',
        'set.cost': '费用',
        'set.noRecent': '暂无调用记录',
        'set.note': '高峰 09:00–12:00 / 14:00–18:00（北京时间）。非 DeepSeek 提供商按固定 USD 估算；Codex/ChatGPT 为订阅。',
        'set.backfillHint': '仅统计插件启用后的调用；点击「回填历史」从会话日志重建。',
        'set.persist': '数据持久化：{file}',
        'set.persistErr': '⚠ 持久化失败：{error}',
        'set.backfillDone': '已回填：{sessions} 个会话，{found} 条调用',
        'set.backfillFailed': '回填失败',
        'set.clearDone': '已清空',
        'set.unknownError': '未知错误',
        'common.loadFailed': '加载失败',
      },
    }

    function makeTranslate(dict) {
      return (key, params) => {
        const template = typeof dict[key] === 'string' ? dict[key] : key
        if (!params) return template
        return template.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m))
      }
    }

    let T = makeTranslate(DICTS.en)
    let LOCALE = null

    // ------------------------------------------------------------------
    // Small shared helpers
    // ------------------------------------------------------------------
    const BAND_KEYS = ['peak', 'offPeak', 'flat']
    const PROVIDER_KEYS = ['deepseek', 'codex', 'openai', 'anthropic', 'google', 'xai', 'qwen', 'glm', 'kimi', 'minimax', 'other']
    const EMPTY_BUCKET = { calls: 0, input: 0, cacheHit: 0, cacheMiss: 0, output: 0, cost: 0 }

    function el(type, props, ...children) {
      return react.createElement(type, props || null, ...children)
    }

    function fmtTokens(n) {
      n = Math.round(Number(n) || 0)
      if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
      return String(n)
    }

    function fmtCost(n) {
      return '$' + (Number(n) || 0).toFixed(4)
    }

    function fmtCostShort(n) {
      const v = Number(n) || 0
      return '$' + (v >= 10 ? v.toFixed(2) : v.toFixed(v >= 1 ? 3 : 4))
    }

    function bandLabel(bk) {
      return T('band.' + bk)
    }

    function providerLabel(pk) {
      const t = T('prov.' + pk)
      return t.indexOf('prov.') === 0 ? pk : t
    }

    function shortId(id) {
      if (typeof id !== 'string') return '?'
      return id.length > 8 ? id.slice(0, 8) : id
    }

    // Force a re-render when the locale changes.
    function useLocaleTick() {
      const [, force] = react.useState(0)
      react.useEffect(() => {
        if (!LOCALE) return
        return LOCALE.subscribe(() => force((v) => v + 1))
      }, [])
    }

    // ------------------------------------------------------------------
    // Panel open/close store (shared between the button and the overlay).
    // ------------------------------------------------------------------
    const overlayStore = {
      open: false,
      listeners: new Set(),
      subscribe(fn) { this.listeners.add(fn); return () => { this.listeners.delete(fn) } },
      notify() { for (const fn of this.listeners) fn() },
      toggle() { this.open = !this.open; this.notify() },
      close() { if (this.open) { this.open = false; this.notify() } },
    }

    function fetchStats() {
      return fetch('/usage-tracker/stats').then((r) => r.json())
    }

    function useStatsData(active, intervalMs) {
      const [data, setData] = react.useState(null)
      react.useEffect(() => {
        if (!active) return
        let alive = true
        const load = () => {
          fetchStats().then((d) => { if (alive) setData(d) }).catch(() => {})
        }
        load()
        const timer = window.setInterval(load, intervalMs)
        return () => { alive = false; window.clearInterval(timer) }
      }, [active, intervalMs])
      return data
    }

    function normalizedStats(data) {
      const s = data && data.stats ? data.stats : null
      if (!s || !s.total || !s.byBand || !s.byProvider) return null
      return s
    }

    // ------------------------------------------------------------------
    // Sidebar footer button (above Settings).
    // ------------------------------------------------------------------
    function FooterButton(props) {
      useLocaleTick()
      const [, force] = react.useState(0)
      react.useEffect(() => overlayStore.subscribe(() => force((v) => v + 1)), [])
      const data = useStatsData(true, 30000)
      const s = normalizedStats(data)
      const open = overlayStore.open
      return el('button', {
        className: 'utt-fab',
        title: open ? T('btn.closeTooltip') : T('btn.tooltip'),
        onClick: () => overlayStore.toggle(),
        'aria-pressed': open,
        style: props.wide ? null : { justifyContent: 'center', padding: '0 6px' },
      },
        el('span', null, open ? T('btn.open') : T('btn.label')),
        s && props.wide ? el('span', { className: 'utt-fab-badge' }, fmtCostShort(s.total.cost)) : null,
      )
    }

    // ------------------------------------------------------------------
    // Floating summary panel (shell.overlay).
    // ------------------------------------------------------------------
    function bandStack(s) {
      const costs = BAND_KEYS.map((bk) => (s.byBand[bk] || EMPTY_BUCKET).cost)
      const total = costs.reduce((a, b) => a + b, 0)
      const segs = BAND_KEYS.map((bk, i) => {
        const pct = total > 0 ? Math.max(1, (costs[i] / total) * 100) : 0
        return el('div', {
          key: bk,
          className: 'utt-band-seg utt-seg-' + bk,
          style: { width: pct + '%' },
          title: bandLabel(bk) + ': ' + fmtCost(costs[i]),
        })
      })
      const legend = BAND_KEYS.map((bk) => {
        const b = s.byBand[bk] || EMPTY_BUCKET
        return el('div', { className: 'utt-legend-item', key: bk },
          el('span', { className: 'utt-legend-dot utt-seg-' + bk }),
          bandLabel(bk) + ' · ' + fmtCost(b.cost),
        )
      })
      return el('div', null,
        el('div', { className: 'utt-band-stack' }, segs),
        el('div', { className: 'utt-band-legend' }, legend),
      )
    }

    function providerRows(s) {
      const rows = PROVIDER_KEYS
        .map((pk) => ({ pk, b: s.byProvider[pk] || EMPTY_BUCKET }))
        .filter((r) => r.b.calls > 0)
        .sort((a, b) => b.b.cost - a.b.cost)
      return el('div', null, rows.map((r) =>
        el('div', { className: 'utt-model-row', key: r.pk },
          el('div', { className: 'utt-model-name' }, providerLabel(r.pk)),
          el('div', { className: 'utt-muted' },
            r.b.calls + ' · ' + T('dock.in') + ' ' + fmtTokens(r.b.input) + ' / ' + T('dock.out') + ' ' + fmtTokens(r.b.output)),
          el('div', { className: 'utt-model-cost' }, fmtCost(r.b.cost)),
        ),
      ))
    }

    function recentTable(s, limit) {
      const rows = (s.recent || []).slice(0, limit || 5)
      if (rows.length === 0) return el('div', { className: 'utt-muted' }, T('set.noRecent'))
      return el('table', { className: 'utt-table' },
        el('thead', null, el('tr', null,
          el('th', null, T('set.time')), el('th', null, T('set.model')),
          el('th', null, T('set.band')), el('th', { className: 'utt-num' }, T('set.output')),
          el('th', { className: 'utt-num' }, T('set.cost')),
        )),
        el('tbody', null, rows.map((r) =>
          el('tr', { key: String(r.ts) + '-' + r.model },
            el('td', { className: 'utt-muted' }, r.time),
            el('td', null, r.model),
            el('td', null, bandLabel(r.band)),
            el('td', { className: 'utt-num' }, fmtTokens(r.output)),
            el('td', { className: 'utt-num utt-strong' }, fmtCost(r.cost)),
          ),
        )),
      )
    }

    function OverlayPanel() {
      useLocaleTick()
      const [, force] = react.useState(0)
      react.useEffect(() => overlayStore.subscribe(() => force((v) => v + 1)), [])
      const data = useStatsData(overlayStore.open, 5000)
      if (!overlayStore.open) return null
      const s = normalizedStats(data)
      return el('div', { className: 'utt-ov' },
        el('div', { className: 'utt-ov-head' },
          el('div', { className: 'utt-ov-title' }, T('ov.title')),
          el('button', { className: 'utt-ov-close', onClick: () => overlayStore.close(), 'aria-label': T('ov.close') }, '×'),
        ),
        !s
          ? el('div', { className: 'utt-muted' }, T('ov.loading'))
          : el('div', null,
              el('div', { className: 'utt-ov-stats' },
                el('div', { className: 'utt-ov-stat' },
                  el('div', { className: 'utt-ov-stat-label' }, T('ov.total')),
                  el('div', { className: 'utt-ov-stat-value utt-cost' }, fmtCost(s.total.cost)),
                ),
                el('div', { className: 'utt-ov-stat' },
                  el('div', { className: 'utt-ov-stat-label' }, T('ov.calls')),
                  el('div', { className: 'utt-ov-stat-value' }, String(s.total.calls)),
                ),
                el('div', { className: 'utt-ov-stat' },
                  el('div', { className: 'utt-ov-stat-label' }, T('set.output')),
                  el('div', { className: 'utt-ov-stat-value' }, fmtTokens(s.total.output)),
                ),
              ),
              el('div', null,
                el('div', { className: 'utt-section' }, T('ov.bands')),
                bandStack(s),
              ),
              el('div', null,
                el('div', { className: 'utt-section' }, T('ov.models')),
                providerRows(s),
              ),
              el('div', null,
                el('div', { className: 'utt-section' }, T('ov.recent')),
                recentTable(s, 5),
              ),
            ),
      )
    }

    // ------------------------------------------------------------------
    // Session-scoped dock line (under the composer).
    // ------------------------------------------------------------------
    function DockReadout(props) {
      useLocaleTick()
      const sessionId = typeof props.sessionId === 'string' && props.sessionId.length > 0
        ? props.sessionId
        : (props.session && typeof props.session.id === 'string' ? props.session.id : null)
      const data = useStatsData(sessionId !== null, 10000)
      const s = normalizedStats(data)
      if (!s || !sessionId) return null
      const b = s.bySession && s.bySession[sessionId]
      if (!b || b.calls <= 0) return null
      return el('div', { className: 'utt-dock' },
        T('dock.thisSession'),
        el('span', { className: 'utt-dock-cost' }, fmtCost(b.cost)),
        ' · ' + b.calls + ' ' + T('dock.calls'),
        ' · ' + T('dock.in') + ' ' + fmtTokens(b.input),
        ' · ' + T('dock.out') + ' ' + fmtTokens(b.output),
      )
    }

    // ------------------------------------------------------------------
    // Settings page detail.
    // ------------------------------------------------------------------
    function SettingsPanel() {
      useLocaleTick()
      const [data, setData] = react.useState(null)
      const [error, setError] = react.useState('')
      const [notice, setNotice] = react.useState('')
      const [confirming, setConfirming] = react.useState(false)
      const [backfilling, setBackfilling] = react.useState(false)

      react.useEffect(() => {
        let alive = true
        const load = async () => {
          try {
            const d = await fetchStats()
            if (alive) { setData(d); setError('') }
          } catch (e) {
            if (alive) setError(T('common.loadFailed') + ': ' + String(e && e.message ? e.message : e))
          }
        }
        load()
        const timer = window.setInterval(load, 5000)
        return () => { alive = false; window.clearInterval(timer) }
      }, [])

      const refresh = () => {
        fetchStats().then((d) => setData(d)).catch(() => {})
      }

      const onBackfill = async () => {
        setBackfilling(true)
        try {
          const res = await fetch('/usage-tracker/stats?action=backfill', { method: 'POST' })
          const r = await res.json()
          if (r && r.ok) {
            setNotice(T('set.backfillDone', { sessions: r.sessions, found: r.found }))
            window.setTimeout(() => setNotice(''), 5000)
          } else {
            setError(T('set.backfillFailed') + ': ' + String(r && r.error ? r.error : T('set.unknownError')))
          }
        } catch (e) {
          setError(T('set.backfillFailed') + ': ' + String(e && e.message ? e.message : e))
        } finally {
          setBackfilling(false)
          refresh()
        }
      }

      const onClear = async () => {
        if (!confirming) {
          setConfirming(true)
          window.setTimeout(() => setConfirming(false), 3000)
          return
        }
        setConfirming(false)
        try {
          await fetch('/usage-tracker/stats?action=clear', { method: 'POST' })
          setNotice(T('set.clearDone'))
          window.setTimeout(() => setNotice(''), 2500)
          refresh()
        } catch (e) {
          setError(String(e && e.message ? e.message : e))
        }
      }

      const head = el('div', { className: 'utt-head' },
        el('div', { className: 'utt-title' }, T('set.title')),
        el('div', { className: 'utt-actions' },
          el('button', { className: 'utt-btn', onClick: onBackfill, disabled: backfilling }, backfilling ? T('set.backfilling') : T('set.backfill')),
          el('button', { className: 'utt-btn', onClick: refresh }, T('set.refresh')),
          el('button', { className: confirming ? 'utt-btn utt-danger' : 'utt-btn', onClick: onClear }, confirming ? T('set.confirmClear') : T('set.clear')),
        ),
      )

      if (!data) {
        return el('div', { className: 'utt-panel' }, head, el('div', { className: 'utt-muted' }, error || T('ov.loading')))
      }

      const s = normalizedStats(data) || {
        total: EMPTY_BUCKET,
        byBand: { peak: EMPTY_BUCKET, offPeak: EMPTY_BUCKET, flat: EMPTY_BUCKET },
        byProvider: {},
        byModel: {},
        bySession: {},
        recent: [],
      }
      const diag = data.diag || {}

      const card = (label, value, sub, cls) =>
        el('div', { className: 'utt-card', key: label },
          el('div', { className: 'utt-card-label' }, label),
          el('div', { className: 'utt-card-value' + (cls || '') }, value),
          sub ? el('div', { className: 'utt-card-sub', title: sub }, sub) : null,
        )

      const sessionRows = Object.keys(s.bySession || {})
        .map((id) => ({ id, ...(s.bySession[id] || {}) }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 8)
        .map((x) => {
          const title = x.title && typeof x.title === 'string' ? x.title : shortId(x.id)
          return el('div', { className: 'utt-model-row', key: x.id },
            el('div', { className: 'utt-model-name' }, title),
            el('div', { className: 'utt-muted' }, x.calls + ' ' + T('dock.calls')),
            el('div', { className: 'utt-model-cost' }, fmtCost(x.cost)),
          )
        })

      const persistNote = diag.lastError
        ? T('set.persistErr', { error: diag.lastError })
        : T('set.persist', { file: diag.statsFile || '~/.dsh/usage-tracker.json' })

      return el('div', { className: 'utt-panel' },
        head,
        error ? el('div', { className: 'utt-error' }, error) : null,
        notice ? el('div', { className: 'utt-ok' }, notice) : null,
        el('div', { className: 'utt-stats-row' },
          card(T('set.total'), fmtCost(s.total.cost), T('set.backfillHint'), ' utt-cost'),
          card(T('set.calls'), String(s.total.calls)),
          card(T('set.input'), fmtTokens(s.total.input), T('set.hit') + ' ' + fmtTokens(s.total.cacheHit) + ' / ' + T('set.miss') + ' ' + fmtTokens(s.total.cacheMiss)),
          card(T('set.output'), fmtTokens(s.total.output)),
        ),
        el('div', null,
          el('div', { className: 'utt-section' }, T('set.bands')),
          bandStack(s),
        ),
        el('div', null,
          el('div', { className: 'utt-section' }, T('set.models')),
          providerRows(s),
        ),
        el('div', null,
          el('div', { className: 'utt-section' }, T('set.sessions')),
          sessionRows.length > 0 ? el('div', null, sessionRows) : el('div', { className: 'utt-muted' }, T('set.noRecent')),
        ),
        el('div', null,
          el('div', { className: 'utt-section' }, T('set.recent')),
          recentTable(s, 8),
        ),
        el('div', { className: 'utt-muted' }, T('set.note')),
        el('div', { className: diag.lastError ? 'utt-warn' : 'utt-muted' }, persistNote),
      )
    }

    // ------------------------------------------------------------------
    // CSS (DSH theme tokens).
    // ------------------------------------------------------------------
    const CSS = `
.utt-panel { display: flex; flex-direction: column; gap: 12px; padding: 4px 2px 12px; font-size: 13px; color: var(--dsw-alias-label-primary); }
.utt-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.utt-title { font-weight: 600; font-size: 14px; }
.utt-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.utt-btn { padding: 4px 10px; font-size: 12px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-primary); cursor: pointer; font-family: inherit; }
.utt-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.utt-btn:disabled { opacity: 0.55; cursor: default; }
.utt-danger { background: var(--dsw-alias-state-error-primary); color: #fff; border-color: transparent; }
.utt-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.utt-card { padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.utt-card-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.utt-card-value { font-weight: 700; font-size: 16px; white-space: nowrap; }
.utt-card-value.utt-cost { color: #60a5fa; font-size: 18px; }
.utt-card-sub { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.utt-section { font-weight: 600; }
.utt-band-stack { display: flex; height: 14px; border-radius: 7px; overflow: hidden; border: 1px solid var(--dsw-alias-border-l1); }
.utt-band-seg { height: 100%; min-width: 2px; }
.utt-seg-peak { background: #3b82f6; }
.utt-seg-offPeak { background: #93c5fd; }
.utt-seg-flat { background: #94a3b8; }
.utt-band-legend { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 4px; }
.utt-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.utt-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.utt-model-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; }
.utt-model-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.utt-model-cost { font-weight: 600; white-space: nowrap; }
.utt-muted { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.utt-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.utt-table th, .utt-table td { text-align: left; padding: 4px 6px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.utt-table th { color: var(--dsw-alias-label-secondary); font-weight: 500; }
.utt-num { text-align: right !important; font-variant-numeric: tabular-nums; }
.utt-strong { font-weight: 600; }
.utt-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.utt-warn { color: var(--dsw-alias-state-warn-primary); font-size: 12px; }
.utt-ok { color: var(--dsw-alias-state-success-primary); font-size: 12px; }
.utt-dock { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); padding: 2px 2px 0; line-height: 18px; }
.utt-dock-cost { font-weight: 600; color: #60a5fa; }
.utt-fab { width: 100%; height: 40px; border: none; background: transparent; color: var(--dsw-alias-label-primary); border-radius: 12px; padding: 0 10px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; justify-content: flex-start; overflow: hidden; white-space: nowrap; }
.utt-fab:hover { background: var(--dsw-alias-interactive-bg-hover-solid, var(--dsw-alias-bg-layer-2)); }
.utt-fab[aria-pressed="true"] { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)); }
.utt-fab-badge { font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; margin-left: auto; }
.utt-ov { position: fixed; left: 12px; bottom: 96px; width: 340px; max-width: calc(100vw - 32px); max-height: calc(100vh - 140px); overflow-y: auto; pointer-events: auto; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 12px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: var(--dsw-alias-label-primary); }
.utt-ov-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.utt-ov-title { font-weight: 600; font-size: 14px; }
.utt-ov-close { border: none; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 16px; padding: 0 6px; border-radius: 6px; line-height: 22px; }
.utt-ov-close:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.utt-ov-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.utt-ov-stat { padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.utt-ov-stat-label { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.utt-ov-stat-value { font-weight: 700; font-size: 14px; white-space: nowrap; }
.utt-ov-stat-value.utt-cost { color: #60a5fa; }
@media (max-width: 640px) {
  .utt-stats-row { grid-template-columns: repeat(2, 1fr); }
}
`

    // ------------------------------------------------------------------
    // Apply.
    // ------------------------------------------------------------------
    const inject = ['slots']

    function apply(ctx) {
      const locale = ctx.get('locale')
      if (locale) {
        ctx.effect(() => locale.register('dsh-usage-tracker', DICTS), 'usage-tracker: locale dicts')
        T = locale.bind('dsh-usage-tracker')
        LOCALE = locale
      } else {
        T = makeTranslate(DICTS.en)
        LOCALE = null
      }

      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-usage-tracker'
        tag.textContent = CSS
        document.head.appendChild(tag)
        return () => { tag.remove() }
      }, 'usage-tracker: styles')

      // Sidebar footer button (renders above Settings).
      ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
        { name: 'sidebar.footer.action', id: 'usage-tracker', order: 10, label: () => T('btn.label') },
        (props) => react.createElement(FooterButton, { wide: props.wide }),
      ))

      // Floating summary panel.
      ctx.slots.inject('shell.overlay', () => ctx.slots.register(
        { name: 'shell.overlay', id: 'usage-tracker-panel', order: 10 },
        () => react.createElement(OverlayPanel, null),
      ))

      // Settings page.
      ctx.slots.inject('settings.section', () => ctx.slots.register(
        { name: 'settings.section', id: 'usage-tracker', order: 30, label: () => T('set.title') },
        () => react.createElement(SettingsPanel, null),
      ))

      // Session-scoped dock line under the composer.
      ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
        { name: 'conversation.composer.dock', id: 'usage-tracker', order: 10 },
        (props) => react.createElement(DockReadout, { sessionId: props.sessionId, session: props.session }),
      ))
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
