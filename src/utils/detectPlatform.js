/**
 * Detect the user's OS and return the matching platform ID.
 * Uses the modern User-Agent Client Hints API when available,
 * falls back to parsing the userAgent string.
 * Returns 'macos' server-side or if detection fails.
 */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'macos'

  // Modern API (Chromium-based browsers) — returns "Windows", "macOS", "Linux"
  const uaPlatform = navigator.userAgentData?.platform
  if (uaPlatform) {
    if (/Windows/i.test(uaPlatform)) return 'windows'
    if (/Linux/i.test(uaPlatform)) return 'linux'
    return 'macos'
  }

  // Fallback: parse the userAgent string (Safari, Firefox, older browsers)
  // UA contains OS tokens like "Windows NT 10.0", "Macintosh", "Linux x86_64"
  const ua = navigator.userAgent || ''
  if (/Windows/i.test(ua)) return 'windows'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux'
  return 'macos'
}
