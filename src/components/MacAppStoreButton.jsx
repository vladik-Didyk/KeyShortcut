import { APP_STORE_URL } from '../data/siteConfig'
import { CONTENT } from '../data/content'

// TODO: Replace with actual Mac App Store URL
export default function MacAppStoreButton({ href = APP_STORE_URL, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={CONTENT.shared.macAppStoreButton.ariaLabel}
      className={`inline-block transition-opacity hover:opacity-80 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 195 52"
        className="w-[165px] h-auto sm:w-[195px]"
        role="img"
        aria-label="Download on the Mac App Store"
      >
        <rect width="195" height="52" rx="8" fill="#fff" />
        <rect x="0.8" y="0.8" width="193.4" height="50.4" rx="7.2" fill="#000" stroke="#a6a6a6" strokeWidth="0.8" />
        <text x="52" y="16" fill="#fff" fontSize="8" fontFamily="-apple-system, 'Helvetica Neue', sans-serif" fontWeight="400">Download on the</text>
        <text x="52" y="35" fill="#fff" fontSize="16" fontFamily="-apple-system, 'Helvetica Neue', sans-serif" fontWeight="600">Mac App Store</text>
        {/* Apple logo */}
        <g transform="translate(14, 10) scale(0.65)" fill="#fff">
          <path d="M24.769 20.3a6.01 6.01 0 012.864-5.047 6.15 6.15 0 00-4.845-2.62c-2.04-.214-4.022 1.22-5.064 1.22-1.06 0-2.66-1.2-4.38-1.166a6.45 6.45 0 00-5.432 3.31c-2.346 4.06-.596 10.04 1.654 13.325 1.125 1.608 2.444 3.41 4.163 3.346 1.68-.07 2.31-1.074 4.338-1.074 2.01 0 2.6 1.074 4.35 1.036 1.803-.03 2.94-1.616 4.03-3.236a13.4 13.4 0 001.83-3.734 5.815 5.815 0 01-3.508-5.36zM21.45 10.39a5.93 5.93 0 001.355-4.25 6.04 6.04 0 00-3.907 2.02 5.65 5.65 0 00-1.39 4.1 5 5 0 003.942-1.87z" />
        </g>
      </svg>
    </a>
  )
}
