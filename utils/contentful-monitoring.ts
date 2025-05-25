// Contentful API monitoring and performance tracking

interface APIMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  cacheHitRate: number
  lastRequestTime: number
}

interface RequestLog {
  timestamp: number
  operation: string
  contentType?: string
  responseTime: number
  success: boolean
  cacheHit: boolean
  error?: string
}

class ContentfulMonitor {
  private metrics: APIMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    lastRequestTime: 0,
  }

  private requestLogs: RequestLog[] = []
  private maxLogSize = 100 // Keep last 100 requests

  logRequest(log: RequestLog): void {
    this.requestLogs.push(log)

    // Keep only the most recent logs
    if (this.requestLogs.length > this.maxLogSize) {
      this.requestLogs.shift()
    }

    // Update metrics
    this.updateMetrics(log)
  }

  private updateMetrics(log: RequestLog): void {
    this.metrics.totalRequests++
    this.metrics.lastRequestTime = log.timestamp

    if (log.success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }

    // Update average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + log.responseTime
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests

    // Update cache hit rate
    const cacheHits = this.requestLogs.filter(l => l.cacheHit).length
    this.metrics.cacheHitRate = (cacheHits / this.requestLogs.length) * 100
  }

  getMetrics(): APIMetrics {
    return { ...this.metrics }
  }

  getRecentLogs(count = 10): RequestLog[] {
    return this.requestLogs.slice(-count)
  }

  getErrorLogs(): RequestLog[] {
    return this.requestLogs.filter(log => !log.success)
  }

  // Performance analysis
  getSlowRequests(threshold = 2000): RequestLog[] {
    return this.requestLogs.filter(log => log.responseTime > threshold)
  }

  getContentTypeStats(): Record<string, { count: number; avgResponseTime: number }> {
    const stats: Record<string, { count: number; totalTime: number }> = {}

    this.requestLogs.forEach(log => {
      if (log.contentType) {
        if (!stats[log.contentType]) {
          stats[log.contentType] = { count: 0, totalTime: 0 }
        }
        stats[log.contentType].count++
        stats[log.contentType].totalTime += log.responseTime
      }
    })

    // Convert to average response times
    const result: Record<string, { count: number; avgResponseTime: number }> = {}
    Object.entries(stats).forEach(([contentType, data]) => {
      result[contentType] = {
        count: data.count,
        avgResponseTime: data.totalTime / data.count,
      }
    })

    return result
  }

  // Reset metrics (useful for testing or periodic resets)
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      lastRequestTime: 0,
    }
    this.requestLogs = []
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics()
    const errorLogs = this.getErrorLogs()
    const slowRequests = this.getSlowRequests()
    const contentTypeStats = this.getContentTypeStats()

    return `
Contentful API Performance Report
================================

Overall Metrics:
- Total Requests: ${metrics.totalRequests}
- Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%
- Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms
- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%

Performance Issues:
- Failed Requests: ${metrics.failedRequests}
- Slow Requests (>2s): ${slowRequests.length}

Content Type Performance:
${Object.entries(contentTypeStats)
        .map(([type, stats]) => `- ${type}: ${stats.count} requests, ${stats.avgResponseTime.toFixed(2)}ms avg`)
        .join('\n')}

Recent Errors:
${errorLogs.slice(-5).map(log => `- ${new Date(log.timestamp).toISOString()}: ${log.operation} - ${log.error}`).join('\n')}
    `.trim()
  }
}

// Export singleton instance
export const contentfulMonitor = new ContentfulMonitor()

// Wrapper function to monitor API calls
export async function withMonitoring<T>(
  operation: string,
  contentType: string | undefined,
  apiCall: () => Promise<T>,
  cacheHit = false
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await apiCall()
    const responseTime = Date.now() - startTime

    contentfulMonitor.logRequest({
      timestamp: startTime,
      operation,
      contentType,
      responseTime,
      success: true,
      cacheHit,
    })

    return result
  } catch (error) {
    const responseTime = Date.now() - startTime

    contentfulMonitor.logRequest({
      timestamp: startTime,
      operation,
      contentType,
      responseTime,
      success: false,
      cacheHit,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}
