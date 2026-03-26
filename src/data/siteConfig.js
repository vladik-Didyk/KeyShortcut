export const APP_COUNT = 107
export const SHORTCUT_COUNT = 4888
export const PRICE = '$7.99'
export const MIN_MACOS = 'macOS 13.0+'
export const APP_STORE_URL = 'https://apps.apple.com/app/keyshortcut/id000000000'
export const SUPPORT_EMAIL = 'support@keyshortcut.com'
export const SITE_NAME = 'KeyShortcut'

export function formatShortcutCount() {
  return SHORTCUT_COUNT.toLocaleString() + '+'
}
