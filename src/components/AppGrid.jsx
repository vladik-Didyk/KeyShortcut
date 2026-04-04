import { Link } from 'react-router'
import AppIcon from './directory/AppIcon'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

function AppCard({ app }) {
  return (
    <Link
      to={`/macos/${app.slug}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-theme-border hover:bg-theme-surface transition-all hover:-translate-y-0.5"
    >
      <AppIcon slug={app.slug} displayName={app.displayName} size={32} className="rounded-lg" />
      <span className="text-sm font-medium text-theme-text truncate">{app.displayName}</span>
    </Link>
  )
}

export default function AppGrid({ appCategories }) {
  const [ref, isVisible] = useInView()
  const { appGrid } = CONTENT.productPage

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[980px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-5">
          {appGrid.title}
        </h2>
        <p className="text-theme-muted text-lg text-center mb-10 md:mb-14 max-w-xl mx-auto">
          {appGrid.subtitle}
        </p>

        {/* Desktop: open grid */}
        <div className="hidden md:flex flex-col gap-10">
          {appCategories.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-theme-muted mb-4">
                {cat.name}
              </h3>
              <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                {cat.apps.map((app) => (
                  <AppCard key={app.slug} app={app} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: collapsible details */}
        <div className="flex flex-col md:hidden">
          {appCategories.map((cat) => (
            <details key={cat.name} className="group border-b border-theme-border">
              <summary className="flex items-center justify-between cursor-pointer py-5 text-theme-text font-medium text-lg list-none [&::-webkit-details-marker]:hidden">
                {cat.name}
                <span className="text-theme-muted text-sm mr-2">{cat.apps.length} apps</span>
              </summary>
              <div className="pb-5 grid grid-cols-2 gap-2">
                {cat.apps.map((app) => (
                  <AppCard key={app.slug} app={app} />
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/macos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            {appGrid.viewAll} &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
