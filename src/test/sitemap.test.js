import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const sitemapPath = join(ROOT, 'public/sitemap.xml')

describe('sitemap generation', () => {
  let indexXml

  beforeAll(() => {
    execFileSync('node', ['scripts/generate-sitemap.mjs'], { cwd: ROOT, timeout: 30000 })
    indexXml = readFileSync(sitemapPath, 'utf-8')
  })

  it('produces well-formed sitemap index XML', () => {
    expect(indexXml).toContain('<?xml version="1.0"')
    expect(indexXml).toContain('<sitemapindex')
    expect(indexXml).toContain('</sitemapindex>')
  })

  it('references expected sub-sitemaps', () => {
    for (const name of ['sitemap-pages.xml', 'sitemap-guides.xml', 'sitemap-compare.xml', 'sitemap-macos.xml', 'sitemap-windows.xml', 'sitemap-linux.xml']) {
      expect(indexXml).toContain(`<loc>https://keyshortcut.com/${name}</loc>`)
    }
  })

  it('sub-sitemap files exist on disk', () => {
    for (const name of ['sitemap-pages.xml', 'sitemap-guides.xml', 'sitemap-compare.xml', 'sitemap-macos.xml']) {
      expect(existsSync(join(ROOT, 'public', name))).toBe(true)
    }
  })

  it('contains static pages in sitemap-pages.xml', () => {
    const xml = readFileSync(join(ROOT, 'public/sitemap-pages.xml'), 'utf-8')
    for (const path of ['/', '/mac-hud', '/privacy']) {
      expect(xml).toContain(`<loc>https://keyshortcut.com${path}</loc>`)
    }
  })

  it('contains platform index and app pages in platform sub-sitemaps', () => {
    const macosXml = readFileSync(join(ROOT, 'public/sitemap-macos.xml'), 'utf-8')
    expect(macosXml).toContain('<loc>https://keyshortcut.com/macos</loc>')
    // Spot-check well-known apps
    for (const slug of ['figma', 'chrome', 'slack']) {
      expect(macosXml).toContain(`/macos/${slug}</loc>`)
    }
  })

  it('all sub-sitemap URLs use https://keyshortcut.com domain', () => {
    const macosXml = readFileSync(join(ROOT, 'public/sitemap-macos.xml'), 'utf-8')
    const locs = [...macosXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/keyshortcut\.com\//)
    }
  })

  it('priority values are valid (0.0–1.0) in sub-sitemaps', () => {
    const pagesXml = readFileSync(join(ROOT, 'public/sitemap-pages.xml'), 'utf-8')
    const priorities = [...pagesXml.matchAll(/<priority>([^<]+)<\/priority>/g)].map(m => parseFloat(m[1]))
    for (const p of priorities) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})
