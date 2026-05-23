/** 统一日志工具 */

export interface Logger {
  error: (message: string, error?: unknown) => void
  warn: (message: string, data?: unknown) => void
  info: (message: string, data?: unknown) => void
  debug: (message: string, data?: unknown) => void
}

const logger: Logger = {
  error(message: string, error?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error)
    } else {
      try {
        const logs = JSON.parse(localStorage.getItem('error_logs') || '[]') as Array<Record<string, unknown>>
        logs.push({
          timestamp: new Date().toISOString(),
          message,
          error: (error as Error)?.message || String(error),
          stack: (error as Error)?.stack
        })
        if (logs.length > 50) logs.shift()
        localStorage.setItem('error_logs', JSON.stringify(logs))
      } catch {
        // 忽略存储错误
      }
    }
  },

  warn(message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data)
    }
  },

  info(message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data)
    }
  },

  debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data)
    }
  }
}

export default logger
