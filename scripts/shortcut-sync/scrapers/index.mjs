/**
 * Scraper factory — maps parser type names to scraper instances.
 *
 * Cascade strategy (parser: "auto"):
 *   1. local-html  — cheerio parsing, no API needed
 *   2. ai-extract  — Gemini API (needs GEMINI_API_KEY)
 *   3. local-ai    — LM Studio local model (needs LM Studio running)
 *
 * Falls through to the next if the previous returns too few results or throws.
 */
import { HtmlTableScraper } from './html-table-scraper.mjs'
import { AiScraper } from './ai-scraper.mjs'
import { LocalHtmlScraper } from './local-html-scraper.mjs'
import { LocalAiScraper } from './local-ai-scraper.mjs'

const scraperInstances = new Map()

// Minimum shortcuts to consider a local-html scrape successful
const MIN_SHORTCUTS_THRESHOLD = 3

/**
 * Get a scraper instance for the given parser type.
 * Instances are cached (singleton per type).
 */
export function getScraper(parserType) {
  if (parserType === 'auto') {
    return { extract: autoCascadeExtract }
  }

  if (scraperInstances.has(parserType)) {
    return scraperInstances.get(parserType)
  }

  let scraper
  switch (parserType) {
    case 'html-table':
      scraper = new HtmlTableScraper()
      break
    case 'ai-extract':
      scraper = new AiScraper()
      break
    case 'local-html':
      scraper = new LocalHtmlScraper()
      break
    case 'local-ai':
      scraper = new LocalAiScraper()
      break
    default:
      throw new Error(`Unknown parser type: "${parserType}". Available: html-table, ai-extract, local-html, local-ai, auto`)
  }

  scraperInstances.set(parserType, scraper)
  return scraper
}

/**
 * Cascade: try local-html first, fall back to ai-extract, then local-ai.
 */
async function autoCascadeExtract(url, options = {}) {
  // Step 1: Try cheerio local parsing
  try {
    const localScraper = getScraper('local-html')
    const result = await localScraper.extract(url, options)
    const count = result.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
    if (count >= MIN_SHORTCUTS_THRESHOLD) {
      console.log(`  [auto] local-html succeeded: ${count} shortcuts`)
      return result
    }
    console.log(`  [auto] local-html returned only ${count} shortcuts, trying next...`)
  } catch (err) {
    console.log(`  [auto] local-html failed: ${err.message.slice(0, 80)}`)
  }

  // Step 2: Try Gemini API (if key available)
  if (process.env.GEMINI_API_KEY) {
    try {
      const aiScraper = getScraper('ai-extract')
      const result = await aiScraper.extract(url, options)
      const count = result.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
      console.log(`  [auto] ai-extract succeeded: ${count} shortcuts`)
      return result
    } catch (err) {
      console.log(`  [auto] ai-extract failed: ${err.message.slice(0, 80)}`)
    }
  } else {
    console.log('  [auto] ai-extract skipped (no GEMINI_API_KEY)')
  }

  // Step 3: Try local AI (LM Studio)
  try {
    const localAi = getScraper('local-ai')
    const result = await localAi.extract(url, options)
    const count = result.sections.reduce((sum, s) => sum + s.shortcuts.length, 0)
    console.log(`  [auto] local-ai succeeded: ${count} shortcuts`)
    return result
  } catch (err) {
    console.log(`  [auto] local-ai failed: ${err.message.slice(0, 80)}`)
  }

  throw new Error('All scraper strategies failed for ' + url)
}
