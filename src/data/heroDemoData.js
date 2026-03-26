// Demo sequence data for the Hero auto-playing panel demo
// Cycles through Figma → VS Code → Chrome, demonstrating modifier highlighting + exact match

export const DEMO_APPS = [
  {
    slug: 'figma',
    name: 'Figma',
    shortcutCount: 119,
    iconColor: '#F24E1E',
    shortcuts: [
      { modifiers: ['⌘'], key: '/', action: 'Quick Actions' },
      { modifiers: ['⌘'], key: 'D', action: 'Duplicate' },
      { modifiers: ['⌘'], key: 'G', action: 'Group' },
      { modifiers: ['⌘'], key: 'Z', action: 'Undo' },
      { modifiers: ['⌘'], key: ']', action: 'Bring Forward' },
      { modifiers: ['⌘'], key: '[', action: 'Send Backward' },
      { modifiers: ['⌘'], key: 'E', action: 'Flatten' },
      { modifiers: ['⌘'], key: 'R', action: 'Rename' },
      { modifiers: ['⇧', '⌘'], key: 'G', action: 'Ungroup' },
      { modifiers: ['⇧', '⌘'], key: 'E', action: 'Export' },
    ],
    beats: [
      // hold ⌘ → all ⌘ shortcuts glow
      { type: 'hold', mods: ['⌘'], duration: 1200 },
      // press ⌘+Z → "Undo" exact match
      { type: 'press', mods: ['⌘'], key: 'Z', action: 'Undo', duration: 1500 },
      // release
      { type: 'release', duration: 800 },
    ],
  },
  {
    slug: 'vscode',
    name: 'VS Code',
    shortcutCount: 72,
    iconColor: '#007ACC',
    shortcuts: [
      { modifiers: ['⇧', '⌘'], key: 'P', action: 'Command Palette' },
      { modifiers: ['⌘'], key: 'P', action: 'Quick Open File' },
      { modifiers: ['⌘'], key: 'B', action: 'Toggle Sidebar' },
      { modifiers: ['⌘'], key: 'J', action: 'Toggle Panel' },
      { modifiers: ['⇧', '⌘'], key: 'E', action: 'Explorer' },
      { modifiers: ['⇧', '⌘'], key: 'F', action: 'Search' },
      { modifiers: ['⇧', '⌘'], key: 'G', action: 'Source Control' },
      { modifiers: ['⌘'], key: 'D', action: 'Add Next Match' },
      { modifiers: ['⌘'], key: '/', action: 'Toggle Comment' },
      { modifiers: ['⌘'], key: 'F', action: 'Find' },
    ],
    beats: [
      { type: 'hold', mods: ['⌘', '⇧'], duration: 1200 },
      { type: 'press', mods: ['⌘', '⇧'], key: 'P', action: 'Command Palette', duration: 1500 },
      { type: 'release', duration: 800 },
    ],
  },
  {
    slug: 'chrome',
    name: 'Chrome',
    shortcutCount: 61,
    iconColor: '#4285F4',
    shortcuts: [
      { modifiers: ['⌘'], key: 'T', action: 'New Tab' },
      { modifiers: ['⌘'], key: 'N', action: 'New Window' },
      { modifiers: ['⌘'], key: 'L', action: 'Jump to Address Bar' },
      { modifiers: ['⌘'], key: 'D', action: 'Bookmark This Page' },
      { modifiers: ['⌘'], key: 'P', action: 'Print' },
      { modifiers: ['⌘'], key: 'S', action: 'Save Page' },
      { modifiers: ['⌘'], key: '+', action: 'Zoom In' },
      { modifiers: ['⌘'], key: '-', action: 'Zoom Out' },
      { modifiers: ['⇧', '⌘'], key: 'T', action: 'Reopen Last Tab' },
      { modifiers: ['⇧', '⌘'], key: 'N', action: 'Incognito Window' },
    ],
    beats: [
      { type: 'hold', mods: ['⌘'], duration: 1200 },
      { type: 'press', mods: ['⌘'], key: 'T', action: 'New Tab', duration: 1500 },
      { type: 'release', duration: 800 },
    ],
  },
]

// Map modifier symbols to keyboard key IDs used in ROWS
export const MOD_SYMBOL_TO_KB_ID = {
  '⌘': 'cmd',
  '⇧': 'shift',
  '⌥': 'opt',
  '⌃': 'ctrl',
}

// Build timeline frames from DEMO_APPS
// Each frame: { t, keys (Set of kb IDs), appIndex, highlightedModifiers (Set of symbols),
//               highlightedShortcut ({action, mods, key} or null), transitioning }
export function buildDemoTimeline(apps) {
  const frames = []
  let t = 0
  const CROSSFADE = 500

  for (let ai = 0; ai < apps.length; ai++) {
    const app = apps[ai]

    // Crossfade in
    frames.push({
      t,
      keys: new Set(),
      appIndex: ai,
      highlightedModifiers: new Set(),
      highlightedShortcut: null,
      transitioning: true,
    })
    t += CROSSFADE

    // Settled (panel visible, no highlights yet)
    frames.push({
      t,
      keys: new Set(),
      appIndex: ai,
      highlightedModifiers: new Set(),
      highlightedShortcut: null,
      transitioning: false,
    })

    for (const beat of app.beats) {
      if (beat.type === 'hold') {
        // Convert mod symbols to keyboard IDs for key lighting
        const kbKeys = new Set()
        const modSymbols = new Set(beat.mods)
        for (const sym of beat.mods) {
          const id = MOD_SYMBOL_TO_KB_ID[sym]
          if (id) kbKeys.add(id)
        }
        frames.push({
          t,
          keys: kbKeys,
          appIndex: ai,
          highlightedModifiers: modSymbols,
          highlightedShortcut: null,
          transitioning: false,
        })
        t += beat.duration
      } else if (beat.type === 'press') {
        const kbKeys = new Set()
        const modSymbols = new Set(beat.mods)
        for (const sym of beat.mods) {
          const id = MOD_SYMBOL_TO_KB_ID[sym]
          if (id) kbKeys.add(id)
        }
        // Add the actual key
        kbKeys.add(beat.key.toLowerCase())
        frames.push({
          t,
          keys: kbKeys,
          appIndex: ai,
          highlightedModifiers: modSymbols,
          highlightedShortcut: { action: beat.action, mods: beat.mods, key: beat.key },
          transitioning: false,
        })
        t += beat.duration
      } else if (beat.type === 'release') {
        frames.push({
          t,
          keys: new Set(),
          appIndex: ai,
          highlightedModifiers: new Set(),
          highlightedShortcut: null,
          transitioning: false,
        })
        t += beat.duration
      }
    }
  }

  return { frames, duration: t }
}
