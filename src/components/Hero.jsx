import { useState, useEffect, useRef } from 'react'
import MacAppStoreButton from './MacAppStoreButton'
import AppPanelMockup from './AppPanelMockup'
import HeroCanvas from './HeroCanvas'
import { useInView } from '../hooks/useInView'
import { DEMO_APPS, buildDemoTimeline } from '../data/heroDemoData'
import { MAC_ROWS } from '../data/keyboardLayout'
import { CONTENT } from '../data/content'

// ─── Build timeline from demo data ───
const { frames: FRAMES, duration: LOOP_MS } = buildDemoTimeline(DEMO_APPS)

// ─── Component ───
export default function Hero() {
  const [ref, isVisible] = useInView()
  const [activeKeys, setActiveKeys] = useState(new Set())
  const [appIndex, setAppIndex] = useState(0)
  const [highlightedMods, setHighlightedMods] = useState(new Set())
  const [highlightedShortcut, setHighlightedShortcut] = useState(null)
  const [panelTransitioning, setPanelTransitioning] = useState(false)
  const [action, setAction] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const prevRef = useRef({ action: null, appIndex: -1 })

  useEffect(() => {
    if (!isVisible) return
    const startTime = performance.now() + 1400
    let rafId
    let lastIdx = -1

    const tick = (now) => {
      const elapsed = now - startTime
      if (elapsed < 0) { rafId = requestAnimationFrame(tick); return }
      const loopTime = elapsed % LOOP_MS
      let idx = 0
      for (let i = FRAMES.length - 1; i >= 0; i--) {
        if (loopTime >= FRAMES[i].t) { idx = i; break }
      }
      if (idx !== lastIdx) {
        lastIdx = idx
        const frame = FRAMES[idx]
        setActiveKeys(frame.keys)
        setHighlightedMods(frame.highlightedModifiers)
        setHighlightedShortcut(frame.highlightedShortcut)

        // App switch
        if (frame.appIndex !== prevRef.current.appIndex) {
          setAppIndex(frame.appIndex)
          setPanelTransitioning(frame.transitioning)
          prevRef.current.appIndex = frame.appIndex
        } else {
          setPanelTransitioning(false)
        }

        // Action label
        const newAction = frame.highlightedShortcut?.action ?? null
        if (newAction !== prevRef.current.action) {
          setAction(newAction)
          if (newAction) setAnimKey(n => n + 1)
          prevRef.current.action = newAction
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isVisible])

  const isActive = (key) => {
    if (key.mod) return !key.id.endsWith('-r') && activeKeys.has(key.mod)
    return activeKeys.has(key.id)
  }

  const currentApp = DEMO_APPS[appIndex]
  const { hero } = CONTENT.productPage

  return (
    <section
      id="hero"
      ref={ref}
      className={`relative pt-32 md:pt-40 lg:pt-48 pb-16 md:pb-20 lg:pb-12 px-5 md:px-6 overflow-hidden fade-in-up ${isVisible ? 'visible' : ''}`}
    >
      {/* ─── Animated canvas background ─── */}
      <HeroCanvas isVisible={isVisible} />

      {/* ═══════ Centered hero text (all screen sizes) ═══════ */}
      <div className="relative z-10 mx-auto max-w-[980px] text-center hero-stagger">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold leading-[1.02] tracking-[-0.03em] mb-6">
          {hero.headline}
          <br />
          <span className="text-gradient">{hero.headlineAccent}</span>
        </h1>

        <p
          className="text-lg md:text-xl text-theme-muted leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ textWrap: 'balance' }}
        >
          {hero.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <MacAppStoreButton />
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-3 mb-3">
          {hero.stats.map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-base-alt/60 border border-theme-border backdrop-blur-sm"
            >
              <span className="text-lg font-bold text-theme-text leading-none">{stat.value}</span>
              <span className="text-[11px] text-theme-muted leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-theme-muted">
          {hero.platformInfoMobile}
        </p>
      </div>

      {/* ═══════ LARGE SCREENS (lg+): demo showcase ═══════ */}
      <div className="hidden lg:block relative z-10 mx-auto max-w-[1100px] mt-16">
        {/* Action label */}
        <div className="h-8 flex items-center justify-center mb-3">
          {action ? (
            <div
              key={animKey}
              className="text-center animate-[hero-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
            >
              <span className="text-xl font-bold text-gradient">{action}</span>
            </div>
          ) : (
            <span className="text-xs text-theme-muted">
              {hero.keyboardHint}
            </span>
          )}
        </div>

        {/* Panel + Keyboard side by side */}
        <div className="flex gap-5 items-start">
          <div className="shrink-0">
            <AppPanelMockup
              app={currentApp}
              highlightedModifiers={highlightedMods}
              highlightedShortcut={highlightedShortcut}
              transitioning={panelTransitioning}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="p-2">
              {MAC_ROWS.map((row, ri) => (
                <div key={ri} className="flex gap-[3px] mb-[3px] last:mb-0">
                  {row.map((key) => {
                    const lit = isActive(key)
                    return (
                      <div
                        key={key.id}
                        className={`
                          ${ri === 0 ? 'h-6 text-[9px]' : 'h-9 text-[12px]'}
                          rounded-[6px] font-medium flex items-center justify-center
                          select-none keycap-interactive keycap-hero
                        `}
                        data-active={lit}
                        style={{ flex: key.w }}
                      >
                        {key.label}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE/TABLET: static screenshot ═══════ */}
      <div className="lg:hidden relative z-10 mt-12">
        <div className="relative mx-auto max-w-[520px]">
          <img
            src="/images/keyflow-black.png"
            alt="KeyShortcut floating shortcut panel"
            loading="eager"
            fetchPriority="high"
            className="hero-app-screenshot rounded-2xl screenshot-shadow"
          />
        </div>
        <p className="text-center text-sm text-theme-muted mt-5">
          {hero.mobileCta}
        </p>
      </div>
    </section>
  )
}
