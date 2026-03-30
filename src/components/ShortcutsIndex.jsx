import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { Search, X } from '../utils/icons'
import { groupByCategories } from '../utils/platformHelpers'
import { buildSearchIndex, searchIndex, parseAppQuery } from '../utils/searchHelpers'
import { categoryConfig } from '../data/categoryConfig'
import { CONTENT } from '../data/content'
import AppCard from './directory/AppCard'
import SearchDropdown from './SearchDropdown'
import AdSlot from './AdSlot'

export default function ShortcutsIndex() {
  const { platformId: platform, platformName, apps, categories } = useLoaderData()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(true)
  const searchRef = useRef(null)
  const searchContainerRef = useRef(null)
  const navigate = useNavigate()

  const totalShortcuts = useMemo(() => {
    return apps.reduce((s, a) => s + a.shortcutCount, 0)
  }, [apps])

  // Smart search index
  const searchIdx = useMemo(() => buildSearchIndex(apps), [apps])
  const smartResults = useMemo(() => searchIndex(searchIdx, search), [searchIdx, search])
  const hasSmartResults = smartResults.appMatches.length > 0 || smartResults.shortcutMatches.length > 0

  const grouped = useMemo(() => {
    let filtered = apps
    if (search) {
      const appNames = apps.map(a => ({ name: a.displayName, slug: a.slug }))
      const parsed = parseAppQuery(search, appNames)
      if (parsed.app) {
        filtered = apps.filter(a => a.slug === parsed.app.slug)
      } else {
        filtered = apps.filter(a => {
          const lower = a.displayName.toLowerCase()
          return parsed.allTokens.some(t => lower.includes(t))
        })
      }
    }
    return groupByCategories(filtered, categories)
  }, [apps, search, categories])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearch('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const onMouseDown = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div className="min-h-screen bg-theme-base">
      <header className="pt-12 pb-10 px-5 md:px-6">
        <div className="mx-auto max-w-[1080px]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-text transition-colors mb-8 no-underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {CONTENT.directory.backLabel}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {platformName} Shortcuts
          </h1>
          <p className="text-theme-muted text-sm mb-4">
            {`${apps.length} apps · ${totalShortcuts.toLocaleString()} keyboard shortcuts`}
          </p>
          <p className="text-theme-muted text-[15px] leading-relaxed max-w-[720px] mb-3">
            {CONTENT.directory.intro(platformName, apps.length, totalShortcuts)}
          </p>
          <p className="text-theme-muted text-[15px] leading-relaxed max-w-[720px] mb-6">
            {CONTENT.directory.learnMore(platformName)}
          </p>

          {/* ─── Modifier Keys Reference ─── */}
          <div className="max-w-[720px] mb-8 rounded-2xl bg-theme-base-alt border border-theme-border p-5">
            <h2 className="text-sm font-semibold tracking-tight mb-3">{CONTENT.directory.modifierTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTENT.directory.modifierExplainer(platformName).map(mod => (
                <div key={mod.name} className="flex gap-3 items-start">
                  <kbd className="keycap-mini shrink-0 mt-0.5">{mod.symbol}</kbd>
                  <div>
                    <span className="text-sm font-medium text-theme-text">{mod.name}</span>
                    <p className="text-xs text-theme-muted leading-relaxed mt-0.5">{mod.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={searchContainerRef} className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="text"
              placeholder={CONTENT.directory.searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && search) {
                  e.preventDefault()
                  const topApp = smartResults.appMatches[0]
                  if (topApp) {
                    navigate(`/${platform}/${topApp.slug}`)
                    setSearch('')
                    searchRef.current?.blur()
                  } else if (smartResults.shortcutMatches[0]) {
                    navigate(`/${platform}/${smartResults.shortcutMatches[0].appSlug}`)
                    setSearch('')
                    searchRef.current?.blur()
                  }
                }
              }}
              aria-label={CONTENT.directory.searchAriaLabel}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-theme-base-alt border border-theme-border text-theme-text placeholder:text-theme-muted outline-none focus:border-theme-border-hover focus:ring-1 focus:ring-theme-border-hover transition-all text-[15px]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-text bg-transparent border-none cursor-pointer p-1 rounded-full transition-colors"
                aria-label={CONTENT.directory.clearAriaLabel}
              >
                <X size={16} />
              </button>
            )}

            {/* Smart search dropdown */}
            {search && dropdownOpen && hasSmartResults && (
              <SearchDropdown
                results={smartResults}
                platform={platform}
                onClose={() => setSearch('')}
              />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-5 md:px-6 pb-20">
        {grouped.map((group, index) => {
          const config = categoryConfig[group.name]
          const Icon = config?.icon

          return (
            <React.Fragment key={group.name}>
              <section className="mb-20">
                <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                  {/* Left: Category label */}
                  <div className="md:w-44 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 md:pt-4">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center md:mb-4"
                      style={{ backgroundColor: config?.color || 'var(--theme-accent)' }}
                    >
                      {Icon && <Icon size={24} className="text-white" />}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-theme-text leading-tight">
                        {group.name}
                      </h2>
                      <p className="text-theme-muted text-sm mt-0.5">{CONTENT.directory.categorySubLabel}</p>
                    </div>
                  </div>

                  {/* Right: App grid */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.apps.map(app => (
                      <AppCard key={app.slug} app={app} platform={platform} />
                    ))}
                  </div>
                </div>
              </section>
              {index === 2 && grouped.length > 4 && (
                <AdSlot adSlot="platform_mid" variant="in-article" />
              )}
            </React.Fragment>
          )
        })}

        {grouped.length === 0 && search && !hasSmartResults && (
          <p className="text-center text-theme-muted py-20">No apps found for &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </div>
  )
}
