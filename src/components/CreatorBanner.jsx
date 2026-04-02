import { useState } from 'react'
import { CONTENT } from '../data/content'
import { APP_STORE_URL } from '../data/siteConfig'
import { MapPin } from '../utils/icons'

function GitHubIcon({ className }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}

function LinkedInIcon({ className }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function CreatorBanner() {
  const { missing, openSource, creator } = CONTENT.about.cards

  return (
    <div className="space-y-5">
      {/* ─── Top row: two cards ─── */}
      <div className="grid md:grid-cols-2 gap-5">
      {/* ─── Missing something? ─── */}
      <div className="rounded-2xl bg-theme-accent p-8 flex flex-col justify-between">
        <div>
          <p className="text-[13px] font-medium text-theme-accent-text/70 mb-2">
            {missing.label}
          </p>
          <h3 className="text-2xl font-bold text-theme-accent-text mb-3">
            {missing.title}
          </h3>
          <p className="text-[15px] text-theme-accent-text/80 leading-relaxed mb-6">
            {missing.text}
          </p>
        </div>
        <div>
          <a
            href={missing.buttonHref}
            className="inline-block px-6 py-2.5 rounded-full text-[14px] font-medium no-underline transition-opacity hover:opacity-90 bg-theme-base text-theme-accent"
          >
            {missing.buttonLabel}
          </a>
        </div>
      </div>

      {/* ─── Open source ─── */}
      <div className="rounded-2xl bg-theme-base-alt border border-theme-border p-8 flex flex-col justify-between">
        <div>
          <p className="text-[13px] font-medium text-theme-muted mb-2">
            {openSource.label}
          </p>
          <h3 className="text-2xl font-bold text-theme-text mb-3">
            {openSource.title}
          </h3>
          <p className="text-[15px] text-theme-muted leading-relaxed mb-6">
            {openSource.text}
          </p>
        </div>
        <div>
          <a
            href={openSource.buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-medium no-underline transition-colors border-[1.5px] border-theme-accent bg-transparent text-theme-accent hover:bg-theme-accent hover:text-theme-accent-text"
          >
            <GitHubIcon className="w-4 h-4" />
            {openSource.buttonLabel}
          </a>
        </div>
      </div>
      </div>

      {/* ─── Bottom: Created by ─── */}
      <div className="rounded-2xl bg-theme-base-alt border border-theme-border p-8">
        <div className="flex items-start gap-4 mb-4">
          <AvatarImage src={creator.avatar} name={creator.name} />
          <div>
            <p className="text-[12px] text-theme-muted leading-none mb-1">
              {creator.label}
            </p>
            <a
              href={creator.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-theme-text leading-tight no-underline hover:text-accent transition-colors"
            >
              {creator.name}
            </a>
            {creator.title && (
              <p className="text-[13px] text-theme-muted mt-0.5">{creator.title}</p>
            )}
            {creator.location && (
              <p className="text-[13px] text-theme-muted mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {creator.location}
              </p>
            )}
          </div>
        </div>

        <p className="text-[15px] text-theme-muted leading-relaxed mb-5">
          {creator.bio}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {APP_STORE_URL && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center no-underline transition-opacity hover:opacity-80"
            >
              <img
                src="/images/app-store-badge.png"
                alt="Download on the App Store"
                width={140}
                height={47}
                className="h-[40px] w-auto pointer-events-none"
              />
            </a>
          )}
          {creator.links?.linkedin && (
            <a
              href={creator.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium no-underline text-theme-muted hover:text-theme-text transition-colors"
            >
              <LinkedInIcon className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          {creator.links?.github && (
            <a
              href={creator.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium no-underline text-theme-muted hover:text-theme-text transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function AvatarImage({ src, name }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)

  if (failed) {
    return (
      <div className="w-12 h-12 rounded-full bg-theme-accent text-theme-accent-text flex items-center justify-center text-[17px] font-semibold shrink-0">
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      width={48}
      height={48}
      className="w-12 h-12 rounded-full object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  )
}
