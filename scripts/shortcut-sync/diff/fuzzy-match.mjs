/**
 * Fuzzy text matching for comparing action descriptions.
 */
import { distance } from 'fastest-levenshtein'

/**
 * Calculate normalized similarity between two strings (0.0 to 1.0).
 * 1.0 = identical, 0.0 = completely different.
 */
export function similarity(a, b) {
  if (a === b) return 1.0
  if (!a || !b) return 0.0

  const la = a.toLowerCase().trim()
  const lb = b.toLowerCase().trim()
  if (la === lb) return 1.0

  const maxLen = Math.max(la.length, lb.length)
  if (maxLen === 0) return 1.0

  const dist = distance(la, lb)
  return 1.0 - dist / maxLen
}

/**
 * Check if two action texts are semantically similar enough to be "the same shortcut".
 * Threshold: 0.85 (based on plan spec).
 */
export function isSameAction(a, b, threshold = 0.85) {
  return similarity(a, b) >= threshold
}
