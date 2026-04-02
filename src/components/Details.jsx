import { Monitor, Globe, Keyboard, Clipboard, Search, ShieldCheck } from '../utils/icons'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

const ICON_MAP = { Monitor, Globe, Keyboard, Clipboard, Search, ShieldCheck }

export default function Details() {
  const [ref, isVisible] = useInView()
  const { details } = CONTENT.productPage

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div className="mx-auto max-w-[980px]">
        <div
          ref={ref}
          className={`text-center mb-16 md:mb-20 fade-in-up ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {details.title}
            <br className="hidden sm:block" />
            <span className="text-gradient">{details.titleAccent}</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.items.map((detail) => (
            <DetailCard key={detail.title} {...detail} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DetailCard({ icon, title, description }) {
  const [ref, isVisible] = useInView()
  const IconComponent = ICON_MAP[icon]

  return (
    <div
      ref={ref}
      className={`detail-card rounded-xl bg-theme-base-alt p-7 border-[1.5px] border-theme-border fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      <IconComponent className="text-accent mb-4" size={28} strokeWidth={1.5} />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-theme-muted text-sm leading-relaxed">{description}</p>
    </div>
  )
}
