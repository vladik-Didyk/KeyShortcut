/**
 * Updates `lastVerified` timestamp on an app in the platform JSON file.
 * Called after a successful sync (whether changes found or not).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../public/data/platforms')

/**
 * Set lastVerified on an app in its platform JSON.
 * @param {string} slug - App slug
 * @param {string} platformId - Platform (macos, windows, linux)
 * @param {string} timestamp - ISO timestamp
 */
export function updateLastVerified(slug, platformId, timestamp) {
  const filePath = join(DATA_DIR, `${platformId}.json`)
  if (!existsSync(filePath)) return false

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const app = data.apps.find(a => a.slug === slug)
  if (!app) return false

  app.lastVerified = timestamp
  writeFileSync(filePath, JSON.stringify(data, null, 0), 'utf-8')
  return true
}
