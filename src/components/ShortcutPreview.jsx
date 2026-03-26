import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

const symbolLabels = {
  '⌘': 'Cmd',
  '⌥': 'Option',
  '⇧': 'Shift',
  '⌃': 'Ctrl',
  '⎋': 'Esc',
  '⌫': 'Delete',
  '⇥': 'Tab',
}

function parseKeys(keyString) {
  const tokens = []
  for (const char of keyString) {
    if (symbolLabels[char]) {
      tokens.push(symbolLabels[char])
    } else if (char === ' ') {
      // Space between tokens means a literal Space key
      tokens.push('Space')
    } else {
      // Letters, numbers, Fn, etc — keep as-is but may need to group
      // Check if the last token is a plain string we can append to
      const last = tokens[tokens.length - 1]
      if (last && !symbolLabels[last] && last !== 'Space' && /^[A-Za-z0-9]+$/.test(last) && /^[A-Za-z0-9]$/.test(char)) {
        tokens[tokens.length - 1] = last + char
      } else {
        tokens.push(char)
      }
    }
  }
  return tokens
}

export default function ShortcutPreview() {
  const [ref, isVisible] = useInView()
  const { shortcutPreview } = CONTENT.productPage
  const previewShortcuts = shortcutPreview.shortcuts.slice(0, 10)

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[980px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-5">
          {shortcutPreview.title}
        </h2>
        <p className="text-theme-muted text-lg text-center mb-10 md:mb-14 max-w-xl mx-auto">
          {shortcutPreview.subtitle}
        </p>

        <div className="retro-window">
          <div className="retro-window-titlebar">
            <span className="retro-window-dot" />
            <span className="retro-window-dot" />
            <span className="retro-window-dot" />
            <span className="ml-2 text-xs text-theme-muted font-mono">shortcuts</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid gap-3">
              {previewShortcuts.map((s) => (
                <div
                  key={s.keys}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-theme-base-alt transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 mr-4">
                    <span className="font-medium text-theme-text text-[15px]">{s.action}</span>
                    <span className="text-theme-muted text-sm truncate">{s.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {parseKeys(s.keys).map((key, i) => (
                      <kbd key={i} className="keycap">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
