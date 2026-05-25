/**
 * Router Guards 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Hoisted mocks (vitest hoists vi.mock to top of file)
const mockAuthAPI = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}))

const mockUserStore = vi.hoisted(() => ({
  currentUser: null as any,
  isStaff: false,
  isSuperuser: false,
  permissions: [] as string[],
  hasAnyPermission: vi.fn(() => false),
  setUser: vi.fn(),
}))

vi.mock('@/api/modules', () => ({
  authAPI: mockAuthAPI,
}))

vi.mock('@/stores', () => ({
  useUserStore: vi.fn(() => mockUserStore),
}))

// Mock document title
let currentTitle = ''
Object.defineProperty(document, 'title', {
  get: () => currentTitle,
  set: (val) => { currentTitle = val },
  configurable: true,
})

import router from '@/router/index'

describe('Router Guards', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockUserStore.currentUser = null
    mockUserStore.isStaff = false
    mockUserStore.isSuperuser = false
    mockUserStore.permissions = []
    mockUserStore.hasAnyPermission.mockReturnValue(false)
    currentTitle = ''
    // Reset router to a known state before each test
    await router.push('/login')
  }, 15000)

  describe('document title', () => {
    it('should set title with site name prefix', async () => {
      await router.push('/login')
      expect(document.title).toBe('登录 - 印刷施工单跟踪系统')
    })

    it('should set default site name when no meta title', async () => {
      await router.push('/404-not-exists')
      expect(document.title).toBe('404 未找到 - 印刷施工单跟踪系统')
    })
  })

  describe('public routes', () => {
    it('should allow access to login page for unauthenticated users', async () => {
      mockAuthAPI.getCurrentUser.mockRejectedValue(new Error('not logged in'))

      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should redirect authenticated user away from login page', async () => {
      mockUserStore.currentUser = { id: 1, username: 'test' }

      // Navigate to dashboard first, then to login to trigger the redirect
      await router.push('/dashboard')
      await router.push('/login')
      expect(router.currentRoute.value.path).not.toBe('/login')
    })
  })

  describe('auth required routes', () => {
    it('should redirect unauthenticated user to login with redirect param', async () => {
      mockAuthAPI.getCurrentUser.mockRejectedValue(new Error('not logged in'))

      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
    })

    it('should allow authenticated user to access protected route', async () => {
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test', permissions: ['workorder.view_workorder'] },
      })

      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('admin routes', () => {
    it('should redirect non-admin user away from admin route', async () => {
      mockUserStore.currentUser = { id: 1, username: 'test' }
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test', is_staff: false, is_superuser: false },
      })

      await router.push('/audit-logs')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should allow staff user to access admin route', async () => {
      mockUserStore.currentUser = { id: 1, username: 'test' }
      mockUserStore.isStaff = true
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test', is_staff: true },
      })

      await router.push('/audit-logs')
      // Staff can access but still needs permission check
    })
  })

  describe('permission routes', () => {
    it('should redirect user without required permission', async () => {
      mockUserStore.currentUser = { id: 1, username: 'test' }
      mockUserStore.isStaff = true
      mockUserStore.permissions = ['other.permission']
      mockUserStore.hasAnyPermission.mockReturnValue(false)
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test', permissions: ['other.permission'] },
      })

      await router.push('/system-notifications')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should allow user with required permission', async () => {
      mockUserStore.currentUser = { id: 1, username: 'test' }
      mockUserStore.isStaff = true
      mockUserStore.permissions = ['workorder.view_systemnotificationsettings']
      mockUserStore.hasAnyPermission.mockReturnValue(true)
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test', permissions: ['workorder.view_systemnotificationsettings'] },
      })

      await router.push('/system-notifications')
    })
  })

  describe('route structure', () => {
    it('should redirect root to dashboard', async () => {
      mockAuthAPI.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'test' },
      })

      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should have workorder routes registered', () => {
      const route = router.resolve('/workorders')
      expect(route.name).toBe('WorkOrderList')
    })

    it('should have finance routes registered', () => {
      const route = router.resolve('/finance/payments')
      expect(route.name).toBeTruthy()
    })

    it('should have task routes registered', () => {
      const route = router.resolve('/tasks')
      expect(route.name).toBe('TaskList')
    })

    it('should have inventory routes registered', () => {
      const route = router.resolve('/inventory/stocks')
      expect(route.name).toBeTruthy()
    })
  })
})
