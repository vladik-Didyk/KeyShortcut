import { useEffect, useRef, useSyncExternalStore } from 'react'
import { CONTENT } from '../data/content'

const ADSENSE_ID = import.meta.env.VITE_ADSENSE_ID || ''
const IS_PROD = import.meta.env.PROD

export default function AdSlot({ adSlot, variant = 'banner', format = 'auto', sponsor, className = '' }) {
  if (!sponsor && !ADSENSE_ID) return null

  // Direct sponsor mode — always visible
  if (sponsor) {
    return (
      <div className={`py-8 px-5 md:px-6 ${className}`}>
        <div className="mx-auto max-w-[980px] text-center">
          <p className="text-[11px] uppercase tracking-widest text-theme-muted mb-3">{CONTENT.shared.adSlot.sponsoredLabel}</p>
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block rounded-2xl border border-theme-border hover:border-theme-border-hover transition-colors overflow-hidden"
          >
            <img
              src={sponsor.image}
              alt={sponsor.alt || 'Sponsor'}
              className="max-w-full h-auto max-h-24"
            />
          </a>
        </div>
      </div>
    )
  }

  // Google AdSense — only render in production and when consent not declined
  if (!IS_PROD) return null
  if (typeof window !== 'undefined' && localStorage.getItem('cookie-consent') === 'declined') return null

  if (variant === 'in-article') {
    return (
      <AdWrapper className={`py-8 px-5 md:px-6 ${className}`}>
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-2xl bg-theme-base-alt border border-theme-border p-5 text-center">
            <AdSenseUnit adSlot={adSlot} format="fluid" layout="in-article" />
          </div>
        </div>
      </AdWrapper>
    )
  }

  if (variant === 'in-feed') {
    return (
      <AdWrapper className={`flex flex-col items-center py-6 px-4 rounded-2xl border border-theme-border bg-theme-base-alt ${className}`}>
        <AdSenseUnit adSlot={adSlot} format="fluid" layoutKey="-fb+5w+4e-db+86" />
      </AdWrapper>
    )
  }

  // Default: banner
  return (
    <AdWrapper className={`py-8 px-5 md:px-6 ${className}`}>
      <div className="mx-auto max-w-[980px] text-center">
        <AdSenseUnit adSlot={adSlot} format={format} />
      </div>
    </AdWrapper>
  )
}

/**
 * Wrapper that stays hidden until the AdSense <ins> inside it gets filled.
 * Uses useSyncExternalStore to subscribe to the ad fill status without
 * calling setState inside an effect.
 */
function AdWrapper({ children, className }) {
  const ref = useRef(null)
  const filledRef = useRef(false)
  const listenersRef = useRef(new Set())

  const subscribe = (callback) => {
    listenersRef.current.add(callback)
    return () => listenersRef.current.delete(callback)
  }

  const getSnapshot = () => filledRef.current

  const filled = useSyncExternalStore(subscribe, getSnapshot, () => false)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const ins = container.querySelector('ins.adsbygoogle')
    if (!ins) return

    const check = () => {
      if (ins.getAttribute('data-ad-status') === 'filled' && !filledRef.current) {
        filledRef.current = true
        listenersRef.current.forEach(cb => cb())
      }
    }

    // Check immediately in case already filled
    check()

    const observer = new MutationObserver(check)
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={filled ? undefined : { display: 'none' }}>
      {filled && (
        <p className="text-[10px] uppercase tracking-widest text-theme-muted mb-3 text-center">Sponsored</p>
      )}
      {children}
    </div>
  )
}

function AdSenseUnit({ adSlot, format, layout, layoutKey }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // AdSense not loaded or blocked
    }
  }, [])

  const attrs = {
    className: 'adsbygoogle block',
    'data-ad-client': ADSENSE_ID,
    'data-ad-slot': adSlot,
    'data-ad-format': format,
  }

  if (layout) attrs['data-ad-layout'] = layout
  if (layoutKey) attrs['data-ad-layout-key'] = layoutKey
  if (format === 'auto') attrs['data-full-width-responsive'] = 'true'

  return <ins {...attrs} />
}
