/**
 * Sync log — records every sync run with timestamps, diffs, and outcomes.
 * Stored as a JSON array in data/sync-log.json, newest first.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH = join(__dirname, '../../public/data/sync-log.json')

// Keep last N entries to prevent unbounded growth
const MAX_ENTRIES = 500

/**
 * Read the current sync log.
 */
export function readSyncLog() {
  if (!existsSync(LOG_PATH)) return []
  try {
    return JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
  } catch {
    return []
  }
}

/**
 * Append an entry to the sync log.
 * @param {object} entry
 * @param {string} entry.slug - App slug
 * @param {string} entry.platformId - Platform
 * @param {string} entry.timestamp - ISO timestamp
 * @param {string} entry.sourceUrl - URL that was scraped
 * @param {string} entry.parser - Parser type used
 * @param {object} entry.result - { added, modified, removed, scrapedTotal, existingTotal }
 * @param {string} entry.confidence - high/medium/low
 * @param {string} entry.action - none/auto-approved/pr-created/issue-created/dry-run
 */
export function appendSyncLog(entry) {
  const log = readSyncLog()
  log.unshift(entry) // newest first
  if (log.length > MAX_ENTRIES) log.length = MAX_ENTRIES
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
}

/**
 * Get the most recent sync entry for an app/platform.
 */
export function getLastSync(slug, platformId) {
  const log = readSyncLog()
  return log.find(e => e.slug === slug && e.platformId === platformId) || null
}
