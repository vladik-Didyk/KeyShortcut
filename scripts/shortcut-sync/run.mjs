#!/usr/bin/env node
/**
 * Shortcut Sync — Automated keyboard shortcut extraction pipeline.
 *
 * Usage:
 *   node scripts/shortcut-sync/run.mjs                          # Check all scheduled apps
 *   node scripts/shortcut-sync/run.mjs --app=chrome              # Check single app (all platforms)
 *   node scripts/shortcut-sync/run.mjs --app=chrome --platform=macos  # Check single app + platform
 *   node scripts/shortcut-sync/run.mjs --tier=1                  # Check all tier 1 apps
 *   node scripts/shortcut-sync/run.mjs --dry-run                 # Don't write to Supabase
 *   node scripts/shortcut-sync/run.mjs --health-check             # Validate all source URLs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getScraper } from './scrapers/index.mjs'
import { normalizeScrapedData } from './pipeline/normalize.mjs'
import { diffShortcuts } from './diff/diff-engine.mjs'
import { generateReport, generateSummary } from './diff/report.mjs'
import { autoApprove } from './review/auto-approve.mjs'
import { createPR, createIssue } from './review/create-pr.mjs'
import { appendSyncLog } from './sync-log.mjs'
import { updateLastVerified } from './update-verified.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

// Load environment
try { process.loadEnvFile(join(ROOT, '.env')) } catch { /* env vars from CI secrets */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const REST_URL = `${SUPABASE_URL}/rest/v1`
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

// ── Parse CLI args ────────────────────────────────────────────
const args = parseArgs(process.argv.slice(2))

// ── Load source registry ──────────────────────────────────────
const sources = JSON.parse(readFileSync(join(__dirname, 'sources.json'), 'utf-8'))

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('=== Shortcut Sync ===\n')

  const appsToCheck = getAppsToCheck()

  if (appsToCheck.length === 0) {
    console.log('No apps to check. Use --app=<slug>, --tier=<n>, or check sources.json')
    return
  }

  console.log(`Checking ${appsToCheck.length} app(s)...\n`)

  const results = []

  for (const { slug, config } of appsToCheck) {
    const platforms = args.platform
      ? [args.platform].filter(p => config.sources[p])
      : Object.keys(config.sources)

    for (const platformId of platforms) {
      try {
        const result = await processApp(slug, config, platformId)
        results.push(result)
      } catch (err) {
        console.error(`  ERROR: ${slug}/${platformId}: ${err.message}`)
        results.push({ slug, platformId, error: err.message })
      }
    }
  }

  // Print summary
  console.log('\n=== Summary ===\n')
  for (const result of results) {
    if (result.error) {
      console.log(`  ✗ ${result.slug}/${result.platformId}: ${result.error}`)
    } else if (result.diff.hasChanges) {
      const actionLabel = result.action ? ` [${result.action}]` : ''
      console.log(`  ● ${result.summary}${actionLabel}`)
    } else {
      console.log(`  ✓ ${result.summary}`)
    }
  }

  const withChanges = results.filter(r => !r.error && r.diff?.hasChanges)
  const autoApproved = results.filter(r => r.action === 'auto-approved')
  const prsCreated = results.filter(r => r.action === 'pr-created')
  const issuesCreated = results.filter(r => r.action === 'issue-created')

  console.log(`\n${withChanges.length} app(s) with changes detected.`)
  if (autoApproved.length) console.log(`  ${autoApproved.length} auto-approved`)
  if (prsCreated.length) console.log(`  ${prsCreated.length} PR(s) created for review`)
  if (issuesCreated.length) console.log(`  ${issuesCreated.length} issue(s) created`)

  if (args.dryRun) {
    console.log('\n(Dry run — no changes written)')
  }
}

// ── Process a single app/platform ─────────────────────────────
async function processApp(slug, config, platformId) {
  const source = config.sources[platformId]
  console.log(`► ${config.displayName} (${platformId})`)
  console.log(`  URL: ${source.url}`)
  console.log(`  Parser: ${source.parser}`)

  // Step 1: Scrape
  console.log('  Scraping...')
  const scraper = getScraper(source.parser)
  const rawData = await scraper.extract(source.url, {
    platformFilter: source.platformFilter,
    platform: platformId,
  })

  const shortcutCount = rawData.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
  console.log(`  Extracted: ${rawData.sections.length} sections, ${shortcutCount} shortcuts`)

  // Step 2: Normalize
  console.log('  Normalizing...')
  const normalized = normalizeScrapedData(rawData, platformId)

  const normalizedCount = normalized.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
  console.log(`  Normalized: ${normalized.sections.length} sections, ${normalizedCount} shortcuts`)

  // Step 3: Fetch existing data from Supabase
  console.log('  Fetching existing data from Supabase...')
  const existing = await fetchExistingData(slug, platformId)

  const existingCount = existing.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
  console.log(`  Existing: ${existing.sections.length} sections, ${existingCount} shortcuts`)

  // Step 4: Diff
  const diff = diffShortcuts(normalized, existing)
  const summary = generateSummary(slug, platformId, diff)
  console.log(`  ${summary}`)

  // Step 5: Handle changes
  let action = 'none'
  if (diff.hasChanges) {
    const report = generateReport(config.displayName, platformId, diff, source.url)
    console.log('\n' + report)

    if (!args.dryRun) {
      // Step 6: Apply changes based on confidence level
      action = await handleChanges(slug, platformId, diff, normalized, report)
    }
  }

  // Log every sync run
  const timestamp = new Date().toISOString()
  appendSyncLog({
    slug,
    platformId,
    timestamp,
    sourceUrl: source.url,
    parser: source.parser,
    result: {
      added: diff.added.length,
      modified: diff.modified.length,
      removed: diff.removed.length,
      scrapedTotal: diff.scrapedTotal,
      existingTotal: diff.existingTotal,
    },
    confidence: diff.confidence.level,
    action: args.dryRun ? 'dry-run' : action,
  })

  // Update lastVerified on the app in platform JSON
  updateLastVerified(slug, platformId, timestamp)

  return { slug, platformId, diff, summary, action }
}

// ── Handle changes based on confidence ────────────────────────
async function handleChanges(slug, platformId, diff, normalized, report) {
  const { level } = diff.confidence

  if (level === 'high') {
    // Auto-approve: write directly to Supabase
    console.log('  → Auto-approving (high confidence)...')
    const result = await autoApprove(slug, platformId, diff, normalized)
    return result.success ? 'auto-approved' : 'auto-approve-failed'
  }

  if (level === 'medium') {
    // Create a GitHub PR for review
    console.log('  → Creating GitHub PR for review (medium confidence)...')
    const pr = createPR(slug, platformId, report, level)
    if (pr) {
      console.log(`  → PR created: ${pr.url}`)
      return 'pr-created'
    }
    return 'pr-failed'
  }

  // Low confidence: create an issue
  console.log('  → Creating GitHub Issue (low confidence — possible parser issue)...')
  const issue = createIssue(slug, platformId, report)
  if (issue) {
    console.log(`  → Issue created: ${issue.url}`)
    return 'issue-created'
  }
  return 'issue-failed'
}

// ── Fetch existing Supabase data ──────────────────────────────
async function fetchExistingData(slug, platformId) {
  // Get app by slug
  const apps = await query(`apps?slug=eq.${slug}&select=id,slug,display_name`)
  if (!apps.length) {
    return { sections: [] } // App not in Supabase yet
  }
  const appId = apps[0].id

  // Get platform's modifier symbols
  const modSymbols = await query(
    `modifier_symbols?platform_id=eq.${platformId}&select=modifier,symbol&order=sort_order`
  )
  const modMap = Object.fromEntries(modSymbols.map(m => [m.modifier, m.symbol]))

  // Get sections for this app + platform
  const sections = await query(
    `sections?app_id=eq.${appId}&platform_id=eq.${platformId}&select=id,name,sort_order&order=sort_order`
  )

  if (!sections.length) {
    return { sections: [] }
  }

  const sectionIds = sections.map(s => s.id)

  // Get shortcuts (batch if needed)
  const shortcuts = await query(
    `shortcuts?section_id=in.(${sectionIds.join(',')})&select=section_id,modifiers,key,action_key,sort_order&order=sort_order`
  )

  // Get translations
  const actionKeys = [...new Set(shortcuts.map(s => s.action_key))]
  let translations = []
  if (actionKeys.length > 0) {
    // Batch in groups of 100
    for (let i = 0; i < actionKeys.length; i += 100) {
      const batch = actionKeys.slice(i, i + 100)
      const result = await query(
        `translations?key=in.(${batch.join(',')})&language=eq.en&select=key,value`
      )
      translations.push(...result)
    }
  }
  const transMap = Object.fromEntries(translations.map(t => [t.key, t.value]))

  // Assemble into same format as normalized scraped data
  return {
    sections: sections.map(sec => ({
      name: sec.name,
      shortcuts: shortcuts
        .filter(sc => sc.section_id === sec.id)
        .map(sc => ({
          modifiers: sc.modifiers.map(m => modMap[m] || m),
          key: sc.key,
          action: transMap[sc.action_key] || sc.action_key,
        })),
    })).filter(s => s.shortcuts.length > 0),
  }
}

async function query(path) {
  const res = await globalThis.fetch(`${REST_URL}/${path}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`Supabase query failed: ${res.status} ${path}`)
  return res.json()
}

// ── CLI helpers ───────────────────────────────────────────────
function getAppsToCheck() {
  const all = Object.entries(sources.apps)

  if (args.app) {
    const config = sources.apps[args.app]
    if (!config) {
      console.error(`App "${args.app}" not found in sources.json`)
      process.exit(1)
    }
    return [{ slug: args.app, config }]
  }

  if (args.tier) {
    return all
      .filter(([, config]) => config.tier === parseInt(args.tier))
      .map(([slug, config]) => ({ slug, config }))
  }

  // Default: all apps
  return all.map(([slug, config]) => ({ slug, config }))
}

function parseArgs(argv) {
  const result = { dryRun: false, healthCheck: false }
  for (const arg of argv) {
    if (arg === '--dry-run') result.dryRun = true
    else if (arg === '--health-check') result.healthCheck = true
    else if (arg.startsWith('--app=')) result.app = arg.split('=')[1]
    else if (arg.startsWith('--platform=')) result.platform = arg.split('=')[1]
    else if (arg.startsWith('--tier=')) result.tier = arg.split('=')[1]
  }
  return result
}

// ── Health check ──────────────────────────────────────────────
async function healthCheck() {
  console.log('=== Health Check — Validating source URLs ===\n')

  const allApps = Object.entries(sources.apps)
  const manual = allApps.filter(([, c]) => !c.sources || c.parser === 'manual')
  const automated = allApps.filter(([, c]) => c.sources && c.parser !== 'manual')

  console.log(`Total apps: ${allApps.length}`)
  console.log(`Automated: ${automated.length}`)
  console.log(`Manual: ${manual.length} (${manual.map(([s]) => s).join(', ')})\n`)

  const results = { ok: [], broken: [], slow: [] }
  let checked = 0
  const uniqueUrls = new Map()

  // Collect unique URLs
  for (const [slug, config] of automated) {
    for (const [platformId, source] of Object.entries(config.sources)) {
      if (!uniqueUrls.has(source.url)) {
        uniqueUrls.set(source.url, [])
      }
      uniqueUrls.get(source.url).push({ slug, platformId })
    }
  }

  console.log(`Checking ${uniqueUrls.size} unique URLs...\n`)

  for (const [url, apps] of uniqueUrls) {
    checked++
    const label = apps.map(a => `${a.slug}/${a.platformId}`).join(', ')
    try {
      const start = Date.now()
      const res = await globalThis.fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KeyShortcut-Bot/1.0)' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      const ms = Date.now() - start

      if (res.ok) {
        if (ms > 5000) {
          results.slow.push({ url, label, ms, status: res.status })
          process.stdout.write(`  ⚠ ${checked}/${uniqueUrls.size} SLOW (${ms}ms): ${label}\n`)
        } else {
          results.ok.push({ url, label, ms })
          process.stdout.write(`  ✓ ${checked}/${uniqueUrls.size} ${label} (${ms}ms)\n`)
        }
      } else {
        results.broken.push({ url, label, status: res.status })
        process.stdout.write(`  ✗ ${checked}/${uniqueUrls.size} HTTP ${res.status}: ${label} — ${url}\n`)
      }
    } catch (err) {
      results.broken.push({ url, label, status: err.message })
      process.stdout.write(`  ✗ ${checked}/${uniqueUrls.size} ERROR: ${label} — ${err.message.slice(0, 80)}\n`)
    }

    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500))
  }

  // Summary
  console.log('\n=== Health Check Summary ===\n')
  console.log(`  ✓ OK: ${results.ok.length}`)
  console.log(`  ⚠ Slow (>5s): ${results.slow.length}`)
  console.log(`  ✗ Broken: ${results.broken.length}`)

  if (results.broken.length > 0) {
    console.log('\nBroken URLs:')
    for (const { url, label, status } of results.broken) {
      console.log(`  ${label}: ${status} — ${url}`)
    }
  }

  if (results.slow.length > 0) {
    console.log('\nSlow URLs:')
    for (const { url, label, ms } of results.slow) {
      console.log(`  ${label}: ${ms}ms — ${url}`)
    }
  }

  return results
}

// ── Entry point ───────────────────────────────────────────────
if (args.healthCheck) {
  healthCheck().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
} else {
  main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}
