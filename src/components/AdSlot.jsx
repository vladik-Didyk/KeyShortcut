import { useEffect, useRef } from 'react'
import { CONTENT } from '../data/content'

const ADSENSE_ID = import.meta.env.VITE_ADSENSE_ID || ''

export default function AdSlot({ adSlot, format = 'auto', sponsor, className = '' }) {
  if (!sponsor && !ADSENSE_ID) return null

  // Direct sponsor mode
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

  // Google AdSense mode
  return (
    <div className={`py-8 px-5 md:px-6 ${className}`}>
      <div className="mx-auto max-w-[980px] text-center">
        <p className="text-[11px] uppercase tracking-widest text-theme-muted mb-3">Sponsored</p>
        <AdSenseUnit adSlot={adSlot} format={format} />
      </div>
    </div>
  )
}

function AdSenseUnit({ adSlot, format }) {
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

  return (
    <ins
      className="adsbygoogle block"
      data-ad-client={ADSENSE_ID}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
