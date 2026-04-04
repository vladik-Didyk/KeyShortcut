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

function buildUrlset(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
}

// ─── Static pages ───────────────────────────────────────────────────

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/mac-hud', priority: '0.8', changefreq: 'weekly' },
  { loc: '/guides', priority: '0.7', changefreq: 'weekly' },
  { loc: '/cheat-sheets', priority: '0.7', changefreq: 'weekly' },
  { loc: '/about', priority: '0.5', changefreq: 'monthly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

// ─── Guide pages ────────────────────────────────────────────────────

const { GUIDES } = await import('../src/data/guides/index.js')
const guidePages = GUIDES.map(g => ({
  loc: `/guides/${g.slug}`,
  lastmod: g.lastUpdated || today,
  priority: '0.6',
  changefreq: 'monthly',
}))

// ─── Comparison pages ───────────────────────────────────────────────

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

// ─── Platform + app pages ───────────────────────────────────────────

const platforms = readJSON('platforms.json')
const platformSitemaps = []

for (const platform of platforms) {
  const platformPages = [
    { loc: `/${platform.id}`, lastmod: today, priority: '0.8', changefreq: 'weekly' },
  ]

  const { apps } = readJSON(`platforms/${platform.id}.json`)
  for (const app of apps) {
    platformPages.push({
      loc: `/${platform.id}/${app.slug}`,
      lastmod: today,
      priority: '0.6',
      changefreq: 'monthly',
    })
  }

  const filename = `sitemap-${platform.id}.xml`
  writeFileSync(join(ROOT, 'public', filename), buildUrlset(platformPages))
  platformSitemaps.push({ filename, count: platformPages.length })
}

// ─── Write sub-sitemaps ─────────────────────────────────────────────

writeFileSync(join(ROOT, 'public', 'sitemap-pages.xml'), buildUrlset(staticPages))
writeFileSync(join(ROOT, 'public', 'sitemap-guides.xml'), buildUrlset(guidePages))
writeFileSync(join(ROOT, 'public', 'sitemap-compare.xml'), buildUrlset(comparePages))

// ─── Write sitemap index ────────────────────────────────────────────

const subSitemaps = [
  'sitemap-pages.xml',
  'sitemap-guides.xml',
  'sitemap-compare.xml',
  ...platformSitemaps.map(s => s.filename),
]

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${subSitemaps.map(f => `  <sitemap>
    <loc>${DOMAIN}/${f}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`

writeFileSync(join(ROOT, 'public/sitemap.xml'), sitemapIndex)

const totalUrls = staticPages.length + guidePages.length + comparePages.length +
  platformSitemaps.reduce((sum, s) => sum + s.count, 0)

console.log(`Sitemap index generated: ${subSitemaps.length} sub-sitemaps, ${totalUrls} total URLs`)
