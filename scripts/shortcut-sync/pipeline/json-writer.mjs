/**
 * JSON writer — writes normalized shortcut data directly to local platform JSON files.
 * Keeps public/data/platforms/*.json in sync alongside Supabase writes.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../..', 'public/data/platforms')

/**
 * Write the full normalized scraped data to the local platform JSON.
 * Replaces the app's sections entirely with the scraped data (full overwrite).
 *
 * @param {string} slug - App slug
 * @param {string} platformId - Platform (macos, windows, linux)
 * @param {object} normalized - Full normalized scraped data { sections: [...] }
 * @param {object} [meta] - Optional metadata to set (docsUrl, lastVerified)
 * @returns {{ success: boolean, shortcutCount: number }}
 */
export function writeToJSON(slug, platformId, normalized, meta = {}) {
  const filePath = join(DATA_DIR, `${platformId}.json`)
  if (!existsSync(filePath)) {
    return { success: false, reason: `${platformId}.json not found` }
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const app = data.apps.find(a => a.slug === slug)
  if (!app) {
    return { success: false, reason: `App "${slug}" not found in ${platformId}.json` }
  }

  // Replace sections with normalized data
  app.sections = normalized.sections
  const shortcutCount = normalized.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
  app.shortcutCount = shortcutCount

  // Update metadata
  if (meta.lastVerified) app.lastVerified = meta.lastVerified
  if (meta.lastUpdated) app.lastUpdated = meta.lastUpdated
  if (meta.docsUrl) app.docsUrl = meta.docsUrl

  writeFileSync(filePath, JSON.stringify(data, null, 0), 'utf-8')

  return { success: true, shortcutCount }
}

/**
 * Apply only the diff (additions, modifications, removals) to the local JSON.
 * More conservative than full overwrite — preserves existing sections/order.
 *
 * @param {string} slug - App slug
 * @param {string} platformId - Platform
 * @param {object} diff - Diff result from diffShortcuts()
 * @param {object} normalized - Full normalized scraped data (for section context)
 * @param {object} [meta] - Optional metadata
 * @returns {{ success: boolean, written: number }}
 */
export function applyDiffToJSON(slug, platformId, diff, normalized, meta = {}) {
  const filePath = join(DATA_DIR, `${platformId}.json`)
  if (!existsSync(filePath)) {
    return { success: false, written: 0, reason: `${platformId}.json not found` }
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const app = data.apps.find(a => a.slug === slug)
  if (!app) {
    return { success: false, written: 0, reason: `App "${slug}" not found in ${platformId}.json` }
  }

  const sectionMap = new Map(app.sections.map(s => [s.name, s]))
  let written = 0

  // Process additions
  for (const { section: sectionName, shortcut } of diff.added) {
    let section = sectionMap.get(sectionName)
    if (!section) {
      section = { name: sectionName, shortcuts: [] }
      app.sections.push(section)
      sectionMap.set(sectionName, section)
    }
    section.shortcuts.push({
      modifiers: shortcut.modifiers,
      key: shortcut.key,
      action: shortcut.action,
    })
    written++
  }

  // Process modifications
  for (const entry of diff.modified) {
    const section = sectionMap.get(entry.section)
    if (!section) continue
    const sc = section.shortcuts.find(s =>
      s.key === entry.shortcut.key &&
      JSON.stringify(s.modifiers) === JSON.stringify(entry.shortcut.modifiers)
    )
    if (sc) {
      sc.action = entry.newAction
      written++
    }
  }

  // Process removals (only for high confidence)
  if (diff.confidence.level === 'high') {
    for (const { section: sectionName, shortcut } of diff.removed) {
      const section = sectionMap.get(sectionName)
      if (!section) continue
      const idx = section.shortcuts.findIndex(s =>
        s.key === shortcut.key &&
        JSON.stringify(s.modifiers) === JSON.stringify(shortcut.modifiers)
      )
      if (idx >= 0) {
        section.shortcuts.splice(idx, 1)
        written++
      }
    }
    // Remove empty sections
    app.sections = app.sections.filter(s => s.shortcuts.length > 0)
  }

  // Recount
  app.shortcutCount = app.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)

  // Update metadata
  if (meta.lastVerified) app.lastVerified = meta.lastVerified
  if (meta.lastUpdated) app.lastUpdated = meta.lastUpdated
  if (meta.docsUrl) app.docsUrl = meta.docsUrl

  writeFileSync(filePath, JSON.stringify(data, null, 0), 'utf-8')

  return { success: true, written }
}
