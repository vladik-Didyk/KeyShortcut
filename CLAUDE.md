# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Keyboard shortcuts directory website — a React site that serves as a multi-platform shortcut directory (macOS, Windows, Linux) with a secondary Mac HUD product page. Domain: `https://keyshortcut.com`.

## Commands

```bash
pnpm dev          # Start React Router dev server (HMR)
pnpm build        # Build icons + sitemap + React Router build (SSR + pre-render) → build/
pnpm sitemap      # Regenerate sitemap.xml only
pnpm rss          # Regenerate rss.xml only
pnpm og-images    # Regenerate Open Graph images only
pnpm icons        # Download app icons from Supabase Storage only
pnpm preview      # Preview production build via react-router-serve
pnpm start        # Serve production build
pnpm lint         # ESLint (flat config, React hooks + refresh plugins)
pnpm test         # Vitest test suite (single run)
pnpm test:watch   # Vitest in watch mode
pnpm test:perf    # Run performance benchmarks
pnpm test:perf:browser  # Run Playwright E2E performance tests
pnpm run deploy   # Build + deploy to Cloudflare Pages (production)
pnpm export       # Export Supabase data to public/data/ JSON (maintainer only, needs .env)
pnpm sync         # Run shortcut sync pipeline (scrape → diff → write to Supabase)
pnpm sync:dry     # Dry run (no writes to Supabase)
pnpm sync:health  # Health check for sync sources
pnpm readme       # Regenerate README app directory from Supabase
pnpm add-app      # Interactive CLI to add a new app (icon, shortcuts, all files)
pnpm add-app:dry  # Preview add-app without writing
```

Add an app from JSON: `pnpm add-app -- --from-json path/to/app.json`

Run a single test file: `pnpm test src/test/data-integrity.test.js`

## Environment Variables

See `.env.example`. **Build works without any env vars** — it reads from committed JSON in `public/data/`.

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — only for `pnpm export`, `pnpm sync`, `pnpm add-app`
- `SUPABASE_SERVICE_ROLE_KEY` — shortcut-sync write operations
- `GEMINI_API_KEY` — AI-powered scraping in shortcut-sync
- `VITE_APP_STORE_ID` — Mac App Store link; when unset, `APP_STORE_URL` is `null` and all download buttons are hidden
- `VITE_CF_ANALYTICS_TOKEN` — Cloudflare Web Analytics (optional)
- `VITE_ADSENSE_ID` — Google AdSense (optional)

## Architecture

**Stack**: React 19 + React Router v7 (framework mode) + Vite 7 + Tailwind CSS 4 (via `@tailwindcss/vite`) + jspdf

**Framework mode**: The site uses React Router v7's framework mode for SSR + static pre-rendering. All ~175 pages are pre-rendered at build time to `build/client/` as static HTML. No Node.js server needed in production — deploy as static files.

**Entry flow**: `src/root.jsx` (HTML shell with `<Layout>` + `<Outlet>`) → `src/routes.ts` (route config) → route modules in `src/routes/`

**Client hydration**: `src/entry.client.jsx` hydrates the pre-rendered HTML using `HydratedRouter`.

### Routing

Defined in `src/routes.ts` using React Router's route config API.

Route modules live in `src/routes/` and export `loader`, `meta`, and a default component:

- `home.jsx` — `/` Directory homepage (server `loader` reads manifest + macos JSON)
- `platform-index.jsx` — `/:platformId` Platform shortcuts index (server `loader`, validates platform)
- `shortcut-page.jsx` — `/:platformId/:slug` Per-app shortcut page (server `loader`, validates app)
- `product-page.jsx` — `/mac-hud` Mac HUD product page (Hero, Problem, Features, etc.)
- `guides-index.jsx` — `/guides` Guides listing page
- `guide-page.jsx` — `/guides/:slug` Individual guide (content from `src/data/guides/`)
- `cheat-sheets.jsx` — `/cheat-sheets` PDF cheat sheet generator (uses jspdf)
- `compare-index.jsx` — `/compare` App comparison listing
- `compare-page.jsx` — `/compare/:pair` Side-by-side app shortcut comparison
- `privacy.jsx` — `/privacy` Privacy policy
- `about.jsx` — `/about` About page
- `redirect-directory.jsx` — `/directory` → `/` redirect (301)
- `redirect-legacy.jsx` — `/shortcuts/*` legacy redirects (301)
- `catch-all.jsx` — `*` 404 catch-all

**Layout**: `src/layouts/directory-layout.jsx` wraps directory routes (home, platform-index, shortcut-page, privacy, about) with `<Navbar />` + `<Footer />`. The product page has its own Navbar/Footer.

**SEO**: Route modules export `meta()` functions that return title, description, OG tags, Twitter Card tags, and canonical links (via `{ tagName: "link", rel: "canonical", ... }`). All meta is rendered server-side into pre-rendered HTML.

Product page sections use anchor links (`#features`, `#faq`, `#policies`, `#download`) for in-page navigation.

### Key directories

- `src/routes/` — Route modules (loaders, meta, components)
- `src/layouts/` — Layout components (directory-layout)
- `src/components/` — Page sections and reusable UI
- `src/components/directory/` — Directory-specific components (AppIcon, AppCard)
- `src/hooks/` — Custom hooks (useTheme, useInView, useMediaQuery, useScrollspy, usePlatformData)
- `src/utils/` — Helpers (directoryHelpers for icons, platformHelpers for data lookups)
- `src/data/` — Static content arrays and generated data files
- `public/data/` — Runtime JSON data (manifest + per-platform shortcut files)
- `scripts/` — Build scripts (download-icons, generate-sitemap, update-readme-apps) + shortcut-sync pipeline

### Data architecture (Static JSON + Supabase)

**Data flow**: Supabase (PostgreSQL) is the source of truth, but the build reads from static JSON files committed to git. No Supabase credentials needed to build or contribute.

```
Supabase DB  →  pnpm export  →  public/data/*.json  →  build reads local JSON
                (maintainer)      (committed to git)     (no credentials needed)
```

**Static data files** (`public/data/`):
- `platforms.json` — platform list (id, display_name, icon_url)
- `categories.json` — category definitions
- `manifest.json` — platforms with modifier symbols and category lists
- `platforms/macos.json` — all macOS apps with sections, shortcuts, and otherPlatforms map
- `platforms/windows.json` — same for Windows
- `platforms/linux.json` — same for Linux

**Data loading**: Route `loader()` functions call `supabase.server.js` helpers which read from `public/data/` JSON files. At runtime, `usePlatformData` hook fetches `/data/platforms/{id}.json` for client-side platform switching.

**Updating data**: After changing data in Supabase (via `pnpm sync`, `pnpm add-app`, or manual edits), run `pnpm export` to regenerate the JSON files, then commit them.

**Supabase tables** (source of truth, queried by `pnpm export`):
- `platforms`, `apps`, `app_platforms`, `categories`, `sections`, `shortcuts`, `translations`, `modifier_symbols`

**App icons**: Stored in Supabase Storage bucket `icons/app-icons/` (public URLs, no auth needed). Downloaded at build time by `scripts/download-icons.mjs` using URLs from the exported JSON.

**Centralized copy**: `content.js` — single source of truth for all UI/marketing text. Imports computed values from `siteConfig.js`. Use `content.js` for all new copy; `copy.js` is legacy.

**Other data files** in `src/data/`:
- `siteConfig.js` — computed constants from `platformIndex.generated.js`: `APP_COUNT`, `SHORTCUT_COUNT`, `PRICE`, etc.
- `categoryConfig.js` — unified category metadata (icon + color per category) for all platforms.
- `keyboardLayout.js` — keyboard row definitions and shortcut databases for Hero and InteractiveKeyboard.
- `details.js` — detail card items for the Details section.
- `guides/` — Guide articles (each exports `meta` + `content`); `guides/index.js` re-exports all for pre-render discovery
- `comparisons.js` — App comparison pairs; auto-discovered by pre-render config
- Hand-maintained: `features.js`, `faq.js`, `policies.js`, `shortcuts.js`, `appCategories.js`, `heroDemoData.js`

**Adding a new platform**: Create `public/data/platforms/{platform}.json`, add entry to `manifest.json`, run `pnpm build`. No code changes needed — pre-rendering config auto-discovers platforms.

### Theme system (Retro Stationery)

Single light theme — no light/dark toggle. All colors defined as CSS custom properties on `:root` in `index.css`.
1. **CSS custom properties** in `index.css`: single `:root` block defines all variables
2. **Tailwind `@theme`** block defines `--color-theme-*` tokens that reference CSS variables
3. **`useTheme` context** (`hooks/useTheme.jsx`) exports a no-op toggle for API compatibility (always light)

**Color palette** (warm beige/tan):
- `#F5F0E8` base, `#EDE8DE` alt/surface, `#1A1A1A` text/accent, `#6B6560` muted, `#C8C0B4` border
- Accent text (on dark buttons): `#F5F0E8` (light text on dark background)
- Keycaps: warm neutrals (`#F5F0E8`, `#C8C0B4`, `#1A1A1A`, `#6B6560`)

### Hero Section

Hero uses an HTML/CSS animated keyboard mockup with `AppPanelMockup` — no 3D/canvas. On large screens, a two-column layout shows the panel + animated keyboard. Mobile shows a static screenshot fallback.

### Search system

`src/utils/searchHelpers.js` powers the directory search. It builds a flat index from all apps/shortcuts, parses natural-language queries ("figma copy", "paste in chrome"), and returns results grouped by app with modifier keycaps. Used by both `SearchDropdown` (overlay) and `SearchResultsInline` (main content area) in `DirectoryHomepage.jsx`. Search also works per-app on `ShortcutPage` and `ShortcutsIndex`.

### Icon imports

`src/utils/icons.js` is a barrel re-export of `lucide-react` icons. Import icons from `../utils/icons` (not directly from `lucide-react`) to keep the tree-shake list centralized and Vite dev server compatible.

### Platform detection

`src/utils/detectPlatform.js` detects user OS from `navigator.userAgent` for auto-selecting the default platform on the homepage.

### Styling conventions

- Apple-style design: clean flat backgrounds, generous whitespace, centered layouts
- Alternating section backgrounds via `.section-alt` class
- Max content width: `max-w-[980px]` (Apple's standard)
- Custom CSS classes: `.text-accent`, `.text-gradient`, `.fade-in-up`, `.section-alt`, `.screenshot-shadow`, `.keycap`, `.keycap-mini`, `.keycap-tiny`
- Flat cards with `rounded-2xl bg-theme-base-alt` — no glass-morphism
- Icons from `lucide-react`, app brand icons from `simple-icons`
- Font: IBM Plex Serif / IBM Plex Mono

### Testing

Vitest with jsdom environment, globals enabled, setup in `src/test/setup.js` (imports `@testing-library/jest-dom`). **Important**: Tests use a separate `vitest.config.js` with `@vitejs/plugin-react` instead of the React Router plugin — this avoids framework conflicts. Test files live in `src/test/`. E2E tests use Playwright in `e2e/`. Key test suites:
- `data-integrity.test.js` — validates platform JSON structure across all platforms
- `directory-helpers.test.js` — tests platformHelpers utility functions
- `search-helpers.test.js` — tests search/filtering utilities
- `sitemap.test.js` — validates sitemap.xml generation
- `content.test.js` — validates content data structure
- `deployment.test.js` — validates deployment configuration
- `use-platform-data.test.js` — tests usePlatformData hook (loading, fetch, error, cache)
- `performance.test.js` — benchmarks page load and rendering

### ESLint

Flat config (`eslint.config.js`). `no-unused-vars` ignores names matching `^[A-Z_]`. `react-refresh/only-export-components` is disabled for route modules (`src/routes/`) since they export loaders/meta alongside components.

### Deployment

Hosted on **Cloudflare Pages** (project: `keyshortcut`). Domain: `keyshortcut.com` via Namecheap (nameservers pointed to Cloudflare).

```bash
pnpm run deploy   # Build + deploy to Cloudflare Pages (production)
```

This runs `pnpm build` then `wrangler pages deploy build/client`. All ~175 routes are pre-rendered as static HTML. No Node.js server needed.

Cloudflare Pages config files in `public/`:
- `_headers` — security headers (X-Frame-Options, HSTS, etc.)
- `_redirects` — legacy redirect rules (`/shortcuts/*`, `/directory`)

### CI/CD Workflows (`.github/workflows/`)

- **`ci.yml`** — Main pipeline: lint → test → build → deploy to Cloudflare Pages (on main push only). Node 24, pnpm 9. Supabase credentials from GitHub Secrets.
- **`update-readme.yml`** — Auto-updates README app directory from Supabase. Runs weekly (Monday 6:00 UTC), after successful CI/CD deploy, or manually via `workflow_dispatch`.
- **`shortcut-sync.yml`** — Runs shortcut sync pipeline (scrape external docs → extract shortcuts via Gemini AI → diff → create PR).
- **`shortcut-sync-deploy.yml`** — Auto-deploys after merging PRs with `shortcut-sync` label.

### Build scripts pipeline

During `pnpm build`, scripts run in order:
1. `scripts/download-icons.mjs` — Fetches app icons from Supabase Storage into `public/images/app-icons/`
2. `scripts/generate-sitemap.mjs` — Generates `public/sitemap.xml` from pre-rendered routes
3. `scripts/generate-rss.mjs` — Generates `public/rss.xml`
4. `scripts/generate-og-images.mjs` — Generates Open Graph images
5. React Router build — SSR + pre-renders all ~175 pages to `build/client/`

**Pre-render route discovery** (`react-router.config.ts`): Reads `public/data/platforms.json` and each platform's app list at build time to generate all `/:platformId` and `/:platformId/:slug` routes. Also imports guide slugs from `src/data/guides/index.js` and comparison pairs from `src/data/comparisons.js`. Adding a new platform JSON or guide/comparison entry automatically creates new pre-rendered pages.

Standalone scripts:
- `scripts/update-readme-apps.mjs` — Queries Supabase, regenerates the Supported Apps section in README.md between `APP-DIRECTORY:START/END` markers
- `scripts/validate-content.mjs` — Validates content data structure
- `scripts/shortcut-sync/run.mjs` — Full sync pipeline with `--dry-run` and `--health-check` flags
- `scripts/sync-apple-docs.mjs` — Bulk sync script for Apple app shortcuts (18 apps, idempotent)

### Shortcut sync pipeline (`scripts/shortcut-sync/`)

The sync pipeline scrapes official documentation pages, extracts shortcuts via Gemini AI, diffs against Supabase, and creates PRs with changes.

**Key files**:
- `sources.json` — Registry of all apps with their docs URLs, parser type, and tier (1=weekly, 2=bi-monthly, 3=on-demand)
- `pipeline/supabase-writer.mjs` — Writes shortcut data to Supabase using service role key (REST API, bypasses RLS)
- `pipeline/normalize.mjs` — Normalizes scraped data (modifiers, keys, actions)
- `pipeline/modifier-map.mjs` — Canonical modifier names per platform (command/option/control/shift/fn for macOS)
- `pipeline/key-map.mjs` — Canonical key names (Left/Right/Up/Down for arrows, Enter, Delete, Escape, Space, Tab)
- `diff/` — Diff engine comparing scraped data against existing Supabase data

**Data conventions**:
- Modifiers stored as PostgreSQL arrays of canonical names: `{command,shift}` (not symbols like ⌘⇧)
- `action_key` format: `shortcuts.{slug}.{camelCaseAction}` (e.g., `shortcuts.chrome.selectAll`)
- Action text lives in `translations` table (key=action_key, language='en', value='Select All')
- `docs_url` on `apps` table links to official documentation; displayed as external link icon on shortcut pages
- `app_platforms` junction table links apps to platforms (macos, windows, linux)

**Adding a new app** requires changes in multiple places:
1. **Supabase** — Create `apps` row (slug, display_name, category_id, docs_url), `app_platforms` link, sections, shortcuts, translations
2. **Icon** — Upload 128x128 WebP to Supabase Storage `icons/app-icons/{slug}.webp`, set `icon_url` on the app row
3. **`src/utils/directoryHelpers.js`** — Add entry to `imageIcons` map (display name → slug) AND `slugToIconName` map (slug → display name). Without this, the icon shows a letter placeholder fallback even if the image file exists.
4. **`src/data/appCategories.js`** — Add display name to the appropriate category array
5. **`scripts/shortcut-sync/sources.json`** — Add entry for the sync automation pipeline (alphabetically sorted)
6. **Run `pnpm export`** to regenerate `public/data/` JSON files, then commit them
