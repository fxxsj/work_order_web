/**
 * API 相关类型定义
 */

import type { AxiosRequestConfig } from 'axios'

// ============ API 响应结构 ============

/**
 * API 统一响应格式（与 backend response_format.py 对齐）
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
  errors?: Record<string, unknown> | null
  timestamp?: string
}

/**
 * 错误响应格式
 */
export interface ApiErrorResponse {
  success: false
  code: number
  message: string
  errors?: Record<string, unknown> | null
  data?: null
  timestamp?: string
}

export interface PaginatedApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data?: {
    count: number
    next: string | null
    previous: string | null
    results: T[]
  }
  errors?: Record<string, unknown> | null
  timestamp?: string
}

// ============ API 请求配置 ============

export type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface ApiRequestConfig extends AxiosRequestConfig {
  method?: RequestMethod
  url?: string
  data?: unknown
  params?: Record<string, unknown>
}

// ============ BaseAPI 子类所需类型 ============

export interface BaseAPIOptions {
  baseUrl: string
  request: <T = unknown>(config: ApiRequestConfig) => Promise<T>
}
