/**
 * AI-powered scraper using Google Gemini 2.0 Flash (free tier).
 * Used as a fallback for pages with non-standard layouts.
 */
import { GoogleGenAI } from '@google/genai'
import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper.mjs'

export class AiScraper extends BaseScraper {
  constructor() {
    super()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for AI extraction')
    }
    this.ai = new GoogleGenAI({ apiKey })
  }

  /**
   * Extract shortcuts using Gemini AI.
   * @param {string} url - Page URL
   * @param {object} options
   * @param {string} options.platformFilter - Target platform (e.g. "mac", "windows")
   * @param {string} options.platform - Platform ID for context (e.g. "macos")
   */
  async extract(url, options = {}) {
    const { html } = await this.fetch(url)

    // Strip non-content elements to reduce token usage
    const cleanedHtml = stripChrome(html)

    const platformName = getPlatformLabel(options.platformFilter || options.platform || 'macos')

    const prompt = `Extract ALL keyboard shortcuts from this documentation page for the ${platformName} platform.

Return valid JSON in this exact format (no markdown, no code fences):
{"sections":[{"name":"Section Name","shortcuts":[{"modifiers":["Ctrl","Shift"],"key":"T","action":"Reopen closed tab"}]}]}

Rules:
- Only include keyboard shortcuts that are explicitly listed on the page
- Do NOT invent or guess shortcuts
- For ${platformName}, use these modifier names: ${getModifierNames(platformName)}
- Each shortcut must have: modifiers (array, can be empty), key (string), action (string)
- Group shortcuts into sections based on the page's own categories/headings
- If the page lists shortcuts for multiple platforms, only extract ${platformName} shortcuts
- Keep action descriptions concise (5-10 words max)
- For keys, use the key name as shown (e.g., "Tab", "Enter", "Space", "F5", "A", "1")

Page content:
${cleanedHtml}`

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    })

    const text = response.text.trim()

    // Parse the JSON response — handle potential markdown code fences
    let jsonStr = text
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim()
    }

    try {
      const result = JSON.parse(jsonStr)

      // Validate structure
      if (!result.sections || !Array.isArray(result.sections)) {
        throw new Error('Response missing sections array')
      }

      for (const section of result.sections) {
        if (!section.name || !Array.isArray(section.shortcuts)) {
          throw new Error(`Invalid section: ${JSON.stringify(section).slice(0, 100)}`)
        }
        section.shortcuts = section.shortcuts.filter(s =>
          s.action && s.key && Array.isArray(s.modifiers)
        )
      }

      // Filter out empty sections
      result.sections = result.sections.filter(s => s.shortcuts.length > 0)

      return result
    } catch (err) {
      throw new Error(`Failed to parse AI response for ${url}: ${err.message}\nRaw: ${text.slice(0, 500)}`)
    }
  }
}

/**
 * Strip navigation, footer, scripts, styles from HTML to reduce token count.
 */
function stripChrome(html) {
  const $ = cheerio.load(html)

  // Remove non-content elements
  $('nav, footer, header, script, style, noscript, iframe, svg, img, video, audio').remove()
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()
  $('.sidebar, .nav, .footer, .header, .menu, .breadcrumb, .cookie-banner').remove()

  // Get the main content area
  const main = $('main, [role="main"], article, .article-body, .content, .documentation').first()
  const content = main.length ? main.html() : $('body').html()

  // Convert to plain text with structure markers, keeping tables and lists
  const $content = cheerio.load(content || '')

  // Truncate to ~30k chars to stay within token limits
  let text = $content.text()
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (text.length > 30000) {
    text = text.slice(0, 30000) + '\n[TRUNCATED]'
  }

  return text
}

function getPlatformLabel(filter) {
  const map = {
    mac: 'macOS', macos: 'macOS',
    windows: 'Windows', win: 'Windows',
    linux: 'Linux',
  }
  return map[filter?.toLowerCase()] || filter || 'macOS'
}

function getModifierNames(platform) {
  const names = {
    macOS: 'Command (⌘), Option (⌥), Control (⌃), Shift (⇧)',
    Windows: 'Ctrl, Alt, Shift, Win',
    Linux: 'Ctrl, Alt, Shift, Super',
  }
  return names[platform] || names.macOS
}
