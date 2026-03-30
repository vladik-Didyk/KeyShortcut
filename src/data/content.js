import { APP_COUNT, PRICE, MIN_MACOS, formatShortcutCount, SITE_NAME, SUPPORT_EMAIL } from './siteConfig'

/**
 * Single source of truth for all website content.
 * Computed values come from siteConfig.js; everything else is defined here.
 */
export const CONTENT = {
  // ─── Shared across pages ───────────────────────────────────────────
  shared: {
    siteName: SITE_NAME,
    tagline: 'Keyboard shortcuts for every app.',

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
      macAppLabel: 'Mac App',
      overviewLabel: 'Overview',
      openMenuLabel: 'Open menu',
      closeMenuLabel: 'Close menu',
    },

    footer: {
      tagline: 'Keyboard shortcuts for every app.',
      columns: [
        {
          heading: 'Directory',
          links: [
            { label: 'macOS Shortcuts', to: '/macos' },
            { label: 'Windows Shortcuts', to: '/windows' },
            { label: 'Linux Shortcuts', to: '/linux' },
          ],
        },
        {
          heading: 'Product',
          links: [
            { label: 'Mac HUD App', to: '/mac-hud' },
            { label: 'Features', to: '/mac-hud#features' },
            { label: 'FAQ', to: '/mac-hud#faq' },
            { label: 'Download', to: '/mac-hud#download' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: 'About', to: '/about' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Use', to: '/privacy#terms' },
          ],
        },
      ],
      copyright: 'KeyShortcut. All rights reserved.',
      bottomTagline: 'Made for people who love shortcuts.',
    },

    notFound: {
      title: '404',
      subtitle: 'Page not found',
      button: 'Back to Home',
    },

    errorBoundary: {
      title: 'Something went wrong',
      subtitle: 'An unexpected error occurred.',
      retryButton: 'Try Again',
      button: 'Back to Home',
    },

    macAppStoreButton: {
      ariaLabel: 'Download on the Mac App Store',
    },

    adSlot: {
      sponsoredLabel: 'Sponsored',
    },
  },

  // ─── Product page (/mac-hud) ───────────────────────────────────────
  productPage: {
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
      items: [
        {
          title: `${formatShortcutCount()} shortcuts across ${APP_COUNT} apps`,
          description: 'From Finder basics to Figma layers to Excel formulas — the shortcuts you actually use, organized by app, ready at a glance. No memorization required.',
          screenshot: 'keyflow-screen2-activeapp',
          alt: 'KeyShortcut showing organized keyboard shortcuts across multiple Mac applications',
        },
        {
          title: 'Always there. Never in the way.',
          description: 'KeyShortcut floats above your workspace in a compact glass panel. It doesn\'t steal focus, doesn\'t block your clicks, doesn\'t interrupt your flow. Pin it to any corner or drag it wherever you want. Toggle it with one hotkey.',
          screenshot: 'keyflow-screen5-workflow',
          alt: 'KeyShortcut floating panel positioned in corner without blocking the workspace',
        },
        {
          title: 'Knows what you\'re using',
          description: 'Switch to Figma, and Figma shortcuts appear. Switch to VS Code, and you see VS Code shortcuts. KeyShortcut detects your active app and shows the right shortcuts automatically.',
          screenshot: 'keyflow-screen3-followkeys',
          alt: 'KeyShortcut automatically detecting the active app and showing relevant shortcuts',
        },
        {
          title: 'Your shortcuts, your rules',
          description: 'Create custom shortcuts for anything — open apps, launch URLs, run Apple Shortcuts, or just keep a personal reference card. Assign a global hotkey and trigger them from anywhere on your Mac.',
          screenshot: 'keyflow-screen4-search',
          alt: 'KeyShortcut custom shortcuts editor with personal shortcut configurations',
        },
      ],
    },

    details: {
      title: 'Thoughtfully crafted,',
      titleAccent: 'down to every pixel',
      items: [
        {
          icon: 'Monitor',
          title: 'Glass UI',
          description: 'Follows your system appearance. Light mode, dark mode — it looks right either way.',
        },
        {
          icon: 'Globe',
          title: '11 languages',
          description: 'English, Spanish, French, Portuguese, Russian, Chinese, Hindi, Arabic, Hebrew, Bengali, and Urdu. Interface and shortcuts, fully localized.',
        },
        {
          icon: 'Keyboard',
          title: 'Key press highlighting',
          description: 'Press a modifier key and see it light up in the panel. A subtle visual confirmation that keeps you oriented.',
        },
        {
          icon: 'Clipboard',
          title: 'Clipboard preview',
          description: 'See what\'s on your clipboard without pasting it. A small toast appears when you copy — tap it for the full contents.',
        },
        {
          icon: 'Search',
          title: 'Instant search',
          description: 'Type to search across every shortcut in every app. Results are grouped and ranked so you find what you need in a keystroke or two.',
        },
        {
          icon: 'ShieldCheck',
          title: 'Completely private',
          description: 'No analytics. No tracking. No data collection. No internet connection required. KeyShortcut runs entirely on your Mac, and your data stays there.',
        },
      ],
    },

    shortcutPreview: {
      title: 'Beautiful shortcut cards',
      subtitle: 'Every shortcut displayed with styled keycap badges — just like the real keys on your keyboard.',
      shortcuts: [
        { keys: '⌘W', action: 'Close', description: 'Close window' },
        { keys: '⌘C', action: 'Copy', description: 'Copy selection' },
        { keys: '⌘X', action: 'Cut', description: 'Cut selection' },
        { keys: '⌘F', action: 'Find', description: 'Find text' },
        { keys: '⌥⌘⎋', action: 'Force Quit', description: 'Force an unresponsive app to quit' },
        { keys: '⌘H', action: 'Hide', description: 'Hide the active app' },
        { keys: '⌘N', action: 'New', description: 'Open a new window or document' },
        { keys: '⌘T', action: 'New Tab', description: 'Open a new tab' },
        { keys: '⌘V', action: 'Paste', description: 'Paste a copy of the last item copied or cut' },
        { keys: '⌥⇧⌘V', action: 'Paste and Match Style', description: 'Paste matching the document style' },
        { keys: '⌘P', action: 'Print', description: 'Print a document' },
        { keys: '⌘Q', action: 'Quit', description: 'Quit an app' },
        { keys: '⌘S', action: 'Save', description: 'Save a document' },
        { keys: '⇧⌘3', action: 'Screenshot', description: 'Screenshot the full screen' },
        { keys: '⇧⌘4', action: 'Screenshot Selection', description: 'Screenshot a portion of the screen' },
        { keys: '⇧⌘5', action: 'Screenshot Options', description: 'Screenshot or record the screen' },
        { keys: '⌘A', action: 'Select All', description: 'Select everything' },
        { keys: 'Fn', action: 'Emoji & Symbols', description: 'Open Character Viewer' },
        { keys: '⌘Space', action: 'Spotlight', description: 'Search for anything on your Mac' },
        { keys: '⌘Tab', action: 'Switch Apps', description: 'Switch between open apps' },
        { keys: '⌘Z', action: 'Undo', description: 'Undo the last action' },
      ],
    },

    appCoverage: {
      title: 'Shortcuts for the apps',
      titleAccent: 'you use every day',
      subtitle: `${APP_COUNT} apps. ${formatShortcutCount()} shortcuts. From system essentials to pro tools.`,
      footnote: 'Don\'t see your app? Import your own shortcut packs or create custom shortcuts for any app.',
      rows: [
        [
          'Safari', 'Chrome', 'Arc', 'Firefox', 'Brave', 'Edge', 'Vivaldi',
          'Xcode', 'VS Code', 'Cursor', 'IntelliJ IDEA', 'Sublime Text',
          'PyCharm', 'GoLand', 'PHPStorm', 'CLion', 'RubyMine', 'Android Studio',
          'iTerm2', 'Warp', 'Vim', 'Chrome DevTools',
          'Figma', 'Sketch', 'Photoshop', 'Illustrator', 'After Effects', 'Blender',
        ],
        [
          'Slack', 'Discord', 'Telegram', 'Zoom', 'Teams', 'Gmail',
          'Notion', 'Obsidian', 'Things', 'Todoist', 'Linear',
          'Jira', 'Trello', 'Asana', 'ClickUp',
          'Google Docs', 'Google Sheets', 'Google Drive',
          'Bear', '1Password', 'Raycast',
          'Word', 'Excel', 'PowerPoint', 'Acrobat',
          'Spotify', 'VLC', 'Final Cut Pro', 'DaVinci Resolve',
          'Finder', 'Mail', 'Notes', 'Calendar', 'Music',
        ],
      ],
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
        mac: 'Click \u2318 \u21E7 \u2325 \u2303 then press a key',
        win: 'Click Ctrl, Shift, Alt, or \u229E then press a key',
      },
      mobileFallback: 'Try the interactive keyboard on a larger screen.',
      notAssigned: '\u2014 not assigned',
    },

    faq: {
      title: 'Questions and answers',
      subtitle: 'Everything you need to know about KeyShortcut.',
      items: [
        {
          question: 'What macOS versions does KeyShortcut support?',
          answer: 'KeyShortcut requires macOS 13 (Ventura) or later.',
        },
        {
          question: 'Is this a subscription?',
          answer: `No. KeyShortcut is a one-time purchase of ${PRICE}. No subscriptions, no in-app purchases, no upsells. Pay once, use it forever.`,
        },
        {
          question: 'Does it work with my favorite app?',
          answer: `KeyShortcut ships with shortcuts for ${APP_COUNT} apps \u2014 from system essentials like Finder and Safari to professional tools like Figma, Xcode, Final Cut Pro, and Excel. Plus JetBrains IDEs, Google Workspace, project management tools, and more. You can also import custom shortcut packs or create your own.`,
        },
        {
          question: 'Is it private?',
          answer: 'Completely. KeyShortcut is sandboxed, collects no data, sends nothing over the internet, and requires no account. What happens on your Mac stays on your Mac.',
        },
        {
          question: 'Can I add my own shortcuts?',
          answer: 'Yes. Create custom shortcuts with any key combination. You can make them visual reference cards or assign actions \u2014 open an app, launch a URL, run an Apple Shortcut, or copy text to your clipboard.',
        },
        {
          question: 'Does it support my language?',
          answer: 'KeyShortcut is fully localized in 11 languages: English, Spanish, French, Portuguese (Brazil), Russian, Chinese (Simplified), Hindi, Arabic, Hebrew, Bengali, and Urdu \u2014 including full right-to-left support.',
        },
        {
          question: 'How is KeyShortcut different from free alternatives?',
          answer: 'Free tools typically show you a raw list of menu items when you hold a key \u2014 then disappear the moment you let go. KeyShortcut is always visible, beautifully organized, covers apps beyond the one you\'re in, detects your active app automatically, lets you search across everything, and supports custom shortcuts with global hotkeys. It\'s a shortcut companion, not a tooltip.',
        },
        {
          question: 'Can I use it on multiple Macs?',
          answer: 'Yes. Like any Mac App Store purchase, KeyShortcut is tied to your Apple Account. Download it on any Mac signed into the same account. Family Sharing is also supported.',
        },
      ],
    },

    policies: {
      title: 'Your Privacy Matters',
      subtitle: 'Zero data collection in the app. Everything stays on your Mac.',
      items: [
        {
          title: 'Privacy Policy',
          id: 'privacy',
          content: [
            'The KeyShortcut app does not collect, store, or transmit any personal data. No analytics or tracking frameworks are included in the app.',
            'No network requests are made by the app \u2014 it works entirely offline.',
            'All user preferences (favorites, custom shortcuts, window position) are stored locally on your device using macOS UserDefaults.',
            'KeyShortcut requests Accessibility permissions solely to detect which app is in the foreground and to monitor key presses for the "Follow Key Presses" feature. This data is never recorded or transmitted.',
            'The keyshortcut.com website uses Cloudflare Web Analytics (cookie-free, no personal data) and Google AdSense. These services apply only to the website, not the app.',
          ],
        },
        {
          title: 'Terms of Use',
          id: 'terms',
          content: [
            'KeyShortcut is provided "as is" without warranty of any kind, express or implied.',
            'You may use KeyShortcut for personal and commercial purposes.',
            'The app is distributed exclusively through the Mac App Store and is subject to Apple\'s standard terms and conditions.',
            'We reserve the right to update these terms at any time. Continued use of the app constitutes acceptance of any changes.',
          ],
        },
        {
          title: 'Data Handling',
          id: 'data',
          content: [
            'Zero data collection in the app \u2014 we never see or access your information.',
            'All app data stays on your device in the macOS app sandbox.',
            'No third-party SDKs, analytics, or advertising frameworks in the app.',
            'No cloud sync \u2014 your settings live exclusively on your Mac.',
            'Uninstalling KeyShortcut removes all associated data from your system.',
            'The website uses Cloudflare Web Analytics and Google AdSense. See our full privacy policy for details.',
          ],
        },
      ],
    },

    ctaBanner: {
      title: 'Learn every shortcut.',
      titleMiddle: 'Keep every shortcut.',
      titleAccent: `${PRICE}.`,
      subtitle: `One-time purchase. No subscription. No tracking.\nJust ${formatShortcutCount()} shortcuts, always within reach.`,
      footnote: `${MIN_MACOS} \u00B7 No account required`,
    },

    video: {
      title: 'See it in',
      titleAccent: 'action',
      subtitle: 'Watch how KeyShortcut helps you master macOS shortcuts effortlessly.',
      placeholder: 'Video coming soon',
    },
  },

  // ─── Directory homepage (/) ────────────────────────────────────────
  home: {
    title: 'Keyboard Shortcuts',
    titleAccent: 'Directory',
    subtitle: 'Browse shortcuts for popular apps on macOS, Windows, and Linux. Organized by category, searchable by name.',
    searchPlaceholder: 'Search apps \u2014 Figma, VS Code, Safari...',
    searchAriaLabel: 'Search for an app',
    allCategory: 'All',
    categorySubLabel: 'shortcuts',
    error: 'Something went wrong. Please try refreshing.',
    refreshButton: 'Refresh',
    emptyCategory: 'No apps in this category yet.',
    promo: {
      title: 'KeyShortcut for Mac',
      subtitle: 'See shortcuts for the active app in your menu bar.',
      button: 'Download',
    },
    aboutSection: {
      title: 'About This Directory',
      paragraphs: [
        'KeyShortcut is a free, open keyboard shortcuts directory covering macOS, Windows, and Linux. Every shortcut listed here is sourced from official application documentation, verified for accuracy, and organized into logical categories so you can find what you need quickly.',
        'The directory is searchable by app name and by shortcut action. You can look up a specific key combination, browse all shortcuts for an app, or explore apps by category — from browsers and code editors to design tools and productivity apps.',
        'All shortcuts are displayed with visual keycap badges that match the modifier key style of each platform: Command, Option, Control, and Shift on macOS, or Ctrl, Alt, Shift, and Win on Windows and Linux. This makes it easy to scan the page and identify the combination you need at a glance.',
      ],
    },
  },

  // ─── Platform index (/:platformId) ────────────────────────────────
  directory: {
    backLabel: 'Home',
    searchPlaceholder: 'Search for an app...',
    searchAriaLabel: 'Search apps',
    clearAriaLabel: 'Clear search',
    categorySubLabel: 'shortcuts',
    shortcutsLabel: 'shortcuts',
    intro: (platformName, appCount, shortcutCount) =>
      `Browse keyboard shortcuts for ${appCount} ${platformName} applications, totaling ${shortcutCount.toLocaleString()}+ shortcuts. Every shortcut is sourced from official documentation and organized by category. Click on any app to see its full shortcut reference, filter by action, or download a PDF cheat sheet.`,
    learnMore: (platformName) =>
      `Keyboard shortcuts are essential for working efficiently on ${platformName}. Whether you're switching between apps, editing documents, or managing files, knowing the right key combination saves you time and keeps you in flow. This directory is updated regularly as apps add new features and shortcuts.`,
  },

  // ─── Per-app shortcut page (/:platformId/:slug) ───────────────────
  shortcutPage: {
    breadcrumbHome: 'Home',
    sidebarTitle: 'Sections',
    filterPlaceholder: 'Filter shortcuts...',
    filterAriaLabel: 'Filter shortcuts',
    clearAriaLabel: 'Clear filter',
    downloadTitle: 'Download shortcuts as PDF',
    alsoOnLabel: 'Also on:',
    intro: (appName, platformName, shortcutCount, sectionCount) =>
      `This page lists all ${shortcutCount} keyboard shortcuts for ${appName} on ${platformName}, organized into ${sectionCount} sections. Each shortcut is displayed with its modifier keys and action so you can quickly find the key combination you need. Use the search bar above to filter shortcuts by name, or browse the sections in the sidebar.`,
    learnMore: (appName) =>
      `Learning keyboard shortcuts is one of the most effective ways to speed up your workflow in ${appName}. Instead of navigating through menus, you can perform common actions instantly with a quick key combination. Bookmark this page for easy reference, or download the shortcuts as a PDF cheat sheet using the download button above.`,
    ctaTitle: (appName) => `Access ${appName} shortcuts from your menu bar`,
    ctaSubtitle: 'KeyShortcut detects the active app and shows its shortcuts instantly. No memorization needed.',
    ctaButton: 'Download KeyShortcut',
    errorTitle: 'App not found',
    errorSubtitle: 'We don\'t have shortcuts for this app yet.',
    errorLink: 'Browse all apps',
  },

  // ─── Privacy & Terms (/privacy) ───────────────────────────────────
  privacy: {
    policy: {
      title: 'Privacy Policy',
      effectiveDate: 'Effective date: March 14, 2026',
      intro: 'KeyShortcut is built with privacy as a core principle. The app operates entirely offline and collects zero user data. This site displays advertisements served by Google AdSense. This policy covers both the KeyShortcut macOS app and the keyshortcut.com website.',
      sections: [
        {
          heading: 'App Data Collection',
          content: [
            { type: 'paragraph', text: 'The KeyShortcut macOS app does not collect, store, or transmit any personal data. There are no analytics frameworks, no tracking pixels, and no third-party SDKs in the app.' },
          ],
        },
        {
          heading: 'Network Access',
          content: [
            { type: 'paragraph', text: 'The KeyShortcut macOS app makes zero network requests. The app contains no networking code and does not communicate with any server. It works entirely offline.' },
          ],
        },
        {
          heading: 'Website Analytics & Advertising',
          content: [
            { type: 'paragraph', text: 'The keyshortcut.com website uses the following third-party services:' },
            {
              type: 'list',
              items: [
                { bold: 'Cloudflare Web Analytics', text: ' \u2014 a privacy-first analytics service that measures page views and performance. It does not use cookies, does not track individual users, and does not collect personal data. Data is aggregated and anonymous.' },
                { bold: 'Google AdSense', text: ' \u2014 may display ads on certain pages of the website. Google may use cookies to serve ads based on your prior visits. You can opt out of personalized advertising at ', link: { text: 'Google Ads Settings', href: 'https://www.google.com/settings/ads' }, textAfter: '.' },
              ],
            },
            { type: 'paragraph', text: 'These services apply only to the website. The KeyShortcut macOS app contains no analytics, advertising, or tracking of any kind.' },
          ],
        },
        {
          heading: 'Local Storage',
          content: [
            { type: 'paragraph', text: 'KeyShortcut stores your preferences locally on your device using macOS UserDefaults within the app sandbox. This includes:' },
            {
              type: 'list',
              items: [
                'Favorited shortcuts',
                'Custom shortcuts you create',
                'Window position and appearance settings',
                'Language preference',
                'Imported shortcut pack file references',
              ],
            },
            { type: 'paragraph', text: 'This data never leaves your Mac. Uninstalling KeyShortcut removes all associated data.' },
          ],
        },
        {
          heading: 'Accessibility Permissions',
          content: [
            { type: 'paragraph', text: 'KeyShortcut may request macOS Accessibility permission for two optional features:' },
            {
              type: 'list',
              items: [
                { bold: 'Follow Key Presses', text: ' \u2014 monitors which keys you press to highlight matching shortcuts in real time. This data is processed in memory and never stored or transmitted.' },
                { bold: 'Active App Detection', text: ' \u2014 identifies the frontmost application to show relevant shortcuts. Only the app\'s bundle identifier is read; no window content is accessed.' },
              ],
            },
            { type: 'paragraph', text: 'Both features are disabled by default and require explicit opt-in.' },
          ],
        },
        {
          heading: 'Apple Diagnostics',
          content: [
            { type: 'paragraph', text: 'KeyShortcut uses Apple\'s MetricKit framework, which allows Apple to collect anonymized crash reports and performance metrics through the standard macOS diagnostics pipeline. This data is processed by Apple, not by us. You can control this in System Settings > Privacy & Security > Analytics & Improvements.' },
          ],
        },
        {
          heading: 'Children\'s Privacy',
          content: [
            { type: 'paragraph', text: 'KeyShortcut does not collect any data from any user, including children.' },
          ],
        },
        {
          heading: 'Cookies',
          content: [
            { type: 'paragraph', text: 'The KeyShortcut macOS app does not use cookies. The keyshortcut.com website uses cookies only through third-party services:' },
            {
              type: 'list',
              items: [
                { bold: 'Google AdSense', text: ' — may set cookies to serve and measure ads. These are governed by ', link: { text: 'Google\u2019s privacy policy', href: 'https://policies.google.com/privacy' }, textAfter: '.' },
                { bold: 'Cloudflare', text: ' — may set a technical cookie (__cf_bm) for bot protection. This is not used for tracking.' },
              ],
            },
            { type: 'paragraph', text: 'You can control cookies through your browser settings. Disabling cookies may affect ad display but will not affect site functionality.' },
          ],
        },
        {
          heading: 'Your Rights (GDPR / EEA)',
          content: [
            { type: 'paragraph', text: 'If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):' },
            {
              type: 'list',
              items: [
                { bold: 'Right of access', text: ' — request a copy of any personal data we hold about you.' },
                { bold: 'Right to rectification', text: ' — request correction of inaccurate data.' },
                { bold: 'Right to erasure', text: ' — request deletion of your personal data.' },
                { bold: 'Right to restrict processing', text: ' — request that we limit how we use your data.' },
                { bold: 'Right to data portability', text: ' — request your data in a portable format.' },
                { bold: 'Right to object', text: ' — object to processing of your data, including for advertising purposes.' },
              ],
            },
            { type: 'paragraph', text: 'Since KeyShortcut does not collect personal data through its app, these rights primarily apply to any data collected by third-party services on the website (Google AdSense). You can opt out of personalized ads via Google Ads Settings or by using the Google consent banner.' },
            { type: 'contact', text: 'To exercise any of these rights, contact us at' },
          ],
        },
        {
          heading: 'Your Rights (CCPA / California)',
          content: [
            { type: 'paragraph', text: 'If you are a California resident, the California Consumer Privacy Act (CCPA) gives you additional rights:' },
            {
              type: 'list',
              items: [
                { bold: 'Right to know', text: ' — what personal information is collected, used, or shared.' },
                { bold: 'Right to delete', text: ' — request deletion of your personal information.' },
                { bold: 'Right to opt out', text: ' — opt out of the sale or sharing of personal information.' },
                { bold: 'Right to non-discrimination', text: ' — you will not be penalized for exercising your rights.' },
              ],
            },
            { type: 'paragraph', text: 'KeyShortcut does not sell personal information. Google AdSense on the website may use data for ad targeting, which may qualify as "sharing" under CCPA. You can opt out via Google Ads Settings or by enabling "Do Not Track" in your browser.' },
            { type: 'contact', text: 'For CCPA requests, contact us at' },
          ],
        },
        {
          heading: 'Data Retention',
          content: [
            { type: 'paragraph', text: 'KeyShortcut does not retain any personal data. App preferences are stored locally on your device and are deleted when you uninstall the app. Any data collected by third-party services on the website (Cloudflare, Google) is governed by their respective retention policies.' },
          ],
        },
        {
          heading: 'Changes to This Policy',
          content: [
            { type: 'paragraph', text: 'If we update this policy, the revised version will be posted here with a new effective date.' },
          ],
        },
        {
          heading: 'Contact',
          content: [
            { type: 'contact', text: 'If you have questions about this privacy policy, contact us at' },
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      effectiveDate: 'Effective date: March 14, 2026',
      intro: 'By purchasing and using KeyShortcut, you agree to the following terms.',
      sections: [
        {
          heading: 'License',
          content: [
            { type: 'paragraph', text: 'KeyShortcut is licensed, not sold. Your purchase grants you a non-exclusive, non-transferable license to use the app on any Mac signed into your Apple Account, in accordance with Apple\'s standard App Store terms.' },
          ],
        },
        {
          heading: 'Disclaimer',
          content: [
            { type: 'paragraph', text: 'KeyShortcut is provided "as is" without warranty of any kind, express or implied. We do not warrant that the app will be error-free or uninterrupted.' },
          ],
        },
        {
          heading: 'Limitation of Liability',
          content: [
            { type: 'paragraph', text: 'In no event shall the developer be liable for any indirect, incidental, or consequential damages arising from the use of KeyShortcut.' },
          ],
        },
        {
          heading: 'Governing Law',
          content: [
            { type: 'paragraph', text: 'These terms are subject to Apple\'s Licensed Application End User License Agreement (EULA) and the laws of the jurisdiction in which the developer resides.' },
          ],
        },
        {
          heading: 'Contact',
          content: [
            { type: 'contact', text: 'For questions about these terms, contact us at' },
          ],
        },
      ],
    },
  },

  // ─── About page (/about) ─────────────────────────────────────────
  about: {
    title: 'About KeyShortcut',
    published: '2025-06-01',
    lastUpdated: '2026-03-30',
    sections: [
      {
        paragraphs: [
          'I spend 12+ hours a day at a computer. Keyboard shortcuts are how I get things done: copying, pasting, switching apps, navigating code. I use them constantly, across dozens of different programs.',
          'The problem? Every time I needed a shortcut I didn\u2019t know, I\u2019d open a browser, go to that app\u2019s website, dig through their docs, find the key combination, switch back, and sometimes forget it before I could even use it. Over and over, for every app.',
          'So I started building my own shortcuts database. One place to look up any shortcut, for any app, organized the way my brain actually works. That became KeyShortcut.',
          `Today it covers ${APP_COUNT} apps across macOS, Windows, and Linux, with ${formatShortcutCount()} shortcuts, all sourced from official documentation. The companion Mac app goes further: it detects your active app and shows its shortcuts in a floating panel, instantly.`,
        ],
      },
    ],
    cards: {
      missing: {
        label: 'Helping out',
        title: 'Missing something?',
        text: 'Can\u2019t find your favorite app or noticed a wrong shortcut? Let me know and I\u2019ll add it. Every suggestion makes this resource better for everyone.',
        buttonLabel: 'Suggest an app',
        buttonHref: `mailto:${SUPPORT_EMAIL}?subject=App%20suggestion%20for%20KeyShortcut`,
      },
      openSource: {
        label: 'Open source',
        title: 'Built in the open',
        text: 'KeyShortcut is open source. Browse the code, report issues, or contribute on GitHub.',
        buttonLabel: 'View on GitHub',
        buttonHref: 'https://github.com/vladik-Didyk/KeyShortcut',
      },
      creator: {
        label: 'Created by',
        name: 'Vladik Didyk',
        url: 'https://vladik-didyk.netlify.app',
        avatar: '/images/avatar.webp',
        title: 'Full-Stack Developer & Systems Engineer',
        location: 'Toronto, Canada',
        bio: 'Like what you see? The Mac app takes it further \u2014 it detects your active app and shows its shortcuts instantly. Support the project and have every shortcut at your fingertips.',
        links: {
          linkedin: 'https://linkedin.com/in/vladislav-didyk',
          github: 'https://github.com/vladik-Didyk',
        },
        buttonLabel: 'Get the Mac App',
      },
    },
  },

  // ─── Route meta (SEO) ─────────────────────────────────────────────
  meta: {
    home: {
      title: 'Keyboard Shortcuts Directory \u2014 KeyShortcut',
      description: `Browse ${formatShortcutCount()} keyboard shortcuts for macOS, Windows, and Linux apps. Find shortcuts for any app, organized by category.`,
      url: 'https://keyshortcut.com/',
    },
    productPage: {
      title: 'Keyboard Shortcuts for macOS, Windows & Linux',
      description: `Browse ${formatShortcutCount()} keyboard shortcuts for macOS, Windows, and Linux apps. Find shortcuts for any app, organized by category.`,
      url: 'https://keyshortcut.com/mac-hud',
    },
    privacy: {
      title: 'Privacy Policy & Terms \u2014 KeyShortcut',
      description: 'KeyShortcut privacy policy, terms of use, and website data practices.',
      url: 'https://keyshortcut.com/privacy',
    },
    about: {
      title: 'About KeyShortcut \u2014 Keyboard Shortcuts Directory',
      description: 'Learn about KeyShortcut, the free keyboard shortcuts directory for macOS, Windows, and Linux. Our mission, approach, and how to get in touch.',
      url: 'https://keyshortcut.com/about',
    },
    catchAll: {
      title: 'Page Not Found \u2014 KeyShortcut',
      description: 'The page you\'re looking for doesn\'t exist.',
    },
    notFound: {
      title: 'Not Found \u2014 KeyShortcut',
    },
    platformIndex: (platformName, appCount, shortcutCount, platformId) => ({
      title: `${platformName} App Shortcuts \u2014 KeyShortcut`,
      description: `Browse keyboard shortcuts for ${appCount} ${platformName} apps. ${shortcutCount.toLocaleString()}+ shortcuts.`,
      url: `https://keyshortcut.com/${platformId}`,
    }),
    shortcutPage: (appName, platformName, shortcutCount, platformId, slug) => ({
      title: `${appName} ${platformName} Shortcuts \u2014 KeyShortcut`,
      description: `All ${shortcutCount} ${appName} keyboard shortcuts for ${platformName}.`,
      url: `https://keyshortcut.com/${platformId}/${slug}`,
    }),
  },

  // ─── Structured data (JSON-LD) ────────────────────────────────────
  structured: {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'KeyShortcut',
      url: 'https://keyshortcut.com',
      description: 'Browse keyboard shortcuts for macOS, Windows, and Linux apps. Find shortcuts for any app, organized by category.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://keyshortcut.com/?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
}

/**
 * Converts a meta entry into React Router's meta array format.
 * @param {{ title: string, description?: string, url?: string }} entry
 * @returns {Array<Object>}
 */
export function buildMeta({ title, description, url }) {
  const meta = [{ title }]
  if (description) {
    meta.push(
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    )
  }
  if (url) {
    meta.push(
      { property: 'og:url', content: url },
      { tagName: 'link', rel: 'canonical', href: url },
    )
  }
  return meta
}
