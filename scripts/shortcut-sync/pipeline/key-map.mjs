/**
 * Key normalization tables.
 * Maps all known variations of key names to canonical forms.
 */

export const KEY_ALIASES = {
  // Enter/Return
  Return: 'Enter', '↩': 'Enter', '⏎': 'Enter', return: 'Enter', enter: 'Enter',
  // Delete/Backspace
  Del: 'Delete', '⌫': 'Delete', Backspace: 'Delete', backspace: 'Delete',
  // Forward Delete
  'Forward Delete': 'Forward Delete', '⌦': 'Forward Delete',
  // Escape
  Esc: 'Escape', '⎋': 'Escape', esc: 'Escape',
  // Arrow keys
  '←': 'Left', '→': 'Right', '↑': 'Up', '↓': 'Down',
  ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down',
  // Page navigation
  PgUp: 'Page Up', PgDn: 'Page Down', 'Page up': 'Page Up', 'Page down': 'Page Down',
  // Space
  ' ': 'Space', Spacebar: 'Space', spacebar: 'Space',
  // Tab
  '⇥': 'Tab',
  // Misc
  'Plus': '+', 'Minus': '-', 'Equals': '=',
}

/**
 * Normalize a key name to its canonical form.
 */
export function normalizeKey(key) {
  if (!key) return key
  const trimmed = key.trim()

  // Check aliases
  if (KEY_ALIASES[trimmed]) return KEY_ALIASES[trimmed]

  // Check case-insensitive
  const lower = trimmed.toLowerCase()
  for (const [alias, canonical] of Object.entries(KEY_ALIASES)) {
    if (alias.toLowerCase() === lower) return canonical
  }

  // Single letter → uppercase
  if (trimmed.length === 1 && /[a-zA-Z]/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  // Function keys → standardize (F1-F24)
  const fkeyMatch = trimmed.match(/^f(\d+)$/i)
  if (fkeyMatch) return `F${fkeyMatch[1]}`

  return trimmed
}
