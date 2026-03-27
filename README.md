# KeyShortcut.com — Every keyboard shortcut, searchable and organized.

[![CI/CD](https://github.com/vladik-Didyk/KeyShortcut/actions/workflows/ci.yml/badge.svg)](https://github.com/vladik-Didyk/KeyShortcut/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Introduction

KeyShortcut is a keyboard shortcuts directory for **macOS**, **Windows**, and **Linux**. Browse shortcuts for 107+ apps across categories like Design, Browsers, Productivity, Development, and more — all in a clean, searchable interface.

**Live site**: [keyshortcut.com](https://keyshortcut.com)

## Tech Stack

- **React 19** + **React Router v7** (framework mode with SSR + static pre-rendering)
- **Vite 7** + **Tailwind CSS 4**
- **Supabase** (PostgreSQL backend + Storage for app icons)
- **Cloudflare Pages** (static hosting)

All ~175 pages are pre-rendered at build time as static HTML. No Node.js server needed in production.

## Running the project

```bash
# Clone
git clone https://github.com/vladik-Didyk/KeyShortcut.git
cd KeyShortcut

# Copy env and fill in your Supabase keys
cp .env.example .env

# Install
pnpm install

# Run
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | For sync | Supabase service role key (shortcut-sync writes) |
| `GEMINI_API_KEY` | For sync | Google Gemini API key (AI-powered scraping) |
| `VITE_CF_ANALYTICS_TOKEN` | No | Cloudflare Web Analytics token |
| `VITE_ADSENSE_ID` | No | Google AdSense publisher ID |
| `VITE_APP_STORE_ID` | No | Mac App Store app ID |

## Scripts

```bash
pnpm dev          # Dev server with HMR
pnpm build        # Production build (icons + sitemap + pre-render)
pnpm preview      # Preview production build locally
pnpm lint         # Run ESLint
pnpm test         # Run test suite
pnpm test:watch   # Run tests in watch mode
pnpm deploy       # Build + deploy to Cloudflare Pages
pnpm sync         # Run shortcut sync pipeline
pnpm sync:dry     # Dry run (no writes to Supabase)
```

## Project structure

```
src/
  routes/          Route modules (loaders, meta, components)
  components/      Page sections and reusable UI
  hooks/           Custom hooks (useTheme, useInView, usePlatformData)
  utils/           Helpers (search, platform detection, icons)
  data/            Static content and config
  test/            Test suites
public/
  data/            Runtime JSON (manifest + per-platform shortcut files)
  images/          App icons, platform icons, OG image
scripts/
  download-icons.mjs       Fetch icons from Supabase Storage
  generate-sitemap.mjs     Generate sitemap.xml
  shortcut-sync/           AI-powered shortcut extraction pipeline
```

## Data architecture

All app and shortcut data lives in **Supabase** (PostgreSQL). Route loaders query Supabase at build time during pre-rendering. The data flows:

```
Supabase → Route loaders → Pre-rendered HTML + .data files → Static deploy
```

**Adding a new platform**: Create `public/data/platforms/{platform}.json`, add an entry to `manifest.json`, run `pnpm build`. No code changes needed.

**Shortcut sync pipeline**: An automated system (`scripts/shortcut-sync/`) that scrapes official documentation, extracts shortcuts using Gemini AI, diffs against existing data, and creates PRs for review. Runs on a schedule via GitHub Actions.

## Contributing

Please use [GitHub Issues](https://github.com/vladik-Didyk/KeyShortcut/issues) to report bugs or request features. PRs are welcome!

Before submitting a PR:

```bash
pnpm lint         # Must pass with no errors
pnpm test         # Must pass all tests
pnpm build        # Must build successfully
```

## Links

- [KeyShortcut.com](https://keyshortcut.com) — Live site
- [KeyShortcut Mac HUD](https://keyshortcut.com/mac-hud) — Mac app product page

## License

[MIT](LICENSE)
