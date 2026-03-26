import { useEffect, useRef, useState } from 'react'

export function useInView({ threshold = 0.15, rootMargin = '0px' } = {}) {
  const ref = useRef(null)
  // Start visible to avoid flash of invisible SSR content
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If already in viewport, stay visible — no animation needed
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) return

    // Below the fold — hide and animate in on scroll
    setIsVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}
