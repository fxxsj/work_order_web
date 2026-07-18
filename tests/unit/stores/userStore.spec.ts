/**
 * User Store 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types'
import { clearReferenceCache, getCachedReference } from '@/utils/referenceDataCache'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    clearReferenceCache()
  })

  describe('setUser', () => {
    it('应该正确设置用户信息', () => {
      const store = useUserStore()
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role_codes: ['admin'],
        permissions: ['*'],
        is_superuser: true,
        is_staff: true,
        access_token: 'access123',
        refresh_token: 'refresh123',
      }

      store.setUser(mockUser)

      expect(store.currentUser).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.permissions).toEqual(['*'])
      expect(store.roles).toEqual(['admin'])
      expect(store.isSuperuser).toBe(true)
    })

    it('应该处理 null 用户', () => {
      const store = useUserStore()
      store.setUser(null)

      expect(store.currentUser).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.permissions).toEqual([])
    })

    it('应该正确映射 access 和 refresh 字段', () => {
      const store = useUserStore()
      const mockUser = {
        id: 1,
        username: 'testuser',
        access: 'access-token',
        refresh: 'refresh-token',
      } as unknown as User

      store.setUser(mockUser)

      expect(store.currentUser?.access_token).toBe('access-token')
      expect(store.currentUser?.refresh_token).toBe('refresh-token')
    })

    it('切换用户时应该清除引用数据缓存', async () => {
      const store = useUserStore()
      const loader = vi.fn()
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }])

      store.setUser({ id: 1, username: 'user-1' })
      await getCachedReference('departments', loader)
      store.setUser({ id: 2, username: 'user-2' })

      await expect(getCachedReference('departments', loader)).resolves.toEqual([{ id: 2 }])
      expect(loader).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearUser', () => {
    it('应该清除所有用户状态', () => {
      const store = useUserStore()
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        role_codes: ['admin'],
        permissions: ['*'],
        is_superuser: true,
      }

      store.setUser(mockUser)
      store.clearUser()

      expect(store.currentUser).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.permissions).toEqual([])
      expect(store.roles).toEqual([])
      expect(store.isSuperuser).toBe(false)
    })
  })

  describe('权限检查', () => {
    it('超级用户拥有所有权限', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'admin',
        is_superuser: true,
        permissions: ['*'],
      })

      expect(store.hasPermission('any_permission')).toBe(true)
    })

    it('普通用户按 permissions 检查', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'user',
        is_superuser: false,
        permissions: ['view', 'edit'],
      })

      expect(store.hasPermission('view')).toBe(true)
      expect(store.hasPermission('delete')).toBe(false)
    })

    it('hasAnyPermission 应该返回 true 如果有任一权限', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'user',
        is_superuser: false,
        permissions: ['view'],
      })

      expect(store.hasAnyPermission(['view', 'edit'])).toBe(true)
      expect(store.hasAnyPermission(['delete', 'admin'])).toBe(false)
    })
  })

  describe('角色检查', () => {
    it('应该正确检查角色', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'user',
        role_codes: ['sales'],
        groups: [],
      })

      expect(store.isSalesperson).toBe(true)
      expect(store.isManager).toBe(false)
    })

    it('hasRole 应该检查 role_codes 和 groups', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'user',
        role_codes: ['sales'],
        groups: ['department_a'],
      })

      expect(store.hasRole('sales')).toBe(true)
      expect(store.hasRole('department_a')).toBe(true)
    })
  })

  describe('localStorage 持久化', () => {
    it('setUser 后应该更新 isAuthenticated', () => {
      const store = useUserStore()
      store.setUser({
        id: 1,
        username: 'testuser',
      })

      expect(store.isAuthenticated).toBe(true)
    })

    it('clearUser 后 isAuthenticated 应该为 false', () => {
      const store = useUserStore()
      store.setUser({ id: 1, username: 'testuser' })
      store.clearUser()

      expect(store.isAuthenticated).toBe(false)
    })
  })
})
