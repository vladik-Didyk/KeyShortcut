import { useState, useEffect } from 'react'

const CONSENT_KEY = 'cookie-consent-accepted'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if not already accepted and we're in a browser
    if (typeof window !== 'undefined' && !localStorage.getItem(CONSENT_KEY)) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="mx-auto max-w-[680px] bg-theme-accent text-theme-accent-text rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
        <p className="text-[14px] leading-relaxed flex-1">
          This website uses cookies for analytics and advertising (Google AdSense).
          By continuing to browse, you consent to our use of cookies.{' '}
          <a href="/privacy" className="underline hover:opacity-80">Learn more</a>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-5 py-2 rounded-full text-[14px] font-medium cursor-pointer border-[1.5px] border-theme-accent-text bg-theme-accent-text text-theme-accent hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
