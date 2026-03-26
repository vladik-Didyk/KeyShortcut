import { useInView } from '../hooks/useInView'
import { CONTENT } from '../data/content'

export default function Policies() {
  const [ref, isVisible] = useInView()
  const { policies: policiesContent } = CONTENT.productPage
  const policies = policiesContent.items

  return (
    <section id="policies" className="py-20 md:py-28 px-5 md:px-6">
      <div
        ref={ref}
        className={`mx-auto max-w-[980px] fade-in-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-5">
          {policiesContent.title}
        </h2>
        <p className="text-theme-muted text-xl text-center mb-10 md:mb-14">
          {policiesContent.subtitle}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="rounded-xl bg-theme-base-alt p-7 border-[1.5px] border-theme-accent transition-colors"
            >
              <h3 className="text-xl font-semibold mb-5">{policy.title}</h3>
              <ul className="flex flex-col gap-3.5">
                {policy.content.map((item, i) => (
                  <li
                    key={i}
                    className="text-theme-muted text-sm leading-relaxed flex gap-2.5"
                  >
                    <span className="text-accent shrink-0 mt-0.5 font-medium">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
