import { describe, it, expect, beforeAll } from 'vitest'
import { buildSearchIndex, searchIndex } from '../utils/searchHelpers'
import { buildPlatformLookups, groupByCategories, getPopularApps } from '../utils/platformHelpers'

/**
 * Performance tests for data processing operations.
 * Fetches real platform data from Supabase and measures how fast
 * the client-side processing functions run on it.
 *
 * Run: pnpm test src/test/performance.test.js
 */

import { join } from 'path'

try { process.loadEnvFile(join(import.meta.dirname, '../../.env')) } catch { /* env vars from CI secrets */ }
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const BASE = `${SUPABASE_URL}/rest/v1`
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

async function query(path) {
  const res = await fetch(`${BASE}/${path}`, { headers: HEADERS })
  return res.json()
}

// Batch large `in(...)` queries to avoid header overflow
const BATCH = 80
async function batchQuery(table, select, column, ids, extraParams = '') {
  if (!ids.length) return []
  const batches = []
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH).join(',')
    batches.push(query(`${table}?select=${select}&${column}=in.(${chunk})${extraParams}`))
  }
  return (await Promise.all(batches)).flat()
}

// Assemble apps array in the same shape the frontend uses
async function loadPlatformApps(platformId) {
  const links = await query(`app_platforms?select=app_id&platform_id=eq.${platformId}`)
  const appIds = links.map(l => l.app_id)
  if (!appIds.length) return []

  const [apps, sections, modSymbols, categories] = await Promise.all([
    batchQuery('apps', 'id,slug,display_name,category_id,sort_order', 'id', appIds),
    batchQuery('sections', 'id,app_id,name,sort_order', 'app_id', appIds, `&platform_id=eq.${platformId}&order=sort_order`),
    query(`modifier_symbols?select=modifier,symbol&platform_id=eq.${platformId}`),
    query(`categories?select=id,display_name`),
  ])

  const modMap = Object.fromEntries(modSymbols.map(m => [m.modifier, m.symbol]))
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.display_name]))
  const sectionIds = sections.map(s => s.id)

  const shortcuts = await batchQuery('shortcuts', 'section_id,modifiers,key,action_key,sort_order', 'section_id', sectionIds)

  const actionKeys = [...new Set(shortcuts.map(s => s.action_key))]
  const translations = await batchQuery('translations', 'key,value', 'key', actionKeys, '&language=eq.en')
  const transMap = Object.fromEntries(translations.map(t => [t.key, t.value]))

  const shortcutsBySection = {}
  for (const sc of shortcuts) {
    (shortcutsBySection[sc.section_id] ||= []).push({
      modifiers: sc.modifiers.map(m => modMap[m] || m),
      key: sc.key,
      action: transMap[sc.action_key] || sc.action_key,
    })
  }

  const sectionsByApp = {}
  for (const sec of sections) {
    (sectionsByApp[sec.app_id] ||= []).push({
      name: sec.name,
      shortcuts: shortcutsBySection[sec.id] || [],
    })
  }

  return apps
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(app => {
      const appSections = sectionsByApp[app.id] || []
      return {
        slug: app.slug,
        displayName: app.display_name,
        category: catMap[app.category_id] || app.category_id,
        shortcutCount: appSections.reduce((sum, s) => sum + s.shortcuts.length, 0),
        sections: appSections,
      }
    })
}

function measure(fn, runs = 5) {
  const times = []
  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    fn()
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  return { median: times[Math.floor(times.length / 2)], min: times[0], max: times.at(-1) }
}

describe('data processing performance', () => {
  let macosApps
  let categoryOrder

  beforeAll(async () => {
    macosApps = await loadPlatformApps('macos')
    const categories = await query('categories?select=display_name&order=sort_order')
    categoryOrder = categories.map(c => c.display_name)
  }, 30_000)

  it('has test data loaded', () => {
    expect(macosApps.length).toBeGreaterThan(50)
    const totalShortcuts = macosApps.reduce((sum, a) => sum + a.shortcutCount, 0)
    console.log(`  Loaded ${macosApps.length} apps, ${totalShortcuts} shortcuts`)
  })

  describe('buildSearchIndex', () => {
    it('completes under 10ms for full macOS dataset', () => {
      const { median, min, max } = measure(() => buildSearchIndex(macosApps))
      console.log(`  buildSearchIndex: ${median.toFixed(2)}ms median (${min.toFixed(2)}–${max.toFixed(2)}ms)`)
      expect(median).toBeLessThan(10)
    })
  })

  describe('searchIndex queries', () => {
    let index

    beforeAll(() => {
      index = buildSearchIndex(macosApps)
    })

    it('simple app search under 5ms', () => {
      const { median } = measure(() => searchIndex(index, 'figma'))
      console.log(`  search "figma": ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(5)
    })

    it('app + action search under 5ms', () => {
      const { median } = measure(() => searchIndex(index, 'copy in chrome'))
      console.log(`  search "copy in chrome": ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(5)
    })

    it('broad action search under 10ms', () => {
      const { median } = measure(() => searchIndex(index, 'paste'))
      console.log(`  search "paste": ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(10)
    })

    it('no-match search under 5ms', () => {
      const { median } = measure(() => searchIndex(index, 'xyznonexistent'))
      console.log(`  search "xyznonexistent": ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(5)
    })
  })

  describe('buildPlatformLookups', () => {
    it('completes under 5ms', () => {
      const { median } = measure(() => buildPlatformLookups(macosApps))
      console.log(`  buildPlatformLookups: ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(5)
    })
  })

  describe('groupByCategories', () => {
    it('completes under 2ms', () => {
      const { median } = measure(() => groupByCategories(macosApps, categoryOrder))
      console.log(`  groupByCategories: ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(2)
    })
  })

  describe('getPopularApps', () => {
    it('completes under 2ms', () => {
      const { median } = measure(() => getPopularApps(macosApps))
      console.log(`  getPopularApps: ${median.toFixed(2)}ms median`)
      expect(median).toBeLessThan(2)
    })
  })
})

// These fetches only run at build time (pre-render) — not in production.
// Budgets are regression guards, not user-facing perf targets.
describe('Supabase fetch performance', () => {
  it('fetches macOS app_platforms under 2s', async () => {
    const start = performance.now()
    const links = await query('app_platforms?select=app_id&platform_id=eq.macos')
    const elapsed = performance.now() - start
    console.log(`  app_platforms query: ${elapsed.toFixed(0)}ms (${links.length} rows)`)
    expect(elapsed).toBeLessThan(2000)
    expect(links.length).toBeGreaterThan(0)
  })

  it('fetches full macOS platform data under 20s', async () => {
    const start = performance.now()
    const apps = await loadPlatformApps('macos')
    const elapsed = performance.now() - start
    const totalShortcuts = apps.reduce((sum, a) => sum + a.shortcutCount, 0)
    console.log(`  Full platform fetch: ${elapsed.toFixed(0)}ms (${apps.length} apps, ${totalShortcuts} shortcuts)`)
    expect(elapsed).toBeLessThan(20_000)
  }, 30_000)

  it('fetches all 3 platforms in parallel under 25s', async () => {
    const start = performance.now()
    const [macos, windows, linux] = await Promise.all([
      loadPlatformApps('macos'),
      loadPlatformApps('windows'),
      loadPlatformApps('linux'),
    ])
    const elapsed = performance.now() - start
    console.log(`  All platforms parallel: ${elapsed.toFixed(0)}ms (macos:${macos.length} win:${windows.length} linux:${linux.length})`)
    expect(elapsed).toBeLessThan(25_000)
  }, 30_000)
})
