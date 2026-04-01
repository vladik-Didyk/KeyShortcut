import { Link } from 'react-router'
import { GUIDES } from '../data/guides'
import AdSlot from './AdSlot'

export default function GuidesIndex() {
  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[680px]">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Guides</h1>
        <p className="text-theme-muted mb-10 leading-relaxed">
          Practical guides on keyboard shortcuts, productivity workflows, and shortcut
          management for macOS, Windows, and Linux.
        </p>

        <div className="space-y-6">
          {GUIDES.map((guide, i) => (
            <div key={guide.slug}>
              <GuideCard guide={guide} />
              {i === 2 && GUIDES.length > 4 && (
                <div className="mt-6">
                  <AdSlot adSlot="guides_mid" variant="in-article" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function GuideCard({ guide }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="block rounded-2xl border border-theme-border bg-theme-base-alt p-6 transition-colors hover:border-theme-border-hover"
    >
      <div className="flex items-center gap-3 text-sm text-theme-muted mb-3">
        <span className="inline-block rounded-full bg-theme-base px-3 py-0.5 text-xs font-medium">
          {guide.category}
        </span>
        <span>{guide.readingTime}</span>
      </div>
      <h2 className="text-lg font-semibold mb-2 text-theme-text">{guide.title}</h2>
      <p className="text-theme-muted text-sm leading-relaxed">{guide.description}</p>
      <p className="text-sm text-theme-muted mt-3">
        <time dateTime={guide.published}>
          {new Date(guide.published + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      </p>
    </Link>
  )
}
