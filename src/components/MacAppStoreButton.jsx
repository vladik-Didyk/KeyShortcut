import { APP_STORE_URL } from '../data/siteConfig'
import { CONTENT } from '../data/content'
import { trackEvent } from '../lib/analytics'

export default function MacAppStoreButton({ href = APP_STORE_URL, className = '' }) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={CONTENT.shared.macAppStoreButton.ariaLabel}
      className={`inline-flex items-center justify-center transition-opacity hover:opacity-80 ${className}`}
      onClick={() => trackEvent('app_store_clicked', { destination: href })}
    >
      <img
        src="/images/app-store-badge.png"
        alt="Download on the App Store"
        width={195}
        height={65}
        className="h-[44px] w-auto sm:h-[52px] pointer-events-none"
      />
    </a>
  )
}
