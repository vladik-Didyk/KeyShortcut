/**
 * Generate human-readable Markdown reports from diff results.
 */

/**
 * Generate a Markdown diff report.
 * @param {string} appName - Display name of the app
 * @param {string} platformId - Platform (macos, windows, linux)
 * @param {object} diff - Result from diffShortcuts()
 * @param {string} sourceUrl - The URL that was scraped
 * @returns {string} Markdown report
 */
export function generateReport(appName, platformId, diff, sourceUrl) {
  const { added, removed, modified, existingTotal, scrapedTotal, confidence } = diff

  const lines = []

  lines.push(`## ${appName} (${platformId}) — Shortcut Changes`)
  lines.push('')
  lines.push(`**Summary:** ${added.length} added, ${modified.length} modified, ${removed.length} removed`)
  lines.push(`**Confidence:** ${confidence.level.toUpperCase()} (${confidence.score.toFixed(2)})`)
  lines.push(`**Existing shortcuts:** ${existingTotal} → **Scraped:** ${scrapedTotal}`)
  lines.push('')

  if (confidence.reasons.length > 0) {
    lines.push('**Notes:**')
    for (const reason of confidence.reasons) {
      lines.push(`- ${reason}`)
    }
    lines.push('')
  }

  if (added.length > 0) {
    lines.push('### Added Shortcuts')
    lines.push('')
    lines.push('| Section | Shortcut | Action |')
    lines.push('|---------|----------|--------|')
    for (const { section, shortcut } of added) {
      lines.push(`| ${section} | ${formatShortcut(shortcut)} | ${shortcut.action} |`)
    }
    lines.push('')
  }

  if (modified.length > 0) {
    lines.push('### Modified Shortcuts')
    lines.push('')
    lines.push('| Section | Shortcut | Old Action | New Action | Similarity |')
    lines.push('|---------|----------|------------|------------|------------|')
    for (const { section, shortcut, oldAction, newAction, similarity } of modified) {
      lines.push(`| ${section} | ${formatShortcut(shortcut)} | ${oldAction} | ${newAction} | ${(similarity * 100).toFixed(0)}% |`)
    }
    lines.push('')
  }

  if (removed.length > 0) {
    lines.push('### Removed Shortcuts')
    lines.push('')
    lines.push('| Section | Shortcut | Action |')
    lines.push('|---------|----------|--------|')
    for (const { section, shortcut } of removed) {
      lines.push(`| ${section} | ${formatShortcut(shortcut)} | ${shortcut.action} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`Source: ${sourceUrl}`)
  lines.push(`Checked: ${new Date().toISOString()}`)

  return lines.join('\n')
}

/**
 * Format a shortcut for display in a table cell.
 */
function formatShortcut(shortcut) {
  const parts = [...shortcut.modifiers, shortcut.key]
  return parts.join(' + ')
}

/**
 * Generate a concise one-line summary for logs.
 */
export function generateSummary(appSlug, platformId, diff) {
  const { added, removed, modified, confidence } = diff
  const parts = []
  if (added.length) parts.push(`+${added.length}`)
  if (modified.length) parts.push(`~${modified.length}`)
  if (removed.length) parts.push(`-${removed.length}`)

  const changeStr = parts.length ? parts.join(', ') : 'no changes'
  return `${appSlug}/${platformId}: ${changeStr} [${confidence.level}]`
}
