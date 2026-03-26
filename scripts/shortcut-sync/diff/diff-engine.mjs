/**
 * Diff engine: compares scraped shortcut data with existing Supabase data.
 * Detects additions, removals, and modifications.
 */
import { shortcutIdentity } from '../pipeline/normalize.mjs'
import { isSameAction, similarity } from './fuzzy-match.mjs'
import { scoreConfidence } from './confidence.mjs'

/**
 * Compare scraped data with existing data for an app on a platform.
 * @param {object} scraped - Normalized scraped data: { sections: [{ name, shortcuts: [{ modifiers, key, action }] }] }
 * @param {object} existing - Current data from Supabase (same format)
 * @returns {object} Diff result with added, removed, modified arrays + confidence
 */
export function diffShortcuts(scraped, existing) {
  // Flatten both into maps: shortcutIdentity → { section, shortcut }
  const scrapedMap = flattenToMap(scraped)
  const existingMap = flattenToMap(existing)

  const added = []
  const removed = []
  const modified = []

  // Find added and modified
  for (const [id, scrapedEntry] of scrapedMap.entries()) {
    const existingEntry = existingMap.get(id)
    if (!existingEntry) {
      added.push({
        section: scrapedEntry.section,
        shortcut: scrapedEntry.shortcut,
      })
    } else if (!isSameAction(scrapedEntry.shortcut.action, existingEntry.shortcut.action)) {
      modified.push({
        section: scrapedEntry.section,
        shortcut: scrapedEntry.shortcut,
        oldAction: existingEntry.shortcut.action,
        newAction: scrapedEntry.shortcut.action,
        similarity: similarity(scrapedEntry.shortcut.action, existingEntry.shortcut.action),
      })
    }
  }

  // Find removed
  for (const [id, existingEntry] of existingMap.entries()) {
    if (!scrapedMap.has(id)) {
      removed.push({
        section: existingEntry.section,
        shortcut: existingEntry.shortcut,
      })
    }
  }

  const existingTotal = existingMap.size
  const scrapedTotal = scrapedMap.size

  const confidence = scoreConfidence({
    added, removed, modified, existingTotal, scrapedTotal,
  })

  return {
    added,
    removed,
    modified,
    existingTotal,
    scrapedTotal,
    confidence,
    hasChanges: added.length > 0 || removed.length > 0 || modified.length > 0,
  }
}

/**
 * Flatten sections/shortcuts into a Map keyed by shortcut identity.
 */
function flattenToMap(data) {
  const map = new Map()
  if (!data?.sections) return map

  for (const section of data.sections) {
    for (const shortcut of section.shortcuts) {
      const id = shortcutIdentity(shortcut)
      map.set(id, { section: section.name, shortcut })
    }
  }

  return map
}
