import { PRICE, APP_COUNT } from './siteConfig'

export const faqItems = [
  {
    question: 'What macOS versions does KeyShortcut support?',
    answer:
      'KeyShortcut requires macOS 13 (Ventura) or later.',
  },
  {
    question: 'Is this a subscription?',
    answer:
      `No. KeyShortcut is a one-time purchase of ${PRICE}. No subscriptions, no in-app purchases, no upsells. Pay once, use it forever.`,
  },
  {
    question: 'Does it work with my favorite app?',
    answer:
      `KeyShortcut ships with shortcuts for ${APP_COUNT} apps — from system essentials like Finder and Safari to professional tools like Figma, Xcode, Final Cut Pro, and Excel. Plus JetBrains IDEs, Google Workspace, project management tools, and more. You can also import custom shortcut packs or create your own.`,
  },
  {
    question: 'Is it private?',
    answer:
      'Completely. KeyShortcut is sandboxed, collects no data, sends nothing over the internet, and requires no account. What happens on your Mac stays on your Mac.',
  },
  {
    question: 'Can I add my own shortcuts?',
    answer:
      'Yes. Create custom shortcuts with any key combination. You can make them visual reference cards or assign actions — open an app, launch a URL, run an Apple Shortcut, or copy text to your clipboard.',
  },
  {
    question: 'Does it support my language?',
    answer:
      'KeyShortcut is fully localized in 11 languages: English, Spanish, French, Portuguese (Brazil), Russian, Chinese (Simplified), Hindi, Arabic, Hebrew, Bengali, and Urdu — including full right-to-left support.',
  },
  {
    question: 'How is KeyShortcut different from free alternatives?',
    answer:
      'Free tools typically show you a raw list of menu items when you hold a key — then disappear the moment you let go. KeyShortcut is always visible, beautifully organized, covers apps beyond the one you\'re in, detects your active app automatically, lets you search across everything, and supports custom shortcuts with global hotkeys. It\'s a shortcut companion, not a tooltip.',
  },
  {
    question: 'Can I use it on multiple Macs?',
    answer:
      'Yes. Like any Mac App Store purchase, KeyShortcut is tied to your Apple Account. Download it on any Mac signed into the same account. Family Sharing is also supported.',
  },
]
