# dsh-usage-tracker

Usage & cost tracker for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Zero build, zero npm dependencies (plain ESM JavaScript).

[Türkçe](README.md)

## Features

- **"Usage" button at the bottom-left** (above Settings) — live total-cost badge and a **peak/off-peak signal**: green = off-peak, blue = peak.
- **Panel** — total cost, calls, DeepSeek peak/off-peak breakdown, per-provider usage, and recent calls.
- **"This session" line** — session cost under the composer.
- **Settings page** — full breakdown, backfill history, and clear.
- **All providers** — DeepSeek official peak/off-peak (Beijing time, USD); a flat USD estimate for everything else, including the Codex/ChatGPT subscription.
- **Language** — Türkçe / English / 中文 (toggle in the panel header).
- **Persistence** — data lives in `~/.dsh/usage-tracker.json`, survives restarts.

## Install

```bash
dsh plugin --profile web add link:/path/to/dsh-usage-tracker
```

Restart `dsh web` and refresh the page.

> Once published: `dsh plugin --profile web add dsh-usage-tracker`

## Development

```bash
node --test 'tests/*.test.js'   # unit + integration tests
npm run check                    # syntax check
```

## License

MIT
