import { useNavigate } from 'react-router'
import { ArrowRight } from '../utils/icons'
import { parseKeyParts } from '../utils/platformHelpers'

export default function SearchDropdown({ results, platform, onClose }) {
  const navigate = useNavigate()
  const { appMatches = [], shortcutMatches = [], otherApps = [] } = results || {}
  const hasResults = appMatches.length > 0 || shortcutMatches.length > 0
  if (!hasResults) return null

  const goTo = (href) => {
    navigate(href)
    onClose()
  }

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 bg-theme-base border border-theme-border rounded-xl shadow-lg overflow-hidden z-50 max-h-[420px] overflow-y-auto"
      role="listbox"
    >
      {/* App matches */}
      {appMatches.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider px-2 mb-1">Apps</p>
          {appMatches.map(app => (
            <button
              key={app.slug}
              onClick={() => goTo(`/${platform}/${app.slug}`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border-none bg-transparent hover:bg-theme-base-alt transition-colors text-left"
            >
              <img
                src={`/images/app-icons/${app.slug}.webp`}
                alt=""
                width={28}
                height={28}
                className="rounded-lg shrink-0"
                onError={e => { e.target.style.display = 'none' }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-medium text-theme-text">{app.name}</span>
                <span className="text-[13px] text-theme-muted ml-2">{app.shortcutCount} shortcuts</span>
              </div>
              <ArrowRight size={14} className="text-theme-muted shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Shortcut matches */}
      {shortcutMatches.length > 0 && (
        <div className="px-3 pt-2 pb-3">
          {appMatches.length > 0 && shortcutMatches.length > 0 && (
            <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider px-2 mb-1 mt-1">Shortcuts</p>
          )}
          {shortcutMatches.map(group => (
            <div key={group.appSlug} className="mb-2 last:mb-0">
              <button
                onClick={() => goTo(`/${platform}/${group.appSlug}`)}
                className="w-full flex items-center gap-2 px-2 py-1.5 cursor-pointer border-none bg-transparent hover:bg-theme-base-alt rounded-md transition-colors text-left"
              >
                <img
                  src={`/images/app-icons/${group.appSlug}.webp`}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-md shrink-0"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <span className="text-[13px] font-semibold text-theme-text">{group.appName}</span>
                <span className="text-[11px] text-theme-muted">› {group.category}</span>
              </button>
              <div className="ml-7 mt-0.5">
                {group.shortcuts.map((sc, i) => (
                  <button
                    key={`${sc.action}-${i}`}
                    onClick={() => goTo(`/${platform}/${group.appSlug}`)}
                    className="w-full flex items-center justify-between px-2 py-1.5 cursor-pointer border-none bg-transparent hover:bg-theme-base-alt rounded-md transition-colors text-left"
                  >
                    <span className="text-[14px] text-theme-text truncate">{sc.action}</span>
                    <span className="flex items-center gap-0.5 shrink-0 ml-3">
                      {parseKeyParts(sc.modifiers, sc.key).map((part, j) => (
                        <kbd key={j} className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded text-[11px] font-medium text-theme-muted bg-theme-base-alt border border-theme-border">
                          {part}
                        </kbd>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "Also in" footer */}
      {otherApps.length > 0 && (
        <div className="px-5 py-2.5 border-t border-theme-border bg-theme-base-alt">
          <p className="text-[12px] text-theme-muted">
            Also in: {otherApps.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
