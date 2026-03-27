import { describe, it, expect, beforeAll } from 'vitest'
import { join } from 'path'

try { process.loadEnvFile(join(import.meta.dirname, '../../.env')) } catch {}
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const BASE = `${SUPABASE_URL}/rest/v1`
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

async function query(path) {
  const res = await fetch(`${BASE}/${path}`, { headers: HEADERS })
  return res.json()
}

describe('platform data integrity (Supabase)', () => {
  let platforms, apps, sections, shortcuts

  beforeAll(async () => {
    platforms = await query('platforms?select=id&order=sort_order')
    apps = await query('apps?select=id,slug,display_name,category_id,sort_order')
    sections = await query('sections?select=id,app_id,platform_id,name')
    shortcuts = await query('shortcuts?select=id,section_id,modifiers,key,action_key')
  })

  it('has at least 3 platforms', () => {
    expect(platforms.length).toBeGreaterThanOrEqual(3)
  })

  it('every app has slug and display_name', () => {
    for (const app of apps) {
      expect(app.slug).toBeTruthy()
      expect(app.display_name).toBeTruthy()
    }
  })

  it('no duplicate slugs', () => {
    const slugs = apps.map(a => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every section has a name', () => {
    for (const sec of sections) {
      expect(sec.name).toBeTruthy()
    }
  })

  it('every shortcut has action_key, key, and modifiers array', () => {
    for (const sc of shortcuts) {
      expect(sc.action_key).toBeTruthy()
      expect(sc.key).toBeTruthy()
      expect(Array.isArray(sc.modifiers)).toBe(true)
    }
  })

  it('sections reference valid apps', () => {
    const appIds = new Set(apps.map(a => a.id))
    for (const sec of sections) {
      expect(appIds.has(sec.app_id)).toBe(true)
    }
  })

  it('shortcuts reference valid sections', () => {
    const secIds = new Set(sections.map(s => s.id))
    for (const sc of shortcuts) {
      expect(secIds.has(sc.section_id)).toBe(true)
    }
  })
})
