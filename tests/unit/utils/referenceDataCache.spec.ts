import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearReferenceCache,
  getCachedReference,
  invalidateReferenceCache
} from '@/utils/referenceDataCache'

describe('referenceDataCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    clearReferenceCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces concurrent loads and serves a cached value until its TTL expires', async () => {
    const loader = vi.fn().mockResolvedValue([{ id: 1 }])

    await expect(Promise.all([
      getCachedReference('processes', loader, 1_000),
      getCachedReference('processes', loader, 1_000)
    ])).resolves.toEqual([[{ id: 1 }], [{ id: 1 }]])
    expect(loader).toHaveBeenCalledTimes(1)

    await getCachedReference('processes', loader, 1_000)
    expect(loader).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1_001)
    await getCachedReference('processes', loader, 1_000)
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('does not cache failures and supports explicit invalidation', async () => {
    const loader = vi.fn()
      .mockRejectedValueOnce(new Error('network failed'))
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ id: 3 }])

    await expect(getCachedReference('departments', loader)).rejects.toThrow('network failed')
    await expect(getCachedReference('departments', loader)).resolves.toEqual([{ id: 2 }])

    invalidateReferenceCache('departments')
    await expect(getCachedReference('departments', loader)).resolves.toEqual([{ id: 3 }])
    expect(loader).toHaveBeenCalledTimes(3)
  })

  it('does not let an invalidated in-flight request overwrite newer data', async () => {
    let resolveOld!: (value: { id: number }[]) => void
    let resolveFresh!: (value: { id: number }[]) => void
    const loader = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
      .mockImplementationOnce(() => new Promise(resolve => { resolveFresh = resolve }))

    const oldRequest = getCachedReference('departments', loader)
    invalidateReferenceCache('departments')
    const freshRequest = getCachedReference('departments', loader)

    resolveOld([{ id: 1 }])
    await expect(oldRequest).resolves.toEqual([{ id: 1 }])

    const sharedFreshRequest = getCachedReference('departments', loader)
    expect(loader).toHaveBeenCalledTimes(2)

    resolveFresh([{ id: 2 }])
    await expect(Promise.all([freshRequest, sharedFreshRequest])).resolves.toEqual([
      [{ id: 2 }],
      [{ id: 2 }]
    ])
    await expect(getCachedReference('departments', loader)).resolves.toEqual([{ id: 2 }])
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
