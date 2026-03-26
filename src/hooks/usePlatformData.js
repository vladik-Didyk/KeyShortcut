import { useState, useEffect } from 'react'

const cache = new Map()
const inflight = new Map()

// Lazy-load Supabase SDK only when actually needed
// Disable auth to avoid "Multiple GoTrueClient instances" warning
let _supabase = null
async function getSupabase() {
  if (_supabase) return _supabase
  const { createClient } = await import('@supabase/supabase-js')
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  _supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return _supabase
}

// Batch helper: run all batches in parallel
const BATCH = 100
async function batchIn(supabase, table, column, ids, select, extraFilters) {
  if (!ids.length) return []
  const batches = []
  for (let i = 0; i < ids.length; i += BATCH) {
    let q = supabase.from(table).select(select).in(column, ids.slice(i, i + BATCH))
    if (extraFilters) q = extraFilters(q)
    batches.push(q)
  }
  const results = await Promise.all(batches)
  return results.flatMap(r => r.data || [])
}

async function fetchPlatformFromSupabase(platformId) {
  const supabase = await getSupabase()

  // Step 1: Get app IDs
  const { data: links } = await supabase
    .from('app_platforms')
    .select('app_id')
    .eq('platform_id', platformId)
  if (!links?.length) return { apps: [] }

  const appIds = links.map(l => l.app_id)

  // Step 2: Fetch apps, sections, modifiers, categories — ALL IN PARALLEL
  const [apps, sections, modSymbols, categories] = await Promise.all([
    batchIn(supabase, 'apps', 'id', appIds, 'id, slug, display_name, category_id, icon_url, sort_order'),
    supabase
      .from('sections')
      .select('id, app_id, name, sort_order')
      .in('app_id', appIds)
      .eq('platform_id', platformId)
      .order('sort_order')
      .then(r => r.data || []),
    supabase
      .from('modifier_symbols')
      .select('modifier, symbol')
      .eq('platform_id', platformId)
      .then(r => r.data || []),
    supabase
      .from('categories')
      .select('id, display_name')
      .then(r => r.data || []),
  ])

  if (!apps.length) return { apps: [] }
  apps.sort((a, b) => a.sort_order - b.sort_order)

  const modMap = Object.fromEntries(modSymbols.map(m => [m.modifier, m.symbol]))
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.display_name]))
  const sectionIds = sections.map(s => s.id)

  // Step 3: Fetch shortcuts (batched in parallel)
  const shortcuts = await batchIn(
    supabase, 'shortcuts', 'section_id', sectionIds,
    'section_id, modifiers, key, action_key, sort_order'
  )

  // Step 4: Fetch translations (batched in parallel)
  const actionKeys = [...new Set(shortcuts.map(s => s.action_key))]
  const translations = await batchIn(
    supabase, 'translations', 'key', actionKeys,
    'key, value',
    q => q.eq('language', 'en')
  )
  const transMap = Object.fromEntries(translations.map(t => [t.key, t.value]))

  // Assemble
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

  return {
    apps: apps.map(app => {
      const appSections = sectionsByApp[app.id] || []
      return {
        slug: app.slug,
        displayName: app.display_name,
        category: catMap[app.category_id] || app.category_id,
        shortcutCount: appSections.reduce((sum, s) => sum + s.shortcuts.length, 0),
        iconUrl: app.icon_url,
        sections: appSections,
      }
    }),
  }
}

/** Prefetch platform data in the background (call on hover) */
export function prefetchPlatform(platformId) {
  if (!platformId || cache.has(platformId) || inflight.has(platformId)) return
  const promise = fetchPlatformFromSupabase(platformId)
    .then(data => cache.set(platformId, data))
    .catch(() => {})
    .finally(() => inflight.delete(platformId))
  inflight.set(platformId, promise)
}

export function usePlatformData(platformId) {
  const [, rerender] = useState(0)

  useEffect(() => {
    if (!platformId || cache.has(platformId)) return

    let cancelled = false
    const onDone = () => { if (!cancelled) rerender(v => v + 1) }

    // If prefetch is already in flight, subscribe to it instead of starting a new fetch
    if (inflight.has(platformId)) {
      inflight.get(platformId).then(onDone)
      return () => { cancelled = true }
    }

    // Start new fetch
    const promise = fetchPlatformFromSupabase(platformId)
      .then(data => {
        cache.set(platformId, data)
        onDone()
      })
      .catch(() => {
        cache.set(platformId, { apps: [], error: true })
        onDone()
      })
      .finally(() => inflight.delete(platformId))

    inflight.set(platformId, promise)
    return () => { cancelled = true }
  }, [platformId])

  const cached = platformId ? cache.get(platformId) : null
  return {
    apps: cached?.apps ?? null,
    loading: !!platformId && !cached,
    error: cached?.error ? `Failed to load ${platformId} data` : null,
  }
}
