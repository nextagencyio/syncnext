// Simple in-memory cache for Contentful data
// In production, consider using Redis or another persistent cache

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ContentfulCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Generate cache key for Contentful queries
  generateKey(operation: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)

    return `${operation}:${JSON.stringify(sortedParams)}`
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const validEntries = entries.filter(([, entry]) => now - entry.timestamp <= entry.ttl)

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
    }
  }
}

// Export singleton instance
export const contentfulCache = new ContentfulCache()

// Cache wrapper function for async operations
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = contentfulCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, fetch the data
  const data = await fetchFn()

  // Store in cache
  contentfulCache.set(key, data, ttl)

  return data
}
