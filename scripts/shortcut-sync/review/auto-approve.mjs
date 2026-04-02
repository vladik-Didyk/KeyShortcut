/**
 * Auto-approve high-confidence changes.
 * Writes to BOTH Supabase and local JSON files in parallel.
 */
import { writeToSupabase } from '../pipeline/supabase-writer.mjs'
import { applyDiffToJSON } from '../pipeline/json-writer.mjs'

/**
 * Auto-apply high-confidence changes to Supabase + local JSON.
 * @param {string} slug - App slug
 * @param {string} platformId - Platform
 * @param {object} diff - Diff result
 * @param {object} normalized - Full normalized scraped data
 * @param {object} source - Source config (url, parser, etc.)
 * @returns {{ success: boolean, written: number }}
 */
export async function autoApprove(slug, platformId, diff, normalized, source = {}) {
  if (diff.confidence.level !== 'high') {
    return { success: false, written: 0, reason: 'Not high confidence' }
  }

  const now = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const meta = {
    lastVerified: now,
    lastUpdated: now,
    docsUrl: source.url,
  }

  const results = { supabase: null, json: null }

  // Write to both targets in parallel
  const [supabaseResult, jsonResult] = await Promise.allSettled([
    // Supabase write (may fail if no service role key)
    writeToSupabase(slug, platformId, diff, normalized)
      .then(r => { results.supabase = r; return r })
      .catch(err => {
        console.warn(`  ⚠ Supabase write skipped: ${err.message.slice(0, 80)}`)
        return { success: false, written: 0, reason: err.message }
      }),
    // Local JSON write (always available)
    Promise.resolve().then(() => {
      const r = applyDiffToJSON(slug, platformId, diff, normalized, meta)
      results.json = r
      return r
    }),
  ])

  const supabaseOk = supabaseResult.status === 'fulfilled' && results.supabase?.written > 0
  const jsonOk = jsonResult.status === 'fulfilled' && results.json?.success

  if (supabaseOk) console.log(`  ✓ Supabase: ${results.supabase.written} changes written`)
  if (jsonOk) console.log(`  ✓ JSON: ${results.json.written} changes applied to ${platformId}.json`)

  const written = Math.max(results.supabase?.written || 0, results.json?.written || 0)
  const success = supabaseOk || jsonOk

  if (!success) {
    console.error('  ✗ Both writes failed')
    return { success: false, written: 0 }
  }

  return { success, written }
}
