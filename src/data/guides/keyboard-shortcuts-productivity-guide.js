export default {
  slug: 'keyboard-shortcuts-productivity-guide',
  title: 'The Ultimate Guide to Keyboard Shortcuts for Productivity in 2026',
  description: 'Master keyboard shortcuts in 2026 with this comprehensive guide. Essential shortcuts for macOS, Windows, and Linux across browsers, code editors, design tools, and productivity apps.',
  published: '2026-03-31',
  lastUpdated: '2026-03-31',
  readingTime: '12 min read',
  category: 'Productivity',
  relatedSlugs: ['universal-shortcuts-all-platforms', 'keyboard-shortcuts-efficiency'],
  relatedApps: [
    { label: 'VS Code Shortcuts', to: '/macos/vs-code' },
    { label: 'Figma Shortcuts', to: '/macos/figma' },
    { label: 'Notion Shortcuts', to: '/macos/notion' },
    { label: 'Chrome Shortcuts', to: '/macos/chrome' },
  ],
  sections: [
    {
      id: 'introduction',
      heading: 'Why 2026 Is the Year to Master Shortcuts',
      content: [
        { type: 'paragraph', text: 'Software keeps getting more powerful, but the way we interact with it hasn\'t fundamentally changed. We still point, click, scroll, and hunt through menus. As applications add more features, the menu structures get deeper and the number of possible actions grows — making keyboard shortcuts more valuable than ever.' },
        { type: 'paragraph', text: 'In 2026, the average knowledge worker uses 8-12 different applications daily, each with its own set of shortcuts. This guide cuts through the noise and gives you the essential shortcuts that matter most across the most popular app categories.' },
      ],
    },
    {
      id: 'browser-shortcuts',
      heading: 'Browser Shortcuts Every User Should Know',
      content: [
        { type: 'paragraph', text: 'The web browser is the most-used application on most computers. Whether you\'re using Chrome, Firefox, Safari, Edge, or Arc, these shortcuts work universally.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ T / Ctrl+T', action: 'New tab', platform: 'all' },
            { keys: '⌘ W / Ctrl+W', action: 'Close current tab', platform: 'all' },
            { keys: '⇧⌘ T / Ctrl+Shift+T', action: 'Reopen last closed tab', platform: 'all' },
            { keys: '⌘ L / Ctrl+L', action: 'Focus address bar', platform: 'all' },
            { keys: '⌘ 1-9 / Ctrl+1-9', action: 'Jump to tab by position', platform: 'all' },
            { keys: '⌘ [ / Alt+←', action: 'Go back', platform: 'all' },
            { keys: '⌘ ] / Alt+→', action: 'Go forward', platform: 'all' },
            { keys: '⇧⌘ N / Ctrl+Shift+N', action: 'New private/incognito window', platform: 'all' },
            { keys: '⌘ ⌥ I / Ctrl+Shift+I', action: 'Open Developer Tools', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'The most life-changing browser shortcut is ⇧⌘T / Ctrl+Shift+T. Accidentally closed a tab? It comes back instantly. You can press it multiple times to reopen tabs in reverse order. No more losing important pages.' },
      ],
    },
    {
      id: 'code-editor-shortcuts',
      heading: 'Code Editor Shortcuts for Developers',
      content: [
        { type: 'paragraph', text: 'Code editors like VS Code, Cursor, and the JetBrains suite are where developers spend most of their day. These shortcuts dramatically speed up code navigation, editing, and debugging.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ P / Ctrl+P', action: 'Quick Open — find and open any file', platform: 'all' },
            { keys: '⇧⌘ P / Ctrl+Shift+P', action: 'Command Palette — search all commands', platform: 'all' },
            { keys: '⌘ D / Ctrl+D', action: 'Select next occurrence of current word', platform: 'all' },
            { keys: '⌘ ⇧ F / Ctrl+Shift+F', action: 'Search across all files in project', platform: 'all' },
            { keys: '⌥ ↑/↓ / Alt+↑/↓', action: 'Move line up or down', platform: 'all' },
            { keys: '⇧⌥ ↓ / Shift+Alt+↓', action: 'Duplicate line', platform: 'all' },
            { keys: '⌘ / / Ctrl+/', action: 'Toggle line comment', platform: 'all' },
            { keys: '⌘ ⇧ K / Ctrl+Shift+K', action: 'Delete entire line', platform: 'all' },
            { keys: '⌃ ` / Ctrl+`', action: 'Toggle integrated terminal', platform: 'all' },
          ],
        },
        { type: 'callout', text: 'The Command Palette (⇧⌘P / Ctrl+Shift+P) is the single most powerful shortcut in VS Code. It gives you access to every command in the editor. If you learn only one VS Code shortcut, make it this one.' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'design-shortcuts',
      heading: 'Design Tool Shortcuts',
      content: [
        { type: 'paragraph', text: 'Designers who master shortcuts work noticeably faster. These shortcuts apply to Figma, Sketch, and other popular design tools.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'V', action: 'Move tool (select)', platform: 'all' },
            { keys: 'R', action: 'Rectangle tool', platform: 'all' },
            { keys: 'T', action: 'Text tool', platform: 'all' },
            { keys: 'F', action: 'Frame tool (Figma)', platform: 'all' },
            { keys: '⌘ G / Ctrl+G', action: 'Group selection', platform: 'all' },
            { keys: '⌘ ⇧ G / Ctrl+Shift+G', action: 'Ungroup selection', platform: 'all' },
            { keys: '⌘ D / Ctrl+D', action: 'Duplicate in place', platform: 'all' },
            { keys: '⌘ [ / Ctrl+[', action: 'Send backward', platform: 'all' },
            { keys: '⌘ ] / Ctrl+]', action: 'Bring forward', platform: 'all' },
            { keys: '⇧ A', action: 'Add Auto Layout (Figma)', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'In design tools, single-key shortcuts are the norm for tool selection. Just pressing "V" switches to the move tool, "R" to rectangle, "T" to text. This keeps your left hand on the keyboard selecting tools while your right hand positions elements with the mouse — a fundamentally faster workflow than clicking toolbar icons.' },
      ],
    },
    {
      id: 'productivity-shortcuts',
      heading: 'Productivity App Shortcuts',
      content: [
        { type: 'paragraph', text: 'Communication and project management tools have their own shortcut ecosystems. Learning these prevents constant context switching between keyboard and mouse while handling messages, tasks, and documents.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ K', action: 'Slack: Jump to any conversation', platform: 'macos' },
            { keys: '⌘ ⇧ A', action: 'Slack: View all unread messages', platform: 'macos' },
            { keys: '⌘ Enter', action: 'Notion/Linear: Open a page or issue', platform: 'macos' },
            { keys: '⌘ ⇧ M', action: 'Gmail: Mute a conversation', platform: 'macos' },
            { keys: 'E', action: 'Gmail: Archive the selected email', platform: 'macos' },
            { keys: '/', action: 'Notion: Open the slash command menu', platform: 'all' },
            { keys: '⌘ N', action: 'Things/Todoist: Create a new task', platform: 'macos' },
          ],
        },
      ],
    },
    {
      id: 'system-shortcuts',
      heading: 'System-Level Shortcuts',
      content: [
        { type: 'paragraph', text: 'Operating system shortcuts work everywhere, regardless of which app you\'re in. These are the foundational shortcuts that tie your entire workflow together.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ Space', action: 'Spotlight / Raycast (macOS search)', platform: 'macos' },
            { keys: '⌘ Tab', action: 'Switch between applications', platform: 'macos' },
            { keys: '⌃ ↑ / Mission Control', action: 'See all open windows', platform: 'macos' },
            { keys: '⌃ ← / ⌃ →', action: 'Switch between desktops', platform: 'macos' },
            { keys: '⇧⌘ 5', action: 'Screenshot and screen recording toolbar', platform: 'macos' },
            { keys: 'Win+E', action: 'Open File Explorer (Windows)', platform: 'windows' },
            { keys: 'Win+V', action: 'Open clipboard history (Windows)', platform: 'windows' },
            { keys: 'Win+← / Win+→', action: 'Snap window to left/right half (Windows)', platform: 'windows' },
          ],
        },
        { type: 'paragraph', text: 'On macOS, Spotlight (⌘Space) is the fastest way to open any app, file, or setting. On Windows, Win+S serves a similar purpose. Once you get into the habit of launching apps via the keyboard instead of clicking Dock or taskbar icons, going back feels impossibly slow.' },
      ],
    },
    {
      id: 'building-habits',
      heading: 'Building Shortcut Habits That Stick',
      content: [
        { type: 'paragraph', text: 'Knowing shortcuts and using them are two different things. Here\'s a practical system for building lasting shortcut habits:' },
        {
          type: 'list',
          items: [
            'The 3-shortcut rule: Pick 3 new shortcuts per week, max. Write them on a sticky note and put it on your monitor.',
            'The catch-yourself method: Every time you reach for the mouse, pause and ask "Is there a shortcut for this?" If yes, use it. If you don\'t know, look it up — then use it.',
            'The first-thing-in-the-morning trick: Before starting work, review your current 3 shortcuts. This takes 10 seconds and primes your brain for the day.',
            'Track your progress: Keep a simple list of shortcuts you\'ve mastered. Seeing it grow is motivating.',
            'Use a shortcut reference tool: Apps like KeyShortcut show shortcuts for your active app in a floating panel, so you never need to search the web.',
          ],
        },
        { type: 'cta', variant: 'mac-app' },
      ],
    },
    {
      id: 'conclusion',
      heading: 'Start with What Matters Most',
      content: [
        { type: 'paragraph', text: 'You don\'t need to memorize hundreds of shortcuts. You need to learn the right 15-20 shortcuts for your specific workflow. Start with the universal ones (copy, paste, undo, find, switch apps), then add app-specific shortcuts for the 3-5 applications where you spend the most time.' },
        { type: 'paragraph', text: 'The compound effect is powerful: each shortcut saves a few seconds, hundreds of times a day. Over weeks and months, those seconds become hours. Over years, they become days. And the skills stay with you forever, because once a shortcut becomes muscle memory, you never forget it.' },
        { type: 'paragraph', text: 'Browse our keyboard shortcuts directory to find shortcuts for any app. Or, for the fastest possible reference, try KeyShortcut — a floating shortcut panel that detects your active app and shows its shortcuts instantly.' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
  ],
}
