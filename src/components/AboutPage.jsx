import { CONTENT } from '../data/content'
import CreatorBanner from './CreatorBanner'

export default function AboutPage() {
  const { about } = CONTENT

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[680px]">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{about.title}</h1>

        {about.sections.map((section, si) => (
          <div key={si} className="mb-8">
            {section.heading && (
              <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
            )}
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-theme-muted mb-4 leading-relaxed">{p}</p>
            ))}
          </div>
        ))}
      </div>

      {/* ─── Creator + Contribute cards ─── */}
      <div className="mx-auto max-w-[780px] mt-6 mb-4">
        <CreatorBanner />
      </div>
    </main>
  )
}
