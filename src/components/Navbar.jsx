import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { CONTENT } from '../data/content'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const isProductPage = location.pathname.startsWith('/mac-hud')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { navbar } = CONTENT.shared

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-theme-base'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[980px] px-5 md:px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/images/app-icon.svg" alt="KeyShortcut icon" width={28} height={28} className="rounded-lg" />
            <span className="text-base font-semibold text-theme-text">KeyShortcut</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navbar.platformLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] text-theme-muted hover:text-theme-text transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/about"
              className="text-[13px] text-theme-muted hover:text-theme-text transition-colors no-underline"
            >
              About
            </Link>
          </div>
        </div>

        <a
          href={isProductPage ? '#download' : '/mac-hud#download'}
          className="text-xs font-medium px-4 py-1.5 rounded-full no-underline transition-colors border-[1.5px] border-theme-accent hover:bg-theme-accent hover:text-theme-accent-text bg-theme-accent text-theme-accent-text"
        >
          {navbar.downloadLabel}
        </a>
      </div>
    </nav>
  )
}
