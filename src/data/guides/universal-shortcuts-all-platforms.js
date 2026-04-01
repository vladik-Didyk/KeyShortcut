export default {
  slug: 'universal-shortcuts-all-platforms',
  title: 'A Complete List of Universal Shortcuts for All Platforms',
  description: 'The definitive reference for keyboard shortcuts that work across macOS, Windows, and Linux. Copy, paste, undo, navigation, and more — with platform-specific key equivalents.',
  published: '2026-03-31',
  lastUpdated: '2026-03-31',
  readingTime: '11 min read',
  category: 'Reference',
  relatedSlugs: ['keyboard-shortcuts-productivity-guide', 'linux-keyboard-shortcuts'],
  relatedApps: [
    { label: 'Finder Shortcuts', to: '/macos/finder' },
    { label: 'Chrome macOS Shortcuts', to: '/macos/chrome' },
    { label: 'Chrome Windows Shortcuts', to: '/windows/chrome' },
  ],
  sections: [
    {
      id: 'introduction',
      heading: 'Universal Shortcuts: One Language, Every Platform',
      content: [
        { type: 'paragraph', text: 'Some keyboard shortcuts are so fundamental that they work in virtually every application, on every operating system. Copy, Paste, Undo, Save — these actions are mapped to consistent key combinations that have remained stable for decades.' },
        { type: 'paragraph', text: 'This guide is a comprehensive reference for universal keyboard shortcuts across macOS, Windows, and Linux. We\'ll cover the essential shortcuts that every user should know, organized by function, with the platform-specific modifier keys clearly labeled.' },
        { type: 'callout', text: 'On macOS, the primary modifier is Command (⌘). On Windows and Linux, it\'s Control (Ctrl). Most universal shortcuts follow the same letter key — just swap the modifier.' },
      ],
    },
    {
      id: 'clipboard',
      heading: 'Clipboard Shortcuts',
      content: [
        { type: 'paragraph', text: 'Clipboard operations are the most frequently used shortcuts across all platforms. These work in text editors, browsers, file managers, design tools, and almost every application.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ C / Ctrl+C', action: 'Copy — duplicate the selected content to the clipboard', platform: 'all' },
            { keys: '⌘ X / Ctrl+X', action: 'Cut — move the selected content to the clipboard', platform: 'all' },
            { keys: '⌘ V / Ctrl+V', action: 'Paste — insert clipboard contents at the cursor', platform: 'all' },
            { keys: '⇧⌘ V / Ctrl+Shift+V', action: 'Paste without formatting — match the destination style', platform: 'all' },
            { keys: '⌘ A / Ctrl+A', action: 'Select All — select everything in the current context', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'The clipboard is a temporary storage area that holds one item at a time (unless you use a clipboard manager). Cut moves the selection while Copy leaves the original intact. Paste without formatting is invaluable when copying text between applications — it strips bold, italic, font changes, and other styling.' },
      ],
    },
    {
      id: 'undo-redo',
      heading: 'Undo and Redo',
      content: [
        { type: 'paragraph', text: 'Undo and Redo let you step backward and forward through your editing history. Most applications support multiple levels of undo, so you can keep pressing the shortcut to go further back.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ Z / Ctrl+Z', action: 'Undo — reverse the last action', platform: 'all' },
            { keys: '⇧⌘ Z / Ctrl+Shift+Z', action: 'Redo — reapply the undone action (most apps)', platform: 'all' },
            { keys: '— / Ctrl+Y', action: 'Redo — reapply the undone action (Windows alternative)', platform: 'windows' },
          ],
        },
        { type: 'paragraph', text: 'Note the Redo inconsistency: most modern applications use Ctrl+Shift+Z (or ⇧⌘Z on macOS), but some older Windows applications use Ctrl+Y. When in doubt, try both. On macOS, ⇧⌘Z is the universal standard.' },
      ],
    },
    {
      id: 'file-operations',
      heading: 'File Operations',
      content: [
        { type: 'paragraph', text: 'These shortcuts handle saving, opening, creating, closing, and printing — the basic file lifecycle in any document-based application.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ S / Ctrl+S', action: 'Save the current document', platform: 'all' },
            { keys: '⇧⌘ S / Ctrl+Shift+S', action: 'Save As — save with a new name or location', platform: 'all' },
            { keys: '⌘ N / Ctrl+N', action: 'New — create a new document or window', platform: 'all' },
            { keys: '⌘ O / Ctrl+O', action: 'Open — open an existing file', platform: 'all' },
            { keys: '⌘ W / Ctrl+W', action: 'Close the current tab or window', platform: 'all' },
            { keys: '⌘ P / Ctrl+P', action: 'Print the current document', platform: 'all' },
            { keys: '⌘ Q / Alt+F4', action: 'Quit the application', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'Save early, save often. The ⌘S / Ctrl+S shortcut should be muscle memory for anyone working on documents, code, or creative projects. Many modern apps auto-save, but the habit prevents data loss in apps that don\'t.' },
      ],
    },
    {
      id: 'text-editing',
      heading: 'Text Editing and Navigation',
      content: [
        { type: 'paragraph', text: 'These shortcuts work in every text input — from code editors and word processors to browser address bars and chat apps. They\'re the foundation of fast text editing.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ F / Ctrl+F', action: 'Find — search for text in the current document', platform: 'all' },
            { keys: '⌘ H / Ctrl+H', action: 'Find and Replace (in most editors)', platform: 'all' },
            { keys: '⌘ G / Ctrl+G / F3', action: 'Find Next — jump to the next search match', platform: 'all' },
            { keys: 'Home / ⌘←', action: 'Move cursor to the beginning of the line', platform: 'all' },
            { keys: 'End / ⌘→', action: 'Move cursor to the end of the line', platform: 'all' },
            { keys: '⌥← / Ctrl+←', action: 'Move cursor one word to the left', platform: 'all' },
            { keys: '⌥→ / Ctrl+→', action: 'Move cursor one word to the right', platform: 'all' },
            { keys: '⇧+Arrow', action: 'Select text in the direction of the arrow', platform: 'all' },
            { keys: '⇧⌘← / Shift+Home', action: 'Select from cursor to beginning of line', platform: 'all' },
            { keys: '⇧⌘→ / Shift+End', action: 'Select from cursor to end of line', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'Combining selection shortcuts with clipboard shortcuts is where keyboard efficiency really shines. For example, ⇧⌘→ then ⌘X (Shift+End then Ctrl+X on Windows) selects everything from your cursor to the end of the line and cuts it — a single fluid motion that replaces several mouse actions.' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'browser',
      heading: 'Browser Shortcuts',
      content: [
        { type: 'paragraph', text: 'Web browsers are where most people spend the majority of their computing time. These shortcuts work in Chrome, Firefox, Safari, Edge, Arc, Brave, and virtually every Chromium-based browser.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ T / Ctrl+T', action: 'Open a new tab', platform: 'all' },
            { keys: '⌘ W / Ctrl+W', action: 'Close the current tab', platform: 'all' },
            { keys: '⇧⌘ T / Ctrl+Shift+T', action: 'Reopen the last closed tab', platform: 'all' },
            { keys: '⌘ L / Ctrl+L', action: 'Focus the address bar', platform: 'all' },
            { keys: '⌘ R / Ctrl+R / F5', action: 'Reload the current page', platform: 'all' },
            { keys: '⇧⌘ R / Ctrl+Shift+R', action: 'Hard reload (bypass cache)', platform: 'all' },
            { keys: '⌘ [ / Alt+←', action: 'Go back in history', platform: 'all' },
            { keys: '⌘ ] / Alt+→', action: 'Go forward in history', platform: 'all' },
            { keys: '⌘ 1-9 / Ctrl+1-9', action: 'Switch to tab 1 through 9', platform: 'all' },
            { keys: 'Space / Shift+Space', action: 'Scroll down / up one page', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'The most underused browser shortcut is ⇧⌘T / Ctrl+Shift+T — reopening closed tabs. Accidentally closed an important tab? Press it once to bring it back. Press it again to recover the one before that. Most browsers remember your last 10+ closed tabs.' },
      ],
    },
    {
      id: 'window-management',
      heading: 'Window and App Management',
      content: [
        { type: 'paragraph', text: 'These shortcuts let you switch between apps, manage windows, and navigate your desktop without reaching for the mouse.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ Tab / Alt+Tab', action: 'Switch between open applications', platform: 'all' },
            { keys: '⌘ ` / Alt+`', action: 'Switch between windows of the same app (macOS)', platform: 'macos' },
            { keys: '— / Win+Tab', action: 'Task View — see all open windows (Windows)', platform: 'windows' },
            { keys: '⌘ M / Win+↓', action: 'Minimize the current window', platform: 'all' },
            { keys: '⌃⌘ F / Win+↑ / F11', action: 'Toggle fullscreen', platform: 'all' },
            { keys: '⌘ H / —', action: 'Hide the current application (macOS)', platform: 'macos' },
            { keys: '— / Win+D', action: 'Show desktop (Windows)', platform: 'windows' },
            { keys: '— / Win+L', action: 'Lock the screen (Windows/Linux)', platform: 'windows' },
            { keys: '⌃⌘ Q / —', action: 'Lock the screen (macOS)', platform: 'macos' },
          ],
        },
      ],
    },
    {
      id: 'screenshots',
      heading: 'Screenshots',
      content: [
        { type: 'paragraph', text: 'Every platform has built-in screenshot shortcuts. On macOS, the screenshot system is particularly powerful with multiple capture modes.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⇧⌘ 3', action: 'Capture the entire screen (macOS)', platform: 'macos' },
            { keys: '⇧⌘ 4', action: 'Capture a selected area (macOS)', platform: 'macos' },
            { keys: '⇧⌘ 5', action: 'Screenshot toolbar with options (macOS)', platform: 'macos' },
            { keys: 'PrtScn / Print Screen', action: 'Capture the entire screen (Windows)', platform: 'windows' },
            { keys: 'Win+Shift+S', action: 'Snip & Sketch — capture a selected area (Windows)', platform: 'windows' },
            { keys: 'PrtScn / Print Screen', action: 'Capture screen — varies by desktop environment (Linux)', platform: 'linux' },
          ],
        },
      ],
    },
    {
      id: 'system',
      heading: 'System Shortcuts',
      content: [
        { type: 'paragraph', text: 'These are operating system-level shortcuts that work regardless of which application is in the foreground.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ Space', action: 'Open Spotlight search (macOS)', platform: 'macos' },
            { keys: 'Win', action: 'Open Start menu / search (Windows)', platform: 'windows' },
            { keys: 'Super', action: 'Open Activities / app launcher (Linux)', platform: 'linux' },
            { keys: 'Fn / Win+.', action: 'Open emoji picker', platform: 'all' },
            { keys: '⌥⌘ Esc / Ctrl+Alt+Del', action: 'Force Quit / Task Manager', platform: 'all' },
            { keys: '⌃ Space / —', action: 'Switch input source / keyboard language (macOS)', platform: 'macos' },
          ],
        },
      ],
    },
    {
      id: 'modifier-keys',
      heading: 'Understanding Modifier Keys Across Platforms',
      content: [
        { type: 'paragraph', text: 'The biggest source of confusion when switching between platforms is the modifier keys. Here\'s how they map:' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: '⌘ Command', action: 'Primary modifier on macOS — equivalent to Ctrl on Windows/Linux', platform: 'macos' },
            { keys: '⌥ Option', action: 'Secondary modifier on macOS — equivalent to Alt on Windows/Linux', platform: 'macos' },
            { keys: '⌃ Control', action: 'Tertiary modifier on macOS — used in terminal and some apps', platform: 'macos' },
            { keys: '⇧ Shift', action: 'Same across all platforms — extends selections and reverses actions', platform: 'all' },
            { keys: 'Fn', action: 'Function key — activates F1-F12 and special functions', platform: 'all' },
          ],
        },
        { type: 'paragraph', text: 'The key insight: macOS uses Command (⌘) where Windows and Linux use Control (Ctrl). When you see a Windows shortcut like Ctrl+C, the macOS equivalent is almost always ⌘C. The physical key position is different (Command is next to the spacebar on Mac, while Ctrl is in the corner on PC keyboards), but the letter is the same.' },
        { type: 'cta', variant: 'mac-app' },
      ],
    },
    {
      id: 'tips',
      heading: 'Tips for Learning Universal Shortcuts',
      content: [
        {
          type: 'list',
          items: [
            'Start with the five most common: Copy, Paste, Undo, Save, and Find. These alone cover a huge percentage of daily keyboard interactions.',
            'Learn platform-specific modifiers once and everything else follows. On Mac, ⌘ = primary. On Windows/Linux, Ctrl = primary.',
            'Practice one new shortcut per day. Trying to memorize a full list rarely works — muscle memory builds through repetition in context.',
            'Keep a reference visible. Pin a shortcut cheat sheet near your monitor, or use a tool like KeyShortcut that floats on your screen.',
            'Use the keyboard for tasks you normally do with the mouse. Every time you catch yourself reaching for the mouse, pause and ask: is there a shortcut for this?',
          ],
        },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'conclusion',
      heading: 'Your Universal Shortcut Reference',
      content: [
        { type: 'paragraph', text: 'The shortcuts listed in this guide work across virtually every application on macOS, Windows, and Linux. They\'re the foundation of keyboard efficiency — the small, repeatable actions that compound into significant time savings over days, weeks, and years.' },
        { type: 'paragraph', text: 'Bookmark this page as a quick reference, or explore the full directory for app-specific shortcuts. And if you\'re on a Mac, KeyShortcut puts all of these shortcuts (and thousands more) right at your fingertips in a floating panel.' },
      ],
    },
  ],
}
