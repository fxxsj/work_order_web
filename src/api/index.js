import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores'
import logger from '@/utils/logger'
import unwrapApiResponse from '@/utils/apiResponse'

// 获取 CSRF Token
function getCsrfToken() {
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// Token 刷新状态管理
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken'
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()

    // 添加 JWT access token
    const token = userStore.currentUser?.access_token || localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 添加 CSRF Token（用于 SessionAuthentication）
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }

    return config
  },
  error => {
    logger.error('Request error', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config
    const userStore = useUserStore()

    logger.error('Response error', error)

    if (!error.response) {
      ElMessage.error({
        message: '网络连接失败，请检查网络设置',
        duration: 3000,
      })
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // 401 错误处理：尝试刷新 token
    if (status === 401 && !originalRequest._retry) {
      if (originalRequest?.url?.includes('/auth/refresh/')) {
        userStore.clearUser()
        if (router.currentRoute.path !== '/login') {
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.fullPath }
          })
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return service(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = userStore.currentUser?.refresh_token || localStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post('/api/v1/auth/refresh/', {
          refresh: refreshToken
        })

        const refreshPayload = unwrapApiResponse(response.data)
        const { access, refresh: newRefresh } = refreshPayload || {}

        if (!access) {
          throw new Error('No access token in refresh response')
        }

        userStore.setUser({
          ...userStore.currentUser,
          access_token: access,
          refresh_token: newRefresh,
        })

        processQueue(null, access)

        originalRequest.headers['Authorization'] = `Bearer ${access}`
        return service(originalRequest)

      } catch (err) {
        processQueue(err, null)
        userStore.clearUser()

        if (router.currentRoute.path !== '/login' && !originalRequest?.url?.includes('/auth/user/')) {
          ElMessage.warning({
            message: '登录已过期，请重新登录',
            duration: 2000,
          })

          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.fullPath }
          })
        }

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401 && originalRequest._retry) {
      userStore.clearUser()
      if (router.currentRoute.path !== '/login') {
        ElMessage.warning({
          message: '登录已过期，请重新登录',
          duration: 2000,
        })
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath }
        })
      }
      return Promise.reject(error)
    }

    if (status === 403) {
      if (router.currentRoute.path !== '/login') {
        const url = error.config?.url || ''
        const isAuxiliaryOperation = url.includes('/workorder-processes/') ||
                                     url.includes('/workorder-materials/') ||
                                     url.includes('/workorder-products/')

        if (!isAuxiliaryOperation) {
          ElMessage.error({
            message: data.detail || data.error || '没有权限执行此操作',
            duration: 3000,
          })
        }
      }
    }

    if (status === 404) {
      ElMessage.error({
        message: '请求的资源不存在',
        duration: 3000,
      })
    }

    if (status === 500) {
      ElMessage.error({
        message: '服务器错误，请稍后重试',
        duration: 3000,
      })
    }

    if (status !== 401) {
      ElMessage.error({
        message: data.detail || data.error || data.message || '请求失败',
        duration: 3000,
      })
    }

    return Promise.reject(error)
  }
)

export default service
