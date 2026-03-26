import { describe, it, expect } from 'vitest'
import {
  getIconData,
} from '../utils/directoryHelpers'
import {
  buildPlatformLookups,
  getPopularApps,
  groupByCategories,
} from '../utils/platformHelpers'

// Minimal mock apps for testing helper functions (no file dependency)
const mockApps = [
  { slug: 'safari', displayName: 'Safari', category: 'Browsers', shortcutCount: 33, sections: [] },
  { slug: 'chrome', displayName: 'Chrome', category: 'Browsers', shortcutCount: 61, sections: [] },
  { slug: 'vscode', displayName: 'VS Code', category: 'Development', shortcutCount: 63, sections: [] },
  { slug: 'figma', displayName: 'Figma', category: 'Design', shortcutCount: 119, sections: [] },
  { slug: 'slack', displayName: 'Slack', category: 'Communication', shortcutCount: 82, sections: [] },
  { slug: 'notion', displayName: 'Notion', category: 'Productivity', shortcutCount: 28, sections: [] },
]

describe('platformHelpers', () => {
  it('buildPlatformLookups creates appMap for every slug', () => {
    const { appMap, appCount, totalShortcuts } = buildPlatformLookups(mockApps)
    expect(appCount).toBe(mockApps.length)
    expect(totalShortcuts).toBeGreaterThan(0)
    for (const app of mockApps) {
      expect(appMap[app.slug]).toBeDefined()
      expect(appMap[app.slug].displayName).toBe(app.displayName)
    }
  })

  it('getPopularApps(n) returns n apps sorted by shortcutCount descending', () => {
    const popular = getPopularApps(mockApps, 3)
    expect(popular).toHaveLength(3)
    for (let i = 1; i < popular.length; i++) {
      expect(popular[i - 1].shortcutCount).toBeGreaterThanOrEqual(popular[i].shortcutCount)
    }
  })

  it('groupByCategories groups apps by category in order', () => {
    const order = ['Browsers', 'Development']
    const groups = groupByCategories(mockApps, order)
    expect(groups.length).toBeLessThanOrEqual(order.length)
    for (const g of groups) {
      expect(order).toContain(g.name)
      expect(g.apps.length).toBeGreaterThan(0)
    }
  })
})

describe('directoryHelpers', () => {
  it('getIconData returns valid icon data for known apps', () => {
    const finderIcon = getIconData('Finder')
    expect(finderIcon.type).toBe('image')
    expect(finderIcon.src).toContain('finder.webp')

    // Fallback for unknown app
    const unknownIcon = getIconData('SomeUnknownApp')
    expect(unknownIcon.type).toBe('fallback')
    expect(unknownIcon.label).toBe('S')
  })
})
