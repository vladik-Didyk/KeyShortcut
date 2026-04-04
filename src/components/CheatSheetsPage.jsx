import { useState, useMemo } from 'react'
import { Link, useLoaderData } from 'react-router'
import { Search, X, Download } from '../utils/icons'
import AdSlot from './AdSlot'
import GuideCtaBanner from './GuideCtaBanner'

export default function CheatSheetsPage() {
  const { apps, platforms } = useLoaderData()
  const [search, setSearch] = useState('')
  const [activePlatform, setActivePlatform] = useState('all')

  const filtered = useMemo(() => {
    let list = apps
    if (activePlatform !== 'all') {
      list = list.filter(a => a.platformId === activePlatform)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.displayName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    }
    // Sort by shortcut count descending (most comprehensive first)
    return list.sort((a, b) => b.shortcutCount - a.shortcutCount)
  }, [apps, search, activePlatform])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map()
    for (const app of filtered) {
      if (!map.has(app.category)) map.set(app.category, [])
      map.get(app.category).push(app)
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[980px]">
        {/* Header */}
        <div className="max-w-[720px] mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Keyboard Shortcut Cheat Sheets
          </h1>
          <p className="text-theme-muted leading-relaxed mb-4">
            Printable keyboard shortcut cheat sheets for every app in our directory.
            Each cheat sheet is a downloadable PDF with organized shortcuts, keycap-style
            key labels, and space for your own notes. Click any app to view its shortcuts
            and download the PDF.
          </p>
          <p className="text-theme-muted leading-relaxed">
            Cheat sheets are one of the most effective ways to learn keyboard shortcuts.
            Print one out and keep it next to your monitor — having shortcuts visible
            nearby helps bridge the gap between looking them up and recalling them from
            muscle memory.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search apps"
              className="w-full pl-8 pr-8 py-2 rounded-lg bg-theme-base-alt border border-theme-border text-theme-text placeholder:text-theme-muted outline-none focus:border-theme-border-hover transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-theme-muted hover:text-theme-text bg-transparent border-none cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            <PlatformTab
              label="All"
              active={activePlatform === 'all'}
              onClick={() => setActivePlatform('all')}
            />
            {platforms.map(p => (
              <PlatformTab
                key={p.id}
                label={p.display_name}
                active={activePlatform === p.id}
                onClick={() => setActivePlatform(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-theme-muted mb-6">
          {filtered.length} cheat sheet{filtered.length !== 1 ? 's' : ''} available
        </p>

        {/* App grid by category */}
        {grouped.map(([category, categoryApps], gi) => (
          <div key={category}>
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryApps.map(app => (
                  <CheatSheetCard key={`${app.platformId}-${app.slug}`} app={app} />
                ))}
              </div>
            </section>
            {gi === 1 && grouped.length > 3 && (
              <AdSlot adSlot="cheatsheets_mid" variant="in-article" />
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-theme-muted py-20">
            No cheat sheets found{search ? ` for "${search}"` : ''}.
          </p>
        )}

        <GuideCtaBanner />

        {/* SEO content */}
        <div className="max-w-[720px] mt-12 mb-8">
          <h2 className="text-xl font-semibold mb-4">Why Use Keyboard Shortcut Cheat Sheets?</h2>
          <p className="text-theme-muted mb-4 leading-relaxed">
            Keyboard shortcut cheat sheets are compact reference cards that list the most important
            shortcuts for a specific application. They&apos;re designed to be printed and placed near
            your workspace — on your desk, pinned to a wall, or tucked under your monitor.
          </p>
          <p className="text-theme-muted mb-4 leading-relaxed">
            Research on motor learning shows that visual cues accelerate the transition from
            conscious recall to muscle memory. When a shortcut reference is physically visible in
            your workspace, you look at it, use the shortcut, and your brain starts associating
            the key combination with the action. After a few days of this, you stop needing to
            look — the shortcut has become automatic.
          </p>
          <p className="text-theme-muted mb-4 leading-relaxed">
            Our cheat sheets are generated from the same verified shortcut database that powers
            the KeyShortcut directory. Each PDF includes organized sections, keycap-style key
            labels that match your physical keyboard, and blank note sections where you can add
            your own annotations.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">How to Use a Cheat Sheet Effectively</h2>
          <ul className="list-disc pl-5 text-theme-muted space-y-2 mb-4">
            <li className="leading-relaxed">Print it and place it where you can glance at it while working — next to your monitor is ideal.</li>
            <li className="leading-relaxed">Highlight the 5 shortcuts you want to learn this week. Focus beats volume.</li>
            <li className="leading-relaxed">Cross off shortcuts as they become muscle memory. Seeing progress is motivating.</li>
            <li className="leading-relaxed">Replace it when you&apos;ve mastered the highlighted shortcuts and want to learn the next batch.</li>
            <li className="leading-relaxed">Use the notes section to write your own custom shortcuts or workflow-specific tips.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

function PlatformTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${
        active
          ? 'bg-theme-accent text-theme-accent-text'
          : 'bg-theme-base-alt text-theme-muted hover:text-theme-text'
      }`}
    >
      {label}
    </button>
  )
}

function CheatSheetCard({ app }) {
  return (
    <Link
      to={`/${app.platformId}/${app.slug}`}
      className="flex items-center gap-3 rounded-xl border border-theme-border bg-theme-base-alt p-4 transition-colors hover:border-theme-border-hover no-underline"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-theme-text truncate">{app.displayName}</p>
        <p className="text-xs text-theme-muted mt-0.5">
          {app.shortcutCount} shortcuts · {app.platformName}
        </p>
      </div>
      <Download size={16} className="text-theme-muted shrink-0" />
    </Link>
  )
}
