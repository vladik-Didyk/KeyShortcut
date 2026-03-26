import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function FAQ() {
  const [ref, isVisible] = useInView()
  const { faq } = CONTENT.productPage
  const faqItems = faq.items

  return (
    <section id="faq" className="py-20 md:py-28 px-5 md:px-6 section-alt">
      <div
        ref={ref}
        className={`mx-auto max-w-3xl fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-5">
          {faq.title}
        </h2>
        <p className="text-theme-muted text-xl text-center mb-10 md:mb-14">
          {faq.subtitle}
        </p>

        <div className="flex flex-col">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group border-b border-theme-border"
            >
              <summary className="flex items-center justify-between cursor-pointer py-5 text-theme-text font-medium text-lg list-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  className="w-5 h-5 text-theme-muted transition-transform duration-200 group-open:rotate-45 shrink-0 ml-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </summary>
              <div className="pb-5 text-theme-muted leading-relaxed text-base">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* FAQ JSON-LD — static data from our own faq.js, safe to inject */}
      <FaqJsonLd items={faqItems} />
    </section>
  )
}

function FaqJsonLd({ items }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })

  // Static data sourced from our own faq.js — no user input involved, safe to render
  // This is the standard React pattern for injecting JSON-LD structured data
  const markup = { __html: jsonLd }
  return <script type="application/ld+json" dangerouslySetInnerHTML={markup} />
}
