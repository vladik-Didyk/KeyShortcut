# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Keyboard shortcuts directory website — a React site that serves as a multi-platform shortcut directory (macOS, Windows, Linux) with a secondary Mac HUD product page. Domain: `https://keyshortcut.com`.

## Commands

```bash
pnpm dev          # Start React Router dev server (HMR)
pnpm build        # Build icons + sitemap + React Router build (SSR + pre-render) → build/
pnpm sitemap      # Regenerate sitemap.xml only
pnpm preview      # Preview production build via react-router-serve
pnpm start        # Serve production build
pnpm lint         # ESLint (flat config, React hooks + refresh plugins)
pnpm test         # Vitest test suite (single run)
pnpm test:watch   # Vitest in watch mode
pnpm run deploy   # Build + deploy to Cloudflare Pages (production)
pnpm sync         # Run shortcut sync pipeline (scrape → diff → write to Supabase)
pnpm sync:dry     # Dry run (no writes to Supabase)
pnpm sync:health  # Health check for sync sources
pnpm readme       # Regenerate README app directory from Supabase
```

Run a single test file: `pnpm test src/test/data-integrity.test.js`

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
- `privacy.jsx` — `/privacy` Privacy policy
- `redirect-directory.jsx` — `/directory` → `/` redirect (301)
- `redirect-legacy.jsx` — `/shortcuts/*` legacy redirects (301)
- `catch-all.jsx` — `*` 404 catch-all

**Layout**: `src/layouts/directory-layout.jsx` wraps directory routes (home, platform-index, shortcut-page, privacy) with `<Navbar />` + `<Footer />`. The product page has its own Navbar/Footer.

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

### Data architecture (Supabase → Platform → Category → App)

**Data source**: All app/shortcut data lives in **Supabase** (PostgreSQL). The Supabase client is in `src/utils/supabase.server.js`. Credentials come from `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Never hardcode Supabase credentials in source files.

**Supabase tables**:
- `platforms` — platform definitions (macos, windows, linux)
- `apps` — app metadata (slug, display_name, category_id, icon_url)
- `app_platforms` — many-to-many link between apps and platforms
- `categories` — category definitions (Design, Browsers, Productivity, etc.)
- `sections` — shortcut sections within an app (per platform)
- `shortcuts` — individual shortcuts (modifiers, key, action_key)
- `translations` — i18n strings for action labels
- `modifier_symbols` — platform-specific modifier symbols (⌘⌥⌃⇧ for macOS, Ctrl/Alt/Shift for Windows)
- `site_config` — key-value settings (SITE_URL, SUPPORT_EMAIL, PRICE, etc.)
- `cms_pages` — CMS content for UI sections (navbar, footer, etc.)
- `faqs`, `product_features`, `product_details`, `legal_policies` — product page content

**App icons**: Stored in Supabase Storage bucket `icons/app-icons/`, referenced via `icon_url` field (full URL).

**Data loading**: Route `loader()` functions call `supabase.server.js` helpers at build time during pre-rendering. Data is serialized into HTML and `.data` files. `usePlatformData` hook handles client-side platform switching on the homepage.

**Pre-rendering config**: `react-router.config.ts` queries Supabase directly (via `loadEnv` from Vite) to generate the list of ~175 paths to pre-render.

**Centralized config** — marketing constants and copy:
- `siteConfig.js` — computed constants from `platformIndex.generated.js`: `APP_COUNT`, `SHORTCUT_COUNT`, `PRICE`, etc.
- `copy.js` — all UI/marketing text organized by section, including default meta title/description.
- `categoryConfig.js` — unified category metadata (icon + color per category) for all platforms.
- `keyboardLayout.js` — keyboard row definitions and shortcut databases for Hero and InteractiveKeyboard.
- `details.js` — detail card items for the Details section.

**Hand-maintained content**: `features.js`, `faq.js`, `policies.js`, `shortcuts.js`, `appCategories.js`, `heroDemoData.js`

**Centralized copy**: `content.js` — single source of truth for all UI/marketing text. Imports computed values from `siteConfig.js`.

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

Vitest with jsdom environment, globals enabled, setup in `src/test/setup.js` (imports `@testing-library/jest-dom`). Separate `vitest.config.js` uses `@vitejs/plugin-react` (not the React Router plugin) to avoid framework conflicts. Test files live in `src/test/`. Key test suites:
- `data-integrity.test.js` — validates platform JSON structure across all platforms
- `directory-helpers.test.js` — tests platformHelpers utility functions
- `sitemap.test.js` — validates sitemap.xml generation
- `use-platform-data.test.js` — tests usePlatformData hook (loading, fetch, error, cache)
- `components.test.jsx` — tests NotFound, ErrorBoundary, Footer, MacAppStoreButton, AdSlot

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
3. React Router build — SSR + pre-renders all ~175 pages to `build/client/`

Standalone scripts:
- `scripts/update-readme-apps.mjs` — Queries Supabase, regenerates the Supported Apps section in README.md between `APP-DIRECTORY:START/END` markers
- `scripts/validate-content.mjs` — Validates content data structure
- `scripts/shortcut-sync/run.mjs` — Full sync pipeline with `--dry-run` and `--health-check` flags
