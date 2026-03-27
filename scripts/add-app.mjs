#!/usr/bin/env node
/**
 * Interactive CLI to add a new app to the keyboard shortcuts directory.
 * Handles everything end-to-end: Supabase records, icon, source URL, frontend mappings.
 *
 * Usage:
 *   node scripts/add-app.mjs                          # Interactive mode
 *   node scripts/add-app.mjs --from-json app.json     # From JSON file
 *   node scripts/add-app.mjs --dry-run                # Preview without writing
 *
 * JSON format:
 * {
 *   "slug": "my-app",
 *   "displayName": "My App",
 *   "category": "apple-apps",
 *   "docsUrl": "https://...",
 *   "iconPath": "/path/to/icon.png",       (optional — .png, .webp, .icns, or .svg)
 *   "iconFromApp": "/Applications/App.app", (optional — extract from macOS app)
 *   "platform": "macos",
 *   "sections": [
 *     {
 *       "name": "General",
 *       "shortcuts": [
 *         { "modifiers": ["command"], "key": "N", "action": "New document" },
 *         { "modifiers": ["command", "shift"], "key": "S", "action": "Save as" }
 *       ]
 *     }
 *   ]
 * }
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Load env
try { process.loadEnvFile(join(ROOT, '.env')) } catch { /* CI */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

// ── CLI helpers ─────────────────────────────────────────────

function rl() {
  return createInterface({ input: process.stdin, output: process.stdout })
}

function ask(prompt) {
  return new Promise(resolve => {
    const r = rl()
    r.question(prompt, answer => { r.close(); resolve(answer.trim()) })
  })
}

function log(msg) { console.log(`  ${msg}`) }
function heading(msg) { console.log(`\n${'─'.repeat(50)}\n  ${msg}\n${'─'.repeat(50)}`) }
function success(msg) { console.log(`  ✓ ${msg}`) }
function warn(msg) { console.log(`  ! ${msg}`) }
function info(msg) { console.log(`  -> ${msg}`) }

// ── Data helpers ────────────────────────────────────────────

function generateActionKey(slug, action) {
  const camel = action
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
  return `shortcuts.${slug}.${camel}`
}

const VALID_MODIFIERS = ['command', 'option', 'control', 'shift', 'fn', 'alt', 'super']
const CATEGORIES = [
  'apple-apps', 'macos-system', 'browsers', 'development', 'communication',
  'productivity', 'design', 'microsoft-office', 'media', 'windows-system', 'system-utils'
]

// ── Shell helper (safe, no injection) ───────────────────────

function run(cmd, cmdArgs, opts = {}) {
  try {
    return execFileSync(cmd, cmdArgs, { encoding: 'utf-8', stdio: 'pipe', ...opts }).trim()
  } catch {
    return null
  }
}

// ── Icon processing ─────────────────────────────────────────

function processIcon(slug, source) {
  const outPath = join(ROOT, 'public/images/app-icons', `${slug}.webp`)

  if (!source) return null

  // Extract from macOS .app bundle
  if (source.endsWith('.app')) {
    info(`Extracting icon from ${source}...`)
    const findResult = run('find', [
      `${source}/Contents/Resources`, '-name', '*.icns', '-maxdepth', '1'
    ])
    if (!findResult) { warn('No .icns file found in app bundle'); return null }

    const icnsFiles = findResult.split('\n').filter(Boolean)
    const appName = source.split('/').pop().replace('.app', '')
    const icns = icnsFiles.find(f => f.includes('AppIcon')) ||
                 icnsFiles.find(f => f.toLowerCase().includes(appName.toLowerCase())) ||
                 icnsFiles[0]

    if (!icns) { warn('No .icns file found'); return null }

    const tmpPng = `/tmp/${slug}_icon.png`
    run('sips', ['-s', 'format', 'png', '-z', '128', '128', icns, '--out', tmpPng])

    // Try cwebp first, then convert/magick
    if (run('cwebp', ['-q', '90', tmpPng, '-o', outPath])) return outPath
    if (run('magick', [tmpPng, outPath])) return outPath
    if (run('convert', [tmpPng, outPath])) return outPath

    // Fallback: copy as PNG
    run('cp', [tmpPng, outPath.replace('.webp', '.png')])
    warn('Could not convert to WebP -- saved as PNG')
    return outPath.replace('.webp', '.png')
  }

  // From file path
  if (existsSync(source)) {
    const ext = extname(source).toLowerCase()
    if (ext === '.webp') {
      run('cp', [source, outPath])
      return outPath
    }
    if (ext === '.icns') {
      const tmpPng = `/tmp/${slug}_icon.png`
      run('sips', ['-s', 'format', 'png', '-z', '128', '128', source, '--out', tmpPng])
      if (run('cwebp', ['-q', '90', tmpPng, '-o', outPath])) return outPath
      if (run('magick', [tmpPng, outPath])) return outPath
      run('cp', [tmpPng, outPath.replace('.webp', '.png')])
      return outPath.replace('.webp', '.png')
    }
    if (['.png', '.jpg', '.jpeg', '.svg'].includes(ext)) {
      if (run('magick', [source, '-resize', '128x128', outPath])) return outPath
      if (run('convert', [source, '-resize', '128x128', outPath])) return outPath
      if (run('sips', ['-s', 'format', 'png', '-z', '128', '128', source, '--out', outPath])) return outPath
      run('cp', [source, outPath])
      return outPath
    }
    warn(`Unsupported icon format: ${ext}`)
    return null
  }

  warn(`Icon source not found: ${source}`)
  return null
}

async function uploadIcon(slug, localPath) {
  const buf = readFileSync(localPath)
  const contentType = localPath.endsWith('.png') ? 'image/png' : 'image/webp'
  const storagePath = `app-icons/${slug}.webp`

  const { error } = await supabase.storage
    .from('icons')
    .upload(storagePath, buf, { contentType, upsert: true })

  if (error) { warn(`Icon upload failed: ${error.message}`); return null }

  const { data } = supabase.storage.from('icons').getPublicUrl(storagePath)
  return data.publicUrl
}

// ── Supabase writes ─────────────────────────────────────────

async function createApp(slug, displayName, categoryId, docsUrl, iconUrl) {
  const { data: existing } = await supabase.from('apps').select('id').eq('slug', slug)
  if (existing?.length) {
    info(`App "${slug}" already exists -- updating`)
    const updates = {}
    if (docsUrl) updates.docs_url = docsUrl
    if (iconUrl) updates.icon_url = iconUrl
    if (Object.keys(updates).length) {
      await supabase.from('apps').update(updates).eq('id', existing[0].id)
    }
    await supabase.from('app_platforms').upsert(
      { app_id: existing[0].id, platform_id: 'macos' },
      { onConflict: 'app_id,platform_id' }
    )
    return existing[0].id
  }

  const { data: maxSort } = await supabase.from('apps').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const sortOrder = (maxSort?.[0]?.sort_order || 0) + 1

  const { data: created, error } = await supabase.from('apps').insert({
    slug, display_name: displayName, category_id: categoryId,
    sort_order: sortOrder, docs_url: docsUrl, icon_url: iconUrl,
  }).select('id')

  if (error) throw new Error(`Failed to create app: ${error.message}`)

  await supabase.from('app_platforms').insert({ app_id: created[0].id, platform_id: 'macos' })
  return created[0].id
}

async function writeShortcuts(appId, slug, platformId, sections) {
  let created = 0, updated = 0

  for (let si = 0; si < sections.length; si++) {
    const section = sections[si]

    // Get or create section
    const { data: existing } = await supabase.from('sections')
      .select('id').eq('app_id', appId).eq('platform_id', platformId).eq('name', section.name)
    let sectionId
    if (existing?.length) {
      sectionId = existing[0].id
    } else {
      const { data: sec, error } = await supabase.from('sections')
        .insert({ app_id: appId, platform_id: platformId, name: section.name, sort_order: si })
        .select('id')
      if (error) throw new Error(`Section "${section.name}": ${error.message}`)
      sectionId = sec[0].id
    }

    for (let i = 0; i < section.shortcuts.length; i++) {
      const { modifiers, key, action } = section.shortcuts[i]
      const actionKey = generateActionKey(slug, action)

      // Ensure translation
      const { data: trans } = await supabase.from('translations')
        .select('id, value').eq('key', actionKey).eq('language', 'en')
      if (trans?.length) {
        if (trans[0].value !== action) await supabase.from('translations').update({ value: action }).eq('id', trans[0].id)
      } else {
        await supabase.from('translations').insert({ key: actionKey, language: 'en', value: action })
      }

      // Check existing shortcut
      const modsFilter = `{${modifiers.join(',')}}`
      const { data: sc } = await supabase.from('shortcuts')
        .select('id').eq('section_id', sectionId).eq('key', key).eq('modifiers', modsFilter)
      if (sc?.length) {
        await supabase.from('shortcuts').update({ action_key: actionKey }).eq('id', sc[0].id)
        updated++
      } else {
        const { error } = await supabase.from('shortcuts').insert({
          section_id: sectionId, modifiers, key, action_key: actionKey, sort_order: i,
        })
        if (error) warn(`Shortcut ${modifiers.join('+')}+${key}: ${error.message}`)
        else created++
      }
    }
  }

  return { created, updated }
}

// ── Frontend file updates ───────────────────────────────────

function updateDirectoryHelpers(slug, displayName) {
  const filePath = join(ROOT, 'src/utils/directoryHelpers.js')
  let content = readFileSync(filePath, 'utf-8')

  // Add to imageIcons if not present
  if (!content.includes(`'${displayName}':`)) {
    // Insert before the "// Platforms" or "// Cross-platform" line in slugToIconName's preceding map
    const platformsComment = content.indexOf("// Platforms")
    if (platformsComment !== -1) {
      const insertAt = content.lastIndexOf('\n', platformsComment)
      content = content.slice(0, insertAt) +
        `\n  '${displayName}': '${slug}',` +
        content.slice(insertAt)
    }
    success(`Added "${displayName}" to imageIcons`)
  } else {
    info(`imageIcons already has "${displayName}"`)
  }

  // Add to slugToIconName if not present
  if (!content.includes(`'${slug}': '${displayName}'`)) {
    const crossPlatform = content.indexOf("// Cross-platform")
    if (crossPlatform !== -1) {
      content = content.slice(0, crossPlatform) +
        `'${slug}': '${displayName}',\n  ` +
        content.slice(crossPlatform)
    }
    success(`Added "${slug}" to slugToIconName`)
  } else {
    info(`slugToIconName already has "${slug}"`)
  }

  if (!DRY_RUN) writeFileSync(filePath, content)
}

function updateAppCategories(displayName, categoryId) {
  const filePath = join(ROOT, 'src/data/appCategories.js')
  let content = readFileSync(filePath, 'utf-8')

  if (content.includes(`'${displayName}'`)) {
    info(`appCategories.js already has "${displayName}"`)
    return
  }

  const catMap = {
    'apple-apps': 'Apple Apps', 'macos-system': 'macOS System',
    'browsers': 'Browsers', 'development': 'Development',
    'communication': 'Communication', 'productivity': 'Productivity',
    'design': 'Design', 'microsoft-office': 'Microsoft Office',
    'media': 'Media', 'system-utils': 'System Utils',
  }

  const catName = catMap[categoryId] || categoryId
  const catIdx = content.indexOf(`name: '${catName}'`)
  if (catIdx === -1) { warn(`Category "${catName}" not found in appCategories.js`); return }

  const appsStart = content.indexOf('apps:', catIdx)
  const arrayEnd = content.indexOf(']', appsStart)
  const beforeBracket = content.slice(0, arrayEnd).trimEnd()
  const needsComma = !beforeBracket.endsWith(',') && !beforeBracket.endsWith('[')

  content = content.slice(0, arrayEnd) +
    (needsComma ? ", " : " ") + `'${displayName}',` +
    content.slice(arrayEnd)

  if (!DRY_RUN) writeFileSync(filePath, content)
  success(`Added to appCategories.js -> ${catName}`)
}

function updateSourcesJson(slug, displayName, docsUrl) {
  const filePath = join(ROOT, 'scripts/shortcut-sync/sources.json')
  const sources = JSON.parse(readFileSync(filePath, 'utf-8'))

  if (sources.apps[slug]) {
    info(`sources.json already has "${slug}"`)
    if (docsUrl && sources.apps[slug].sources?.macos?.url !== docsUrl) {
      sources.apps[slug].sources = sources.apps[slug].sources || {}
      sources.apps[slug].sources.macos = { url: docsUrl, parser: 'ai-extract' }
      success('Updated docs URL in sources.json')
    }
  } else {
    sources.apps[slug] = {
      displayName,
      tier: 3,
      sources: { macos: { url: docsUrl, parser: 'ai-extract' } },
    }
    success('Added to sources.json')
  }

  // Sort alphabetically
  const sorted = Object.keys(sources.apps).sort()
  const sortedApps = {}
  for (const key of sorted) sortedApps[key] = sources.apps[key]
  sources.apps = sortedApps

  if (!DRY_RUN) writeFileSync(filePath, JSON.stringify(sources, null, 2) + '\n')
}

// ── Interactive mode ────────────────────────────────────────

async function interactiveMode() {
  heading('Add New App to KeyShortcut')

  const slug = await ask('  Slug (e.g. "my-app"): ')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) { console.error('Invalid slug — use lowercase letters, numbers, hyphens'); process.exit(1) }

  const displayName = await ask('  Display name (e.g. "My App"): ')
  if (!displayName) { console.error('Display name required'); process.exit(1) }

  console.log('\n  Categories:', CATEGORIES.join(', '))
  const category = await ask('  Category: ')
  if (!CATEGORIES.includes(category)) { warn(`Unknown category "${category}" -- using anyway`) }

  const docsUrl = await ask('  Docs URL (keyboard shortcuts page): ')
  const iconSource = await ask('  Icon source (file path, .app path, or empty to skip): ')

  console.log('\n  Now enter shortcuts. Format per shortcut:')
  console.log('    modifiers (comma-separated) | key | action')
  console.log('    Example: command,shift | S | Save as')
  console.log('  Type a section name on its own line to start a new section.')
  console.log('  Type "done" when finished.\n')

  const sections = []
  let currentSection = null

  while (true) {
    const line = await ask('  > ')
    if (line.toLowerCase() === 'done') break

    if (!line.includes('|')) {
      currentSection = { name: line, shortcuts: [] }
      sections.push(currentSection)
      info(`Section: ${line}`)
      continue
    }

    if (!currentSection) {
      currentSection = { name: 'General', shortcuts: [] }
      sections.push(currentSection)
    }

    const parts = line.split('|').map(p => p.trim())
    if (parts.length !== 3) { warn('Expected: modifiers | key | action'); continue }

    const modifiers = parts[0] ? parts[0].split(',').map(m => m.trim().toLowerCase()) : []
    const invalid = modifiers.filter(m => m && !VALID_MODIFIERS.includes(m))
    if (invalid.length) { warn(`Invalid modifiers: ${invalid.join(', ')}. Valid: ${VALID_MODIFIERS.join(', ')}`); continue }

    currentSection.shortcuts.push({
      modifiers: modifiers.filter(Boolean),
      key: parts[1],
      action: parts[2],
    })
  }

  return { slug, displayName, category, docsUrl, iconSource, platform: 'macos', sections }
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  let appData

  const jsonIdx = args.indexOf('--from-json')
  if (jsonIdx !== -1 && args[jsonIdx + 1]) {
    const jsonPath = args[jsonIdx + 1]
    appData = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    appData.iconSource = appData.iconPath || appData.iconFromApp || null
    appData.platform = appData.platform || 'macos'
  } else {
    appData = await interactiveMode()
  }

  const { slug, displayName, category, docsUrl, iconSource, platform, sections } = appData

  if (DRY_RUN) heading('DRY RUN -- no writes will be made')

  // Step 1: Process icon
  heading('Step 1: Icon')
  let iconUrl = null
  if (iconSource) {
    const localPath = processIcon(slug, iconSource)
    if (localPath) {
      success(`Icon saved to ${localPath}`)
      if (!DRY_RUN) {
        iconUrl = await uploadIcon(slug, localPath)
        if (iconUrl) success(`Uploaded to Supabase Storage`)
      }
    }
  } else {
    warn('No icon provided -- app will show letter fallback')
  }

  // Step 2: Create app in Supabase
  heading('Step 2: Database')
  if (!DRY_RUN) {
    const appId = await createApp(slug, displayName, category, docsUrl, iconUrl)
    success(`App created/updated (${appId})`)

    if (sections.length) {
      const { created, updated } = await writeShortcuts(appId, slug, platform, sections)
      success(`Shortcuts: ${created} created, ${updated} updated`)
    } else {
      info('No shortcuts provided -- add them later or run pnpm sync')
    }
  } else {
    log(`Would create app: ${slug} (${displayName})`)
    log(`Category: ${category}, Docs: ${docsUrl}`)
    for (const s of sections) {
      log(`Section "${s.name}": ${s.shortcuts.length} shortcuts`)
    }
  }

  // Step 3: Update frontend files
  heading('Step 3: Frontend Files')
  updateDirectoryHelpers(slug, displayName)
  updateAppCategories(displayName, category)
  if (docsUrl) updateSourcesJson(slug, displayName, docsUrl)

  // Summary
  heading('Done!')
  const totalShortcuts = sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
  log(`App: ${displayName} (${slug})`)
  log(`Shortcuts: ${totalShortcuts} across ${sections.length} sections`)
  log(`Icon: ${iconUrl ? 'uploaded' : 'not set'}`)
  log(`Docs: ${docsUrl || 'not set'}`)

  if (!DRY_RUN) {
    console.log('\n  Next steps:')
    console.log('    1. rm -rf node_modules/.cache/supabase')
    console.log('    2. pnpm run deploy')
  }
}

main().catch(err => { console.error('\nError:', err.message); process.exit(1) })
