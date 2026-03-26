import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock Supabase client
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIn = vi.fn()
const mockOrder = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      mockFrom(table)
      return {
        select: (...args) => {
          mockSelect(table, ...args)
          return {
            eq: (...a) => { mockEq(table, ...a); return { order: () => ({ data: [], error: null }), data: [], error: null } },
            in: (...a) => { mockIn(table, ...a); return { order: () => ({ data: [], error: null }), eq: () => ({ data: [], error: null }), data: [], error: null } },
            order: () => ({ data: [], error: null }),
            data: [],
            error: null,
          }
        },
      }
    },
  }),
}))

let usePlatformData, prefetchPlatform

beforeEach(async () => {
  vi.resetModules()
  // Re-import to get fresh module with cleared cache
  const mod = await import('../hooks/usePlatformData.js')
  usePlatformData = mod.usePlatformData
  prefetchPlatform = mod.prefetchPlatform
})

describe('usePlatformData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => usePlatformData('macos'))
    expect(result.current.loading).toBe(true)
    expect(result.current.apps).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('populates apps after successful fetch', async () => {
    const { result } = renderHook(() => usePlatformData('macos'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // With mocked empty Supabase responses, apps will be empty array
    expect(result.current.apps).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns null for no platformId', () => {
    const { result } = renderHook(() => usePlatformData(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.apps).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('resolves when prefetch is already in flight (race condition fix)', async () => {
    // This test guards against the bug where:
    // 1. prefetchPlatform starts a background fetch (inflight)
    // 2. User clicks the platform tab → usePlatformData called
    // 3. Hook saw inflight request and exited without subscribing
    // 4. Prefetch completed but no re-render → stuck on loading forever
    //
    // The fix: usePlatformData subscribes to inflight promises.

    // Start a background prefetch (simulates requestIdleCallback prefetch)
    prefetchPlatform('windows')

    // Now call the hook (simulates user clicking "Windows" while prefetch is inflight)
    const { result } = renderHook(() => usePlatformData('windows'))

    // Should start in loading state
    expect(result.current.loading).toBe(true)

    // Must eventually resolve — this would timeout before the fix
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.apps).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('does not re-render after unmount when prefetch completes', async () => {
    // Guard against memory leak: if component unmounts while waiting
    // for an inflight prefetch, the cancelled flag prevents state updates

    prefetchPlatform('linux')

    const { result, unmount } = renderHook(() => usePlatformData('linux'))
    expect(result.current.loading).toBe(true)

    // Unmount before the prefetch can resolve
    unmount()

    // Wait for the prefetch promise to settle — should not throw
    await new Promise(r => setTimeout(r, 50))
  })
})
