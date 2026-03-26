import { CONTENT } from '../data/content'
import { SUPPORT_EMAIL } from '../data/siteConfig'

export default function PrivacyPage() {
  const { policy, terms } = CONTENT.privacy

  return (
    <main className="pt-20 pb-16 px-5 md:px-6">
      <div className="mx-auto max-w-[680px]">
        <PolicySection data={policy} />
        <hr className="border-theme-border my-10" />
        <PolicySection data={terms} id="terms" />
      </div>
    </main>
  )
}

function PolicySection({ data, id }) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-2" id={id}>{data.title}</h1>
      <p className="text-sm text-theme-muted mb-8">{data.effectiveDate}</p>
      <p className="text-theme-muted mb-4 leading-relaxed">{data.intro}</p>

      {data.sections.map((section) => (
        <div key={section.heading}>
          <h2 className="text-xl font-semibold mt-10 mb-3">{section.heading}</h2>
          {section.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>
      ))}
    </>
  )
}

function ContentBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p className="text-theme-muted mb-4 leading-relaxed">{block.text}</p>
  }

  if (block.type === 'contact') {
    return (
      <p className="text-theme-muted mb-4 leading-relaxed">
        {block.text}{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>.
      </p>
    )
  }

  if (block.type === 'list') {
    return (
      <ul className="list-disc pl-5 text-theme-muted mb-4 space-y-2">
        {block.items.map((item, i) => (
          <li key={i}>
            {typeof item === 'string' ? (
              item
            ) : (
              <>
                <strong className="text-theme-text">{item.bold}</strong>
                {item.text}
                {item.link && (
                  <a href={item.link.href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{item.link.text}</a>
                )}
                {item.textAfter}
              </>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return null
}
