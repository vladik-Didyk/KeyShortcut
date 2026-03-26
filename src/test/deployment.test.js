import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

describe('deployment config', () => {
  describe('react-router.config.ts', () => {
    const configPath = join(ROOT, 'react-router.config.ts')
    const configContent = readFileSync(configPath, 'utf-8')

    it('disables lazy route discovery for static hosting', () => {
      // React Router v7 defaults to lazy route discovery which fetches /__manifest
      // on client-side navigation. This endpoint doesn't exist on static hosts
      // (Cloudflare Pages, Netlify, etc.) causing JSON parse errors.
      // mode: "initial" includes all routes upfront — required for static hosting.
      expect(configContent).toContain('routeDiscovery')
      expect(configContent).toMatch(/mode:\s*["']initial["']/)
    })

    it('enables SSR for pre-rendering', () => {
      expect(configContent).toMatch(/ssr:\s*true/)
    })

    it('has a prerender function', () => {
      expect(configContent).toContain('prerender')
    })
  })

  describe('Cloudflare Pages config', () => {
    it('has _headers file with security headers', () => {
      const headersPath = join(ROOT, 'public/_headers')
      expect(existsSync(headersPath)).toBe(true)
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('X-Frame-Options')
      expect(content).toContain('Strict-Transport-Security')
    })

    it('has _redirects file for legacy URLs', () => {
      const redirectsPath = join(ROOT, 'public/_redirects')
      expect(existsSync(redirectsPath)).toBe(true)
      const content = readFileSync(redirectsPath, 'utf-8')
      expect(content).toContain('/shortcuts/*')
      expect(content).toContain('/directory')
    })
  })

  describe('build output (if built)', () => {
    const buildDir = join(ROOT, 'build/client')

    // Only run if build exists — these validate after `pnpm build`
    const buildExists = existsSync(buildDir)

    it.skipIf(!buildExists)('pre-renders .data files alongside HTML', () => {
      // React Router generates .data files for client-side navigation.
      // If these are missing, clicking links on the site will fail.
      const dataFile = join(buildDir, 'macos/asana.data')
      const htmlFile = join(buildDir, 'macos/asana/index.html')
      expect(existsSync(dataFile)).toBe(true)
      expect(existsSync(htmlFile)).toBe(true)
    })

    it.skipIf(!buildExists)('.data files contain valid JSON-like data', () => {
      const dataFile = join(buildDir, 'macos/asana.data')
      const content = readFileSync(dataFile, 'utf-8')
      // React Router .data files start with a JSON array
      expect(content.startsWith('[')).toBe(true)
      // Must NOT be HTML (the bug we fixed)
      expect(content).not.toContain('<!DOCTYPE')
    })

    it.skipIf(!buildExists)('generates root data file', () => {
      expect(existsSync(join(buildDir, '_root.data'))).toBe(true)
    })
  })
})
