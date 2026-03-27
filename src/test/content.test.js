import { describe, it, expect } from 'vitest'
import { CONTENT, buildMeta } from '../data/content'

describe('CONTENT structure', () => {
  it('has all top-level namespaces', () => {
    const expected = ['shared', 'productPage', 'home', 'directory', 'shortcutPage', 'privacy', 'meta', 'structured']
    for (const ns of expected) {
      expect(CONTENT).toHaveProperty(ns)
      expect(CONTENT[ns]).toBeDefined()
    }
  })

  it('shared namespace has required keys', () => {
    const { shared } = CONTENT
    expect(shared.siteName).toBe('KeyShortcut')
    expect(shared.tagline).toBeTruthy()
    expect(shared.navbar).toBeDefined()
    expect(shared.navbar.platformLinks).toHaveLength(3)
    expect(shared.navbar.appDropdownLinks).toHaveLength(3)
    expect(shared.navbar.downloadLabel).toBeTruthy()
    expect(shared.footer).toBeDefined()
    expect(shared.footer.columns).toHaveLength(3)
    expect(shared.notFound).toBeDefined()
    expect(shared.errorBoundary).toBeDefined()
    expect(shared.macAppStoreButton.ariaLabel).toBeTruthy()
    expect(shared.adSlot.sponsoredLabel).toBeTruthy()
  })

  it('productPage has all sections', () => {
    const sections = [
      'hero', 'problem', 'features', 'details', 'shortcutPreview',
      'appCoverage', 'appGrid', 'interactiveKeyboard', 'faq',
      'policies', 'ctaBanner', 'video',
    ]
    for (const s of sections) {
      expect(CONTENT.productPage).toHaveProperty(s)
    }
  })

  it('features items have required fields', () => {
    for (const item of CONTENT.productPage.features.items) {
      expect(item.title).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(item.screenshot).toBeTruthy()
      expect(item.alt).toBeTruthy()
    }
  })

  it('details items have icon as string name', () => {
    for (const item of CONTENT.productPage.details.items) {
      expect(typeof item.icon).toBe('string')
      expect(item.title).toBeTruthy()
      expect(item.description).toBeTruthy()
    }
  })

  it('faq items have question and answer', () => {
    expect(CONTENT.productPage.faq.items.length).toBeGreaterThan(0)
    for (const item of CONTENT.productPage.faq.items) {
      expect(item.question).toBeTruthy()
      expect(item.answer).toBeTruthy()
    }
  })

  it('shortcutPreview has shortcuts', () => {
    expect(CONTENT.productPage.shortcutPreview.shortcuts.length).toBeGreaterThan(0)
    for (const s of CONTENT.productPage.shortcutPreview.shortcuts) {
      expect(s.keys).toBeTruthy()
      expect(s.action).toBeTruthy()
    }
  })

  it('appGrid has title, subtitle, and viewAll', () => {
    expect(CONTENT.productPage.appGrid.title).toBeTruthy()
    expect(CONTENT.productPage.appGrid.subtitle).toBeTruthy()
    expect(CONTENT.productPage.appGrid.viewAll).toBeTruthy()
  })

  it('appCoverage has two rows of apps', () => {
    expect(CONTENT.productPage.appCoverage.rows).toHaveLength(2)
    expect(CONTENT.productPage.appCoverage.rows[0].length).toBeGreaterThan(0)
    expect(CONTENT.productPage.appCoverage.rows[1].length).toBeGreaterThan(0)
  })

  it('privacy has policy and terms with sections', () => {
    const { policy, terms } = CONTENT.privacy
    expect(policy.title).toBeTruthy()
    expect(policy.sections.length).toBeGreaterThan(0)
    expect(terms.title).toBeTruthy()
    expect(terms.sections.length).toBeGreaterThan(0)
  })

  it('home namespace has required keys', () => {
    const { home } = CONTENT
    expect(home.title).toBeTruthy()
    expect(home.titleAccent).toBeTruthy()
    expect(home.subtitle).toBeTruthy()
    expect(home.searchPlaceholder).toBeTruthy()
    expect(home.promo.title).toBeTruthy()
  })

  it('directory namespace has required keys', () => {
    const { directory } = CONTENT
    expect(directory.backLabel).toBeTruthy()
    expect(directory.searchPlaceholder).toBeTruthy()
    expect(directory.shortcutsLabel).toBeTruthy()
  })

  it('shortcutPage namespace has required keys', () => {
    const { shortcutPage } = CONTENT
    expect(shortcutPage.breadcrumbHome).toBeTruthy()
    expect(shortcutPage.ctaSubtitle).toBeTruthy()
    expect(shortcutPage.ctaButton).toBeTruthy()
    expect(typeof shortcutPage.ctaTitle).toBe('function')
  })
})

describe('buildMeta', () => {
  it('builds complete meta array from title + description + url', () => {
    const result = buildMeta({
      title: 'Test Title',
      description: 'Test description',
      url: 'https://example.com/test',
    })
    expect(result).toContainEqual({ title: 'Test Title' })
    expect(result).toContainEqual({ name: 'description', content: 'Test description' })
    expect(result).toContainEqual({ property: 'og:title', content: 'Test Title' })
    expect(result).toContainEqual({ property: 'og:description', content: 'Test description' })
    expect(result).toContainEqual({ property: 'og:url', content: 'https://example.com/test' })
    expect(result).toContainEqual({ name: 'twitter:title', content: 'Test Title' })
    expect(result).toContainEqual({ name: 'twitter:description', content: 'Test description' })
    expect(result).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://example.com/test' })
  })

  it('handles title-only meta (no description/url)', () => {
    const result = buildMeta({ title: 'Title Only' })
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ title: 'Title Only' })
  })
})

describe('meta template functions', () => {
  it('platformIndex returns correct meta', () => {
    const meta = CONTENT.meta.platformIndex('macOS', 85, 4200, 'macos')
    expect(meta.title).toContain('macOS')
    expect(meta.title).toContain('KeyShortcut')
    expect(meta.description).toContain('85')
    expect(meta.url).toBe('https://keyshortcut.com/macos')
  })

  it('shortcutPage returns correct meta', () => {
    const meta = CONTENT.meta.shortcutPage('Figma', 'macOS', 120, 'macos', 'figma')
    expect(meta.title).toContain('Figma')
    expect(meta.title).toContain('macOS')
    expect(meta.description).toContain('120')
    expect(meta.url).toBe('https://keyshortcut.com/macos/figma')
  })
})

describe('no empty or null values', () => {
  function checkNoEmpty(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      if (typeof value === 'function') continue
      if (value === null || value === undefined) {
        throw new Error(`Null/undefined at ${fullPath}`)
      }
      if (typeof value === 'string' && value.trim() === '') {
        throw new Error(`Empty string at ${fullPath}`)
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        checkNoEmpty(value, fullPath)
      }
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            checkNoEmpty(item, `${fullPath}[${i}]`)
          }
        })
      }
    }
  }

  it('CONTENT has no empty or null values', () => {
    expect(() => checkNoEmpty(CONTENT)).not.toThrow()
  })
})
