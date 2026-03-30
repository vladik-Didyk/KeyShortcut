import { useState } from 'react'
import { CONTENT } from '../data/content'
import { APP_STORE_URL } from '../data/siteConfig'

export default function CreatorBanner() {
  const { missing, creator } = CONTENT.about.cards

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* ─── Left: Missing something? ─── */}
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

      {/* ─── Right: Created by ─── */}
      <div className="rounded-2xl bg-theme-base-alt border border-theme-border p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3.5 mb-4">
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
            </div>
          </div>
          <p className="text-[15px] text-theme-muted leading-relaxed mb-6">
            {creator.bio}
          </p>
        </div>
        <div>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-full text-[14px] font-medium no-underline transition-colors border-[1.5px] border-theme-accent bg-transparent text-theme-accent hover:bg-theme-accent hover:text-theme-accent-text"
          >
            {creator.buttonLabel}
          </a>
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
