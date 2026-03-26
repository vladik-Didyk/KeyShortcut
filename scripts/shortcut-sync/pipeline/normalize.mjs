/**
 * Normalization pipeline: raw scraped data → canonical Supabase-compatible format.
 */
import { normalizeModifiers, modifiersToSymbols } from './modifier-map.mjs'
import { normalizeKey } from './key-map.mjs'

/**
 * Normalize raw scraped shortcut data into canonical format.
 * @param {object} rawData - { sections: [{ name, shortcuts: [{ modifiers, key, action }] }] }
 * @param {string} platformId - Target platform (macos, windows, linux)
 * @returns {object} Normalized data in same structure
 */
export function normalizeScrapedData(rawData, platformId) {
  if (!rawData?.sections) return { sections: [] }

  const sections = rawData.sections
    .map(section => normalizeSection(section, platformId))
    .filter(section => section.shortcuts.length > 0)

  return { sections }
}

function normalizeSection(section, platformId) {
  const name = normalizeSectionName(section.name)
  const shortcuts = section.shortcuts
    .map(s => normalizeShortcut(s, platformId))
    .filter(Boolean)
    // Deduplicate by modifiers+key
    .filter((s, i, arr) => {
      const id = shortcutIdentity(s)
      return arr.findIndex(other => shortcutIdentity(other) === id) === i
    })

  return { name, shortcuts }
}

function normalizeShortcut(shortcut, platformId) {
  if (!shortcut.action || !shortcut.key) return null

  const modifiers = normalizeModifiers(shortcut.modifiers || [], platformId)
  const symbols = modifiersToSymbols(modifiers, platformId)
  const key = normalizeKey(shortcut.key)
  const action = normalizeAction(shortcut.action)

  if (!key || !action) return null

  return { modifiers: symbols, key, action }
}

/**
 * Normalize section name: trim, remove redundant suffixes, title case.
 */
function normalizeSectionName(name) {
  if (!name) return 'General'

  return name
    .replace(/\s*keyboard shortcuts?$/i, '')
    .replace(/\s*shortcuts?$/i, '')
    .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
    .trim() || 'General'
}

/**
 * Normalize action text: trim, fix casing, remove trailing punctuation.
 */
function normalizeAction(action) {
  if (!action) return ''

  return action
    .replace(/\s+/g, ' ')
    .replace(/[.;:]+$/, '')  // Remove trailing punctuation
    .trim()
}

/**
 * Create a unique identity string for a shortcut (for deduplication and diffing).
 */
export function shortcutIdentity(shortcut) {
  const mods = [...shortcut.modifiers].sort().join('+')
  const key = shortcut.key.toLowerCase()
  return `${mods}::${key}`
}

/**
 * Create a section-scoped identity for a shortcut.
 */
export function scopedShortcutIdentity(sectionName, shortcut) {
  return `${sectionName}::${shortcutIdentity(shortcut)}`
}
