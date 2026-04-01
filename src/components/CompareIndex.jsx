import { Link } from 'react-router'
import { COMPARISONS } from '../data/comparisons'

export default function CompareIndex() {
  // Group by category
  const grouped = new Map()
  for (const c of COMPARISONS) {
    if (!grouped.has(c.category)) grouped.set(c.category, [])
    grouped.get(c.category).push(c)
  }

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[680px]">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Keyboard Shortcut Comparisons
        </h1>
        <p className="text-theme-muted mb-10 leading-relaxed">
          Side-by-side comparisons of keyboard shortcuts between popular apps.
          See how common actions map across tools in the same category — useful when
          switching between apps or choosing which one to learn.
        </p>

        {[...grouped.entries()].map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="space-y-3">
              {items.map(c => {
                const slug = `${c.slugA}-vs-${c.slugB}`
                const nameA = formatName(c.slugA)
                const nameB = formatName(c.slugB)
                return (
                  <Link
                    key={slug}
                    to={`/compare/${slug}`}
                    className="flex items-center justify-between rounded-2xl border border-theme-border bg-theme-base-alt p-5 transition-colors hover:border-theme-border-hover no-underline"
                  >
                    <span className="font-medium text-theme-text">
                      {nameA} vs {nameB}
                    </span>
                    <span className="text-sm text-theme-muted">
                      Compare shortcuts &rarr;
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

function formatName(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
