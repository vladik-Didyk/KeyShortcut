import { useState } from 'react'
import { Sun, Moon } from '../utils/icons'
import { useInView } from '../hooks/useInView'

export default function FeatureSection({ title, description, screenshot, alt, reverse }) {
  const [ref, isVisible] = useInView()
  const [mode, setMode] = useState('light')

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      <div className={`flex flex-col gap-4 ${reverse ? 'md:order-2' : ''}`}>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className="text-theme-muted text-lg leading-relaxed">{description}</p>
      </div>

      <div className={`flex flex-col items-center gap-3 ${reverse ? 'md:order-1' : ''}`}>
        <img
          src={`/images/screenshots/${screenshot}-${mode}.webp`}
          alt={alt}
          width={1264}
          height={1708}
          className="w-full max-w-lg rounded-2xl screenshot-shadow"
          loading="lazy"
        />
        <div className="flex items-center gap-1 rounded-full bg-theme-base-alt border border-theme-border p-1">
          <button
            onClick={() => setMode('light')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border-none cursor-pointer ${
              mode === 'light'
                ? 'bg-theme-accent text-theme-accent-text'
                : 'text-theme-muted hover:text-theme-text'
            }`}
            aria-label="Light mode screenshot"
          >
            <Sun size={12} />
            Light
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border-none cursor-pointer ${
              mode === 'dark'
                ? 'bg-theme-accent text-theme-accent-text'
                : 'text-theme-muted hover:text-theme-text'
            }`}
            aria-label="Dark mode screenshot"
          >
            <Moon size={12} />
            Dark
          </button>
        </div>
      </div>
    </div>
  )
}
