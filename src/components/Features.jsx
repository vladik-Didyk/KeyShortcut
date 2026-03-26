import FeatureSection from './FeatureSection'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function Features() {
  const [ref, isVisible] = useInView()
  const { title, titleAccent, subtitle, items: features } = CONTENT.productPage.features

  return (
    <section id="features" className="py-20 md:py-28 px-5 md:px-6 section-alt">
      <div className="mx-auto max-w-[980px]">
        <div
          ref={ref}
          className={`text-center mb-16 md:mb-20 fade-in-up ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {title}{' '}
            <span className="text-accent">{titleAccent}</span>
          </h2>
          <p className="text-theme-muted text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {features.map((feature, i) => (
            <FeatureSection
              key={feature.title}
              {...feature}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
