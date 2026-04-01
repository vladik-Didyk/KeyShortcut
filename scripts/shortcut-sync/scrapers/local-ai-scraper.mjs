/**
 * Local AI scraper — uses LM Studio's OpenAI-compatible API (localhost:1234).
 * Fallback when cheerio parsing fails and no cloud API key is available.
 * Same extraction prompt as AiScraper but targets the local model.
 */
import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper.mjs'

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234'

export class LocalAiScraper extends BaseScraper {
  async extract(url, options = {}) {
    // Verify LM Studio is reachable
    try {
      const check = await globalThis.fetch(`${LM_STUDIO_URL}/v1/models`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!check.ok) throw new Error(`HTTP ${check.status}`)
    } catch {
      throw new Error(
        'LM Studio not reachable at ' + LM_STUDIO_URL +
        '. Start LM Studio and load a model, or set LM_STUDIO_URL.'
      )
    }

    const { html } = await this.fetch(url)
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

    const response = await globalThis.fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a precise data extraction assistant. Output only valid JSON, no explanation.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
      signal: AbortSignal.timeout(120000), // local models can be slow
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`LM Studio API error: ${response.status} — ${body.slice(0, 200)}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) throw new Error('LM Studio returned empty response')

    // Parse JSON — handle code fences
    let jsonStr = text
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim()
    }

    try {
      const result = JSON.parse(jsonStr)

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

      result.sections = result.sections.filter(s => s.shortcuts.length > 0)
      return result
    } catch (err) {
      throw new Error(`Failed to parse local AI response: ${err.message}\nRaw: ${text.slice(0, 500)}`)
    }
  }
}

function stripChrome(html) {
  const $ = cheerio.load(html)
  $('nav, footer, header, script, style, noscript, iframe, svg, img, video, audio').remove()
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()
  $('.sidebar, .nav, .footer, .header, .menu, .breadcrumb, .cookie-banner').remove()

  const main = $('main, [role="main"], article, .article-body, .content, .documentation').first()
  const content = main.length ? main.html() : $('body').html()

  const $content = cheerio.load(content || '')
  let text = $content.text().replace(/\n{3,}/g, '\n\n').trim()

  if (text.length > 30000) {
    text = text.slice(0, 30000) + '\n[TRUNCATED]'
  }
  return text
}

function getPlatformLabel(filter) {
  const map = { mac: 'macOS', macos: 'macOS', windows: 'Windows', win: 'Windows', linux: 'Linux' }
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
