/**
 * Auto-approve high-confidence changes.
 * Writes directly to Supabase and logs the action.
 */
import { writeToSupabase } from '../pipeline/supabase-writer.mjs'

/**
 * Auto-apply high-confidence changes to Supabase.
 * @param {string} slug - App slug
 * @param {string} platformId - Platform
 * @param {object} diff - Diff result
 * @param {object} normalized - Full normalized scraped data
 * @returns {{ success: boolean, written: number }}
 */
export async function autoApprove(slug, platformId, diff, normalized) {
  if (diff.confidence.level !== 'high') {
    return { success: false, written: 0, reason: 'Not high confidence' }
  }

  try {
    const result = await writeToSupabase(slug, platformId, diff, normalized)
    console.log(`  Auto-approved: ${result.written} changes written to Supabase`)
    return { success: true, written: result.written }
  } catch (err) {
    console.error(`  Auto-approve failed: ${err.message}`)
    return { success: false, written: 0, reason: err.message }
  }
}
