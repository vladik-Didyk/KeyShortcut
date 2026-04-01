#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'public/data')

const DOMAIN = 'https://keyshortcut.com'
const today = new Date().toISOString().split('T')[0]

function readJSON(relativePath) {
  return JSON.parse(readFileSync(join(DATA_DIR, relativePath), 'utf-8'))
}

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/mac-hud', priority: '0.8', changefreq: 'weekly' },
  { loc: '/guides', priority: '0.7', changefreq: 'weekly' },
  { loc: '/cheat-sheets', priority: '0.7', changefreq: 'weekly' },
  { loc: '/about', priority: '0.5', changefreq: 'monthly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

// Guide pages
const { GUIDES } = await import('../src/data/guides/index.js')
const guidePages = GUIDES.map(g => ({
  loc: `/guides/${g.slug}`,
  lastmod: g.lastUpdated || today,
  priority: '0.6',
  changefreq: 'monthly',
}))

// Comparison pages
const { COMPARISONS } = await import('../src/data/comparisons.js')
const comparePages = [
  { loc: '/compare', lastmod: today, priority: '0.6', changefreq: 'monthly' },
  ...COMPARISONS.map(c => ({
    loc: `/compare/${c.slugA}-vs-${c.slugB}`,
    lastmod: today,
    priority: '0.6',
    changefreq: 'monthly',
  })),
]

// Platform + app pages from exported JSON
const platforms = readJSON('platforms.json')
const platformPages = []
const appPages = []

for (const platform of platforms) {
  platformPages.push({
    loc: `/${platform.id}`,
    lastmod: today,
    priority: '0.8',
    changefreq: 'weekly',
  })

  const { apps } = readJSON(`platforms/${platform.id}.json`)
  for (const app of apps) {
    appPages.push({
      loc: `/${platform.id}/${app.slug}`,
      lastmod: today,
      priority: '0.6',
      changefreq: 'monthly',
    })
  }
}

const allPages = [...staticPages, ...guidePages, ...comparePages, ...platformPages, ...appPages]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml)
console.log(`Sitemap generated: ${allPages.length} URLs (${platformPages.length} platforms, ${appPages.length} app pages)`)
