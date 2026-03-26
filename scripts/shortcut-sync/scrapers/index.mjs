/**
 * Scraper factory — maps parser type names to scraper instances.
 */
import { HtmlTableScraper } from './html-table-scraper.mjs'
import { AiScraper } from './ai-scraper.mjs'

const scraperInstances = new Map()

/**
 * Get a scraper instance for the given parser type.
 * Instances are cached (singleton per type).
 */
export function getScraper(parserType) {
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
    default:
      throw new Error(`Unknown parser type: "${parserType}". Available: html-table, ai-extract`)
  }

  scraperInstances.set(parserType, scraper)
  return scraper
}
