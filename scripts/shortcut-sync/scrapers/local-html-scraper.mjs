/**
 * Local HTML scraper — parses structured documentation pages using cheerio.
 * No external AI API needed. Works for pages with heading + list/paragraph
 * layouts where shortcuts use Unicode modifier symbols (⌘, ⌥, ⌃, ⇧, ^).
 */
import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper.mjs'

// Modifier symbols recognized at start of shortcut strings.
// Both Unicode (⌃) and ASCII (^) forms for Control.
const MODIFIER_CHARS = {
  '⌃': 'Control', '⌥': 'Option', '⇧': 'Shift', '⌘': 'Command',
  '^': 'Control',
}

// Key symbols that map to canonical key names
const KEY_SYMBOLS = {
  '⇥': 'Tab',
  '↩︎': 'Enter', '↩': 'Enter', '⏎': 'Enter',
  '⌫': 'Delete', '⌦': 'Forward Delete',
  '←': 'Left', '→': 'Right', '↑': 'Up', '↓': 'Down',
  '⎋': 'Escape',
}

// Lines containing these patterns are not shortcuts
const JUNK_PATTERNS = [
  /^please note/i,
  /^note:/i,
  /^the shortcuts? with/i,
  /^check the/i,
]

export class LocalHtmlScraper extends BaseScraper {
  async extract(url) {
    const { html } = await this.fetch(url)
    const $ = cheerio.load(html)

    // Remove non-content elements
    $('nav, footer, header, script, style, noscript, iframe, svg, img, video, audio').remove()

    const main = $('main, [role="main"], article, .article-body, .content, .documentation').first()
    const $root = main.length ? main : $('body')

    const sections = []
    let currentSection = null

    $root.find('h1, h2, h3, h4, li, p, dt, dd, tr').each((_, el) => {
      const $el = $(el)
      const tag = el.tagName.toLowerCase()

      if (/^h[1-4]$/.test(tag)) {
        const name = $el.text().trim()
        if (name) {
          currentSection = { name, shortcuts: [] }
          sections.push(currentSection)
        }
        return
      }

      if (!currentSection) {
        currentSection = { name: 'General', shortcuts: [] }
        sections.push(currentSection)
      }

      const text = $el.text().trim()
      if (!text) return

      // Skip junk lines
      if (JUNK_PATTERNS.some(p => p.test(text))) return

      const parsed = parseShortcutLine(text)
      if (parsed.length > 0) {
        currentSection.shortcuts.push(...parsed)
      }
    })

    return {
      sections: sections.filter(s => s.shortcuts.length > 0),
    }
  }
}

/**
 * Parse a line of text that may contain one or more shortcuts.
 * Handles:
 *   "⌘B - Bold"
 *   "^⌘C - Code block"
 *   "⌘1 , ⌘2, … ⌘6 - Headings"
 *   "↑ and ↓ keys - Move the selection"
 *   "⇥ - Shift the list element right"
 */
function parseShortcutLine(text) {
  const cleaned = text.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim()

  // Split on first " - ", " – ", " — "
  const sepMatch = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/)
  if (!sepMatch) return []

  const [, shortcutPart, actionText] = sepMatch
  if (!actionText || actionText.length < 2) return []

  // Skip if action looks like junk
  if (JUNK_PATTERNS.some(p => p.test(actionText))) return []

  // Check for range pattern like "⌘1 , ⌘2, … ⌘6" → expand to ⌘1..⌘6
  const rangeResult = tryExpandRange(shortcutPart, actionText)
  if (rangeResult) return rangeResult

  // Try as a single shortcut
  const single = parseModifiersAndKey(shortcutPart.trim())
  if (single) {
    return [{ modifiers: single.modifiers, key: single.key, action: actionText }]
  }

  // Try splitting compound: "↑ and ↓ keys"
  const parts = shortcutPart.split(/\s+and\s+/).filter(Boolean)
  const results = []
  for (const part of parts) {
    const trimmed = part.replace(/\s*keys?\s*$/i, '').trim()
    if (!trimmed) continue
    const parsed = parseModifiersAndKey(trimmed)
    if (parsed) {
      results.push({ modifiers: parsed.modifiers, key: parsed.key, action: actionText })
    }
  }

  return results
}

/**
 * Try to expand range patterns like "⌘1 , ⌘2, … ⌘6 - Headings" into
 * individual shortcuts: Heading 1, Heading 2, ... Heading 6.
 */
function tryExpandRange(shortcutPart, action) {
  // Match pattern: modifiers + digit, comma-separated, with optional …
  const items = shortcutPart.split(/\s*,\s*/).map(s => s.replace(/…/g, '').trim()).filter(Boolean)
  if (items.length < 2) return null

  // Check if all items parse to shortcuts with numeric keys
  const parsed = items.map(parseModifiersAndKey).filter(Boolean)
  if (parsed.length < 2) return null

  const allNumeric = parsed.every(p => /^\d$/.test(p.key))
  if (!allNumeric) return null

  const first = parseInt(parsed[0].key)
  const last = parseInt(parsed[parsed.length - 1].key)
  if (first >= last) return null

  // Expand: ⌘1..⌘6 → "Heading 1", "Heading 2", ...
  const results = []
  for (let i = first; i <= last; i++) {
    results.push({
      modifiers: parsed[0].modifiers,
      key: String(i),
      action: `${action} ${i}`,
    })
  }
  return results
}

/**
 * Parse a shortcut string like "⌥⌘T", "^⌘C", "⇧⌘K" into modifiers + key.
 */
function parseModifiersAndKey(str) {
  if (!str) return null

  let remaining = str.trim()
  const modifiers = []

  // Extract modifier symbols greedily from the start
  let changed = true
  while (changed) {
    changed = false
    for (const [sym, name] of Object.entries(MODIFIER_CHARS)) {
      if (remaining.startsWith(sym)) {
        // Avoid duplicate modifiers (e.g. ^⌃ both mapping to Control)
        if (!modifiers.includes(name)) {
          modifiers.push(name)
        }
        remaining = remaining.slice(sym.length)
        changed = true
        break // restart after each match for correct ordering
      }
    }
  }

  remaining = remaining.trim()
  if (!remaining) return null

  // Check if remaining is a known key symbol (↓, ⌫, etc.)
  if (KEY_SYMBOLS[remaining]) {
    return { modifiers, key: KEY_SYMBOLS[remaining] }
  }

  // The remaining is the key (letter, digit, punctuation, function key, etc.)
  const key = remaining
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1')
    .trim()

  if (!key) return null

  return { modifiers, key }
}
