/**
 * Scraper for pages that use HTML <table> elements for shortcuts.
 * Works well with Google support pages, Apple help articles, etc.
 */
import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper.mjs'

export class HtmlTableScraper extends BaseScraper {
  /**
   * Extract shortcuts from HTML tables.
   * @param {string} url - Page URL
   * @param {object} options
   * @param {string} options.platformFilter - Filter sections by platform keyword (e.g. "mac", "windows")
   * @param {string} options.selector - CSS selector for tables (default: "table")
   */
  async extract(url, options = {}) {
    const { html } = await this.fetch(url)
    const $ = cheerio.load(html)
    const sections = []

    // Find all relevant tables
    const tables = $(options.selector || 'table')

    tables.each((_, table) => {
      const $table = $(table)

      // Try to find a section name from the nearest heading
      let sectionName = 'General'
      const prev = $table.prevAll('h2, h3, h4').first()
      if (prev.length) {
        sectionName = prev.text().trim()
      }

      // Platform filter: skip sections that don't match the target platform
      if (options.platformFilter) {
        const filter = options.platformFilter.toLowerCase()
        const headingText = sectionName.toLowerCase()
        const tableHtml = $table.html()?.toLowerCase() || ''

        // Some pages have platform-specific tables or sections
        // If the section heading mentions a different platform, skip it
        const otherPlatforms = ['mac', 'windows', 'linux', 'chromeos'].filter(p => p !== filter)
        const headingMentionsPlatform = otherPlatforms.some(p => headingText.includes(p))
        if (headingMentionsPlatform && !headingText.includes(filter)) {
          return // skip this table
        }
      }

      // Clean up section name — remove platform suffixes
      sectionName = sectionName
        .replace(/\s*\(mac(?:os)?\)/i, '')
        .replace(/\s*\(windows\)/i, '')
        .replace(/\s*\(linux\)/i, '')
        .replace(/\s*keyboard shortcuts?$/i, '')
        .trim()

      if (!sectionName) sectionName = 'General'

      const shortcuts = []
      const rows = $table.find('tr')

      rows.each((rowIdx, row) => {
        const cells = $(row).find('td, th')
        if (cells.length < 2) return

        // Try to identify which column has the shortcut and which has the action
        // Common patterns: [Action, Shortcut] or [Shortcut, Action]
        const cell0 = $(cells[0]).text().trim()
        const cell1 = $(cells[1]).text().trim()

        if (!cell0 || !cell1) return

        // Heuristic: if cell contains + or modifier keywords, it's the shortcut column
        const looksLikeShortcut = (text) => {
          return /[+⌘⌥⌃⇧]/.test(text) ||
            /\b(ctrl|alt|shift|cmd|command|option)\b/i.test(text)
        }

        let shortcutText, actionText
        if (looksLikeShortcut(cell0)) {
          shortcutText = cell0
          actionText = cell1
        } else if (looksLikeShortcut(cell1)) {
          shortcutText = cell1
          actionText = cell0
        } else {
          // Skip header rows or rows without clear shortcuts
          return
        }

        // Parse the shortcut text into modifiers + key
        const parsed = parseShortcutText(shortcutText, options.platformFilter)
        if (parsed) {
          shortcuts.push({
            modifiers: parsed.modifiers,
            key: parsed.key,
            action: actionText,
          })
        }
      })

      if (shortcuts.length > 0) {
        // Merge into existing section or create new one
        const existing = sections.find(s => s.name === sectionName)
        if (existing) {
          existing.shortcuts.push(...shortcuts)
        } else {
          sections.push({ name: sectionName, shortcuts })
        }
      }
    })

    return { sections }
  }
}

/**
 * Parse a shortcut string like "Ctrl + Shift + T" or "⌘⇧T" into { modifiers, key }
 */
function parseShortcutText(text, platformFilter) {
  if (!text) return null

  // Normalize separators
  let parts = text
    .replace(/\s*\+\s*/g, '+')  // normalize spaces around +
    .replace(/\s*then\s*/gi, '+') // "then" → +
    .split('+')
    .map(p => p.trim())
    .filter(Boolean)

  // If no + separator, try splitting Unicode modifier symbols
  if (parts.length === 1) {
    const unicodeSplit = splitUnicodeModifiers(parts[0])
    if (unicodeSplit.length > 1) {
      parts = unicodeSplit
    }
  }

  if (parts.length === 0) return null

  const modifiers = []
  let key = ''

  const modifierPatterns = [
    { pattern: /^(⌘|cmd|command)$/i, name: '⌘' },
    { pattern: /^(⌥|opt|option|alt)$/i, name: '⌥' },
    { pattern: /^(⌃|ctrl|control)$/i, name: '⌃' },
    { pattern: /^(⇧|shift)$/i, name: '⇧' },
    { pattern: /^(⊞|win|windows|super|meta)$/i, name: 'Super' },
  ]

  for (const part of parts) {
    let isModifier = false
    for (const { pattern, name } of modifierPatterns) {
      if (pattern.test(part)) {
        if (!modifiers.includes(name)) modifiers.push(name)
        isModifier = true
        break
      }
    }
    if (!isModifier) {
      key = part
    }
  }

  if (!key) return null

  return { modifiers, key }
}

/**
 * Split Unicode modifier symbols that are concatenated (e.g. "⌘⇧T" → ["⌘", "⇧", "T"])
 */
function splitUnicodeModifiers(text) {
  const parts = []
  const modSymbols = ['⌘', '⌥', '⌃', '⇧']
  let remaining = text

  for (const sym of modSymbols) {
    if (remaining.startsWith(sym)) {
      parts.push(sym)
      remaining = remaining.slice(sym.length)
    }
  }

  if (remaining) parts.push(remaining)
  return parts
}
