/**
 * Smart search: builds a flat index from platform data and parses
 * natural-language queries like "figma copy" or "paste in chrome".
 */

const STOP_WORDS = new Set([
  'look', 'up', 'for', 'in', 'at', 'the', 'find', 'search',
  'show', 'me', 'how', 'to', 'what', 'is', 'a', 'an', 'of',
  'shortcut', 'shortcuts', 'key', 'keys',
])

/**
 * Build a flat search index from platform apps.
 * Returns { entries[], appNames[] }
 *   entry: { action, key, modifiers, appName, appSlug, section, category }
 */
export function buildSearchIndex(apps) {
  if (!apps) return { entries: [], appNames: [] }

  const entries = []
  const appNames = []

  for (const app of apps) {
    appNames.push({ name: app.displayName, slug: app.slug, category: app.category, shortcutCount: app.shortcutCount })
    for (const section of app.sections) {
      for (const sc of section.shortcuts) {
        entries.push({
          action: sc.action,
          key: sc.key,
          modifiers: sc.modifiers,
          appName: app.displayName,
          appSlug: app.slug,
          section: section.name,
          category: app.category,
        })
      }
    }
  }

  return { entries, appNames }
}

/**
 * Parse a query string into tokens, stripping stop words.
 * Splits on whitespace and common punctuation (colons, semicolons, commas, hyphens).
 * Returns lowercase token array.
 */
export function tokenize(query) {
  return query
    .toLowerCase()
    .split(/[\s:;,\-]+/)
    .filter(t => t.length > 0 && !STOP_WORDS.has(t))
}

/**
 * Check if a name matches a set of tokens (all tokens must appear as substrings).
 */
function matchesAll(name, tokens) {
  const lower = name.toLowerCase()
  return tokens.every(t => lower.includes(t))
}

/**
 * Score how well a string matches tokens (lower = better).
 * Prioritizes: exact match > starts-with > contains.
 */
function matchScore(name, tokens) {
  const lower = name.toLowerCase()
  let score = 0
  for (const t of tokens) {
    if (lower === t) score += 0
    else if (lower.startsWith(t)) score += 1
    else score += 2
  }
  return score
}

/**
 * Check if an app matches a set of tokens by name or slug.
 */
function matchesApp(app, tokens) {
  return matchesAll(app.name, tokens) || matchesAll(app.slug, tokens)
}

/**
 * Score an app match — tries both name and slug, returns best (lowest) score.
 */
function appMatchScore(app, tokens) {
  const nameScore = matchesAll(app.name, tokens) ? matchScore(app.name, tokens) : Infinity
  const slugScore = matchesAll(app.slug, tokens) ? matchScore(app.slug, tokens) : Infinity
  return Math.min(nameScore, slugScore)
}

/**
 * Parse a query to detect an app name token (from any position) and remaining action tokens.
 * Pure function — no side effects.
 *
 * @param {string} query — raw user input
 * @param {Array<{name: string, slug: string}>} appNames — list of known apps
 * @returns {{ app: object|null, actionTokens: string[], allTokens: string[] }}
 */
export function parseAppQuery(query, appNames) {
  const tokens = tokenize(query)
  if (tokens.length === 0 || !appNames) return { app: null, actionTokens: [], allTokens: [] }

  let bestAppMatch = null

  for (let len = Math.min(3, tokens.length); len >= 1; len--) {
    for (let start = 0; start <= tokens.length - len; start++) {
      const appTokens = tokens.slice(start, start + len)
      const remaining = [...tokens.slice(0, start), ...tokens.slice(start + len)]

      const matching = appNames.filter(a => matchesApp(a, appTokens))
      if (matching.length > 0) {
        const best = matching.sort((a, b) => appMatchScore(a, appTokens) - appMatchScore(b, appTokens))[0]
        const score = appMatchScore(best, appTokens)
        if (!bestAppMatch || len > bestAppMatch.tokenLen || (len === bestAppMatch.tokenLen && score < bestAppMatch.score)) {
          bestAppMatch = { app: best, tokenLen: len, score, remaining }
        }
      }
    }
  }

  return {
    app: bestAppMatch?.app ?? null,
    actionTokens: bestAppMatch?.remaining ?? tokens,
    allTokens: tokens,
  }
}

/**
 * Search the index with a natural-language query.
 *
 * Strategy:
 * 1. Tokenize and strip stop words
 * 2. Try to identify which tokens match an app name (or slug)
 * 3. Remaining tokens match against shortcut actions
 * 4. Return grouped results: { appMatches[], shortcutMatches[] }
 *
 * shortcutMatches grouped by app: { appName, appSlug, category, shortcuts[] }
 */
export function searchIndex(index, query, maxResults = 50) {
  if (!query?.trim() || !index) return { appMatches: [], shortcutMatches: [] }

  const { entries, appNames } = index
  const parsed = parseAppQuery(query, appNames)
  if (parsed.allTokens.length === 0) return { appMatches: [], shortcutMatches: [] }

  const tokens = parsed.allTokens

  // If we found an app match and have remaining tokens, search shortcuts within that app
  if (parsed.app && parsed.actionTokens.length > 0) {
    const actionTokens = parsed.actionTokens
    const appSlug = parsed.app.slug
    const matched = entries
      .filter(e => e.appSlug === appSlug && matchesAll(e.action, actionTokens))
      .slice(0, maxResults)

    // Also find same action in other apps for "also in" display
    const otherApps = new Set()
    if (matched.length > 0) {
      const primaryAction = matched[0].action.toLowerCase()
      for (const e of entries) {
        if (e.appSlug !== appSlug && e.action.toLowerCase().includes(primaryAction)) {
          otherApps.add(e.appName)
        }
      }
    }

    return {
      appMatches: [],
      shortcutMatches: groupShortcutResults(matched),
      otherApps: [...otherApps].slice(0, 5),
    }
  }

  // If we found an app match but no remaining tokens, show the app + its shortcuts
  if (parsed.app && parsed.actionTokens.length === 0) {
    const appSlug = parsed.app.slug
    const appMatch = appNames.filter(a => matchesApp(a, tokens))
      .sort((a, b) => appMatchScore(a, tokens) - appMatchScore(b, tokens))

    const preview = entries
      .filter(e => e.appSlug === appSlug)

    return {
      appMatches: appMatch.slice(0, 5),
      shortcutMatches: groupShortcutResults(preview),
      otherApps: [],
    }
  }

  // No app match found — search all actions across all apps
  const appMatch = appNames.filter(a => matchesApp(a, tokens))
    .sort((a, b) => appMatchScore(a, tokens) - appMatchScore(b, tokens))

  const shortcutResults = entries
    .filter(e => matchesAll(e.action, tokens))
    .slice(0, maxResults)

  return {
    appMatches: appMatch.slice(0, 5),
    shortcutMatches: groupShortcutResults(shortcutResults),
    otherApps: [],
  }
}

/**
 * Group flat shortcut results by app.
 */
function groupShortcutResults(results) {
  const groups = {}
  for (const r of results) {
    if (!groups[r.appSlug]) {
      groups[r.appSlug] = { appName: r.appName, appSlug: r.appSlug, category: r.category, shortcuts: [] }
    }
    groups[r.appSlug].shortcuts.push(r)
  }
  return Object.values(groups)
}
