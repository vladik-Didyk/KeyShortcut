import React, { useState, useDeferredValue, useMemo, useRef, useEffect, useCallback } from 'react'
import { useLoaderData, useNavigate, Link } from 'react-router'
import { Search, X, ArrowRight } from '../utils/icons'
import { usePlatformData, prefetchPlatform } from '../hooks/usePlatformData'
import { groupByCategories, getPopularApps, parseKeyParts } from '../utils/platformHelpers'
import { detectPlatform } from '../utils/detectPlatform'
import { buildSearchIndex, searchIndex, parseAppQuery } from '../utils/searchHelpers'
import AppCard from './directory/AppCard'
import { categoryConfig } from '../data/categoryConfig'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'
import AdSlot from './AdSlot'
import { APP_STORE_URL } from '../data/siteConfig'
import { trackEvent } from '../lib/analytics'

export default function DirectoryHomepage() {
  const loaderData = useLoaderData()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState(
    () => (typeof navigator !== 'undefined' ? detectPlatform() : loaderData?.defaultPlatformId || 'macos')
  )
  const searchRef = useRef(null)
  const searchContainerRef = useRef(null)
  const chipsRef = useRef(null)
  const [searchFocused, setSearchFocused] = useState(false)

  const platforms = loaderData?.manifest?.platforms ?? null
  const isInitialPlatform = selectedPlatform === (loaderData?.defaultPlatformId || 'macos')
  const { apps: switchedApps, otherPlatformsMap: switchedOPMap, loading: switchedLoading, error } = usePlatformData(
    isInitialPlatform ? null : selectedPlatform
  )
  const apps = isInitialPlatform ? loaderData?.platformData?.apps : switchedApps
  const otherPlatformsMap = isInitialPlatform ? (loaderData?.platformData?.otherPlatformsMap || {}) : switchedOPMap
  const loading = isInitialPlatform ? false : switchedLoading

  // Eagerly prefetch other platforms in the background when browser is idle
  // so switching is instant without bloating the server-rendered HTML
  useEffect(() => {
    if (!platforms) return
    const defaultId = loaderData?.defaultPlatformId || 'macos'
    const others = platforms.filter(p => p.id !== defaultId)
    if (others.length === 0) return

    const schedule = typeof requestIdleCallback === 'function'
      ? (cb) => { const id = requestIdleCallback(cb); return () => cancelIdleCallback(id) }
      : (cb) => { const id = setTimeout(cb, 2000); return () => clearTimeout(id) }

    const cancel = schedule(() => others.forEach(p => prefetchPlatform(p.id)))
    return cancel
  }, [platforms, loaderData?.defaultPlatformId])
  const currentPlatform = platforms?.find(p => p.id === selectedPlatform)
  const categoryOrder = useMemo(() => currentPlatform?.categories || [], [currentPlatform])

  // Horizontal scroll: mouse drag + wheel
  useEffect(() => {
    const el = chipsRef.current
    if (!el) return
    let isDown = false, startX = 0, scrollLeft = 0

    const onMouseDown = (e) => {
      isDown = true
      el.style.cursor = 'grabbing'
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onMouseUp = () => { isDown = false; el.style.cursor = 'grab' }
    const onMouseLeave = () => { isDown = false; el.style.cursor = 'grab' }
    const onMouseMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX)
    }
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // native horizontal scroll
      if (el.scrollWidth <= el.clientWidth) return // nothing to scroll
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.style.cursor = 'grab'
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('wheel', onWheel)
    }
  }, [categoryOrder])

  // Smart search index — built once per platform data change
  const deferredSearch = useDeferredValue(search)
  const searchIdx = useMemo(() => buildSearchIndex(apps), [apps])
  const smartResults = useMemo(() => searchIndex(searchIdx, deferredSearch), [searchIdx, deferredSearch])

  const navigate = useNavigate()
  const hasSmartResults = smartResults.appMatches.length > 0 || smartResults.shortcutMatches.length > 0

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


  const setCategory = useCallback((cat) => {
    setActiveCategory(cat)
    if (cat) trackEvent('category_filtered', { category: cat, platform: selectedPlatform })
  }, [selectedPlatform])

  const setPlatform = useCallback((id) => {
    setSelectedPlatform(id)
    setActiveCategory(null)
    setSearch('')
    trackEvent('platform_switched', { platform: id })
  }, [])

  // Platform is detected at initialization via useState initializer above

  const grouped = useMemo(() => {
    if (!apps) return []
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
    const groups = groupByCategories(filtered, categoryOrder)
    if (activeCategory && !search) {
      return groups.filter(g => g.name === activeCategory)
    }
    return groups
  }, [apps, search, activeCategory, categoryOrder])

  const popularApps = useMemo(() => getPopularApps(apps, 8), [apps])

  const matchCount = search
    ? grouped.reduce((sum, g) => sum + g.apps.length, 0)
    : null

  return (
    <div className="min-h-screen bg-theme-base">

      {/* ─── Hero ─── */}
      <section className="pt-24 md:pt-32 pb-8 px-5 md:px-6">
        <div className="mx-auto max-w-[780px] text-center">
          <h1 className="text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] font-bold tracking-tight leading-[1.08] mb-5">
            <span className="text-theme-text">{CONTENT.home.title}</span>
            <br />
            <span className="text-accent">{CONTENT.home.titleAccent}</span>
          </h1>

          <p className="text-theme-muted text-[1.125rem] md:text-[1.25rem] mb-8 max-w-lg mx-auto leading-relaxed">
            {CONTENT.home.subtitle}
          </p>

          {/* Platform Toggle */}
          {!search && platforms && (
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center rounded-xl overflow-hidden border border-theme-border">
                {platforms.map(p => {
                  const isActive = p.id === selectedPlatform
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      onMouseEnter={() => prefetchPlatform(p.id)}
                      className={`group flex items-center gap-2 px-5 py-2.5 text-[15px] font-medium transition-all cursor-pointer border-none ${
                        isActive
                          ? 'bg-theme-accent text-theme-base'
                          : 'bg-transparent text-theme-muted hover:text-theme-text'
                      }`}
                    >
                      {p.icon && (
                        <img
                          src={`/images/platform-icons/${p.icon.replace('.png', '.webp')}`}
                          alt=""
                          width={15}
                          height={15}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span>{p.displayName}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <div ref={searchContainerRef} className="relative max-w-[600px] mx-auto">
            <div
              className={`relative rounded-xl border-[1.5px] transition-all duration-300 ${
                searchFocused
                  ? 'border-theme-accent'
                  : 'border-theme-border hover:border-theme-border-hover'
              }`}
            >
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search apps and shortcuts — try &quot;Figma copy&quot;"
                value={search}
                onChange={e => { setSearch(e.target.value); setCategory(null) }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && search) {
                    e.preventDefault()
                    trackEvent('directory_search_performed', { query: search, platform: selectedPlatform, has_results: hasSmartResults })
                    const topApp = smartResults.appMatches[0]
                    if (topApp) {
                      navigate(`/${selectedPlatform}/${topApp.slug}`)
                      setSearch('')
                      searchRef.current?.blur()
                    } else if (smartResults.shortcutMatches[0]) {
                      navigate(`/${selectedPlatform}/${smartResults.shortcutMatches[0].appSlug}`)
                      setSearch('')
                      searchRef.current?.blur()
                    }
                  }
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label={CONTENT.home.searchAriaLabel}
                className="directory-search w-full pl-12 pr-24 py-4.5 bg-transparent outline-none text-[17px] text-theme-text caret-theme-accent"
              />
              {!search && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none select-none">
                  <kbd className="px-1.5 py-0.5 rounded text-[11px] font-medium text-theme-muted border border-theme-border">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded text-[11px] font-medium text-theme-muted border border-theme-border">K</kbd>
                </span>
              )}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1.5 rounded-full transition-colors hover:bg-theme-base-alt text-theme-muted"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

          </div>

          {search && !hasSmartResults && matchCount === 0 && (
            <p className="mt-3 text-sm text-theme-muted" role="status" aria-live="polite">
              No results for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* ─── Category Chips ─── */}
      {!search && (
        <div className="px-5 md:px-6 mb-10">
          <div className="mx-auto max-w-[1080px] overflow-hidden">
            <nav ref={chipsRef} className="chips-scroll flex flex-nowrap gap-2 py-2 overflow-x-auto select-none" aria-label="Filter by category">
              <ChipButton active={!activeCategory} onClick={() => setCategory(null)}>
                {CONTENT.home.allCategory}
              </ChipButton>
              {categoryOrder.map(cat => {
                const config = categoryConfig[cat]
                const CatIcon = config?.icon
                return (
                  <ChipButton
                    key={cat}
                    active={activeCategory === cat}
                    onClick={() => setCategory(activeCategory === cat ? null : cat)}
                    icon={CatIcon}
                    color={config?.color}
                  >
                    {cat}
                  </ChipButton>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1080px] px-5 md:px-6 pb-16">

        {/* ─── Error state ─── */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-theme-muted mb-4">{CONTENT.home.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full font-medium cursor-pointer border-none transition-opacity hover:opacity-90 bg-theme-accent text-theme-accent-text"
            >
              {CONTENT.home.refreshButton}
            </button>
          </div>
        )}

        {/* ─── Loading skeleton ─── */}
        {!error && loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center py-10 px-4 rounded-2xl animate-pulse border border-theme-border">
                <div className="w-16 h-16 rounded-2xl mb-4 bg-black/6" />
                <div className="w-20 h-3 rounded bg-black/6" />
                <div className="w-12 h-2.5 rounded mt-2 bg-black/4" />
              </div>
            ))}
          </div>
        )}

        {/* ─── Search Results (inline, same as dropdown) ─── */}
        {!error && !loading && search && hasSmartResults && (
          <SearchResultsInline results={smartResults} platform={selectedPlatform} />
        )}

        {/* ─── Category Sections (when not searching) ─── */}
        {/* ─── Popular Apps ─── */}
        {!error && !loading && !search && !activeCategory && popularApps.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-theme-muted mb-4">Popular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {popularApps.map(app => (
                <AppCard key={app.slug} app={app} platform={selectedPlatform} />
              ))}
            </div>
          </section>
        )}

        {!error && !loading && !search && grouped.map((group, index) => (
          <React.Fragment key={group.name}>
            <CategorySection group={group} platform={selectedPlatform} otherPlatformsMap={otherPlatformsMap} />
            {index === 2 && grouped.length > 4 && (
              <AdSlot adSlot="home_mid" variant="in-article" />
            )}
          </React.Fragment>
        ))}

        {!error && !loading && grouped.length === 0 && !search && (
          <p className="text-center py-20 text-theme-muted">{CONTENT.home.emptyCategory}</p>
        )}
      </div>

      {/* ─── About Section ─── */}
      {!search && (
        <>
          <section className="border-t border-theme-border px-5 md:px-6 py-14">
            <div className="mx-auto max-w-[680px]">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                {CONTENT.home.aboutSection.title}
              </h2>
              {CONTENT.home.aboutSection.paragraphs.map((p, i) => (
                <p key={i} className="text-theme-muted text-[15px] leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          </section>

          {/* ─── Why Shortcuts Matter ─── */}
          <section className="border-t border-theme-border px-5 md:px-6 py-14 bg-theme-base-alt">
            <div className="mx-auto max-w-[680px]">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                {CONTENT.home.aboutSection.whyTitle}
              </h2>
              {CONTENT.home.aboutSection.whyParagraphs.map((p, i) => (
                <p key={i} className="text-theme-muted text-[15px] leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          </section>

          {/* ─── Popular Universal Shortcuts ─── */}
          <section className="border-t border-theme-border px-5 md:px-6 py-14">
            <div className="mx-auto max-w-[680px]">
              <h2 className="text-xl font-bold tracking-tight mb-2">
                {CONTENT.home.aboutSection.popularTitle}
              </h2>
              <p className="text-theme-muted text-[15px] mb-6">
                {CONTENT.home.aboutSection.popularSubtitle}
              </p>
              <table className="shortcut-table w-full">
                <thead>
                  <tr className="text-left text-xs text-theme-muted uppercase tracking-wider">
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium text-right">macOS</th>
                    <th className="pb-3 font-medium text-right">Windows / Linux</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTENT.home.aboutSection.popularShortcuts.map((s, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'shortcut-row-alt' : ''}>
                      <td className="py-2.5 text-theme-text text-[15px]">{s.action}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {s.mac.split(' ').map((k, j) => (
                            <kbd key={j} className="keycap-mini">{k}</kbd>
                          ))}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {s.win.split(' ').map((k, j) => (
                            <kbd key={j} className="keycap-mini">{k}</kbd>
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ─── Mac HUD App Promo ─── */}
      {APP_STORE_URL && (
        <section className="mt-14">
          <div className="rounded-2xl bg-theme-accent text-theme-accent-text p-8 md:p-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              {CONTENT.home.promo.title}
            </h2>
            <p className="text-theme-accent-text/80 text-[15px] leading-relaxed mb-5 max-w-md mx-auto">
              {CONTENT.home.promo.subtitle}
            </p>
            <Link
              to="/mac-hud"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-theme-base text-theme-accent font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity"
              onClick={() => trackEvent('mac_hud_promo_clicked', { source: 'directory_homepage' })}
            >
              {CONTENT.home.promo.button}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}

/* ─── Chip button with optional icon ─── */
function ChipButton({ active, onClick, children, icon: Icon, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[15px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border-none ${
        active
          ? 'bg-theme-accent text-theme-base'
          : 'bg-transparent text-theme-muted hover:text-theme-text hover:bg-theme-base-alt'
      }`}
    >
      {Icon && <Icon size={13} style={!active && color ? { color } : undefined} />}
      {children}
    </button>
  )
}

/* ─── Inline search results — mirrors SearchDropdown content ─── */
function SearchResultsInline({ results, platform }) {
  const { appMatches = [], shortcutMatches = [], otherApps = [] } = results || {}

  return (
    <div className="space-y-6">
      {/* App matches */}
      {appMatches.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">Apps</p>
          <div className="space-y-1">
            {appMatches.map(app => (
              <Link
                key={app.slug}
                to={`/${platform}/${app.slug}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline hover:bg-theme-base-alt transition-colors"
              >
                <img
                  src={`/images/app-icons/${app.slug}.webp`}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-xl shrink-0"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[16px] font-medium text-theme-text">{app.name}</span>
                  <span className="text-[14px] text-theme-muted ml-2">{app.shortcutCount} shortcuts</span>
                </div>
                <ArrowRight size={16} className="text-theme-muted shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shortcut matches grouped by app */}
      {shortcutMatches.length > 0 && (
        <div>
          {appMatches.length > 0 && (
            <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">Shortcuts</p>
          )}
          <div className="space-y-6">
            {shortcutMatches.map(group => (
              <div key={group.appSlug}>
                <Link
                  to={`/${platform}/${group.appSlug}`}
                  className="flex items-center gap-2.5 mb-2 no-underline hover:opacity-80 transition-opacity"
                >
                  <img
                    src={`/images/app-icons/${group.appSlug}.webp`}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-lg shrink-0"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span className="text-[15px] font-semibold text-theme-text">{group.appName}</span>
                  <span className="text-[12px] text-theme-muted">› {group.category}</span>
                </Link>
                <div className="ml-9 space-y-0.5">
                  {group.shortcuts.map((sc, i) => (
                    <Link
                      key={`${sc.action}-${i}`}
                      to={`/${platform}/${group.appSlug}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg no-underline hover:bg-theme-base-alt transition-colors"
                    >
                      <span className="text-[15px] text-theme-text truncate">{sc.action}</span>
                      <span className="flex items-center gap-0.5 shrink-0 ml-4">
                        {parseKeyParts(sc.modifiers, sc.key).map((part, j) => (
                          <kbd key={j} className="inline-flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded text-[12px] font-medium text-theme-muted bg-theme-base-alt border border-theme-border">
                            {part}
                          </kbd>
                        ))}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Also in" footer */}
      {otherApps.length > 0 && (
        <p className="text-[13px] text-theme-muted px-1">
          Also in: {otherApps.join(', ')}
        </p>
      )}
    </div>
  )
}

/* ─── Category section — matches ShortcutsIndex layout ─── */
function CategorySection({ group, platform, otherPlatformsMap = {} }) {
  const [ref, visible] = useInView({ threshold: 0.05 })
  const config = categoryConfig[group.name]
  const CatIcon = config?.icon

  return (
    <section ref={ref} className={`mb-20 fade-in-up ${visible ? 'visible' : ''}`}>
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Left: Category label */}
        <div className="md:w-44 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 md:pt-4">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center md:mb-4"
            style={{ backgroundColor: config?.color || 'var(--theme-accent)' }}
          >
            {CatIcon && <CatIcon size={24} className="text-white" />}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-theme-text leading-tight">
              {group.name}
            </h2>
            <p className="text-theme-muted text-sm mt-0.5">{CONTENT.home.categorySubLabel}</p>
          </div>
        </div>

        {/* Right: App grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {group.apps.map(app => (
            <AppCard key={app.slug} app={app} platform={platform} otherPlatforms={otherPlatformsMap[app.slug]} />
          ))}
        </div>
      </div>
    </section>
  )
}
