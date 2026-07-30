/**
 * Vue Router Configuration
 * 路由守卫: 认证检查、权限控制、页面标题、Chunk 加载错误处理
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'
import { authAPI } from '@/api/modules'
import { resolveDocumentTitle } from './title'
import './types'

import { workorderRoutes } from './modules/workorder'
import { masterDataRoutes } from './modules/master-data'
import { plateRoutes } from './modules/plates'
import { procurementRoutes } from './modules/procurement'
import { salesRoutes } from './modules/sales'
import { taskRoutes } from './modules/task'
import { financeRoutes } from './modules/finance'
import { inventoryRoutes } from './modules/inventory'

// ==================== 顶层路由组件 ====================

const Login = () => import('@/views/Login.vue')
const AppLayout = () => import('@/components/layout/AppLayout.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Notification = () => import('@/views/Notification.vue')
const NotificationAdmin = () => import('@/views/notification/NotificationAdmin.vue')
const Profile = () => import('@/views/Profile.vue')
const ApprovalSettings = () => import('@/views/ApprovalSettings.vue')
const AuditLogList = () => import('@/views/audit/AuditLogList.vue')
const NotFound = () => import('@/views/NotFound.vue')

// ==================== 路由定义 ====================

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 未找到', requiresAuth: false }
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '工作台', requiresAuth: true }
      },
      ...workorderRoutes,
      ...masterDataRoutes,
      ...plateRoutes,
      ...procurementRoutes,
      ...salesRoutes,
      ...taskRoutes,
      {
        path: 'notifications',
        name: 'Notification',
        component: Notification,
        meta: { title: '通知中心', requiresAuth: true }
      },
      {
        path: 'system-notifications',
        name: 'NotificationAdmin',
        component: NotificationAdmin,
        meta: { title: '系统通知管理', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_systemnotificationsettings', 'workorder.view_notificationtemplate'] }
      },
      ...financeRoutes,
      ...inventoryRoutes,
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'approval-settings',
        name: 'ApprovalSettings',
        component: ApprovalSettings,
        meta: { title: '审核设置', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.change_approvalconfig'] }
      },
      {
        path: 'audit-logs',
        name: 'AuditLogList',
        component: AuditLogList,
        meta: { title: '审计日志', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_auditlog'] }
      }
    ]
  }
]

// ==================== Router 实例 ====================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// ==================== 认证检查 ====================

let isAuthChecking = false
let authCheckPromise: Promise<boolean> | null = null

function hasUsableStoredCredentials(): boolean {
  const userStore = useUserStore()
  const user = userStore.currentUser

  if (!user) {
    return false
  }

  if (user.refresh_token) {
    return true
  }

  if (!user.access_token) {
    return false
  }

  if (!user.access_expires_at) {
    return true
  }

  return user.access_expires_at > Math.floor(Date.now() / 1000)
}

async function checkAuthentication(): Promise<boolean> {
  const userStore = useUserStore()

  if (userStore.currentUser) {
    if (hasUsableStoredCredentials()) {
      return true
    }
    userStore.clearUser()
    return false
  }

  if (isAuthChecking && authCheckPromise) {
    try {
      await authCheckPromise
      return !!userStore.currentUser
    } catch {
      return false
    }
  }

  isAuthChecking = true
  authCheckPromise = (async () => {
    try {
      const response = await authAPI.getCurrentUser() as any
      const userInfo = response?.data || response
      if (response?.success && userInfo && userInfo.id) {
        userStore.setUser(userInfo)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      isAuthChecking = false
      authCheckPromise = null
    }
  })()

  return authCheckPromise
}

// ==================== 导航守卫 ====================

router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = resolveDocumentTitle(to.meta.title)

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (!requiresAuth) {
    // 公开路由：已登录用户访问登录页则跳转
    if (to.path === '/login') {
      const userStore = useUserStore()
      if (userStore.currentUser && hasUsableStoredCredentials()) {
        const redirect = (to.query.redirect as string) || from.fullPath || '/dashboard'
        next(redirect)
        return
      }
      if (userStore.currentUser) {
        userStore.clearUser()
      }
    }
    next()
    return
  }

  // 需要认证的路由
  const isLoggedIn = await checkAuthentication()

  if (!isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
    return
  }

  // 检查管理员权限
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin === true)
  if (requiresAdmin) {
    const userStore = useUserStore()
    if (!userStore.isStaff && !userStore.isSuperuser) {
      next({ path: '/dashboard', replace: true })
      return
    }
  }

  // 检查特定权限
  const requiredPermission = to.meta.requiresPermission
  if (requiredPermission) {
    const userStore = useUserStore()
    const perms = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    if (!userStore.hasAnyPermission(perms)) {
      next({ path: '/dashboard', replace: true })
      return
    }
  }

  next()
})

// ==================== Chunk 加载错误处理 ====================

router.onError((error: Error) => {
  console.error('Router error:', error)

  const isChunkLoadError =
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('Loading CSS chunk') ||
    error.name === 'ChunkLoadError'

  if (isChunkLoadError) {
    const reloadKey = 'chunk_reload_attempted'
    const lastReload = sessionStorage.getItem(reloadKey)
    const now = Date.now()

    // 允许重载：从未重载过，或距离上次重载超过 10 秒
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem(reloadKey, now.toString())
      console.warn('Chunk load error detected, reloading page to fetch latest version...')
      // Give rolling deployments time to make the new fingerprinted chunk
      // available before retrying the route.
      window.setTimeout(() => window.location.reload(), 1500)
    } else {
      console.error('Chunk load error persists after reload. Please clear browser cache.')
    }
  }
})

export default router
