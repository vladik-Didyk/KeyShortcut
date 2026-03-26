import { Link } from 'react-router'
import { getIconData, slugToIconName } from '../utils/directoryHelpers'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

// Build display name → slug mapping from the existing slugToIconName reverse map
const nameToSlug = {}
for (const [slug, name] of Object.entries(slugToIconName)) {
  nameToSlug[name] = slug
}
// Also add simple names where slug === lowercase name
const simpleNames = [
  'Finder','Mail','Notes','Calendar','Reminders','Photos','Preview','Pages',
  'Numbers','Keynote','Messages','Music','Safari','Terminal','Chrome','Edge',
  'Firefox','Brave','Arc','Vivaldi','Chromium','Opera','Xcode','Cursor',
  'Eclipse','Vim','Atom','Postman','Slack','Discord','Telegram','Zoom',
  'Teams','Notion','Obsidian','Things','Todoist','Linear','Raycast','Jira',
  'Trello','Asana','Bear','Confluence','GitLab','Figma','Sketch','Blender',
  'Canva','GIMP','Inkscape','Maya','Webflow','Photoshop','Illustrator',
  'Acrobat','Word','Excel','Spotify','VLC','Tower','Unity','Rider',
  'Processing','Insomnia','Stata','Minitab',
]
for (const name of simpleNames) {
  if (!nameToSlug[name]) nameToSlug[name] = name.toLowerCase()
}

function AppIcon({ name }) {
  const data = getIconData(name)

  if (data.type === 'image') {
    return (
      <img
        src={data.src}
        alt=""
        width={32}
        height={32}
        className="shrink-0 rounded-lg"
        aria-hidden="true"
        loading="lazy"
      />
    )
  }

  return (
    <span
      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: `#${data.hex}` }}
      aria-hidden="true"
    >
      {data.label}
    </span>
  )
}

function AppCard({ name }) {
  const slug = nameToSlug[name]
  const inner = (
    <>
      <AppIcon name={name} />
      <span className="text-sm font-medium text-theme-text truncate">{name}</span>
    </>
  )

  const className = "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-theme-border hover:bg-theme-surface transition-all hover:-translate-y-0.5"

  if (slug) {
    return (
      <Link to={`/macos/${slug}`} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={className}>
      {inner}
    </div>
  )
}

export default function AppGrid() {
  const [ref, isVisible] = useInView()
  const { appGrid } = CONTENT.productPage
  const { categories: appCategories } = appGrid

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
                  <AppCard key={app} name={app} />
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
                  <AppCard key={app} name={app} />
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/macos"
            className="text-accent hover:underline font-medium"
          >
            {appGrid.viewAll} &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
