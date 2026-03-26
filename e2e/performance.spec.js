import { test, expect } from '@playwright/test'

/**
 * Browser performance tests — measures real page load and navigation metrics.
 *
 * Prerequisites:
 *   pnpm build && pnpm preview   (run in another terminal on port 3000)
 *
 * Run:
 *   npx playwright test e2e/performance.spec.js
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// Helper: get Navigation Timing metrics from the browser
async function getNavigationTiming(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    if (!nav) return null
    return {
      ttfb: nav.responseStart - nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      load: nav.loadEventEnd - nav.startTime,
      domInteractive: nav.domInteractive - nav.startTime,
      transferSize: nav.transferSize,
    }
  })
}

// Helper: get Largest Contentful Paint
async function getLCP(page) {
  return page.evaluate(() => new Promise(resolve => {
    let lcp = 0
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        lcp = Math.max(lcp, entry.startTime)
      }
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    // LCP is finalized by user interaction or shortly after load
    setTimeout(() => { observer.disconnect(); resolve(lcp) }, 3000)
  }))
}

// Helper: count loaded JS resources and total size
async function getResourceStats(page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource')
    const scripts = resources.filter(r => r.initiatorType === 'script' || r.name.endsWith('.js'))
    return {
      jsCount: scripts.length,
      jsTotalSize: scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      totalResources: resources.length,
    }
  })
}

test.describe('Page load performance', () => {
  test('homepage loads under performance budget', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'load' })
    // Wait for hydration to complete
    await page.waitForFunction(() => document.querySelector('[data-hydrated]') || document.readyState === 'complete')

    const timing = await getNavigationTiming(page)
    const resources = await getResourceStats(page)

    console.log('  Homepage timing:')
    console.log(`    TTFB: ${timing.ttfb.toFixed(0)}ms`)
    console.log(`    DOM Interactive: ${timing.domInteractive.toFixed(0)}ms`)
    console.log(`    DOM Content Loaded: ${timing.domContentLoaded.toFixed(0)}ms`)
    console.log(`    Full Load: ${timing.load.toFixed(0)}ms`)
    console.log(`    JS files: ${resources.jsCount} (${(resources.jsTotalSize / 1024).toFixed(0)}KB)`)

    // Budgets (local preview server — real CDN will be faster)
    expect(timing.domInteractive).toBeLessThan(2000)
    expect(timing.domContentLoaded).toBeLessThan(3000)
  })

  test('homepage does not load jspdf/html2canvas', async ({ page }) => {
    const loadedScripts = []
    page.on('response', response => {
      if (response.url().endsWith('.js')) {
        loadedScripts.push(response.url())
      }
    })

    await page.goto(BASE, { waitUntil: 'networkidle' })

    const pdfScripts = loadedScripts.filter(url =>
      url.includes('jspdf') || url.includes('html2canvas') || url.includes('purify')
    )
    console.log(`  JS files loaded: ${loadedScripts.length}`)
    console.log(`  PDF-related scripts loaded: ${pdfScripts.length}`)

    expect(pdfScripts).toHaveLength(0)
  })

  test('shortcut page loads under performance budget', async ({ page }) => {
    await page.goto(`${BASE}/macos/vscode`, { waitUntil: 'load' })

    const timing = await getNavigationTiming(page)
    console.log('  Shortcut page (macos/vscode):')
    console.log(`    TTFB: ${timing.ttfb.toFixed(0)}ms`)
    console.log(`    DOM Interactive: ${timing.domInteractive.toFixed(0)}ms`)
    console.log(`    Full Load: ${timing.load.toFixed(0)}ms`)

    expect(timing.domInteractive).toBeLessThan(2000)
  })
})

test.describe('Client-side navigation performance', () => {
  test('navigate from homepage to app page under 500ms', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })

    // Click first app card and measure navigation time
    const start = await page.evaluate(() => performance.now())
    await page.click('a[href*="/macos/"]')
    await page.waitForURL('**/macos/**')
    // Wait for content to render
    await page.waitForSelector('h1')
    const elapsed = await page.evaluate((s) => performance.now() - s, start)

    console.log(`  Homepage → app page navigation: ${elapsed.toFixed(0)}ms`)
    expect(elapsed).toBeLessThan(500)
  })

  test('navigate between shortcut pages under 500ms', async ({ page }) => {
    await page.goto(`${BASE}/macos/vscode`, { waitUntil: 'networkidle' })

    // Navigate back to platform index
    const start = await page.evaluate(() => performance.now())
    await page.click('a[href="/macos"]')
    await page.waitForURL('**/macos')
    await page.waitForSelector('h1')
    const elapsed = await page.evaluate((s) => performance.now() - s, start)

    console.log(`  App page → platform index: ${elapsed.toFixed(0)}ms`)
    expect(elapsed).toBeLessThan(500)
  })
})

test.describe('Platform switching performance', () => {
  test('switch platforms on homepage under 2s', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })

    // Wait for initial content
    await page.waitForSelector('[data-platform]', { timeout: 5000 }).catch(() => {})

    // Find and click the Windows platform button
    const windowsBtn = page.locator('button:has-text("Windows"), a:has-text("Windows")').first()
    if (await windowsBtn.isVisible()) {
      const start = await page.evaluate(() => performance.now())
      await windowsBtn.click()

      // Wait for content to update (new app cards to appear)
      await page.waitForTimeout(100)
      await page.waitForFunction(() => {
        const cards = document.querySelectorAll('[data-app-card], .app-card, a[href*="/windows/"]')
        return cards.length > 0
      }, { timeout: 5000 }).catch(() => {})

      const elapsed = await page.evaluate((s) => performance.now() - s, start)
      console.log(`  Platform switch (macOS → Windows): ${elapsed.toFixed(0)}ms`)
      expect(elapsed).toBeLessThan(2000)
    } else {
      console.log('  Skipped: Windows button not found')
    }
  })
})

test.describe('Core Web Vitals', () => {
  test('homepage LCP under 2.5s', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'load' })
    const lcp = await getLCP(page)
    console.log(`  Homepage LCP: ${lcp.toFixed(0)}ms`)
    expect(lcp).toBeLessThan(2500)
  })

  test('no layout shifts above 0.1 CLS', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'load' })

    const cls = await page.evaluate(() => new Promise(resolve => {
      let clsValue = 0
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsValue += entry.value
        }
      })
      observer.observe({ type: 'layout-shift', buffered: true })
      setTimeout(() => { observer.disconnect(); resolve(clsValue) }, 3000)
    }))

    console.log(`  Homepage CLS: ${cls.toFixed(4)}`)
    expect(cls).toBeLessThan(0.1)
  })
})
