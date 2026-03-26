import { Play } from '../utils/icons'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function VideoSection() {
  const [ref, isVisible] = useInView()
  const { video } = CONTENT.productPage

  return (
    <section
      id="video"
      ref={ref}
      className={`py-20 md:py-28 px-5 md:px-6 fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      <div className="mx-auto max-w-[980px] text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
          {video.title} <span className="text-accent">{video.titleAccent}</span>
        </h2>
        <p className="text-theme-muted text-xl mb-10 md:mb-14">
          {video.subtitle}
        </p>

        <div className="aspect-video rounded-2xl bg-theme-base-alt border border-theme-border flex items-center justify-center cursor-pointer group overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 bg-theme-accent"
            >
              <Play className="text-theme-base ml-1 w-7 h-7 md:w-9 md:h-9" />
            </div>
            <span className="text-theme-muted text-sm">{video.placeholder}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
