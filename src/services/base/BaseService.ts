import logger from '@/utils/logger'

export interface ExecuteOptions {
  showLoading?: boolean
  showError?: boolean
  errorMessage?: ((error: unknown) => string) | null
  successMessage?: string
}

export interface ExecuteResult<T> {
  success: boolean
  data: T | null
  error?: string
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class BaseService {
  apiClient: unknown
  loading: boolean
  error: string | null

  constructor(apiClient: unknown) {
    this.apiClient = apiClient
    this.loading = false
    this.error = null
  }

  handleError(error: unknown): string {
    logger.error('Service Error', error)

    const err = error as Record<string, unknown>
    const response = err.response as Record<string, unknown> | undefined

    if (response) {
      const status = response.status as number
      const data = response.data as Record<string, unknown> | undefined

      switch (status) {
        case 400:
          return (data?.error as string) || (data?.detail as string) || '请求参数错误'
        case 401:
          return '未授权，请重新登录'
        case 403:
          return '没有权限执行此操作'
        case 404:
          return '请求的资源不存在'
        case 409:
          return (data?.error as string) || '数据已被其他用户修改，请刷新后重试'
        case 500:
          return '服务器错误，请稍后重试'
        default:
          return (data?.error as string) || (data?.detail as string) || `服务器错误 (${status})`
      }
    } else if (err.request) {
      return '网络错误，请检查网络连接'
    } else {
      return (error as Error)?.message || '未知错误'
    }
  }

  async execute<T>(apiCall: () => Promise<{ data: T }>, options: ExecuteOptions = {}): Promise<ExecuteResult<T>> {
    const { showLoading = true, showError = true, errorMessage = null } = options

    if (showLoading) {
      this.loading = true
      this.error = null
    }

    try {
      const result = await apiCall()
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMsg = errorMessage ? errorMessage(error) : this.handleError(error)
      this.error = errorMsg

      if (showError) {
        logger.error('API Error', errorMsg)
      }

      return { success: false, error: errorMsg, data: null }
    } finally {
      if (showLoading) {
        this.loading = false
      }
    }
  }

  async executeBatch<T>(
    apiCalls: Array<() => Promise<{ data: T }>>,
    options: ExecuteOptions & { stopOnError?: boolean } = {}
  ): Promise<ExecuteResult<T>[]> {
    const { stopOnError = true, ...executeOptions } = options
    const results: ExecuteResult<T>[] = []

    for (const apiCall of apiCalls) {
      const result = await this.execute(apiCall, executeOptions)
      results.push(result)
      if (!result.success && stopOnError) break
    }

    return results
  }

  paginate<T>(items: T[], page = 1, pageSize = 20): PaginationResult<T> {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: items.slice(start, end),
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize)
    }
  }

  sort<T extends Record<string, unknown>>(items: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...items].sort((a: any, b: any) => {
      const aVal = a[field]
      const bVal = b[field]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      return order === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }

  filter<T extends Record<string, unknown>>(items: T[], filters: Record<string, unknown>): T[] {
    return items.filter((item: any) =>
      Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true
        const itemValue = item[key]

        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }

        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }

        return itemValue === value
      })
    )
  }

  clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (Array.isArray(obj)) return obj.map((item: any) => this.clone(item)) as unknown as T

    const clonedObj = {} as Record<string, unknown>
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = this.clone((obj as Record<string, unknown>)[key])
      }
    }
    return clonedObj as T
  }

  debounce<T extends (...args: unknown[]) => void>(func: T, delay = 300): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
  }

  throttle<T extends (...args: unknown[]) => void>(func: T, interval = 300): (...args: Parameters<T>) => void {
    let lastTime = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastTime >= interval) {
        lastTime = now
        func.apply(this, args)
      }
    }
  }
}

export default BaseService
