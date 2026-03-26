#!/usr/bin/env node
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

process.loadEnvFile(join(ROOT, '.env'))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}
const BASE = `${SUPABASE_URL}/rest/v1`
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
const DOMAIN = 'https://keyshortcut.com'
const today = new Date().toISOString().split('T')[0]

async function query(path) {
  const res = await fetch(`${BASE}/${path}`, { headers: HEADERS })
  return res.json()
}

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/mac-hud', priority: '0.8', changefreq: 'weekly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

const platforms = await query('platforms?select=id&order=sort_order')
const platformPages = []
const appPages = []

for (const platform of platforms) {
  platformPages.push({
    loc: `/${platform.id}`,
    lastmod: today,
    priority: '0.8',
    changefreq: 'weekly',
  })

  const links = await query(`app_platforms?select=app_id&platform_id=eq.${platform.id}`)
  const appIds = links.map(l => l.app_id)
  if (!appIds.length) continue

  const apps = await query(`apps?select=slug&id=in.(${appIds.join(',')})&order=sort_order`)
  for (const app of apps) {
    appPages.push({
      loc: `/${platform.id}/${app.slug}`,
      lastmod: today,
      priority: '0.6',
      changefreq: 'monthly',
    })
  }
}

const allPages = [...staticPages, ...platformPages, ...appPages]

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
