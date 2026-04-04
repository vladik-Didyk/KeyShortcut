#!/usr/bin/env node
import sharp from 'sharp'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { GUIDES } from '../src/data/guides/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'images', 'og')
const DATA_DIR = join(ROOT, 'public', 'data')

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const WIDTH = 1200
const HEIGHT = 630

// Theme colors matching the site
const BG = '#F5F0E8'
const TEXT = '#1A1A1A'
const MUTED = '#605B56'
const ACCENT_BG = '#1A1A1A'
const ACCENT_TEXT = '#F5F0E8'

function readJSON(relativePath) {
  return JSON.parse(readFileSync(join(DATA_DIR, relativePath), 'utf-8'))
}

function wrapText(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars) {
      lines.push(line.trim())
      line = word
    } else {
      line = line ? line + ' ' + word : word
    }
  }
  if (line) lines.push(line.trim())
  return lines
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

// ─── Guide OG images ───────────────────────────────────────────────

function buildGuideSvg(guide) {
  const titleLines = wrapText(guide.title, 38)
  const titleY = titleLines.length <= 2 ? 240 : 200
  const lineHeight = 60

  const titleMarkup = titleLines
    .map((line, i) => `<text x="80" y="${titleY + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="bold" fill="${TEXT}">${escapeXml(line)}</text>`)
    .join('\n    ')

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${ACCENT_BG}"/>

  <!-- Category badge -->
  <rect x="80" y="80" width="${guide.category.length * 14 + 40}" height="36" rx="18" fill="${ACCENT_BG}"/>
  <text x="${80 + guide.category.length * 7 + 20}" y="104" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${ACCENT_TEXT}" text-anchor="middle" font-weight="500">${escapeXml(guide.category)}</text>

  <!-- Reading time -->
  <text x="${80 + guide.category.length * 14 + 60}" y="104" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${MUTED}">${escapeXml(guide.readingTime)}</text>

  <!-- Title -->
  ${titleMarkup}

  <!-- Description (truncated) -->
  <text x="80" y="${titleY + titleLines.length * lineHeight + 30}" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="${MUTED}">${escapeXml(guide.description.slice(0, 90))}${guide.description.length > 90 ? '...' : ''}</text>

  <!-- Bottom bar with branding -->
  <rect x="0" y="${HEIGHT - 80}" width="${WIDTH}" height="80" fill="${ACCENT_BG}"/>
  <text x="80" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${ACCENT_TEXT}" font-weight="600">KeyShortcut</text>
  <text x="${WIDTH - 80}" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="${ACCENT_TEXT}" text-anchor="end" opacity="0.7">keyshortcut.com/guides</text>
</svg>`
}

// ─── Platform OG images ─────────────────────────────────────────────

function buildPlatformSvg(platform, appCount) {
  const platformNames = { macos: 'macOS', windows: 'Windows', linux: 'Linux' }
  const name = platformNames[platform.id] || platform.display_name || platform.id

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${ACCENT_BG}"/>

  <!-- Platform badge -->
  <rect x="80" y="100" width="${name.length * 16 + 48}" height="44" rx="22" fill="${ACCENT_BG}"/>
  <text x="${80 + name.length * 8 + 24}" y="128" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" fill="${ACCENT_TEXT}" text-anchor="middle" font-weight="600">${escapeXml(name)}</text>

  <!-- Title -->
  <text x="80" y="240" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold" fill="${TEXT}">Keyboard Shortcuts</text>
  <text x="80" y="310" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold" fill="${TEXT}">Directory</text>

  <!-- Stats -->
  <text x="80" y="380" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${MUTED}">${appCount} apps with verified shortcuts</text>

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 80}" width="${WIDTH}" height="80" fill="${ACCENT_BG}"/>
  <text x="80" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${ACCENT_TEXT}" font-weight="600">KeyShortcut</text>
  <text x="${WIDTH - 80}" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="${ACCENT_TEXT}" text-anchor="end" opacity="0.7">keyshortcut.com/${escapeXml(platform.id)}</text>
</svg>`
}

// ─── App shortcut page OG images ────────────────────────────────────

function buildAppSvg(app, platformId) {
  const platformNames = { macos: 'macOS', windows: 'Windows', linux: 'Linux' }
  const platformName = platformNames[platformId] || platformId
  const titleLines = wrapText(`${app.displayName} Shortcuts`, 30)
  const titleY = 220
  const lineHeight = 64

  const titleMarkup = titleLines
    .map((line, i) => `<text x="80" y="${titleY + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold" fill="${TEXT}">${escapeXml(line)}</text>`)
    .join('\n    ')

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${ACCENT_BG}"/>

  <!-- Platform badge -->
  <rect x="80" y="100" width="${platformName.length * 14 + 40}" height="36" rx="18" fill="${ACCENT_BG}"/>
  <text x="${80 + platformName.length * 7 + 20}" y="124" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${ACCENT_TEXT}" text-anchor="middle" font-weight="500">${escapeXml(platformName)}</text>

  <!-- Title -->
  ${titleMarkup}

  <!-- Stats -->
  <text x="80" y="${titleY + titleLines.length * lineHeight + 20}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${MUTED}">${app.shortcutCount} shortcuts \u00B7 ${app.sections?.length || 0} categories</text>

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 80}" width="${WIDTH}" height="80" fill="${ACCENT_BG}"/>
  <text x="80" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${ACCENT_TEXT}" font-weight="600">KeyShortcut</text>
  <text x="${WIDTH - 80}" y="${HEIGHT - 32}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="${ACCENT_TEXT}" text-anchor="end" opacity="0.7">keyshortcut.com/${escapeXml(platformId)}/${escapeXml(app.slug)}</text>
</svg>`
}

// ─── Generate all images ────────────────────────────────────────────

let count = 0

// Guide images
for (const guide of GUIDES) {
  const svg = buildGuideSvg(guide)
  const outPath = join(OUT_DIR, `${guide.slug}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  count++
}

// Platform images
const platforms = readJSON('platforms.json')
for (const platform of platforms) {
  const { apps } = readJSON(`platforms/${platform.id}.json`)
  const svg = buildPlatformSvg(platform, apps.length)
  const outPath = join(OUT_DIR, `${platform.id}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  count++

  // App images for this platform
  for (const app of apps) {
    const appSvg = buildAppSvg(app, platform.id)
    const appOutPath = join(OUT_DIR, `${platform.id}-${app.slug}.png`)
    await sharp(Buffer.from(appSvg)).png().toFile(appOutPath)
    count++
  }
}

console.log(`OG images generated: ${count} images (guides + platforms + apps) in public/images/og/`)
