import { useRef, useEffect } from 'react'

/**
 * Animated canvas background for the product page hero.
 * Renders drifting gradient orbs and twinkling particles
 * in warm amber/gold tones. Respects prefers-reduced-motion.
 */
export default function HeroCanvas({ isVisible }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animId
    let time = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const parent = canvas.parentElement
      canvas.width = parent.offsetWidth * dpr
      canvas.height = parent.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const w = () => canvas.parentElement.offsetWidth
    const h = () => canvas.parentElement.offsetHeight

    // ─── Gradient orbs (large, soft, drifting) ───
    const orbs = [
      { x: 0.5, y: 0.2, r: 380, speed: 0.12, phase: 0, opacity: 0.07 },
      { x: 0.25, y: 0.55, r: 300, speed: 0.1, phase: 2.1, opacity: 0.045 },
      { x: 0.75, y: 0.45, r: 260, speed: 0.08, phase: 4.3, opacity: 0.035 },
      { x: 0.6, y: 0.7, r: 200, speed: 0.14, phase: 1.5, opacity: 0.025 },
    ]

    // ─── Particles (tiny, twinkling) ───
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.04,
      alpha: Math.random() * 0.3 + 0.06,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.4 + 0.15,
    }))

    const drawFrame = () => {
      const W = w()
      const H = h()
      ctx.clearRect(0, 0, W, H)
      time += 0.005

      // Draw orbs
      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(time * orb.speed + orb.phase) * 0.07) * W
        const oy = (orb.y + Math.cos(time * orb.speed * 0.6 + orb.phase) * 0.05) * H
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r)
        grad.addColorStop(0, `rgba(212, 168, 83, ${orb.opacity})`)
        grad.addColorStop(0.5, `rgba(190, 150, 70, ${orb.opacity * 0.25})`)
        grad.addColorStop(1, 'rgba(212, 168, 83, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx / W
        p.y += p.vy / H
        if (p.x < -0.02) p.x = 1.02
        if (p.x > 1.02) p.x = -0.02
        if (p.y < -0.02) p.y = 1.02
        if (p.y > 1.02) p.y = -0.02

        const pulse = 0.4 + 0.6 * Math.sin(time * p.pulseSpeed + p.pulsePhase)
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha * pulse})`
        ctx.fill()
      }
    }

    if (prefersReducedMotion) {
      drawFrame()
      return () => window.removeEventListener('resize', resize)
    }

    const loop = () => {
      drawFrame()
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isVisible])

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
