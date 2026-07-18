const DEFAULT_TTL = 5 * 60 * 1000
const MAX_ENTRIES = 20

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const entries = new Map<string, CacheEntry<unknown>>()
const inFlight = new Map<string, Promise<unknown>>()
const keyGenerations = new Map<string, number>()
let cacheGeneration = 0

function generationFor(key: string): string {
  return `${cacheGeneration}:${keyGenerations.get(key) ?? 0}`
}

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

  const requestGeneration = generationFor(key)
  const request = loader()
    .then(value => {
      if (requestGeneration === generationFor(key)) {
        entries.delete(key)
        while (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value!)
        entries.set(key, { value, expiresAt: Date.now() + ttl })
      }
      return value
    })
    .finally(() => {
      if (inFlight.get(key) === request) inFlight.delete(key)
    })

  inFlight.set(key, request)
  return request
}

export function invalidateReferenceCache(key: string): void {
  entries.delete(key)
  inFlight.delete(key)
  keyGenerations.set(key, (keyGenerations.get(key) ?? 0) + 1)
}

export function clearReferenceCache(): void {
  entries.clear()
  inFlight.clear()
  keyGenerations.clear()
  cacheGeneration++
}

export const referenceCacheKeys = {
  activeProcesses: 'active-processes',
  departments: 'departments'
} as const
