import { fallbackIcons } from '../data/fallbackIcons'

/* ─── Image icons for apps with real macOS icons ─── */
const imageIcons = {
  // Apple apps
  'Finder': 'finder', 'Mail': 'mail', 'Notes': 'notes', 'Calendar': 'calendar',
  'Reminders': 'reminders', 'Photos': 'photos', 'Preview': 'preview',
  'Pages': 'pages', 'Numbers': 'numbers', 'Keynote': 'keynote',
  'Messages': 'messages', 'Music': 'music', 'Safari': 'safari',
  'macOS': 'macos', 'Terminal': 'terminal',
  // Browsers
  'Chrome': 'chrome', 'Chrome DevTools': 'chrome-devtools', 'Edge': 'edge', 'Firefox': 'firefox', 'Brave': 'brave', 'Arc': 'arc',
  'Vivaldi': 'vivaldi', 'Tor Browser': 'tor-browser', 'Chromium': 'chromium', 'Opera': 'opera',
  // Development
  'Xcode': 'xcode', 'Cursor': 'cursor', 'Android Studio': 'android-studio',
  'VS Code': 'vscode', 'IntelliJ IDEA': 'intellij', 'PyCharm': 'pycharm',
  'GoLand': 'goland', 'PHPStorm': 'phpstorm', 'CLion': 'clion', 'RubyMine': 'rubymine', 'Sublime Text': 'sublime-text',
  'iTerm2': 'iterm', 'Warp': 'warp', 'Eclipse': 'eclipse', 'Vim': 'vim', 'WebStorm': 'webstorm',
  'Atom': 'atom', 'DataGrip': 'datagrip', 'DataSpell': 'dataspell', 'DBeaver': 'dbeaver',
  'Godot Engine': 'godot', 'GNU Emacs': 'emacs', 'Insomnia': 'insomnia',
  'Jupyter Notebook': 'jupyter', 'LabVIEW': 'labview', 'MATLAB': 'matlab',
  'Postman': 'postman', 'Processing': 'processing', 'PuTTY': 'putty',
  'Rider': 'rider', 'RStudio': 'rstudio', 'SourceTree': 'sourcetree',
  'Oracle SQL Developer': 'sql-developer', 'Tower': 'tower',
  'Unity': 'unity', 'Unreal Engine': 'unreal-engine', 'Visual Studio': 'visual-studio',
  // Communication
  'Slack': 'slack', 'Discord': 'discord', 'Telegram': 'telegram',
  'Zoom': 'zoom', 'Teams': 'teams', 'Gmail': 'gmail',
  // Productivity
  '1Password': '1password', 'Notion': 'notion', 'Obsidian': 'obsidian',
  'Things': 'things', 'Todoist': 'todoist', 'Linear': 'linear',
  'Raycast': 'raycast', 'Jira': 'jira', 'Trello': 'trello',
  'Asana': 'asana', 'Click Up': 'clickup', 'ClickUp': 'clickup', 'Bear': 'bear',
  'WordPress': 'wordpress', 'Confluence': 'confluence', 'GitLab': 'gitlab',
  'Jira Align': 'jira-align', 'ShotGrid': 'shotgrid', 'Stata': 'stata', 'Minitab': 'minitab',
  'GitHub': 'github', 'Google Docs': 'google-docs',
  'Google Sheets': 'google-sheets', 'Google Drive': 'google-drive',
  // Design
  'Acrobat': 'acrobat', 'Photoshop': 'photoshop', 'Sketch': 'sketch',
  'Blender': 'blender', 'After Effects': 'after-effects',
  'Illustrator': 'illustrator', 'Figma': 'figma',
  'Adobe XD': 'adobe-xd', 'Canva': 'canva', 'GIMP': 'gimp', 'Inkscape': 'inkscape',
  'Maya': 'maya', 'Webflow': 'webflow',
  // Microsoft Office
  'Word': 'word', 'Excel': 'excel', 'PowerPoint': 'powerpoint',
  // Media
  'Spotify': 'spotify', 'VLC': 'vlc', 'DaVinci Resolve': 'davinci-resolve',
  'Final Cut Pro': 'final-cut-pro', 'Premiere Pro': 'premiere-pro',
  // Platforms
  'Windows': 'windows', 'Linux Desktop': 'linux',
}

export function getIconData(name) {
  if (imageIcons[name]) return { type: 'image', src: `/images/app-icons/${imageIcons[name]}.webp` }
  if (fallbackIcons[name]) return { type: 'fallback', ...fallbackIcons[name] }
  return { type: 'fallback', hex: '86868b', label: name[0] }
}

export const slugToIconName = {
  'vscode': 'VS Code', 'vlc': 'VLC', 'iterm': 'iTerm2', '1password': '1Password',
  'clion': 'CLion', 'phpstorm': 'PHPStorm', 'pycharm': 'PyCharm', 'goland': 'GoLand',
  'rubymine': 'RubyMine', 'chrome-devtools': 'Chrome DevTools', 'intellij': 'IntelliJ IDEA',
  'davinci-resolve': 'DaVinci Resolve', 'final-cut-pro': 'Final Cut Pro',
  'after-effects': 'After Effects', 'sublime-text': 'Sublime Text',
  'android-studio': 'Android Studio', 'google-docs': 'Google Docs',
  'google-sheets': 'Google Sheets', 'google-drive': 'Google Drive',
  'powerpoint': 'PowerPoint', 'github': 'GitHub', 'gmail': 'Gmail',
  'tor-browser': 'Tor Browser', 'webstorm': 'WebStorm', 'wordpress': 'WordPress',
  'premiere-pro': 'Premiere Pro', 'adobe-xd': 'Adobe XD', 'shotgrid': 'ShotGrid',
  'datagrip': 'DataGrip', 'dataspell': 'DataSpell', 'dbeaver': 'DBeaver',
  'emacs': 'GNU Emacs', 'godot': 'Godot Engine', 'spss': 'IBM SPSS Statistics',
  'jira-align': 'Jira Align', 'jupyter': 'Jupyter Notebook',
  'labview': 'LabVIEW', 'matlab': 'MATLAB', 'putty': 'PuTTY',
  'rstudio': 'RStudio', 'sourcetree': 'SourceTree', 'sql-developer': 'Oracle SQL Developer',
  'tortoisegit': 'TortoiseGit', 'unreal-engine': 'Unreal Engine',
  'visual-studio': 'Visual Studio',
  // Cross-platform entries
  'windows': 'Windows', 'linux': 'Linux Desktop',
}
