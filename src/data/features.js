import { APP_COUNT, formatShortcutCount } from './siteConfig'

export const features = [
  {
    title: `${formatShortcutCount()} shortcuts across ${APP_COUNT} apps`,
    description:
      'From Finder basics to Figma layers to Excel formulas — the shortcuts you actually use, organized by app, ready at a glance. No memorization required.',
    screenshot: 'keyflow-screen2-activeapp',
    alt: 'KeyShortcut showing organized keyboard shortcuts across multiple Mac applications',
  },
  {
    title: 'Always there. Never in the way.',
    description:
      'KeyShortcut floats above your workspace in a compact glass panel. It doesn\'t steal focus, doesn\'t block your clicks, doesn\'t interrupt your flow. Pin it to any corner or drag it wherever you want. Toggle it with one hotkey.',
    screenshot: 'keyflow-screen5-workflow',
    alt: 'KeyShortcut floating panel positioned in corner without blocking the workspace',
  },
  {
    title: 'Knows what you\'re using',
    description:
      'Switch to Figma, and Figma shortcuts appear. Switch to VS Code, and you see VS Code shortcuts. KeyShortcut detects your active app and shows the right shortcuts automatically.',
    screenshot: 'keyflow-screen3-followkeys',
    alt: 'KeyShortcut automatically detecting the active app and showing relevant shortcuts',
  },
  {
    title: 'Your shortcuts, your rules',
    description:
      'Create custom shortcuts for anything — open apps, launch URLs, run Apple Shortcuts, or just keep a personal reference card. Assign a global hotkey and trigger them from anywhere on your Mac.',
    screenshot: 'keyflow-screen4-search',
    alt: 'KeyShortcut custom shortcuts editor with personal shortcut configurations',
  },
]
