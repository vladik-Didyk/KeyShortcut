import { useState, useEffect } from 'react'

const cache = new Map()
const inflight = new Map()

async function fetchPlatformData(platformId) {
  const res = await fetch(`/data/platforms/${platformId}.json`)
  if (!res.ok) throw new Error(`Failed to load ${platformId} data`)
  const data = await res.json()
  return { apps: data.apps }
}

/** Prefetch platform data in the background (call on hover) */
export function prefetchPlatform(platformId) {
  if (!platformId || cache.has(platformId) || inflight.has(platformId)) return
  const promise = fetchPlatformData(platformId)
    .then(data => cache.set(platformId, data))
    .catch(() => {})
    .finally(() => inflight.delete(platformId))
  inflight.set(platformId, promise)
}

export function usePlatformData(platformId) {
  const [, rerender] = useState(0)

  useEffect(() => {
    if (!platformId || cache.has(platformId)) return

    let cancelled = false
    const onDone = () => { if (!cancelled) rerender(v => v + 1) }

    // If prefetch is already in flight, subscribe to it instead of starting a new fetch
    if (inflight.has(platformId)) {
      inflight.get(platformId).then(onDone)
      return () => { cancelled = true }
    }

    // Start new fetch
    const promise = fetchPlatformData(platformId)
      .then(data => {
        cache.set(platformId, data)
        onDone()
      })
      .catch(() => {
        cache.set(platformId, { apps: [], error: true })
        onDone()
      })
      .finally(() => inflight.delete(platformId))

    inflight.set(platformId, promise)
    return () => { cancelled = true }
  }, [platformId])

  const cached = platformId ? cache.get(platformId) : null
  return {
    apps: cached?.apps ?? null,
    loading: !!platformId && !cached,
    error: cached?.error ? `Failed to load ${platformId} data` : null,
  }
}
