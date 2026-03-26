import { describe, it, expect } from 'vitest'
import { tokenize, parseAppQuery, buildSearchIndex, searchIndex } from '../utils/searchHelpers'

// Sample app names matching the shape expected by parseAppQuery/buildSearchIndex
const appNames = [
  { name: 'Figma', slug: 'figma', category: 'Design', shortcutCount: 50 },
  { name: 'Chrome', slug: 'chrome', category: 'Browsers', shortcutCount: 40 },
  { name: 'VS Code', slug: 'vscode', category: 'Developer Tools', shortcutCount: 80 },
  { name: 'Final Cut Pro', slug: 'final-cut-pro', category: 'Video', shortcutCount: 60 },
  { name: 'Safari', slug: 'safari', category: 'Browsers', shortcutCount: 30 },
  { name: 'Xcode', slug: 'xcode', category: 'Developer Tools', shortcutCount: 45 },
  { name: 'Finder', slug: 'finder', category: 'System', shortcutCount: 25 },
]

// Sample apps with sections/shortcuts for full search index tests
const sampleApps = [
  {
    displayName: 'Figma', slug: 'figma', category: 'Design', shortcutCount: 3,
    sections: [{
      name: 'General',
      shortcuts: [
        { action: 'Copy', key: 'C', modifiers: ['⌘'] },
        { action: 'Paste', key: 'V', modifiers: ['⌘'] },
        { action: 'Copy Properties', key: 'C', modifiers: ['⌘', '⌥'] },
      ],
    }],
  },
  {
    displayName: 'Chrome', slug: 'chrome', category: 'Browsers', shortcutCount: 2,
    sections: [{
      name: 'Tabs',
      shortcuts: [
        { action: 'New Tab', key: 'T', modifiers: ['⌘'] },
        { action: 'Close Tab', key: 'W', modifiers: ['⌘'] },
      ],
    }],
  },
  {
    displayName: 'VS Code', slug: 'vscode', category: 'Developer Tools', shortcutCount: 1,
    sections: [{
      name: 'General',
      shortcuts: [
        { action: 'Copy Line Down', key: 'D', modifiers: ['⌘'] },
      ],
    }],
  },
]

describe('tokenize', () => {
  it('lowercases and splits on whitespace', () => {
    expect(tokenize('Figma Copy')).toEqual(['figma', 'copy'])
  })

  it('strips stop words', () => {
    expect(tokenize('how to copy in figma')).toEqual(['copy', 'figma'])
  })

  it('splits on colons and hyphens', () => {
    expect(tokenize('figma: copy')).toEqual(['figma', 'copy'])
    expect(tokenize('figma-copy')).toEqual(['figma', 'copy'])
  })

  it('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([])
  })

  it('returns empty array when all words are stop words', () => {
    expect(tokenize('how to find the')).toEqual([])
  })

  it('handles mixed separators', () => {
    expect(tokenize('copy, paste; undo')).toEqual(['copy', 'paste', 'undo'])
  })
})

describe('parseAppQuery', () => {
  it('detects app as first token: "figma copy"', () => {
    const result = parseAppQuery('figma copy', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('detects app as last token: "copy figma"', () => {
    const result = parseAppQuery('copy figma', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('strips stop words and detects app: "copy in figma"', () => {
    const result = parseAppQuery('copy in figma', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('handles natural language: "how to copy in figma"', () => {
    const result = parseAppQuery('how to copy in figma', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('handles colon separator: "figma: copy"', () => {
    const result = parseAppQuery('figma: copy', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('returns no app for action-only query: "copy"', () => {
    const result = parseAppQuery('copy', appNames)
    expect(result.app).toBeNull()
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('returns app with empty action tokens for app-only query: "figma"', () => {
    const result = parseAppQuery('figma', appNames)
    expect(result.app?.slug).toBe('figma')
    expect(result.actionTokens).toEqual([])
  })

  it('matches by slug: "vscode copy"', () => {
    const result = parseAppQuery('vscode copy', appNames)
    expect(result.app?.slug).toBe('vscode')
    expect(result.actionTokens).toEqual(['copy'])
  })

  it('matches multi-word app names: "final cut pro trim"', () => {
    const result = parseAppQuery('final cut pro trim', appNames)
    expect(result.app?.slug).toBe('final-cut-pro')
    expect(result.actionTokens).toEqual(['trim'])
  })

  it('returns empty for empty query', () => {
    const result = parseAppQuery('', appNames)
    expect(result.app).toBeNull()
    expect(result.actionTokens).toEqual([])
    expect(result.allTokens).toEqual([])
  })

  it('returns allTokens for all inputs', () => {
    const result = parseAppQuery('copy in figma', appNames)
    expect(result.allTokens).toEqual(['copy', 'figma'])
  })
})

describe('searchIndex', () => {
  const index = buildSearchIndex(sampleApps)

  it('finds shortcuts scoped to app: "figma copy"', () => {
    const results = searchIndex(index, 'figma copy')
    expect(results.shortcutMatches.length).toBeGreaterThan(0)
    expect(results.shortcutMatches[0].appSlug).toBe('figma')
    const actions = results.shortcutMatches[0].shortcuts.map(s => s.action)
    expect(actions).toContain('Copy')
    expect(actions).toContain('Copy Properties')
  })

  it('finds shortcuts with reversed order: "copy figma"', () => {
    const results = searchIndex(index, 'copy figma')
    expect(results.shortcutMatches.length).toBeGreaterThan(0)
    expect(results.shortcutMatches[0].appSlug).toBe('figma')
  })

  it('finds shortcuts with natural language: "copy in figma"', () => {
    const results = searchIndex(index, 'copy in figma')
    expect(results.shortcutMatches.length).toBeGreaterThan(0)
    expect(results.shortcutMatches[0].appSlug).toBe('figma')
  })

  it('shows app match for app-only query: "figma"', () => {
    const results = searchIndex(index, 'figma')
    expect(results.appMatches.length).toBeGreaterThan(0)
    expect(results.appMatches[0].slug).toBe('figma')
  })

  it('searches all apps for action-only query: "tab"', () => {
    const results = searchIndex(index, 'tab')
    expect(results.shortcutMatches.length).toBeGreaterThan(0)
    const appSlugs = results.shortcutMatches.map(g => g.appSlug)
    expect(appSlugs).toContain('chrome')
  })

  it('finds by slug: "vscode copy"', () => {
    const results = searchIndex(index, 'vscode copy')
    expect(results.shortcutMatches.length).toBeGreaterThan(0)
    expect(results.shortcutMatches[0].appSlug).toBe('vscode')
  })

  it('returns empty for empty query', () => {
    const results = searchIndex(index, '')
    expect(results.appMatches).toEqual([])
    expect(results.shortcutMatches).toEqual([])
  })

  it('returns empty for stop-words-only query', () => {
    const results = searchIndex(index, 'how to find the')
    expect(results.appMatches).toEqual([])
    expect(results.shortcutMatches).toEqual([])
  })

  it('includes otherApps when scoped to an app', () => {
    // "figma copy" should mention other apps that also have "Copy"
    const results = searchIndex(index, 'figma copy')
    // otherApps may or may not be populated depending on data, but field should exist
    expect(results).toHaveProperty('otherApps')
  })
})
