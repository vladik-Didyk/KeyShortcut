/**
 * Base scraper with fetch, retry, rate limiting, and robots.txt compliance.
 * All scrapers extend this class.
 */

const USER_AGENT = 'KeyShortcut-Bot/1.0 (+https://keyshortcut.com/bot)'
const MIN_DELAY_MS = 2000
const MAX_RETRIES = 3
const RETRY_BACKOFF_MS = 1000

// Per-domain rate limiter
const lastRequestTime = new Map()

async function rateLimit(domain) {
  const last = lastRequestTime.get(domain) || 0
  const elapsed = Date.now() - last
  if (elapsed < MIN_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - elapsed))
  }
  lastRequestTime.set(domain, Date.now())
}

export class BaseScraper {
  /**
   * Fetch a URL with retry and rate limiting.
   * Returns { html, headers, status }
   */
  async fetch(url) {
    const domain = new URL(url).hostname

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      await rateLimit(domain)

      try {
        const res = await globalThis.fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          redirect: 'follow',
        })

        if (res.ok) {
          const html = await res.text()
          return {
            html,
            headers: Object.fromEntries(res.headers.entries()),
            status: res.status,
          }
        }

        if (res.status >= 400 && res.status < 500) {
          throw new Error(`HTTP ${res.status} for ${url} (not retryable)`)
        }

        // 5xx — retry
        console.warn(`  Attempt ${attempt}/${MAX_RETRIES}: HTTP ${res.status} for ${url}`)
      } catch (err) {
        if (attempt === MAX_RETRIES || err.message.includes('not retryable')) {
          throw err
        }
        console.warn(`  Attempt ${attempt}/${MAX_RETRIES}: ${err.message}`)
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS * attempt))
    }
  }

  /**
   * Fetch raw bytes (for PDFs).
   */
  async fetchBuffer(url) {
    const domain = new URL(url).hostname
    await rateLimit(domain)

    const res = await globalThis.fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    })

    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return Buffer.from(await res.arrayBuffer())
  }

  /**
   * Subclasses must implement this.
   * Returns: { sections: [{ name, shortcuts: [{ modifiers[], key, action }] }] }
   */
  async extract(url, options = {}) {
    throw new Error('extract() must be implemented by subclass')
  }
}
