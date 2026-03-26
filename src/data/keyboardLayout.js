// ─── Shared Mac keyboard layout ───
export const MAC_ROWS = [
  [
    { id: 'esc', label: 'esc', w: 1.3 },
    ...['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].map(f => ({
      id: f.toLowerCase(), label: f, w: 1,
    })),
  ],
  [
    { id: '`', label: '`', w: 1 },
    ...['1','2','3','4','5','6','7','8','9','0'].map(n => ({ id: n, label: n, w: 1 })),
    { id: '-', label: '–', w: 1 }, { id: '=', label: '=', w: 1 },
    { id: 'delete', label: '⌫', w: 1.5 },
  ],
  [
    { id: 'tab', label: '⇥', w: 1.5 },
    ...'qwertyuiop'.split('').map(k => ({ id: k, label: k.toUpperCase(), w: 1 })),
    { id: '[', label: '[', w: 1 }, { id: ']', label: ']', w: 1 },
    { id: '\\', label: '\\', w: 1 },
  ],
  [
    { id: 'caps', label: '⇪', w: 1.75 },
    ...'asdfghjkl'.split('').map(k => ({ id: k, label: k.toUpperCase(), w: 1 })),
    { id: ';', label: ';', w: 1 }, { id: "'", label: "'", w: 1 },
    { id: 'return', label: '↩', w: 1.75 },
  ],
  [
    { id: 'shift-l', label: '⇧', w: 2.25, mod: 'shift' },
    ...'zxcvbnm'.split('').map(k => ({ id: k, label: k.toUpperCase(), w: 1 })),
    { id: ',', label: ',', w: 1 }, { id: '.', label: '.', w: 1 },
    { id: '/', label: '/', w: 1 },
    { id: 'shift-r', label: '⇧', w: 2.25, mod: 'shift' },
  ],
  [
    { id: 'fn', label: 'fn', w: 1 },
    { id: 'ctrl', label: '⌃', w: 1, mod: 'ctrl' },
    { id: 'opt-l', label: '⌥', w: 1.25, mod: 'opt' },
    { id: 'cmd-l', label: '⌘', w: 1.5, mod: 'cmd' },
    { id: 'space', label: '', w: 5.5 },
    { id: 'cmd-r', label: '⌘', w: 1.5, mod: 'cmd' },
    { id: 'opt-r', label: '⌥', w: 1.25, mod: 'opt' },
    { id: 'left', label: '◀', w: 1 },
    { id: 'up', label: '▲', w: 1 },
    { id: 'down', label: '▼', w: 1 },
    { id: 'right', label: '▶', w: 1 },
  ],
]

// ─── Windows keyboard layout ───
export const WIN_ROWS = [
  MAC_ROWS[0], // F-row same
  [
    { id: '`', label: '`', w: 1 },
    ...['1','2','3','4','5','6','7','8','9','0'].map(n => ({ id: n, label: n, w: 1 })),
    { id: '-', label: '–', w: 1 }, { id: '=', label: '=', w: 1 },
    { id: 'backspace', label: '⌫', w: 1.5 },
  ],
  MAC_ROWS[2], // QWERTY same
  [
    { id: 'caps', label: 'Caps', w: 1.75 },
    ...'asdfghjkl'.split('').map(k => ({ id: k, label: k.toUpperCase(), w: 1 })),
    { id: ';', label: ';', w: 1 }, { id: "'", label: "'", w: 1 },
    { id: 'enter', label: 'Enter', w: 1.75 },
  ],
  [
    { id: 'shift-l', label: 'Shift', w: 2.25, mod: 'shift' },
    ...'zxcvbnm'.split('').map(k => ({ id: k, label: k.toUpperCase(), w: 1 })),
    { id: ',', label: ',', w: 1 }, { id: '.', label: '.', w: 1 },
    { id: '/', label: '/', w: 1 },
    { id: 'shift-r', label: 'Shift', w: 2.25, mod: 'shift' },
  ],
  [
    { id: 'ctrl-l', label: 'Ctrl', w: 1.3, mod: 'ctrl' },
    { id: 'fn', label: 'Fn', w: 1 },
    { id: 'win-l', label: '⊞', w: 1.25, mod: 'win' },
    { id: 'alt-l', label: 'Alt', w: 1.5, mod: 'alt' },
    { id: 'space', label: '', w: 5.5 },
    { id: 'alt-r', label: 'Alt', w: 1.25, mod: 'alt' },
    { id: 'ctrl-r', label: 'Ctrl', w: 1.3, mod: 'ctrl' },
    { id: 'left', label: '◀', w: 1 },
    { id: 'up', label: '▲', w: 1 },
    { id: 'down', label: '▼', w: 1 },
    { id: 'right', label: '▶', w: 1 },
  ],
]

// ─── Shortcut databases ───
export const MAC_SHORTCUTS = {
  'cmd+a': 'Select All', 'cmd+b': 'Bold', 'cmd+c': 'Copy',
  'cmd+d': 'Bookmark', 'cmd+f': 'Find', 'cmd+g': 'Find Next',
  'cmd+h': 'Hide App', 'cmd+i': 'Italic', 'cmd+k': 'Insert Link',
  'cmd+l': 'Address Bar', 'cmd+m': 'Minimize', 'cmd+n': 'New Window',
  'cmd+o': 'Open', 'cmd+p': 'Print', 'cmd+q': 'Quit',
  'cmd+r': 'Reload', 'cmd+s': 'Save', 'cmd+t': 'New Tab',
  'cmd+u': 'Underline', 'cmd+v': 'Paste', 'cmd+w': 'Close Window',
  'cmd+x': 'Cut', 'cmd+z': 'Undo', 'cmd+shift+z': 'Redo',
  'cmd+shift+n': 'New Folder', 'cmd+shift+t': 'Reopen Tab',
  'cmd+shift+3': 'Screenshot', 'cmd+shift+4': 'Screenshot Selection',
  'cmd+shift+5': 'Screenshot Options',
  'cmd+opt+esc': 'Force Quit', 'ctrl+cmd+space': 'Emoji Picker',
  'cmd+space': 'Spotlight', 'cmd+tab': 'Switch Apps',
  'cmd+delete': 'Move to Trash', 'cmd+,': 'Preferences',
  'cmd+[': 'Back', 'cmd+]': 'Forward',
}

export const WIN_SHORTCUTS = {
  'ctrl+a': 'Select All', 'ctrl+b': 'Bold', 'ctrl+c': 'Copy',
  'ctrl+d': 'Bookmark', 'ctrl+f': 'Find', 'ctrl+g': 'Find Next',
  'ctrl+h': 'Replace', 'ctrl+i': 'Italic', 'ctrl+k': 'Insert Link',
  'ctrl+l': 'Address Bar', 'ctrl+n': 'New Window',
  'ctrl+o': 'Open', 'ctrl+p': 'Print', 'ctrl+r': 'Reload',
  'ctrl+s': 'Save', 'ctrl+t': 'New Tab', 'ctrl+u': 'Underline',
  'ctrl+v': 'Paste', 'ctrl+w': 'Close Tab', 'ctrl+x': 'Cut',
  'ctrl+y': 'Redo', 'ctrl+z': 'Undo', 'ctrl+shift+z': 'Redo',
  'ctrl+shift+n': 'Private Window', 'ctrl+shift+t': 'Reopen Tab',
  'ctrl+shift+esc': 'Task Manager',
  'alt+f4': 'Close Window', 'alt+tab': 'Switch Apps',
  'win+d': 'Show Desktop', 'win+e': 'File Explorer',
  'win+l': 'Lock Screen', 'win+r': 'Run Dialog',
  'win+s': 'Search', 'win+shift+s': 'Screenshot',
  'win+tab': 'Task View',
}
