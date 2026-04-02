import MacAppStoreButton from './MacAppStoreButton'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function CTABanner() {
  const [ref, isVisible] = useInView()
  const { ctaBanner } = CONTENT.productPage

  return (
    <section
      id="download"
      ref={ref}
      className={`py-20 md:py-28 px-5 md:px-6 section-alt cta-glow fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      <div className="mx-auto max-w-[980px] text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
          {ctaBanner.title}
          {' '}<br className="hidden sm:block" />
          <span className="text-gradient">{ctaBanner.titleAccent}</span>
        </h2>
        <p className="text-theme-muted text-xl mb-8 md:mb-10 max-w-xl mx-auto whitespace-pre-line">
          {ctaBanner.subtitle}
        </p>
        <MacAppStoreButton />
        <p className="text-sm text-theme-muted mt-4">
          {ctaBanner.footnote}
        </p>
      </div>
    </section>
  )
}
