#!/usr/bin/env node
import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { GUIDES } from '../src/data/guides/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'og')

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const WIDTH = 1200
const HEIGHT = 630

// Theme colors matching the site
const BG = '#F5F0E8'
const TEXT = '#1A1A1A'
const MUTED = '#6B6560'
const ACCENT_BG = '#1A1A1A'
const ACCENT_TEXT = '#F5F0E8'

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

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

let count = 0
for (const guide of GUIDES) {
  const svg = buildGuideSvg(guide)
  const outPath = join(OUT_DIR, `${guide.slug}.png`)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  count++
}

console.log(`OG images generated: ${count} guide images in public/images/og/`)
