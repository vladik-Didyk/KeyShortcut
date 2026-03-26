import { useState, useCallback } from 'react'
import { useInView } from '../hooks/useInView'
import { MAC_ROWS, WIN_ROWS, MAC_SHORTCUTS, WIN_SHORTCUTS } from '../data/keyboardLayout'
import { CONTENT } from '../data/content'

// ─── Modifier display symbols ───
const MAC_SYMBOLS = { ctrl: '⌃', opt: '⌥', cmd: '⌘', shift: '⇧' }
const WIN_SYMBOLS = { ctrl: 'Ctrl', alt: 'Alt', win: '⊞', shift: 'Shift' }

// ─── Modifier ordering for combo strings ───
const MAC_MOD_ORDER = ['ctrl', 'opt', 'cmd', 'shift']
const WIN_MOD_ORDER = ['ctrl', 'shift', 'alt', 'win']

function buildCombo(mods, key, order) {
  const active = order.filter(m => mods.has(m))
  if (active.length === 0) return null
  return [...active, key].join('+')
}

function formatCombo(mods, key, order, symbols) {
  const parts = order.filter(m => mods.has(m)).map(m => symbols[m])
  if (key) parts.push(key.length === 1 ? key.toUpperCase() : key)
  return parts.join(' + ')
}

// ─── Component ───
export default function InteractiveKeyboard() {
  const [ref, isVisible] = useInView()
  const [platform, setPlatform] = useState('mac')
  const [mods, setMods] = useState(new Set())
  const [result, setResult] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const rows = platform === 'mac' ? MAC_ROWS : WIN_ROWS
  const shortcuts = platform === 'mac' ? MAC_SHORTCUTS : WIN_SHORTCUTS
  const modOrder = platform === 'mac' ? MAC_MOD_ORDER : WIN_MOD_ORDER
  const modSymbols = platform === 'mac' ? MAC_SYMBOLS : WIN_SYMBOLS
  const { interactiveKeyboard: kb } = CONTENT.productPage

  const switchPlatform = useCallback((p) => {
    setPlatform(p)
    setMods(new Set())
    setResult(null)
  }, [])

  const handleKey = useCallback((key) => {
    if (key.mod) {
      setMods(prev => {
        const next = new Set(prev)
        if (next.has(key.mod)) next.delete(key.mod)
        else next.add(key.mod)
        return next
      })
      setResult(null)
    } else {
      const combo = buildCombo(mods, key.id, modOrder)
      const action = combo ? shortcuts[combo] : null
      if (combo) {
        setResult({
          display: formatCombo(mods, key.id, modOrder, modSymbols),
          action,
        })
        setAnimKey(k => k + 1)
      }
      setMods(new Set())
    }
  }, [mods, modOrder, shortcuts, modSymbols])

  const activeDisplay = mods.size > 0
    ? formatCombo(mods, null, modOrder, modSymbols) + ' + …'
    : null

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[820px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-5">
          {kb.title} <span className="text-accent">{kb.titleAccent}</span>
        </h2>
        <p className="text-theme-muted text-lg text-center mb-10 md:mb-14 max-w-xl mx-auto">
          {kb.subtitle}
        </p>

        {/* Platform tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {['mac', 'win'].map(p => (
            <button
              key={p}
              onClick={() => switchPlatform(p)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border-none cursor-pointer ${
                platform === p
                  ? 'bg-theme-accent text-theme-base'
                  : 'bg-theme-base-alt text-theme-muted hover:text-theme-text'
              }`}
            >
              {kb.platformLabels[p]}
            </button>
          ))}
        </div>

        {/* Result display */}
        <div className="h-16 flex items-center justify-center mb-6">
          {result ? (
            <div
              key={animKey}
              className="text-center animate-[kb-pop_0.3s_ease-out]"
            >
              <span className="text-lg font-semibold text-theme-text">{result.display}</span>
              {result.action ? (
                <span className="ml-3 text-lg text-accent font-semibold">→ {result.action}</span>
              ) : (
                <span className="ml-3 text-lg text-theme-muted">{kb.notAssigned}</span>
              )}
            </div>
          ) : activeDisplay ? (
            <span className="text-lg font-semibold text-theme-accent">{activeDisplay}</span>
          ) : (
            <span className="text-sm text-theme-muted">
              {kb.hints[platform]}
            </span>
          )}
        </div>

        {/* Keyboard — desktop only */}
        <div className="hidden md:block retro-window">
          <div className="retro-window-titlebar">
            <span className="retro-window-dot" />
            <span className="retro-window-dot" />
            <span className="retro-window-dot" />
            <span className="ml-2 text-xs text-theme-muted font-mono">keyboard</span>
          </div>
          <div className="p-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-[3px] mb-[3px] last:mb-0">
                {row.map((key) => {
                  const isActive = key.mod && mods.has(key.mod)
                  const isFRow = ri === 0

                  return (
                    <button
                      key={key.id}
                      onClick={() => handleKey(key)}
                      title={key.mod ? key.mod : key.id}
                      className={`
                        ${isFRow ? 'h-7 text-[10px]' : 'h-10 text-xs'}
                        rounded-[4px] font-medium
                        flex items-center justify-center
                        select-none cursor-pointer
                        outline-none focus-visible:ring-1 focus-visible:ring-theme-accent
                        keycap-interactive
                      `}
                      data-active={isActive}
                      style={{ flex: key.w }}
                    >
                      {key.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile fallback */}
        <p className="md:hidden text-center text-theme-muted text-sm">
          {kb.mobileFallback}
        </p>
      </div>

    </section>
  )
}
