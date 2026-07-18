/**
 * 用户认证 Store
 * 管理当前用户状态、权限、角色
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { clearReferenceCache } from '@/utils/referenceDataCache'

export const useUserStore = defineStore('user', () => {
  // ==================== State ====================

  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const userGroups = ref<string[]>([])
  const isSuperuser = ref(false)
  const isStaff = ref(false)

  // ==================== Getters ====================

  const userId = computed(() => currentUser.value?.id)
  const username = computed(() => currentUser.value?.username)
  const isSalesperson = computed(() => roles.value.includes('sales'))
  const isManager = computed(() => roles.value.includes('manager'))
  const isSupervisor = computed(() => roles.value.includes('supervisor'))
  const isOperator = computed(() => roles.value.includes('operator'))

  // ==================== Actions ====================

  function setUser(userData: User | null) {
    const previousUserId = currentUser.value?.id ?? null
    const mappedData = userData
      ? {
          ...userData,
          access_token: userData.access_token || (userData as unknown as Record<string, unknown>).access as string | undefined,
          refresh_token: userData.refresh_token || (userData as unknown as Record<string, unknown>).refresh as string | undefined
        }
      : null

    if (previousUserId !== (mappedData?.id ?? null)) {
      clearReferenceCache()
    }

    currentUser.value = mappedData
    isAuthenticated.value = !!mappedData
    permissions.value = mappedData?.permissions || []
    roles.value = mappedData?.role_codes || mappedData?.roles || []
    userGroups.value = mappedData?.groups || []
    isSuperuser.value = mappedData?.is_superuser || false
    isStaff.value = mappedData?.is_staff || false
  }

  function clearUser() {
    clearReferenceCache()
    currentUser.value = null
    isAuthenticated.value = false
    permissions.value = []
    roles.value = []
    userGroups.value = []
    isSuperuser.value = false
    isStaff.value = false
  }

  function hasPermission(permission: string): boolean {
    if (isSuperuser.value) return true
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(requiredPermissions: string[]): boolean {
    if (isSuperuser.value) return true
    return requiredPermissions.some(perm => permissions.value.includes(perm))
  }

  function hasRole(roleName: string): boolean {
    return roles.value.includes(roleName) || userGroups.value.includes(roleName)
  }

  function hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some((role: any) => hasRole(role))
  }

  async function restoreSession(): Promise<void> {
    try {
      // 使用 pinia-plugin-persistedstate，存储格式为 { state: { ... } }
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored) as { state?: { currentUser: User } }
        if (parsed?.state?.currentUser) {
          setUser(parsed.state.currentUser)
        }
      }
    } catch (error: any) {
      console.error('Restore session failed:', error)
    }
  }

  return {
    // State
    currentUser,
    isAuthenticated,
    permissions,
    roles,
    userGroups,
    isSuperuser,
    isStaff,
    // Getters
    userId,
    username,
    isSalesperson,
    isManager,
    isSupervisor,
    isOperator,
    // Actions
    setUser,
    clearUser,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    restoreSession
  }
}, {
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['currentUser', 'isAuthenticated', 'permissions', 'roles', 'userGroups', 'isSuperuser', 'isStaff']
  }
})
