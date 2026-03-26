import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'child_process'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const sitemapPath = join(ROOT, 'public/sitemap.xml')

describe('sitemap generation', () => {
  let xml

  beforeAll(() => {
    execFileSync('node', ['scripts/generate-sitemap.mjs'], { cwd: ROOT, timeout: 30000 })
    xml = readFileSync(sitemapPath, 'utf-8')
  })

  it('produces well-formed XML with urlset root', () => {
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
  })

  it('contains static pages: /, /mac-hud, /privacy', () => {
    for (const path of ['/', '/mac-hud', '/privacy']) {
      expect(xml).toContain(`<loc>https://keyshortcut.com${path}</loc>`)
    }
  })

  it('contains platform index pages', () => {
    for (const platform of ['macos', 'windows', 'linux']) {
      expect(xml).toContain(`<loc>https://keyshortcut.com/${platform}</loc>`)
    }
  })

  it('contains app URLs', () => {
    // Spot-check a few well-known apps
    for (const slug of ['figma', 'chrome', 'slack', 'vscode']) {
      expect(xml).toContain(`/${slug}</loc>`)
    }
  })

  it('all URLs use https://keyshortcut.com domain', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/keyshortcut\.com\//)
    }
  })

  it('priority values are valid (0.0–1.0)', () => {
    const priorities = [...xml.matchAll(/<priority>([^<]+)<\/priority>/g)].map(m => parseFloat(m[1]))
    for (const p of priorities) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})
