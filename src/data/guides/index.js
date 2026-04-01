import keyboardShortcutTools from './keyboard-shortcut-tools.js'
import universalShortcuts from './universal-shortcuts-all-platforms.js'
import personalizedWorkflow from './personalized-shortcut-workflow.js'
import shortcutsEfficiency from './keyboard-shortcuts-efficiency.js'
import scienceShortcuts from './science-keyboard-shortcuts.js'
import productivityGuide from './keyboard-shortcuts-productivity-guide.js'
import appFeatures from './keyboard-shortcut-app-features.js'
import shortcutCollections from './shortcut-collections.js'
import customGuides from './custom-shortcut-guides.js'
import linuxShortcuts from './linux-keyboard-shortcuts.js'

export const GUIDES = [
  keyboardShortcutTools,
  universalShortcuts,
  personalizedWorkflow,
  shortcutsEfficiency,
  scienceShortcuts,
  productivityGuide,
  appFeatures,
  shortcutCollections,
  customGuides,
  linuxShortcuts,
]

const slugMap = new Map(GUIDES.map(g => [g.slug, g]))

export function getGuideBySlug(slug) {
  return slugMap.get(slug)
}
