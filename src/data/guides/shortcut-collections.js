export default {
  slug: 'shortcut-collections',
  title: 'Upgrade Your Productivity Setup with KeyShortcut\'s Shortcut Collections',
  description: 'Learn how to use KeyShortcut\'s shortcut collections to organize, browse, and master keyboard shortcuts for your most-used apps on macOS.',
  published: '2026-03-31',
  lastUpdated: '2026-03-31',
  readingTime: '6 min read',
  category: 'Product',
  relatedSlugs: ['custom-shortcut-guides', 'keyboard-shortcut-app-features'],
  relatedApps: [
    { label: 'Xcode Shortcuts', to: '/macos/xcode' },
    { label: 'Figma Shortcuts', to: '/macos/figma' },
    { label: 'Slack Shortcuts', to: '/macos/slack' },
  ],
  sections: [
    {
      id: 'introduction',
      heading: 'What Are Shortcut Collections?',
      content: [
        { type: 'paragraph', text: 'KeyShortcut ships with a built-in library of keyboard shortcuts for over 60 macOS applications. Each app\'s shortcuts are organized into a collection — a structured set of key combinations grouped by function (file management, navigation, editing, formatting, and more).' },
        { type: 'paragraph', text: 'These collections are designed to be browsable and searchable. Instead of reading through a wall of text in an app\'s documentation, you get a clean, categorized view of every shortcut — displayed with real keycap badges so you can read them at a glance.' },
      ],
    },
    {
      id: 'how-collections-work',
      heading: 'How Collections Work',
      content: [
        { type: 'paragraph', text: 'When KeyShortcut detects your active application, it automatically loads that app\'s shortcut collection into the floating panel. Switch to Figma and you see Figma shortcuts. Switch to VS Code and you see VS Code shortcuts. There\'s no manual navigation — the tool follows your workflow.' },
        { type: 'paragraph', text: 'Each collection is organized into sections that mirror how you actually use the app:' },
        {
          type: 'list',
          items: [
            'General — universal actions like save, undo, redo, and quit.',
            'Navigation — moving around the interface, switching tabs, jumping to specific panels.',
            'Editing — cut, copy, paste, find, replace, and app-specific editing commands.',
            'View — zoom, toggle panels, switch layouts, show/hide elements.',
            'App-specific — unique actions like "Add Auto Layout" in Figma or "Toggle Terminal" in VS Code.',
          ],
        },
      ],
    },
    {
      id: 'apps-covered',
      heading: 'Apps Covered',
      content: [
        { type: 'paragraph', text: 'KeyShortcut\'s collections cover the apps that macOS professionals use most:' },
        {
          type: 'list',
          items: [
            'Browsers: Safari, Chrome, Arc, Firefox, Brave, Edge, Vivaldi.',
            'Code editors: VS Code, Cursor, Xcode, Sublime Text, and the full JetBrains suite (IntelliJ IDEA, PyCharm, GoLand, PHPStorm, CLion, RubyMine, Android Studio).',
            'Design: Figma, Sketch, Photoshop, Illustrator, After Effects, Blender.',
            'Productivity: Slack, Discord, Telegram, Zoom, Teams, Gmail, Notion, Obsidian, Things, Todoist, Linear, Jira.',
            'Office: Google Docs, Google Sheets, Google Drive, Word, Excel, PowerPoint, Acrobat.',
            'Media: Spotify, VLC, Final Cut Pro, DaVinci Resolve.',
            'System: Finder, Mail, Notes, Calendar, Music.',
          ],
        },
        { type: 'paragraph', text: 'New app collections are added regularly based on user requests and usage data. If your app isn\'t covered, you can create custom shortcuts for it (see below).' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'custom-collections',
      heading: 'Creating Your Own Collections',
      content: [
        { type: 'paragraph', text: 'Beyond the built-in collections, KeyShortcut lets you create custom shortcuts for any app — including apps that aren\'t in the default library. You can build entire custom collections tailored to your specific workflow.' },
        { type: 'paragraph', text: 'Custom shortcuts can be:' },
        {
          type: 'list',
          items: [
            'Visual reference cards — just a key combination and label, for shortcuts you want to remember.',
            'Actionable shortcuts — assign an action like opening a URL, launching an app, running an Apple Shortcut, or copying text to the clipboard.',
            'Global hotkeys — assign a custom key combination that works from anywhere on your Mac, even when the target app isn\'t active.',
          ],
        },
        { type: 'paragraph', text: 'This makes KeyShortcut more than a reference tool — it becomes a personal shortcut system that adapts to the way you work.' },
      ],
    },
    {
      id: 'search-across',
      heading: 'Searching Across Collections',
      content: [
        { type: 'paragraph', text: 'Sometimes you know the action but not the shortcut, or the shortcut but not the app. KeyShortcut\'s search bar lets you search across all collections simultaneously.' },
        { type: 'paragraph', text: 'Type "paste" and you\'ll see the paste shortcut for every app that has one — including variations like "Paste Without Formatting," "Paste and Match Style," and "Paste Special." The results are grouped by app and ranked by relevance, so you can quickly find exactly what you need.' },
        { type: 'paragraph', text: 'This cross-app search is especially useful for discovering that different apps handle the same action differently, or for finding app-specific shortcuts you didn\'t know existed.' },
      ],
    },
    {
      id: 'workflow-tips',
      heading: 'Tips for Getting the Most Out of Collections',
      content: [
        {
          type: 'list',
          items: [
            'Pin the panel to a consistent screen position so it becomes a natural reference point in your workspace.',
            'Use the global toggle hotkey to show/hide the panel instantly when you need a quick reference.',
            'Start by scanning the collection for your most-used app. You\'ll likely discover shortcuts for actions you\'ve been doing with the mouse.',
            'Create custom shortcuts for your 3 most repetitive daily tasks — even something simple like opening a specific URL or project folder.',
            'Check the panel when you switch to a less familiar app. It\'s the fastest way to learn a new tool\'s keyboard interface.',
          ],
        },
        { type: 'cta', variant: 'mac-app' },
      ],
    },
    {
      id: 'online-directory',
      heading: 'Browse Collections Online',
      content: [
        { type: 'paragraph', text: 'Don\'t have a Mac? You can browse the full shortcut directory on this website — all 60+ apps across macOS, Windows, and Linux, organized by category, searchable by name or action. Each app page includes every shortcut with keycap badges, section navigation, and a downloadable PDF cheat sheet.' },
        { type: 'paragraph', text: 'Whether you use the Mac app or the web directory, the goal is the same: get the right shortcut in front of you at the right moment, so you can work faster without breaking your flow.' },
      ],
    },
  ],
}
