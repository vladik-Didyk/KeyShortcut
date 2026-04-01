import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockResponse = { apps: [] }

let fetchSpy

beforeEach(async () => {
  vi.resetModules()
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
  })
})

afterEach(() => {
  fetchSpy.mockRestore()
})

let usePlatformData, prefetchPlatform

beforeEach(async () => {
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

    expect(result.current.apps).toEqual([])
    expect(result.current.error).toBeNull()
    expect(fetchSpy).toHaveBeenCalledWith('/data/platforms/macos.json')
  })

  it('returns null for no platformId', () => {
    const { result } = renderHook(() => usePlatformData(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.apps).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('resolves when prefetch is already in flight (race condition fix)', async () => {
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
    prefetchPlatform('linux')

    const { result, unmount } = renderHook(() => usePlatformData('linux'))
    expect(result.current.loading).toBe(true)

    // Unmount before the prefetch can resolve
    unmount()

    // Wait for the prefetch promise to settle — should not throw
    await new Promise(r => setTimeout(r, 50))
  })
})
