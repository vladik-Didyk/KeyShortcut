import { useState } from 'react'
import { Link } from 'react-router'
import { CONTENT } from '../data/content'

export default function Footer() {
  const year = new Date().getFullYear()
  const { footer } = CONTENT.shared
  const creator = CONTENT.about.cards.creator

  return (
    <footer className="border-t border-theme-border pt-14 pb-8 px-5 md:px-6">
      <div className="mx-auto max-w-[980px]">

        {/* ─── Top: Logo + Columns ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 no-underline mb-4">
              <img
                src="/images/app-icon.svg"
                alt="KeyShortcut icon"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-[17px] font-semibold text-theme-text">{CONTENT.shared.siteName}</span>
            </Link>
            <p className="text-[14px] text-theme-muted leading-relaxed max-w-[240px]">
              {footer.tagline}
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-theme-text mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <FooterLink key={link.to} to={link.to}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="border-t border-theme-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[13px] text-theme-muted">
            &copy; {year} {footer.copyright}
          </span>

          {/* Created by badge */}
          <a href={creator.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline group">
            <FooterAvatar src={creator.avatar} name={creator.name} />
            <span className="flex flex-col">
              <span className="text-[11px] text-theme-muted leading-none">{creator.label}</span>
              <span className="text-[13px] font-medium text-theme-text group-hover:text-accent transition-colors leading-tight">{creator.name}</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterAvatar({ src, name }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)

  if (failed) {
    return (
      <span className="w-7 h-7 rounded-full bg-theme-accent text-theme-accent-text flex items-center justify-center text-[11px] font-semibold shrink-0">
        {initials}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      width={28}
      height={28}
      className="w-7 h-7 rounded-full object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  )
}

function FooterLink({ to, children }) {
  const hasHash = to.includes('#')
  const cls = "text-[14px] text-theme-muted hover:text-theme-text transition-colors no-underline"
  return (
    <li className="list-none">
      {hasHash ? (
        <a href={to} className={cls}>{children}</a>
      ) : (
        <Link to={to} className={cls}>{children}</Link>
      )}
    </li>
  )
}
