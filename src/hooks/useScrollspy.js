import { useState, useEffect } from 'react'

export function useScrollspy(ids) {
  const [activeId, setActiveId] = useState(ids[0] || '')

  useEffect(() => {
    if (!ids.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
