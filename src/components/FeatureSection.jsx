import { useInView } from '../hooks/useInView'

export default function FeatureSection({ title, description, screenshot, alt, reverse }) {
  const [ref, isVisible] = useInView()

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      <div className={`flex flex-col gap-4 ${reverse ? 'md:order-2' : ''}`}>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className="text-theme-muted text-lg leading-relaxed">{description}</p>
      </div>

      <div className={`flex justify-center ${reverse ? 'md:order-1' : ''}`}>
        <div className="w-full max-w-lg macos-frame">
          <div className="macos-frame-titlebar">
            <span className="macos-frame-dot macos-frame-dot--close" />
            <span className="macos-frame-dot macos-frame-dot--minimize" />
            <span className="macos-frame-dot macos-frame-dot--maximize" />
          </div>
          <img
            src={`/images/screenshots/${screenshot}-dark.png`}
            alt={alt}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
