import { Link } from 'react-router'
import { useScrollspy } from '../hooks/useScrollspy'
import { getGuideBySlug } from '../data/guides'
import AdSlot from './AdSlot'
import GuideCtaBanner from './GuideCtaBanner'

/**
 * Builds the Article JSON-LD structured data string.
 * All values come from our own static guide data files (not user input),
 * so the output is safe to embed without sanitization.
 */
function buildArticleJsonLd(guide) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.lastUpdated || guide.published,
    author: {
      '@type': 'Person',
      name: 'Vladik Didyk',
      url: 'https://vladik-didyk.netlify.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'KeyShortcut',
      url: 'https://keyshortcut.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://keyshortcut.com/guides/${guide.slug}`,
    },
  })
}

export default function GuidePage({ guide }) {
  const sectionIds = guide.sections.map(s => s.id)
  const activeId = useScrollspy(sectionIds)
  const relatedGuides = (guide.relatedSlugs || [])
    .map(slug => getGuideBySlug(slug))
    .filter(Boolean)

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[980px] lg:grid lg:grid-cols-[1fr_200px] lg:gap-10">
        {/* Article */}
        <article className="max-w-[680px]">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/guides"
              className="text-sm text-theme-muted hover:text-theme-text transition-colors mb-4 inline-block"
            >
              &larr; Guides
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{guide.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-theme-muted">
              <span className="inline-block rounded-full bg-theme-base-alt px-3 py-0.5 text-xs font-medium border border-theme-border">
                {guide.category}
              </span>
              <span>{guide.readingTime}</span>
              <span>&middot;</span>
              <time dateTime={guide.published}>
                {new Date(guide.published + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              {guide.lastUpdated && guide.lastUpdated !== guide.published && (
                <>
                  <span>&middot;</span>
                  <span>
                    Updated{' '}
                    <time dateTime={guide.lastUpdated}>
                      {new Date(guide.lastUpdated + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sections */}
          {guide.sections.map(section => (
            <section key={section.id} id={section.id} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{section.heading}</h2>
              {section.content.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </section>
          ))}

          {/* CTA */}
          <GuideCtaBanner />

          {/* Related articles */}
          {relatedGuides.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">Related Guides</h3>
              <div className="space-y-3">
                {relatedGuides.map(rg => (
                  <Link
                    key={rg.slug}
                    to={`/guides/${rg.slug}`}
                    className="block rounded-2xl border border-theme-border bg-theme-base-alt p-4 transition-colors hover:border-theme-border-hover"
                  >
                    <p className="font-medium text-theme-text">{rg.title}</p>
                    <p className="text-sm text-theme-muted mt-1">{rg.readingTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related directory pages */}
          {guide.relatedApps?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4">Browse Shortcuts</h3>
              <div className="flex flex-wrap gap-2">
                {guide.relatedApps.map(app => (
                  <Link
                    key={app.to}
                    to={app.to}
                    className="rounded-full border border-theme-border bg-theme-base-alt px-4 py-1.5 text-sm transition-colors hover:border-theme-border-hover"
                  >
                    {app.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar — Table of Contents */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-theme-muted mb-3">
              On this page
            </p>
            <ul className="space-y-2 text-sm">
              {guide.sections.map(section => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`block leading-snug transition-colors ${
                      activeId === section.id
                        ? 'text-theme-text font-medium'
                        : 'text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {/* JSON-LD structured data — sourced from our own static guide data files */}
      <script
        type="application/ld+json"
        // Safe: buildArticleJsonLd uses only our own static guide data, not user input
        dangerouslySetInnerHTML={{ __html: buildArticleJsonLd(guide) }}
      />
      <script
        type="application/ld+json"
        // Safe: breadcrumb values come from our own static guide data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://keyshortcut.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://keyshortcut.com/guides' },
            { '@type': 'ListItem', position: 3, name: guide.title, item: `https://keyshortcut.com/guides/${guide.slug}` },
          ],
        }) }}
      />
    </main>
  )
}

function ContentBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p className="text-theme-muted mb-4 leading-relaxed">{block.text}</p>
  }

  if (block.type === 'list') {
    return (
      <ul className="list-disc pl-5 text-theme-muted mb-4 space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="leading-relaxed">{item}</li>
        ))}
      </ul>
    )
  }

  if (block.type === 'callout') {
    return (
      <div className="rounded-2xl bg-theme-base-alt border border-theme-border p-5 mb-4">
        <p className="text-theme-muted leading-relaxed">{block.text}</p>
      </div>
    )
  }

  if (block.type === 'shortcut-table') {
    return (
      <div className="rounded-2xl border border-theme-border overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-theme-base-alt border-b border-theme-border">
              <th className="text-left px-4 py-2.5 font-medium text-theme-muted">Shortcut</th>
              <th className="text-left px-4 py-2.5 font-medium text-theme-muted">Action</th>
            </tr>
          </thead>
          <tbody>
            {block.shortcuts.map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? '' : 'bg-theme-base-alt/50'}>
                <td className="px-4 py-2.5 font-mono text-theme-text whitespace-nowrap">
                  {s.keys}
                </td>
                <td className="px-4 py-2.5 text-theme-muted">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (block.type === 'cta') {
    return <GuideCtaBanner />
  }

  if (block.type === 'ad') {
    return <AdSlot adSlot="guide_inline" variant={block.variant || 'in-article'} />
  }

  return null
}
