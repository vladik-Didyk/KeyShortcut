import { Link, useLoaderData } from 'react-router'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Search, X, Download, ExternalLink, Lightbulb, ChevronDown } from '../utils/icons'
import AppIcon from './directory/AppIcon'
import { useScrollspy } from '../hooks/useScrollspy'
import { CONTENT } from '../data/content'
import AdSlot from './AdSlot'
import { tokenize } from '../utils/searchHelpers'
import { parseKeyParts } from '../utils/platformHelpers'

function Keycap({ children }) {
  return <kbd className="keycap">{children}</kbd>
}

export default function ShortcutPage() {
  const { platformId: platform, platformName, app, otherPlatforms } = useLoaderData()
  const slug = app.slug
  const [search, setSearch] = useState('')
  const searchInputRef = useRef(null)
  const headerRef = useRef(null)
  const [stickyTop, setStickyTop] = useState(48)
  const sp = CONTENT.shortcutPage

  const sectionIds = useMemo(() => {
    const counts = {}
    return app.sections.map(s => {
      const base = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      counts[base] = (counts[base] || 0) + 1
      return counts[base] > 1 ? `${base}-${counts[base]}` : base
    })
  }, [app])

  const activeId = useScrollspy(sectionIds)

  // Measure header bottom to position sticky section titles below it
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => setStickyTop(48 + el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // "/" keyboard shortcut to focus in-app search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearch('')
        searchInputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Compute action tokens (stripping app name tokens from the query)
  const actionTokens = useMemo(() => {
    if (!search) return null
    const allTokens = tokenize(search)
    if (allTokens.length === 0) return null
    const appNameLower = app.displayName.toLowerCase()
    const appSlugLower = app.slug.toLowerCase()
    const filtered = allTokens.filter(t => !appNameLower.includes(t) && !appSlugLower.includes(t))
    return filtered.length === 0 ? null : filtered
  }, [search, app])

  // Filter shortcuts by search — strips tokens matching the current app name
  const filteredSections = useMemo(() => {
    if (!actionTokens) return app.sections.map((s, i) => ({ ...s, id: sectionIds[i] }))

    return app.sections
      .map((s, i) => ({
        ...s,
        id: sectionIds[i],
        shortcuts: s.shortcuts.filter(sc => {
          const actionLower = sc.action.toLowerCase()
          return actionTokens.every(t => actionLower.includes(t))
        }),
      }))
      .filter(s => s.shortcuts.length > 0)
  }, [app, actionTokens, sectionIds])

  const totalVisible = filteredSections.reduce((sum, s) => sum + s.shortcuts.length, 0)


  return (
    <div className="min-h-screen bg-theme-base">

      {/* Navbar clearance */}
      <div className="h-12" />

      {/* ─── Header ─── */}
      <header ref={headerRef} className="py-4 px-5 md:px-6 border-b border-theme-border sticky top-12 z-20 bg-theme-base">
        <div className="mx-auto max-w-[980px] flex items-center gap-4 flex-wrap">
          <AppIcon slug={slug} displayName={app.displayName} size={40} />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">
              {app.displayName} Shortcuts
            </h1>
            {app.category && (
              <Link
                to={`/?category=${app.category}${platform !== 'macos' ? `&platform=${platform}` : ''}`}
                className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full no-underline transition-colors border-[1.5px] border-theme-accent bg-theme-keycap text-theme-keycap-legend shrink-0"
              >
                {app.category}
              </Link>
            )}
            <span className="hidden md:inline text-theme-muted text-xs shrink-0">
              {app.shortcutCount} shortcuts · {app.sections.length} sections
            </span>
            {otherPlatforms.length > 0 && (
              <span className="hidden lg:inline text-theme-muted text-xs shrink-0">
                · {sp.alsoOnLabel}{' '}
                {otherPlatforms.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && ', '}
                    <Link to={`/${p.id}/${slug}`} className="text-accent hover:underline no-underline">
                      {p.name}
                    </Link>
                  </span>
                ))}
              </span>
            )}
          </div>
          {/* Search + Download */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-48 md:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={sp.filterPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={sp.filterAriaLabel}
                className="w-full pl-8 pr-12 py-1.5 rounded-lg bg-theme-base-alt border border-theme-border text-theme-text placeholder:text-theme-muted outline-none focus:border-theme-border-hover focus:ring-1 focus:ring-theme-border-hover transition-all text-sm"
              />
              {!search && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-theme-muted pointer-events-none select-none">
                  <kbd className="px-1 py-0.5 rounded bg-theme-base border border-theme-border text-[10px] font-medium">/</kbd>
                </span>
              )}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-text bg-transparent border-none cursor-pointer p-0.5 rounded-full transition-colors"
                  aria-label={sp.clearAriaLabel}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={async () => {
                const { generateShortcutPDF } = await import('../utils/generateShortcutPDF')
                generateShortcutPDF(app)
              }}
              className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-base-alt text-theme-muted hover:text-theme-text transition-colors shrink-0 cursor-pointer"
              title={sp.downloadTitle}
              aria-label={sp.downloadTitle}
            >
              <Download size={14} />
            </button>
            {app.docsUrl && (
              <a
                href={app.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-theme-border hover:bg-theme-base-alt text-theme-muted hover:text-theme-text transition-colors shrink-0 no-underline"
                title="View official documentation"
                aria-label="View official documentation"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {/* Search feedback */}
          {search && (
            <p className="w-full text-xs text-theme-muted" role="status" aria-live="polite">
              {totalVisible} of {app.shortcutCount} shortcuts
            </p>
          )}
        </div>
      </header>

      {/* ─── Intro text ─── */}
      <div className="mx-auto max-w-[980px] px-5 md:px-6 pt-8 pb-2">
        <p className="text-theme-muted text-[15px] leading-relaxed max-w-[720px]">
          {sp.intro(app.displayName, platformName, app.shortcutCount, app.sections.length)}
        </p>
        <p className="text-theme-muted text-[15px] leading-relaxed max-w-[720px] mt-3">
          {sp.learnMore(app.displayName)}
        </p>
        <p className="text-theme-muted text-[15px] leading-relaxed max-w-[720px] mt-3">
          {sp.whyShortcuts(app.displayName, platformName)}
        </p>

        {/* ─── Quick Tips ─── */}
        <div className="mt-8 max-w-[720px] rounded-2xl bg-theme-base-alt border border-theme-border p-6">
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-theme-muted" />
            {sp.tipsTitle}
          </h2>
          <ul className="space-y-3">
            {sp.tips(app.displayName, platformName).slice(0, 3).map((tip, i) => (
              <li key={i} className="text-theme-muted text-[14px] leading-relaxed pl-4 border-l-2 border-theme-border">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Sidebar + Main ─── */}
      <div className="mx-auto max-w-[980px] px-5 md:px-6 py-10 md:py-14">
        <div className="flex gap-12">

          {/* Sidebar TOC — desktop only */}
          <nav className="hidden lg:block w-48 shrink-0">
            <div className="sticky" style={{ top: stickyTop + 16 }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-4">
                {sp.sidebarTitle}
              </p>
              <ul className="flex flex-col gap-0.5">
                {app.sections.map((section, i) => {
                  const id = sectionIds[i]
                  const matchCount = actionTokens
                    ? section.shortcuts.filter(sc => {
                        const al = sc.action.toLowerCase()
                        return actionTokens.every(t => al.includes(t))
                      }).length
                    : section.shortcuts.length
                  const isActive = activeId === id
                  const isDimmed = search && matchCount === 0

                  return (
                    <li key={i}>
                      <a
                        href={`#${id}`}
                        className={`text-sm block py-1.5 pl-3 border-l-2 transition-colors ${
                          isActive
                            ? 'toc-link-active'
                            : isDimmed
                              ? 'text-theme-muted/30 border-transparent'
                              : 'text-theme-muted hover:text-theme-text border-transparent hover:border-theme-border-hover'
                        }`}
                      >
                        <span className="truncate">{section.name}</span>
                        <span className={`ml-1.5 text-[11px] ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                          {matchCount}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {filteredSections.map((section, idx) => (
              <React.Fragment key={section.id}>
                <div id={section.id} className="mb-14">
                  <h2 className="text-lg font-semibold tracking-tight pt-3 pb-3 flex items-center gap-2 sticky z-10 bg-theme-base border-b border-theme-border" style={{ top: stickyTop }}>
                    {section.name}
                    <span className="text-xs font-normal text-theme-muted px-1.5 py-0.5 rounded-full bg-theme-base-alt">
                      {section.shortcuts.length}
                    </span>
                  </h2>
                  <table className="shortcut-table">
                    <tbody>
                      {section.shortcuts.map((s, j) => (
                        <tr key={j} className={j % 2 === 1 ? 'shortcut-row-alt' : ''}>
                          <td className="py-3 pr-4 text-theme-text text-[15px]">
                            {s.action}
                          </td>
                          <td className="py-3 pl-4 text-right whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              {parseKeyParts(s.modifiers, s.key).map((part, k) => (
                                <Keycap key={k}>{part}</Keycap>
                              ))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {idx === 1 && filteredSections.length >= 4 && !search && (
                  <AdSlot adSlot="shortcut_mid" variant="in-article" />
                )}
              </React.Fragment>
            ))}

            {search && filteredSections.length === 0 && (
              <p className="text-center text-theme-muted py-20">
                No shortcuts match "{search}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── FAQ Section ─── */}
      <div className="border-t border-theme-border">
        <div className="mx-auto max-w-[980px] px-5 md:px-6 py-14">
          <h2 className="text-xl font-semibold tracking-tight mb-6">{sp.faqTitle}</h2>
          <div className="space-y-2 max-w-[720px]">
            {sp.faqItems(app, platformName).map((item, i) => (
              <FaqAccordion key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── CTA Card ─── */}
      <div className="border-t border-theme-border">
        <div className="mx-auto max-w-[980px] px-5 md:px-6 py-14">
          <div className="rounded-2xl bg-theme-accent text-theme-accent-text p-8 md:p-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
              {sp.ctaTitle(app.displayName)}
            </h2>
            <p className="text-theme-accent-text/80 text-[15px] leading-relaxed mb-6 max-w-md mx-auto">
              {sp.ctaSubtitle}
            </p>
            <Link
              to="/mac-hud"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-theme-base text-theme-accent font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity"
            >
              {sp.ctaButton}
            </Link>
          </div>
        </div>
      </div>

      <FaqSchema app={app} platformName={platformName} />
      <BreadcrumbSchema appName={app.displayName} platformName={platformName} platformId={platform} slug={slug} />
    </div>
  )
}

/**
 * FAQ structured data for Google rich results.
 * All values come from our own static content data (CONTENT.shortcutPage.faqItems),
 * not from user input, so the serialized JSON is safe to embed directly.
 */
function FaqSchema({ app, platformName }) {
  const sp = CONTENT.shortcutPage
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sp.faqItems(app, platformName).map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  })
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
  )
}

/**
 * BreadcrumbList structured data for shortcut pages (Home > Platform > App).
 * Safe: all values come from our own static route/app data, not user input.
 */
function BreadcrumbSchema({ appName, platformName, platformId, slug }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://keyshortcut.com/' },
      { '@type': 'ListItem', position: 2, name: `${platformName} Shortcuts`, item: `https://keyshortcut.com/${platformId}` },
      { '@type': 'ListItem', position: 3, name: `${appName} Shortcuts`, item: `https://keyshortcut.com/${platformId}/${slug}` },
    ],
  })
  // Safe: jsonLd is built from our own static app/platform data (not user input)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
}

/* ─── FAQ Accordion ─── */
function FaqAccordion({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-theme-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-transparent border-none cursor-pointer text-theme-text hover:bg-theme-base-alt transition-colors"
      >
        <span className="text-[15px] font-medium pr-4">{question}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-theme-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-theme-muted text-[14px] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
