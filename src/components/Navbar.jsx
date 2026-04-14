import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from '../utils/icons'
import { CONTENT } from '../data/content'
import { APP_STORE_URL } from '../data/siteConfig'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isProductPage = location.pathname.startsWith('/mac-hud')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { navbar } = CONTENT.shared
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-theme-base'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[980px] px-5 md:px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline" onClick={closeMenu}>
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

        <div className="flex items-center gap-3">
          {APP_STORE_URL && isProductPage && (
            <a
              href="#download"
              className="text-xs font-medium px-4 py-1.5 rounded-full no-underline transition-colors border-[1.5px] border-theme-accent hover:bg-theme-accent hover:text-theme-accent-text bg-theme-accent text-theme-accent-text"
            >
              {navbar.downloadLabel}
            </a>
          )}

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-theme-text hover:bg-theme-base-alt transition-colors"
            aria-label={menuOpen ? navbar.closeMenuLabel : navbar.openMenuLabel}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-theme-border bg-theme-base">
          <div className="mx-auto max-w-[980px] px-5 py-3 flex flex-col gap-1">
            {navbar.platformLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="text-[14px] text-theme-muted hover:text-theme-text transition-colors no-underline py-2 px-2 rounded-lg hover:bg-theme-base-alt"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={closeMenu}
              className="text-[14px] text-theme-muted hover:text-theme-text transition-colors no-underline py-2 px-2 rounded-lg hover:bg-theme-base-alt"
            >
              About
            </Link>
            <Link
              to="/mac-hud"
              onClick={closeMenu}
              className="text-[14px] text-theme-muted hover:text-theme-text transition-colors no-underline py-2 px-2 rounded-lg hover:bg-theme-base-alt"
            >
              {navbar.macAppLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
