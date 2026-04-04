import { Star } from '../utils/icons'
import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function SocialProof() {
  const [ref, isVisible] = useInView()
  const { socialProof } = CONTENT.productPage

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[980px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        {/* Rating badge */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                className="text-theme-accent"
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </div>
          <p className="text-lg font-semibold">{socialProof.ratingLabel}</p>
          <p className="text-sm text-theme-muted">{socialProof.ratingSource}</p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {socialProof.testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-theme-border bg-theme-base-alt p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-theme-accent"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <p className="text-[15px] leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-theme-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
