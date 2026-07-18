const DEFAULT_TTL = 5 * 60 * 1000
const MAX_ENTRIES = 20

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const entries = new Map<string, CacheEntry<unknown>>()
const inFlight = new Map<string, Promise<unknown>>()

/**
 * Reads stable reference data from a bounded, in-memory cache. Concurrent
 * callers for the same key share one request; rejected requests are never
 * retained and can be retried immediately.
 */
export async function getCachedReference<T>(
  key: string,
  loader: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const entry = entries.get(key) as CacheEntry<T> | undefined
  if (entry && entry.expiresAt > Date.now()) return entry.value
  if (entry) entries.delete(key)

  const pending = inFlight.get(key) as Promise<T> | undefined
  if (pending) return pending

  const request = loader()
    .then(value => {
      entries.delete(key)
      while (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value!)
      entries.set(key, { value, expiresAt: Date.now() + ttl })
      return value
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, request)
  return request
}

export function invalidateReferenceCache(key: string): void {
  entries.delete(key)
}

export const referenceCacheKeys = {
  activeProcesses: 'active-processes',
  departments: 'departments'
} as const
