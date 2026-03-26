/**
 * Supabase writer — writes normalized shortcut data to Supabase.
 * Uses the service role key (bypasses RLS) for write access.
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../..')

// Reverse map: display symbol → canonical modifier name (as stored in Supabase)
const SYMBOL_TO_CANONICAL = {
  '⌘': 'command', '⌥': 'option', '⌃': 'control', '⇧': 'shift', Fn: 'fn',
  Ctrl: 'control', Alt: 'alt', Shift: 'shift', Win: 'super', Super: 'super',
}

/**
 * Write shortcut changes to Supabase.
 * @param {string} slug - App slug (e.g., "chrome")
 * @param {string} platformId - Platform (e.g., "macos")
 * @param {object} diff - Diff result from diffShortcuts()
 * @param {object} normalized - Full normalized scraped data (for section context)
 */
export async function writeToSupabase(slug, platformId, diff, normalized) {
  const { url, headers } = getSupabaseConfig()

  // Step 1: Look up app
  const app = await query(url, headers, `apps?slug=eq.${slug}&select=id`)
  if (!app.length) {
    throw new Error(`App "${slug}" not found in Supabase`)
  }
  const appId = app[0].id

  // Step 2: Ensure app_platforms link exists
  await upsert(url, headers, 'app_platforms', {
    app_id: appId,
    platform_id: platformId,
  }, 'app_id,platform_id', 'app_id')

  // Step 3: Get existing sections for sort_order context
  const existingSections = await query(url, headers,
    `sections?app_id=eq.${appId}&platform_id=eq.${platformId}&select=id,name,sort_order`
  )
  const sectionMap = Object.fromEntries(existingSections.map(s => [s.name, s]))

  // Step 4: Process additions
  for (const { section: sectionName, shortcut } of diff.added) {
    const sectionId = await ensureSection(url, headers, appId, platformId, sectionName, sectionMap, normalized)
    await writeShortcut(url, headers, sectionId, slug, shortcut)
  }

  // Step 5: Process modifications (update action text)
  for (const entry of diff.modified) {
    const sectionId = await ensureSection(url, headers, appId, platformId, entry.section, sectionMap, normalized)
    const actionKey = generateActionKey(slug, entry.newAction)

    // Ensure translation exists with new text
    await ensureTranslation(url, headers, actionKey, entry.newAction)

    // Update the shortcut's action_key
    const canonicalMods = shortcutToCanonical(entry.shortcut)
    const modsFilter = `{${canonicalMods.join(',')}}`
    const existing = await query(url, headers,
      `shortcuts?section_id=eq.${sectionId}&key=eq.${encodeURIComponent(entry.shortcut.key)}&modifiers=eq.${encodeURIComponent(modsFilter)}&select=id,action_key`
    )
    if (existing.length) {
      await patch(url, headers, `shortcuts?id=eq.${existing[0].id}`, { action_key: actionKey })
    }
  }

  // Step 6: Process removals (only for high-confidence diffs)
  if (diff.confidence.level === 'high') {
    for (const { section: sectionName, shortcut } of diff.removed) {
      const section = sectionMap[sectionName]
      if (!section) continue

      const canonicalMods = shortcutToCanonical(shortcut)
      const modsFilter = `{${canonicalMods.join(',')}}`
      const existing = await query(url, headers,
        `shortcuts?section_id=eq.${section.id}&key=eq.${encodeURIComponent(shortcut.key)}&modifiers=eq.${encodeURIComponent(modsFilter)}&select=id`
      )
      if (existing.length) {
        await del(url, headers, `shortcuts?id=eq.${existing[0].id}`)
      }
    }
  }

  const total = diff.added.length + diff.modified.length +
    (diff.confidence.level === 'high' ? diff.removed.length : 0)
  return { written: total }
}

/**
 * Ensure a section exists, create if needed. Returns section ID.
 */
async function ensureSection(url, headers, appId, platformId, sectionName, sectionMap, normalized) {
  if (sectionMap[sectionName]) {
    return sectionMap[sectionName].id
  }

  // Check if section already exists in DB
  const existing = await query(url, headers,
    `sections?app_id=eq.${appId}&platform_id=eq.${platformId}&name=eq.${encodeURIComponent(sectionName)}&select=id,name`
  )
  if (existing.length) {
    sectionMap[sectionName] = existing[0]
    return existing[0].id
  }

  // Create new section
  const sectionIndex = normalized.sections.findIndex(s => s.name === sectionName)
  const sortOrder = sectionIndex >= 0 ? sectionIndex : Object.keys(sectionMap).length

  const result = await insert(url, headers, 'sections', {
    app_id: appId,
    platform_id: platformId,
    name: sectionName,
    sort_order: sortOrder,
  })

  if (result.length) {
    sectionMap[sectionName] = result[0]
    return result[0].id
  }

  throw new Error(`Failed to create section "${sectionName}"`)
}

/**
 * Write a single shortcut (with its translation).
 */
async function writeShortcut(url, headers, sectionId, slug, shortcut) {
  const actionKey = generateActionKey(slug, shortcut.action)

  // Ensure translation exists
  await ensureTranslation(url, headers, actionKey, shortcut.action)

  // Get sort_order: count existing shortcuts in this section
  const existingShortcuts = await query(url, headers,
    `shortcuts?section_id=eq.${sectionId}&select=id`
  )
  const sortOrder = existingShortcuts.length

  // Check if shortcut already exists
  const canonicalMods = shortcutToCanonical(shortcut)
  const modsFilter = `{${canonicalMods.join(',')}}`
  const existing = await query(url, headers,
    `shortcuts?section_id=eq.${sectionId}&key=eq.${encodeURIComponent(shortcut.key)}&modifiers=eq.${encodeURIComponent(modsFilter)}&select=id`
  )

  if (existing.length) {
    // Update existing shortcut's action_key
    await patch(url, headers, `shortcuts?id=eq.${existing[0].id}`, { action_key: actionKey })
  } else {
    // Insert new shortcut
    await insert(url, headers, 'shortcuts', {
      section_id: sectionId,
      modifiers: canonicalMods,
      key: shortcut.key,
      action_key: actionKey,
      sort_order: sortOrder,
    })
  }
}

/**
 * Ensure a translation exists, create or update.
 */
async function ensureTranslation(url, headers, actionKey, value) {
  const existing = await query(url, headers,
    `translations?key=eq.${encodeURIComponent(actionKey)}&language=eq.en&select=id,value`
  )
  if (existing.length) {
    if (existing[0].value !== value) {
      await patch(url, headers, `translations?id=eq.${existing[0].id}`, { value })
    }
  } else {
    await insert(url, headers, 'translations', {
      key: actionKey,
      language: 'en',
      value,
    })
  }
}

/**
 * Convert display-symbol modifiers back to canonical names for Supabase storage.
 */
function shortcutToCanonical(shortcut) {
  return shortcut.modifiers.map(m => SYMBOL_TO_CANONICAL[m] || m.toLowerCase())
}

/**
 * Generate an action_key from slug + action text.
 * e.g., ("chrome", "Jump to Address Bar") → "shortcuts.chrome.jumpToAddressBar"
 */
function generateActionKey(slug, action) {
  const camel = action
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word, i) => i === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('')

  return `shortcuts.${slug}.${camel}`
}

// ── Supabase REST helpers ──────────────────────────────────

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  }
  return {
    url: `${url}/rest/v1`,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  }
}

async function query(url, headers, path) {
  const res = await globalThis.fetch(`${url}/${path}`, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase GET ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function insert(url, headers, table, data) {
  const res = await globalThis.fetch(`${url}/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase INSERT ${table} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function upsert(url, headers, table, data, onConflict, returning = 'id') {
  const res = await globalThis.fetch(`${url}/${table}?on_conflict=${onConflict}&select=${returning}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase UPSERT ${table} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function patch(url, headers, path, data) {
  const res = await globalThis.fetch(`${url}/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase PATCH ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function del(url, headers, path) {
  const res = await globalThis.fetch(`${url}/${path}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase DELETE ${path} failed: ${res.status} ${text}`)
  }
}
