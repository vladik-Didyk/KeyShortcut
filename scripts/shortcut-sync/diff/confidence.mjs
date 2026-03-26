/**
 * Confidence scoring for shortcut changes.
 * Determines whether changes should be auto-approved, reviewed via PR, or flagged as suspicious.
 */

/**
 * @typedef {object} ChangeSet
 * @property {Array} added - New shortcuts not in existing data
 * @property {Array} removed - Shortcuts in existing but not in scraped
 * @property {Array} modified - Shortcuts with same key combo but different action text
 * @property {number} existingTotal - Total shortcuts in existing data
 * @property {number} scrapedTotal - Total shortcuts in scraped data
 */

/**
 * Calculate confidence score for a set of changes.
 * @param {ChangeSet} changes
 * @returns {{ score: number, level: 'high' | 'medium' | 'low', reasons: string[] }}
 */
export function scoreConfidence(changes) {
  const { added, removed, modified, existingTotal, scrapedTotal } = changes
  const reasons = []
  let score = 1.0

  const totalChanges = added.length + removed.length + modified.length

  // No changes = perfect confidence
  if (totalChanges === 0) {
    return { score: 1.0, level: 'high', reasons: ['No changes detected'] }
  }

  // Bulk change penalty: if >50% of shortcuts changed, likely a parser issue
  if (existingTotal > 0) {
    const changeRatio = totalChanges / existingTotal
    if (changeRatio > 0.5) {
      score -= 0.5
      reasons.push(`${Math.round(changeRatio * 100)}% of shortcuts changed — possible parser failure`)
    } else if (changeRatio > 0.3) {
      score -= 0.2
      reasons.push(`${Math.round(changeRatio * 100)}% of shortcuts changed — significant change`)
    }
  }

  // Removal penalty: removals are less certain than additions
  if (removed.length > 0) {
    score -= Math.min(0.2, removed.length * 0.05)
    reasons.push(`${removed.length} shortcut(s) removed`)
  }

  // Large addition with no existing data: could be initial scrape or complete replacement
  if (existingTotal === 0 && scrapedTotal > 0) {
    score = 0.7
    reasons.push('No existing data — initial extraction')
  }

  // Count mismatch: very different totals suggest parser captured wrong section
  if (existingTotal > 0 && scrapedTotal > 0) {
    const ratio = scrapedTotal / existingTotal
    if (ratio < 0.3 || ratio > 3.0) {
      score -= 0.3
      reasons.push(`Shortcut count changed dramatically: ${existingTotal} → ${scrapedTotal}`)
    }
  }

  // Small, incremental changes are high confidence
  if (added.length <= 5 && removed.length === 0 && modified.length <= 3) {
    score = Math.max(score, 0.9)
    if (reasons.length === 0) reasons.push('Small incremental change')
  }

  // Text-only modifications (same key combo, slightly different action) are high confidence
  if (modified.length > 0 && added.length === 0 && removed.length === 0) {
    score = Math.max(score, 0.85)
    reasons.push('Action text updates only')
  }

  score = Math.max(0.0, Math.min(1.0, score))

  let level
  if (score >= 0.9) level = 'high'
  else if (score >= 0.6) level = 'medium'
  else level = 'low'

  return { score, level, reasons }
}
