import { APP_COUNT, PRICE, MIN_MACOS, formatShortcutCount } from './siteConfig'

export const copy = {
  hero: {
    headline: 'Stop Googling shortcuts.',
    headlineAccent: 'Start knowing them.',
    subheadline: 'A floating shortcut panel on your Mac that detects your active app and shows every shortcut at a glance.',
    subheadlineMobile: 'A floating shortcut panel on your Mac that detects your active app and shows every shortcut at a glance. You\'ll work faster from day one.',
    platformInfo: `${MIN_MACOS}\nOne-time ${PRICE}`,
    platformInfoMobile: `${MIN_MACOS} \u00B7 One-time ${PRICE}`,
    stats: [
      { value: String(APP_COUNT), label: 'Apps' },
      { value: formatShortcutCount(), label: 'Shortcuts' },
    ],
    statsMobile: [
      { value: String(APP_COUNT), label: 'Apps supported' },
      { value: formatShortcutCount(), label: 'Shortcuts built-in' },
    ],
    keyboardHint: 'Modifier keys filter the panel — press a shortcut to highlight it',
    mobileCta: 'One-time purchase \u00B7 No subscription \u00B7 No tracking',
  },

  problem: {
    title: 'You already know the shortcut.',
    titleAccent: 'You just forgot it.',
    paragraphs: [
      'You\'ve looked it up before. Command-something. Maybe Shift was involved. You open a new tab, type "Figma shortcuts," scroll past the ads, find the one you need, switch back to your app, and — wait, what was it again?',
      'Or maybe you hold down a key and stare at a tiny overlay, trying to parse a wall of text before it vanishes.',
      'This isn\'t how shortcuts should work. Shortcuts are supposed to save you time, not cost it. You need them visible, organized, and there the moment you glance over — not hidden behind a search bar or a long press.',
    ],
  },

  features: {
    title: 'What makes KeyShortcut',
    titleAccent: 'different',
    subtitle: 'Built to stay out of your way while keeping every shortcut within reach.',
  },

  details: {
    title: 'Thoughtfully crafted,',
    titleAccent: 'down to every pixel',
  },

  shortcutPreview: {
    title: 'Beautiful shortcut cards',
    subtitle: 'Every shortcut displayed with styled keycap badges — just like the real keys on your keyboard.',
  },

  appCoverage: {
    title: 'Shortcuts for the apps',
    titleAccent: 'you use every day',
    subtitle: `${APP_COUNT} apps. ${formatShortcutCount()} shortcuts. From system essentials to pro tools.`,
    footnote: 'Don\'t see your app? Import your own shortcut packs or create custom shortcuts for any app.',
  },

  appGrid: {
    title: 'Browse by category',
    subtitle: 'Find shortcuts for your favorite apps, organized by workflow.',
    viewAll: `View all ${APP_COUNT} apps`,
  },

  interactiveKeyboard: {
    title: 'Try a',
    titleAccent: 'shortcut',
    subtitle: 'Click modifier keys then a letter to discover keyboard shortcuts.',
    platformLabels: { mac: 'MacBook', win: 'Windows' },
    hints: {
      mac: 'Click ⌘ ⇧ ⌥ ⌃ then press a key',
      win: 'Click Ctrl, Shift, Alt, or ⊞ then press a key',
    },
    mobileFallback: 'Try the interactive keyboard on a larger screen.',
  },

  faq: {
    title: 'Questions and answers',
    subtitle: 'Everything you need to know about KeyShortcut.',
  },

  policies: {
    title: 'Your Privacy Matters',
    subtitle: 'Zero data collection in the app. Everything stays on your Mac.',
  },

  ctaBanner: {
    title: 'Learn every shortcut.',
    titleMiddle: 'Keep every shortcut.',
    titleAccent: `${PRICE}.`,
    subtitle: `One-time purchase. No subscription. No tracking.\nJust ${formatShortcutCount()} shortcuts, always within reach.`,
    footnote: `${MIN_MACOS} \u00B7 No account required`,
  },

  navbar: {
    platformLinks: [
      { label: 'macOS', to: '/macos' },
      { label: 'Windows', to: '/windows' },
      { label: 'Linux', to: '/linux' },
    ],
    appDropdownLinks: [
      { label: 'Features', href: '#features' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Privacy', href: '#policies' },
    ],
    downloadLabel: 'Download',
  },

  footer: {
    links: [
      { label: 'macOS Shortcuts', to: '/macos' },
      { label: 'Windows Shortcuts', to: '/windows' },
      { label: 'Linux Shortcuts', to: '/linux' },
      { label: 'Mac HUD App', to: '/mac-hud' },
      { label: 'Privacy', to: '/privacy' },
    ],
  },

  notFound: {
    title: '404',
    subtitle: 'Page not found',
    button: 'Back to Home',
  },

  errorBoundary: {
    title: 'Something went wrong',
    subtitle: 'An unexpected error occurred.',
    button: 'Back to Home',
  },

  shortcutPage: {
    errorTitle: 'App not found',
    errorSubtitle: 'We don\'t have shortcuts for this app yet.',
    errorLink: 'Browse all apps',
    ctaSubtitle: 'KeyShortcut detects the active app and shows its shortcuts instantly. No memorization needed.',
    ctaButton: 'Download KeyShortcut',
  },

  directoryHomepage: {
    title: 'Keyboard Shortcuts\nDirectory',
    popularLabel: 'Popular',
    promoTitle: 'KeyShortcut for Mac',
    promoSubtitle: 'See shortcuts for the active app in your menu bar.',
    promoButton: 'Download',
  },

  meta: {
    defaultTitle: 'Keyboard Shortcuts for macOS, Windows & Linux',
    defaultDescription: `Browse ${formatShortcutCount()} keyboard shortcuts for macOS, Windows, and Linux apps. Find shortcuts for any app, organized by category.`,
  },
}
