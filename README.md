# KeyShortcut.com

The keyboard shortcuts directory -- search cheatsheets for every app you use.

Browse keyboard shortcuts for macOS, Windows, and Linux in a clean, searchable directory.

**Live site**: [keyshortcut.com](https://keyshortcut.com)

## Tech Stack

- **React 19** + **React Router v7** (framework mode with SSR + static pre-rendering)
- **Vite 7** + **Tailwind CSS 4**
- **Supabase** (PostgreSQL backend + Storage for app icons)
- **Cloudflare Pages** (static hosting)

All pages are pre-rendered at build time as static HTML. No Node.js server needed in production.

## Setup

```bash
# Clone the repo
git clone https://github.com/vladik-Didyk/KeyShortcut.git
cd KeyShortcut

# Copy env and fill in your Supabase keys
cp .env.example .env

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Scripts

```bash
pnpm dev          # Dev server with HMR
pnpm build        # Production build (icons + sitemap + pre-render)
pnpm preview      # Preview production build locally
pnpm lint         # Run ESLint
pnpm test         # Run test suite
pnpm deploy       # Build + deploy to Cloudflare Pages
pnpm sync         # Run shortcut sync pipeline
pnpm sync:dry     # Dry run of sync pipeline
```

## Contributing

Please use [GitHub Issues](https://github.com/vladik-Didyk/KeyShortcut/issues) to report bugs or request features. PRs welcome.

## Links

- [KeyShortcut.com](https://keyshortcut.com)
