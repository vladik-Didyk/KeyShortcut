/**
 * Updates timestamps on an app in the platform JSON file.
 *
 * - `lastVerified` — set on every sync (checked against official docs)
 * - `lastUpdated`  — set only when shortcuts actually changed
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../public/data/platforms')

/**
 * Set lastVerified (and optionally lastUpdated) on an app.
 * @param {string} slug - App slug
 * @param {string} platformId - Platform (macos, windows, linux)
 * @param {string} timestamp - ISO date string (YYYY-MM-DD or full ISO)
 * @param {boolean} hasChanges - Whether shortcuts were actually modified
 */
export function updateLastVerified(slug, platformId, timestamp, hasChanges = false) {
  const filePath = join(DATA_DIR, `${platformId}.json`)
  if (!existsSync(filePath)) return false

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const app = data.apps.find(a => a.slug === slug)
  if (!app) return false

  // Always update lastVerified (we checked the source)
  app.lastVerified = timestamp

  // Only update lastUpdated when data actually changed
  if (hasChanges) {
    app.lastUpdated = timestamp
  }

  writeFileSync(filePath, JSON.stringify(data, null, 0), 'utf-8')
  return true
}
