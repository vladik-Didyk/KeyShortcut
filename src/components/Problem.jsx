import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function Problem() {
  const [ref, isVisible] = useInView()
  const { problem } = CONTENT.productPage

  return (
    <section className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[680px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-8 leading-tight">
          {problem.title}{' '}
          <span className="text-accent">{problem.titleAccent}</span>
        </h2>
        <div className="text-theme-muted text-lg leading-relaxed space-y-5">
          {problem.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
