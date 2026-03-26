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
        <img
          src={`/images/screenshots/${screenshot}-1440x900.jpg`}
          srcSet={`/images/screenshots/${screenshot}-1440x900.jpg 1440w, /images/screenshots/${screenshot}-2880x1800.jpg 2880w`}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={alt}
          className="w-full max-w-lg rounded-2xl screenshot-shadow"
          loading="lazy"
        />
      </div>
    </div>
  )
}
