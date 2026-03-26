import { useMemo } from 'react'
import { parseKeyParts } from '../utils/platformHelpers'

// Check if a shortcut's modifiers are a superset of (or equal to) the highlighted modifiers
function modsMatch(shortcutMods, highlightedMods) {
  if (highlightedMods.size === 0) return false
  for (const m of highlightedMods) {
    if (!shortcutMods.includes(m)) return false
  }
  return shortcutMods.length > 0
}

export default function AppPanelMockup({
  app,
  highlightedModifiers,
  highlightedShortcut,
  transitioning,
  compact = false,
}) {
  const matchingCount = useMemo(() => {
    if (!highlightedModifiers || highlightedModifiers.size === 0) return 0
    return app.shortcuts.filter(s => modsMatch(s.modifiers, highlightedModifiers)).length
  }, [app, highlightedModifiers])

  const countLabel = highlightedModifiers?.size > 0
    ? `${matchingCount} of ${app.shortcutCount}`
    : `${app.shortcuts.length} of ${app.shortcutCount}`

  return (
    <div
      aria-hidden="true"
      className={`
        panel-mockup retro-window
        ${compact ? 'w-[280px]' : 'w-[340px] sm:w-[360px]'}
        transition-all duration-500
        ${transitioning ? 'panel-crossfade' : ''}
      `}
    >
      {/* Retro titlebar */}
      <div className={`retro-window-titlebar ${compact ? 'px-3 py-2' : ''}`}>
        <span className="retro-window-dot" />
        <span className="retro-window-dot" />
        <span className="retro-window-dot" />
        <img
          src={`/images/app-icons/${app.slug}.webp`}
          alt={app.name}
          className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-md shrink-0 ml-2`}
        />
        <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} text-theme-text truncate`}>{app.name}</span>
        <span className={`ml-auto ${compact ? 'text-[10px]' : 'text-[11px]'} text-theme-muted whitespace-nowrap`}>{countLabel}</span>
      </div>

      {/* Shortcut rows */}
      <div className={compact ? 'px-1 py-1' : 'px-1.5 py-1.5'}>
        {app.shortcuts.map((sc) => {
          const isExact = highlightedShortcut?.action === sc.action
          const isModMatch = !isExact && modsMatch(sc.modifiers, highlightedModifiers)

          return (
            <div
              key={sc.action}
              className={`
                flex items-center justify-between gap-1.5
                ${compact ? 'px-2 py-[5px]' : 'px-3 py-[7px]'}
                rounded-lg transition-colors duration-200
                ${isExact ? 'shortcut-row-exact-match' : ''}
                ${isModMatch ? 'shortcut-row-mod-match' : ''}
              `}
            >
              <span
                className={`${compact ? 'text-[11px]' : 'text-[13px]'} truncate ${
                  isExact ? 'text-theme-accent-text font-semibold' : 'text-theme-text'
                }`}
              >
                {sc.action}
              </span>
              <div className="flex gap-[2px] shrink-0">
                {parseKeyParts(sc.modifiers, sc.key).map((part, i) => (
                  <span
                    key={i}
                    className={`${compact ? 'keycap-tiny' : 'keycap-mini'} ${isExact ? (compact ? 'keycap-tiny-active' : 'keycap-mini-active') : ''}`}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
