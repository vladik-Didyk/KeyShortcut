export default {
  slug: 'custom-shortcut-guides',
  title: 'Enhance Your Digital Workflow with KeyShortcut\'s Custom Guides',
  description: 'Create custom keyboard shortcuts, build personal reference cards, and automate actions with KeyShortcut\'s custom shortcut system on macOS.',
  published: '2026-03-31',
  lastUpdated: '2026-03-31',
  readingTime: '7 min read',
  category: 'Product',
  relatedSlugs: ['shortcut-collections', 'personalized-shortcut-workflow'],
  relatedApps: [
    { label: 'Finder Shortcuts', to: '/macos/finder' },
    { label: 'Safari Shortcuts', to: '/macos/safari' },
  ],
  sections: [
    {
      id: 'introduction',
      heading: 'Beyond Built-In Shortcuts',
      content: [
        { type: 'paragraph', text: 'Every app comes with its own keyboard shortcuts, but they\'re designed for the average user. Your workflow is different. You have specific files you open daily, URLs you visit repeatedly, commands you run in sequence, and actions no app developer anticipated.' },
        { type: 'paragraph', text: 'KeyShortcut\'s custom shortcut system lets you go beyond what apps provide. Create your own keyboard shortcuts for any action — from simple reference cards to powerful automations — and access them with a global hotkey from anywhere on your Mac.' },
      ],
    },
    {
      id: 'reference-cards',
      heading: 'Custom Reference Cards',
      content: [
        { type: 'paragraph', text: 'The simplest custom shortcut is a reference card — a key combination paired with a label that appears in KeyShortcut\'s panel. No action is triggered; it\'s just a visual reminder of shortcuts you want to remember.' },
        { type: 'paragraph', text: 'Reference cards are useful for:' },
        {
          type: 'list',
          items: [
            'App-specific shortcuts you\'re currently learning and want to see alongside the built-in list.',
            'System-level shortcuts that aren\'t tied to any single app (like macOS accessibility shortcuts).',
            'Custom macOS keyboard shortcuts you\'ve set up via System Settings → Keyboard → Keyboard Shortcuts.',
            'Terminal commands or Git shortcuts you use frequently but haven\'t fully memorized.',
          ],
        },
        { type: 'paragraph', text: 'Think of reference cards as a digital sticky note on your screen — except they\'re organized, searchable, and automatically categorized alongside your other shortcuts.' },
      ],
    },
    {
      id: 'actionable-shortcuts',
      heading: 'Actionable Shortcuts',
      content: [
        { type: 'paragraph', text: 'Custom shortcuts become truly powerful when you assign actions to them. KeyShortcut supports several action types:' },
        {
          type: 'list',
          items: [
            'Open an app — Launch any application with a single key press. Assign ⌃⌥T to open Terminal, or ⌃⌥F to open Finder.',
            'Open a URL — One shortcut to open a specific web page. Daily standup meeting link, project dashboard, documentation page — anything you visit regularly.',
            'Run an Apple Shortcut — Trigger any Apple Shortcuts automation from a key combination. This connects KeyShortcut to the entire Apple Shortcuts ecosystem.',
            'Copy text to clipboard — Instantly copy a pre-defined text string. Email signatures, code snippets, template responses, or frequently-typed phrases.',
          ],
        },
        { type: 'paragraph', text: 'Each custom shortcut can be assigned a global hotkey — meaning it works from anywhere on your Mac, regardless of which app is in the foreground. Press the key combination and the action fires immediately.' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'workflow-examples',
      heading: 'Workflow Examples',
      content: [
        { type: 'paragraph', text: 'Here are practical examples of custom shortcuts that solve real workflow problems:' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌃⌥ D', action: 'Open daily standup meeting link in browser', platform: 'macos' },
            { keys: '⌃⌥ J', action: 'Open Jira board for current sprint', platform: 'macos' },
            { keys: '⌃⌥ G', action: 'Open GitHub notifications page', platform: 'macos' },
            { keys: '⌃⌥ S', action: 'Copy email signature to clipboard', platform: 'macos' },
            { keys: '⌃⌥ T', action: 'Open Terminal app', platform: 'macos' },
            { keys: '⌃⌥ N', action: 'Run "New Meeting Note" Apple Shortcut', platform: 'macos' },
          ],
        },
        { type: 'paragraph', text: 'The key insight is consistency: once you build a set of ⌃⌥ (Control+Option) shortcuts for your daily actions, they become second nature within a week. You no longer need to remember URLs, navigate bookmark folders, or click through menus — every action is one key press away.' },
      ],
    },
    {
      id: 'organization',
      heading: 'Organizing Your Custom Shortcuts',
      content: [
        { type: 'paragraph', text: 'As your custom shortcut collection grows, organization becomes important. A few strategies that work well:' },
        {
          type: 'list',
          items: [
            'Use a consistent modifier prefix. For example, use ⌃⌥ (Control+Option) for all custom shortcuts. This avoids conflicts with app-native shortcuts.',
            'Group by function. URLs in one group, app launchers in another, clipboard templates in a third.',
            'Keep it lean. 10-15 well-chosen custom shortcuts are more useful than 50 that you can\'t remember. If you haven\'t used a custom shortcut in a month, consider removing it.',
            'Review quarterly. Your workflow changes — your shortcuts should change with it. Add new ones for new responsibilities, remove ones that are no longer relevant.',
          ],
        },
      ],
    },
    {
      id: 'apple-shortcuts',
      heading: 'Integration with Apple Shortcuts',
      content: [
        { type: 'paragraph', text: 'The Apple Shortcuts integration is where custom shortcuts get seriously powerful. Apple Shortcuts can automate almost anything on macOS — from controlling system settings and managing files to interacting with third-party apps and web services.' },
        { type: 'paragraph', text: 'By assigning a KeyShortcut hotkey to an Apple Shortcut, you can trigger complex automations with a single key press:' },
        {
          type: 'list',
          items: [
            'Start a focus mode, open specific apps, and arrange windows for a work session.',
            'Create a new note in Apple Notes with today\'s date as the title.',
            'Take a screenshot and immediately upload it to a shared folder.',
            'Generate a daily summary from your calendar and copy it to the clipboard.',
            'Toggle system dark mode.',
          ],
        },
        { type: 'paragraph', text: 'The combination of KeyShortcut\'s global hotkeys and Apple Shortcuts\' automation capabilities gives you a keyboard-driven control center for your entire Mac.' },
      ],
    },
    {
      id: 'getting-started',
      heading: 'Getting Started',
      content: [
        { type: 'paragraph', text: 'Start with three custom shortcuts that solve your most repetitive daily tasks. The ones that make the biggest difference are usually the actions you perform multiple times a day — opening a specific URL, launching a specific app, or typing a specific phrase.' },
        { type: 'paragraph', text: 'Once those three are muscle memory (usually within a week), add three more. Within a month, you\'ll have a personalized shortcut system that saves you meaningful time every day.' },
        { type: 'cta', variant: 'mac-app' },
      ],
    },
  ],
}
