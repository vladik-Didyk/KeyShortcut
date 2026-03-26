/**
 * Modifier normalization tables.
 * Maps all known variations to canonical internal names that match Supabase modifier_symbols.
 */

// All input variations → canonical modifier names (matching Supabase modifier_symbols.modifier)
export const MODIFIER_ALIASES = {
  // macOS symbols
  '⌘': 'command', '⌥': 'option', '⌃': 'control', '⇧': 'shift',
  // macOS words
  cmd: 'command', command: 'command',
  opt: 'option', option: 'option',
  ctrl: 'control', control: 'control',
  shift: 'shift',
  // Windows/Linux
  alt: 'alt',
  win: 'super', windows: 'super', super: 'super', meta: 'super',
  fn: 'fn',
}

// Platform-specific canonical modifier names → display symbols
export const MODIFIER_SYMBOLS = {
  macos: {
    control: '⌃', option: '⌥', shift: '⇧', command: '⌘', fn: 'Fn',
  },
  windows: {
    control: 'Ctrl', alt: 'Alt', shift: 'Shift', super: 'Win',
  },
  linux: {
    control: 'Ctrl', alt: 'Alt', shift: 'Shift', super: 'Super',
  },
}

// Canonical sort order per platform (matches Supabase modifier_symbols.sort_order)
export const MODIFIER_ORDER = {
  macos: ['control', 'option', 'shift', 'command', 'fn'],
  windows: ['control', 'alt', 'shift', 'super'],
  linux: ['control', 'alt', 'shift', 'super'],
}

/**
 * Normalize a single modifier string to its canonical name.
 */
export function normalizeModifier(mod) {
  const key = mod.trim().toLowerCase()
  return MODIFIER_ALIASES[key] || MODIFIER_ALIASES[mod] || key
}

/**
 * Normalize and sort an array of modifiers for a given platform.
 */
export function normalizeModifiers(modifiers, platformId) {
  const order = MODIFIER_ORDER[platformId] || MODIFIER_ORDER.macos
  const normalized = modifiers
    .map(normalizeModifier)
    .filter((m, i, arr) => arr.indexOf(m) === i) // dedupe

  return normalized.sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

/**
 * Convert canonical modifier names to display symbols for a platform.
 */
export function modifiersToSymbols(modifiers, platformId) {
  const symbols = MODIFIER_SYMBOLS[platformId] || MODIFIER_SYMBOLS.macos
  return modifiers.map(m => symbols[m] || m)
}
