# dsh-usage-tracker

A zero-build, zero-dependency [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web plugin that tracks model usage and cost across your session — DeepSeek peak/off-peak pricing included, plus every other connected provider (Codex/ChatGPT subscription, OpenAI, Claude, Gemini, …).

## What it does

- **Sidebar button (above Settings)** — a "Usage" button at the bottom-left of the sidebar, with a live total-cost badge.
- **Floating summary panel** — click the button to see total cost, calls, output tokens, the **DeepSeek peak / off-peak breakdown**, a per-provider cost table, and recent calls.
- **Session-scoped cost** — a persistent line under the composer shows "This session" spend, calls, and tokens.
- **Settings page** — full detail: total/input/output cards, peak/off-peak breakdown, per-provider and per-session tables, recent calls, backfill and clear.
- **All providers** — the host listens to `llm/stream`, so every model call is captured regardless of provider. DeepSeek is priced with the official peak/off-peak schedule (Beijing time); other providers use a flat multi-vendor USD table; Codex/ChatGPT-subscription usage is tracked with an API-equivalent estimate (it is a flat subscription in reality).
- **Persistence** — stats survive restarts in `~/.dsh/usage-tracker.json`; first load backfills history from the durable session logs.

## Pricing

- **DeepSeek** (USD / 1M tokens, official): peak `09:00–12:00` and `14:00–18:00` Beijing time; off-peak otherwise. Before `2026-08-17` the V4 models were flat-priced.
- **Other providers**: a flat USD table (OpenAI, Codex/Kiro, Claude, Gemini, Grok, Qwen, GLM, Kimi, MiniMax) with prefix matching; unknown models fall back to a default row.

## Install

```bash
# from this checkout
dsh plugin --profile web add link:/path/to/dsh-usage-tracker

# or, once published to npm
dsh plugin --profile web add dsh-usage-tracker
```

Restart `dsh web`, then refresh the page. The "Usage" button appears at the bottom of the sidebar, above Settings.

> The plugin is a dual-face package: the node half (`lib/index.js`) runs in the host (usage listener + `/usage-tracker/stats` route), and the browser half (`lib/client.js`) renders the UI. It has no npm dependencies.

## Development

```bash
node --test 'tests/*.test.js'   # unit + integration tests (built-in node:test)
npm run check                    # syntax-check the shipped files
```

`lib/` ships prebuilt plain ESM JavaScript (no build step required).

## License

MIT
