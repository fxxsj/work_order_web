/**
 * Axios HTTP Client
 * 统一请求拦截器、响应拦截器、Token 刷新队列、主动刷新调度
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useUserStore } from '@/stores'
import router from '@/router'
import logger from '@/utils/logger'
import type { ApiResponse } from '@/types'

// Token 刷新提前量（秒）- 过期前 30 秒主动刷新
const REFRESH_BEFORE_SECONDS = 30

function getCsrfToken(): string | null {
  const name = 'csrftoken'
  if (!document.cookie || document.cookie === '') return null
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.substring(0, name.length + 1) === (name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  return null
}

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = []
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * 清除刷新定时器
 */
function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 计算距离下次刷新的毫秒数
 * 返回 null 表示不需要刷新（无过期时间）
 */
function getMsUntilRefresh(expiresAt: number): number | null {
  const now = Math.floor(Date.now() / 1000) // 当前 Unix 时间戳（秒）
  const expiresIn = expiresAt - now - REFRESH_BEFORE_SECONDS // 剩余时间 - 提前量
  if (expiresIn <= 0) {
    // 已过期或即将过期，立即刷新
    return 0
  }
  return expiresIn * 1000 // 转换为毫秒
}

/**
 * 调度下次 token 刷新
 */
function scheduleRefresh(expiresAt: number) {
  clearRefreshTimer()
  const msUntilRefresh = getMsUntilRefresh(expiresAt)
  if (msUntilRefresh === null) return

  logger.info(`Token refresh scheduled in ${msUntilRefresh / 1000} seconds`)
  refreshTimer = setTimeout(() => {
    doProactiveRefresh()
  }, msUntilRefresh)
}

/**
 * 执行主动刷新（无请求触发）
 */
async function doProactiveRefresh() {
  const userStore = useUserStore()
  const refreshToken = userStore.currentUser?.refresh_token

  if (!refreshToken) {
    logger.warn('No refresh token available for proactive refresh')
    return
  }

  if (isRefreshing) {
    logger.info('Refresh already in progress, skipping proactive refresh')
    return
  }

  logger.info('Executing proactive token refresh')
  isRefreshing = true

  try {
    const response = await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken })
    // 后端已统一返回标准格式: { success, code, message, data: { access, refresh, access_expires_at } }
    const payload = response?.data?.data || {}
    const { access, refresh: newRefresh, access_expires_at } = payload

    if (!access) {
      throw new Error('No access token in refresh response')
    }

    userStore.setUser({
      ...userStore.currentUser!,
      access_token: access,
      refresh_token: newRefresh || userStore.currentUser?.refresh_token,
      access_expires_at: access_expires_at || getDefaultExpiresAt()
    })

    logger.info('Proactive token refresh successful')
    processQueue(null, access)

    // 调度下一次刷新
    const newExpiresAt = access_expires_at || getDefaultExpiresAt()
    scheduleRefresh(newExpiresAt)
  } catch (err: any) {
    logger.error('Proactive token refresh failed:', err)
    processQueue(err as Error, null)
    // 主动刷新失败，降级到被动等待 401
  } finally {
    isRefreshing = false
  }
}

/**
 * 获取默认的过期时间戳（用于兼容旧接口）
 */
function getDefaultExpiresAt(): number {
  // 默认 5 分钟过期
  return Math.floor(Date.now() / 1000) + 5 * 60
}

/**
 * 处理刷新响应，更新过期时间并调度下次刷新
 */
function handleRefreshResponse(response: unknown, userStore: ReturnType<typeof useUserStore>) {
  const payload = (response as Record<string, unknown>)?.data || response
  const accessExpiresAt = (payload as Record<string, unknown>)?.access_expires_at as number | undefined

  if (accessExpiresAt) {
    userStore.setUser({
      ...userStore.currentUser!,
      access_expires_at: accessExpiresAt
    })
    scheduleRefresh(accessExpiresAt)
  } else {
    // 后端未返回 access_expires_at，使用默认值并调度
    const defaultExpiresAt = getDefaultExpiresAt()
    scheduleRefresh(defaultExpiresAt)
  }
}

const service: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken'
})

service.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore()
    const token = userStore.currentUser?.access_token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    return config
  },
  (error: any) => {
    logger.error('Request error', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: any) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const userStore = useUserStore()

    logger.error('Response error', error)

    if (!error.response) {
      return Promise.reject(error)
    }

    const { status, data } = error.response

    if (status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh/')) {
        userStore.clearUser()
        clearRefreshTimer()
        if (router.currentRoute.value.path !== '/login') {
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return service(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = userStore.currentUser?.refresh_token
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken })
        // 后端已统一返回标准格式: { success, code, message, data: { access, refresh, access_expires_at } }
        const payload = response?.data?.data || {}
        const { access, refresh: newRefresh, access_expires_at } = payload

        if (!access) {
          throw new Error('No access token in refresh response')
        }

        userStore.setUser({
          ...userStore.currentUser!,
          access_token: access,
          refresh_token: newRefresh || userStore.currentUser?.refresh_token,
          access_expires_at: access_expires_at || getDefaultExpiresAt()
        })

        processQueue(null, access)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers['Authorization'] = `Bearer ${access}`
        return service(originalRequest)
      } catch (err: any) {
        processQueue(err as Error, null)
        userStore.clearUser()
        clearRefreshTimer()
        if (router.currentRoute.value.path !== '/login' && !originalRequest.url?.includes('/auth/user/')) {
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401) {
      if (originalRequest.url?.includes('/auth/login/')) {
        return Promise.reject(error)
      }
      userStore.clearUser()
      clearRefreshTimer()
      if (router.currentRoute.value.path !== '/login') {
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export { scheduleRefresh, handleRefreshResponse, clearRefreshTimer }
export default service as <T = unknown>(config: AxiosRequestConfig) => Promise<T>
