/**
 * App comparison pairs for SEO comparison pages.
 * Each pair generates a /compare/:slugA-vs-:slugB page.
 * Apps must exist in the same platform's data.
 */
export const COMPARISONS = [
  // Design
  { slugA: 'figma', slugB: 'sketch', platform: 'macos', category: 'Design' },
  { slugA: 'photoshop', slugB: 'illustrator', platform: 'macos', category: 'Design' },
  { slugA: 'figma', slugB: 'photoshop', platform: 'macos', category: 'Design' },

  // Code Editors
  { slugA: 'vscode', slugB: 'cursor', platform: 'macos', category: 'Development' },
  { slugA: 'vscode', slugB: 'sublime-text', platform: 'macos', category: 'Development' },
  { slugA: 'intellij', slugB: 'vscode', platform: 'macos', category: 'Development' },

  // Browsers
  { slugA: 'chrome', slugB: 'safari', platform: 'macos', category: 'Browsers' },
  { slugA: 'chrome', slugB: 'firefox', platform: 'macos', category: 'Browsers' },
  { slugA: 'chrome', slugB: 'arc', platform: 'macos', category: 'Browsers' },

  // Productivity
  { slugA: 'notion', slugB: 'obsidian', platform: 'macos', category: 'Productivity' },
  { slugA: 'slack', slugB: 'discord', platform: 'macos', category: 'Communication' },
  { slugA: 'todoist', slugB: 'things', platform: 'macos', category: 'Productivity' },

  // Office
  { slugA: 'excel', slugB: 'google-sheets', platform: 'macos', category: 'Microsoft Office' },
  { slugA: 'word', slugB: 'google-docs', platform: 'macos', category: 'Microsoft Office' },
]

export function getComparisonBySlug(slug) {
  return COMPARISONS.find(c => `${c.slugA}-vs-${c.slugB}` === slug)
}
