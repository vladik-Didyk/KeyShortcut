import { Link } from 'react-router'
import AdSlot from './AdSlot'

export default function ComparePage({ appA, appB, comparison }) {
  // Find overlapping section names (case-insensitive)
  const normalize = name => name.toLowerCase().trim()
  const sectionsA = new Map(appA.sections.map(s => [normalize(s.name), s]))
  const sectionsB = new Map(appB.sections.map(s => [normalize(s.name), s]))

  // Matched sections (both apps have a section with similar name)
  const matched = []
  const usedB = new Set()
  for (const [key, sA] of sectionsA) {
    if (sectionsB.has(key)) {
      matched.push({ name: sA.name, sectionA: sA, sectionB: sectionsB.get(key) })
      usedB.add(key)
    }
  }

  // Unique to each app
  const onlyA = [...sectionsA.entries()].filter(([k]) => !sectionsB.has(k)).map(([, s]) => s)
  const onlyB = [...sectionsB.entries()].filter(([k]) => !usedB.has(k)).map(([, s]) => s)

  // Breadcrumb JSON-LD — safe: all values come from our own static app/comparison data
  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://keyshortcut.com/' },
      { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://keyshortcut.com/compare' },
      { '@type': 'ListItem', position: 3, name: `${appA.displayName} vs ${appB.displayName}`, item: `https://keyshortcut.com/compare/${appA.slug}-vs-${appB.slug}` },
    ],
  })

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[980px]">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/compare"
            className="text-sm text-theme-muted hover:text-theme-text transition-colors mb-4 inline-block"
          >
            &larr; All Comparisons
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {appA.displayName} vs {appB.displayName} Shortcuts
          </h1>
          <p className="text-theme-muted leading-relaxed max-w-[720px]">
            A side-by-side comparison of keyboard shortcuts between {appA.displayName} ({appA.shortcutCount} shortcuts)
            and {appB.displayName} ({appB.shortcutCount} shortcuts) on {comparison.platform === 'macos' ? 'macOS' : comparison.platform}.
            See how common actions map across both apps.
          </p>
        </div>

        {/* Stats comparison */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <AppStatCard app={appA} platform={comparison.platform} />
          <AppStatCard app={appB} platform={comparison.platform} />
        </div>

        {/* Matched sections */}
        {matched.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Shared Categories</h2>
            <p className="text-theme-muted mb-6 text-sm">
              These shortcut categories exist in both apps. Compare how the same actions
              are mapped to different key combinations.
            </p>
            {matched.map((m, i) => (
              <div key={m.name}>
                <ComparisonSection
                  name={m.name}
                  sectionA={m.sectionA}
                  sectionB={m.sectionB}
                  appA={appA}
                  appB={appB}
                />
                {i === 1 && matched.length > 3 && (
                  <AdSlot adSlot="compare_mid" variant="in-article" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Unique sections */}
        {(onlyA.length > 0 || onlyB.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {onlyA.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Only in {appA.displayName}
                </h2>
                {onlyA.map(s => (
                  <UniqueSection key={s.name} section={s} />
                ))}
              </div>
            )}
            {onlyB.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Only in {appB.displayName}
                </h2>
                {onlyB.map(s => (
                  <UniqueSection key={s.name} section={s} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO content */}
        <div className="max-w-[720px] mt-12 border-t border-theme-border pt-10">
          <h2 className="text-xl font-semibold mb-4">
            Switching Between {appA.displayName} and {appB.displayName}
          </h2>
          <p className="text-theme-muted mb-4 leading-relaxed">
            Both {appA.displayName} and {appB.displayName} are popular tools in the {comparison.category} category.
            When switching between them, the biggest challenge is re-learning keyboard shortcuts — actions you
            perform automatically in one app require conscious effort in the other.
          </p>
          <p className="text-theme-muted mb-4 leading-relaxed">
            The comparison above highlights where shortcuts overlap (making the transition easier)
            and where they differ (requiring new muscle memory). Focus on learning the differences
            first, since the shared shortcuts will transfer naturally.
          </p>
          <p className="text-theme-muted mb-4 leading-relaxed">
            For a complete shortcut reference, visit the full shortcut pages:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/${comparison.platform}/${appA.slug}`}
              className="rounded-full border border-theme-border bg-theme-base-alt px-4 py-1.5 text-sm transition-colors hover:border-theme-border-hover"
            >
              {appA.displayName} shortcuts
            </Link>
            <Link
              to={`/${comparison.platform}/${appB.slug}`}
              className="rounded-full border border-theme-border bg-theme-base-alt px-4 py-1.5 text-sm transition-colors hover:border-theme-border-hover"
            >
              {appB.displayName} shortcuts
            </Link>
          </div>
        </div>

        {/* Safe: breadcrumbJsonLd is built from our own static app data, not user input */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      </div>
    </main>
  )
}

function AppStatCard({ app, platform }) {
  return (
    <Link
      to={`/${platform}/${app.slug}`}
      className="rounded-2xl border border-theme-border bg-theme-base-alt p-5 text-center transition-colors hover:border-theme-border-hover no-underline"
    >
      <p className="text-lg font-bold text-theme-text">{app.displayName}</p>
      <p className="text-sm text-theme-muted mt-1">
        {app.shortcutCount} shortcuts · {app.sections.length} sections
      </p>
    </Link>
  )
}

function ComparisonSection({ name, sectionA, sectionB, appA, appB }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-3">{name}</h3>
      <div className="rounded-2xl border border-theme-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-theme-base-alt border-b border-theme-border">
              <th className="text-left px-4 py-2.5 font-medium text-theme-muted w-1/3">
                {appA.displayName}
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-theme-muted w-1/3">Action</th>
              <th className="text-left px-4 py-2.5 font-medium text-theme-muted w-1/3">
                {appB.displayName}
              </th>
            </tr>
          </thead>
          <tbody>
            {sectionA.shortcuts.slice(0, 8).map((s, i) => {
              // Try to find matching action in B
              const matchB = sectionB.shortcuts.find(sb =>
                sb.action.toLowerCase() === s.action.toLowerCase()
              )
              return (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-theme-base-alt/50'}>
                  <td className="px-4 py-2.5 font-mono text-theme-text whitespace-nowrap text-xs">
                    {formatKeys(s)}
                  </td>
                  <td className="px-4 py-2.5 text-theme-muted">{s.action}</td>
                  <td className="px-4 py-2.5 font-mono text-theme-text whitespace-nowrap text-xs">
                    {matchB ? formatKeys(matchB) : '\u2014'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UniqueSection({ section }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-theme-muted mb-2">
        {section.name} ({section.shortcuts.length})
      </h3>
      <div className="rounded-xl border border-theme-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {section.shortcuts.slice(0, 5).map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-theme-base-alt/30' : ''}>
                <td className="px-3 py-2 font-mono text-theme-text whitespace-nowrap text-xs">
                  {formatKeys(s)}
                </td>
                <td className="px-3 py-2 text-theme-muted text-xs">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatKeys(shortcut) {
  const parts = []
  if (shortcut.modifiers) parts.push(...shortcut.modifiers)
  if (shortcut.key) parts.push(shortcut.key)
  return parts.join(' ') || '\u2014'
}
