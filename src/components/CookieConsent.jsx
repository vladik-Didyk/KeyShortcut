import { useState, useEffect } from 'react'
import { X } from '../utils/icons'

const CONSENT_KEY = 'cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [gdpr, setGdpr] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) return // already accepted or declined

    // Fetch region to determine if reject button is needed
    fetch('/api/geo')
      .then(r => r.ok ? r.json() : { gdpr: false })
      .then(data => setGdpr(data.gdpr))
      .catch(() => {})
      .finally(() => {
        // Show banner after a short delay regardless of geo result
        setTimeout(() => setVisible(true), 800)
      })
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="mx-auto max-w-[680px] bg-theme-accent text-theme-accent-text rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg relative">
        <p className="text-[14px] leading-relaxed flex-1">
          This website uses cookies for analytics and advertising (Google AdSense).
          By continuing to browse, you consent to our use of cookies.{' '}
          <a href="/privacy" className="underline hover:opacity-80">Learn more</a>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {gdpr && (
            <button
              onClick={decline}
              className="px-4 py-2 rounded-full text-[14px] font-medium cursor-pointer border-[1.5px] border-theme-accent-text bg-transparent text-theme-accent-text hover:opacity-80 transition-opacity"
            >
              Decline
            </button>
          )}
          <button
            onClick={accept}
            className="px-5 py-2 rounded-full text-[14px] font-medium cursor-pointer border-[1.5px] border-theme-accent-text bg-theme-accent-text text-theme-accent hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
        {gdpr && (
          <button
            onClick={decline}
            className="absolute top-3 right-3 p-1 rounded-full bg-transparent border-none cursor-pointer text-theme-accent-text hover:opacity-70 transition-opacity"
            aria-label="Dismiss cookie banner"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
