/**
 * 全局类型声明
 */

// 路由元信息扩展
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresPermission?: string | string[]
  }
}

// Axios 错误响应结构
export interface AxiosErrorResponse {
  status: number
  data?: {
    detail?: string
    error?: string
    message?: string
    code?: string | number
    reason?: string
    metadata?: unknown
  }
}

// Toast 类型
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  duration?: number
  startTime?: number
}

// 导航加载状态
export interface NavigationState {
  isNavigating: boolean
  startNavigation: () => void
  endNavigation: () => void
}
