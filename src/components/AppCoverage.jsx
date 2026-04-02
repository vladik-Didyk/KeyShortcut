import { useInView } from '../hooks/useInView'
import { getIconData } from '../utils/directoryHelpers'
import { CONTENT } from '../data/content'

export default function AppCoverage() {
  const [ref, isVisible] = useInView()
  const { appCoverage } = CONTENT.productPage
  const [row1, row2] = appCoverage.rows

  return (
    <section className="py-20 md:py-28 section-alt overflow-hidden">
      <div
        ref={ref}
        className={`text-center mb-12 md:mb-16 px-5 md:px-6 fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
          {appCoverage.title}{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient">{appCoverage.titleAccent}</span>
        </h2>
        <p className="text-theme-muted text-lg max-w-xl mx-auto">
          {appCoverage.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow apps={row1} direction="left" />
        <MarqueeRow apps={row2} direction="right" />
      </div>

      <p className="text-center text-theme-muted text-sm mt-10 px-5 md:px-6">
        {appCoverage.footnote}
      </p>
    </section>
  )
}

function MarqueeRow({ apps, direction }) {
  const animClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
  const doubled = [...apps, ...apps]

  return (
    <div className="marquee-mask relative">
      <div className={`flex gap-3 ${animClass}`}>
        {doubled.map((app, i) => (
          <AppPill key={`${app}-${i}`} name={app} />
        ))}
      </div>
    </div>
  )
}

function AppPill({ name }) {
  const data = getIconData(name)

  return (
    <span className="shrink-0 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium bg-theme-base text-theme-text border border-theme-border whitespace-nowrap select-none">
      {data.type === 'image' ? (
        <img
          src={data.src}
          alt=""
          width={18}
          height={18}
          className="shrink-0 rounded-[4px]"
          aria-hidden="true"
          loading="lazy"
        />
      ) : (
        <span
          className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[10px] font-bold text-white leading-none shrink-0"
          style={{ backgroundColor: `#${data.hex}` }}
          aria-hidden="true"
        >
          {data.label}
        </span>
      )}
      {name}
    </span>
  )
}
