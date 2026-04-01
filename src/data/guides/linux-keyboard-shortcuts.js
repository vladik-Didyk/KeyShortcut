export default {
  slug: 'linux-keyboard-shortcuts',
  title: 'Mastering Linux Keyboard Shortcuts: Tips and Tricks',
  description: 'A comprehensive guide to Linux keyboard shortcuts for GNOME, KDE, terminal, file management, and popular Linux applications. From beginner essentials to power user tricks.',
  published: '2026-03-31',
  lastUpdated: '2026-03-31',
  readingTime: '10 min read',
  category: 'Reference',
  relatedSlugs: ['universal-shortcuts-all-platforms', 'keyboard-shortcuts-productivity-guide'],
  relatedApps: [
    { label: 'Linux Shortcuts', to: '/linux' },
    { label: 'VS Code Linux Shortcuts', to: '/linux/vs-code' },
    { label: 'Chrome Linux Shortcuts', to: '/linux/chrome' },
  ],
  sections: [
    {
      id: 'introduction',
      heading: 'Linux and the Keyboard: A Natural Fit',
      content: [
        { type: 'paragraph', text: 'Linux has always been a keyboard-first operating system. From its Unix roots with command-line interfaces to modern desktop environments like GNOME and KDE, keyboard efficiency is deeply embedded in the Linux philosophy. Power users, developers, and sysadmins who work on Linux tend to rely heavily on shortcuts — and the OS rewards them for it.' },
        { type: 'paragraph', text: 'This guide covers essential keyboard shortcuts across the Linux desktop stack: desktop environment shortcuts, file manager navigation, terminal commands, and application-specific shortcuts. Whether you\'re new to Linux or looking to level up your workflow, these shortcuts will make you significantly faster.' },
      ],
    },
    {
      id: 'gnome',
      heading: 'GNOME Desktop Shortcuts',
      content: [
        { type: 'paragraph', text: 'GNOME is the default desktop environment on Ubuntu, Fedora, and many other popular distributions. Its shortcuts are clean and consistent.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'Super', action: 'Open Activities overview (app launcher + workspace view)', platform: 'linux' },
            { keys: 'Super+A', action: 'Open the application grid (all apps)', platform: 'linux' },
            { keys: 'Super+L', action: 'Lock the screen', platform: 'linux' },
            { keys: 'Super+↑', action: 'Maximize the current window', platform: 'linux' },
            { keys: 'Super+↓', action: 'Restore / unmaximize the window', platform: 'linux' },
            { keys: 'Super+← / →', action: 'Snap window to left / right half', platform: 'linux' },
            { keys: 'Super+Home', action: 'Switch to the first workspace', platform: 'linux' },
            { keys: 'Ctrl+Alt+↑/↓', action: 'Switch between workspaces', platform: 'linux' },
            { keys: 'Ctrl+Alt+Shift+↑/↓', action: 'Move current window to another workspace', platform: 'linux' },
            { keys: 'Alt+Tab', action: 'Switch between open applications', platform: 'linux' },
            { keys: 'Alt+`', action: 'Switch between windows of the same application', platform: 'linux' },
            { keys: 'Alt+F2', action: 'Open the command dialog (run a command)', platform: 'linux' },
          ],
        },
        { type: 'paragraph', text: 'The Super key (usually the Windows key on your keyboard) is the gateway to GNOME. Pressing it opens the Activities overview where you can type to search for apps, files, and settings — similar to Spotlight on macOS.' },
      ],
    },
    {
      id: 'kde',
      heading: 'KDE Plasma Shortcuts',
      content: [
        { type: 'paragraph', text: 'KDE Plasma is highly customizable and has its own set of default shortcuts. If you\'re on Kubuntu, openSUSE, or KDE Neon, these are your starting point.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'Super', action: 'Open the application launcher', platform: 'linux' },
            { keys: 'Alt+Space', action: 'Open KRunner (command launcher and search)', platform: 'linux' },
            { keys: 'Ctrl+F8', action: 'Show desktop grid (all workspaces)', platform: 'linux' },
            { keys: 'Ctrl+Alt+L', action: 'Lock the screen', platform: 'linux' },
            { keys: 'Super+↑/↓/←/→', action: 'Snap window to quarter or half of screen', platform: 'linux' },
            { keys: 'Ctrl+F9', action: 'Show all windows on current desktop (Exposé)', platform: 'linux' },
            { keys: 'Ctrl+Alt+D', action: 'Show the desktop (minimize all windows)', platform: 'linux' },
          ],
        },
        { type: 'paragraph', text: 'KDE\'s big advantage is customization. You can remap virtually any shortcut through System Settings → Shortcuts. If a default binding conflicts with your workflow, change it. KDE also supports custom global shortcuts that trigger any shell command.' },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'terminal',
      heading: 'Terminal Shortcuts',
      content: [
        { type: 'paragraph', text: 'The terminal is where Linux power users spend a significant portion of their time. These shortcuts work in most terminal emulators (GNOME Terminal, Konsole, Alacritty, kitty) and are based on readline — the same input library used by Bash, Zsh, and many other shells.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'Ctrl+C', action: 'Cancel the current command / send SIGINT', platform: 'linux' },
            { keys: 'Ctrl+Z', action: 'Suspend the current process (resume with "fg")', platform: 'linux' },
            { keys: 'Ctrl+D', action: 'Exit the shell (or send EOF)', platform: 'linux' },
            { keys: 'Ctrl+L', action: 'Clear the terminal screen', platform: 'linux' },
            { keys: 'Ctrl+R', action: 'Reverse search through command history', platform: 'linux' },
            { keys: 'Ctrl+A', action: 'Move cursor to beginning of line', platform: 'linux' },
            { keys: 'Ctrl+E', action: 'Move cursor to end of line', platform: 'linux' },
            { keys: 'Ctrl+W', action: 'Delete the word before the cursor', platform: 'linux' },
            { keys: 'Ctrl+U', action: 'Delete from cursor to beginning of line', platform: 'linux' },
            { keys: 'Ctrl+K', action: 'Delete from cursor to end of line', platform: 'linux' },
            { keys: 'Alt+B / Alt+F', action: 'Move cursor back / forward one word', platform: 'linux' },
            { keys: '!!', action: 'Repeat the last command (in Bash/Zsh)', platform: 'linux' },
            { keys: 'sudo !!', action: 'Re-run last command with sudo', platform: 'linux' },
          ],
        },
        { type: 'callout', text: 'Ctrl+R is the most underused terminal shortcut. It lets you search through your entire command history by typing a few characters. Press Ctrl+R, type "docker", and it finds your most recent docker command. Press Ctrl+R again to cycle through older matches.' },
      ],
    },
    {
      id: 'file-manager',
      heading: 'File Manager Shortcuts',
      content: [
        { type: 'paragraph', text: 'GNOME Files (Nautilus) and KDE\'s Dolphin are the two most common Linux file managers. Their shortcuts follow familiar patterns.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'Ctrl+L', action: 'Edit the location bar (type a path)', platform: 'linux' },
            { keys: 'Ctrl+T', action: 'Open a new tab', platform: 'linux' },
            { keys: 'Ctrl+W', action: 'Close the current tab', platform: 'linux' },
            { keys: 'Alt+↑', action: 'Go to parent directory', platform: 'linux' },
            { keys: 'Alt+← / →', action: 'Go back / forward in history', platform: 'linux' },
            { keys: 'Ctrl+H', action: 'Toggle showing hidden files', platform: 'linux' },
            { keys: 'F2', action: 'Rename the selected file', platform: 'linux' },
            { keys: 'Delete', action: 'Move to trash', platform: 'linux' },
            { keys: 'Shift+Delete', action: 'Permanently delete (bypass trash)', platform: 'linux' },
            { keys: 'Ctrl+Shift+N', action: 'Create a new folder', platform: 'linux' },
          ],
        },
      ],
    },
    {
      id: 'text-editing',
      heading: 'Text Editing Shortcuts',
      content: [
        { type: 'paragraph', text: 'These shortcuts work in most Linux text editors, browsers, and input fields. They\'re based on Emacs-style bindings that are built into GTK and Qt text widgets.' },
        {
          type: 'shortcut-table',
          shortcuts: [
            { keys: 'Ctrl+A', action: 'Select all text', platform: 'linux' },
            { keys: 'Ctrl+C / Ctrl+V', action: 'Copy / Paste', platform: 'linux' },
            { keys: 'Ctrl+X', action: 'Cut selected text', platform: 'linux' },
            { keys: 'Ctrl+Z / Ctrl+Shift+Z', action: 'Undo / Redo', platform: 'linux' },
            { keys: 'Ctrl+← / →', action: 'Move cursor word by word', platform: 'linux' },
            { keys: 'Home / End', action: 'Move cursor to beginning / end of line', platform: 'linux' },
            { keys: 'Ctrl+Home / End', action: 'Move cursor to beginning / end of document', platform: 'linux' },
            { keys: 'Shift+Ctrl+← / →', action: 'Select word by word', platform: 'linux' },
          ],
        },
      ],
    },
    {
      id: 'power-user-tips',
      heading: 'Power User Tips',
      content: [
        {
          type: 'list',
          items: [
            'Use xdotool or xbindkeys to create custom global shortcuts that run any shell command. On Wayland, use wtype and sway/Hyprland key bindings instead.',
            'Set up Vi-style key bindings in your shell by adding "set -o vi" to your .bashrc or .zshrc. This lets you edit commands with Vim motions.',
            'Learn tmux shortcuts if you work with multiple terminal sessions. Ctrl+B is the default prefix — then d (detach), c (new window), n/p (next/previous window).',
            'Use Ctrl+Alt+T as a universal terminal launcher — it works on most Linux distributions out of the box.',
            'Master "Alt+." (Alt+period) in Bash — it inserts the last argument from the previous command. Useful for operations on the same file: "ls -la /some/path" then "cd Alt+.".',
          ],
        },
        { type: 'ad', variant: 'in-article' },
      ],
    },
    {
      id: 'customization',
      heading: 'Customizing Linux Shortcuts',
      content: [
        { type: 'paragraph', text: 'One of Linux\'s greatest strengths is customizability. You can remap any shortcut at multiple levels:' },
        {
          type: 'list',
          items: [
            'Desktop environment: GNOME Settings → Keyboard → Keyboard Shortcuts. KDE System Settings → Shortcuts.',
            'Application level: Most Linux apps support custom keybindings in their settings.',
            'System level: Tools like xbindkeys (X11) or custom key bindings in your compositor config (Sway, Hyprland).',
            'Shell level: .inputrc for readline bindings, or shell-specific configurations.',
          ],
        },
        { type: 'paragraph', text: 'The ability to customize at every level means you can build a shortcut system that exactly matches your workflow — something that\'s much harder to achieve on macOS or Windows.' },
      ],
    },
    {
      id: 'conclusion',
      heading: 'Embrace the Keyboard',
      content: [
        { type: 'paragraph', text: 'Linux rewards keyboard-driven workflows more than any other operating system. The tools are there, the customization options are endless, and the community actively shares configurations and tips. Start with the desktop and terminal shortcuts in this guide, then gradually customize your setup as you discover your preferences.' },
        { type: 'paragraph', text: 'For a complete reference of shortcuts across all your Linux applications, browse our Linux shortcuts directory — searchable, organized by app and category, with downloadable PDF cheat sheets for every app.' },
        { type: 'cta', variant: 'mac-app' },
      ],
    },
  ],
}
