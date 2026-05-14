import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const isAuthenticated = ref(false)
  const permissions = ref([])
  const roles = ref([])
  const userGroups = ref([])
  const isSuperuser = ref(false)
  const isStaff = ref(false)

  // Getters
  const userId = computed(() => currentUser.value?.id)
  const username = computed(() => currentUser.value?.username)
  const isSalesperson = computed(() => roles.value.includes('sales'))
  const isManager = computed(() => roles.value.includes('manager'))
  const isSupervisor = computed(() => roles.value.includes('supervisor'))
  const isOperator = computed(() => roles.value.includes('operator'))

  // Actions
  function setUser(userData) {
    // Map backend JWT field names (access/refresh) to frontend names (access_token/refresh_token)
    const mappedData = userData ? {
      ...userData,
      access_token: userData.access_token || userData.access,
      refresh_token: userData.refresh_token || userData.refresh,
    } : null

    currentUser.value = mappedData
    isAuthenticated.value = !!mappedData
    permissions.value = mappedData?.permissions || []
    roles.value = mappedData?.role_codes || []
    userGroups.value = mappedData?.groups || []
    isSuperuser.value = mappedData?.is_superuser || false
    isStaff.value = mappedData?.is_staff || false
  }

  function clearUser() {
    currentUser.value = null
    isAuthenticated.value = false
    permissions.value = []
    roles.value = []
    userGroups.value = []
    isSuperuser.value = false
    isStaff.value = false
  }

  function hasPermission(permission) {
    if (isSuperuser.value) return true
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(requiredPermissions) {
    if (isSuperuser.value) return true
    return requiredPermissions.some(perm => permissions.value.includes(perm))
  }

  function hasRole(roleName) {
    // 支持中文角色名和英文 role_code
    return roles.value.includes(roleName) || userGroups.value.includes(roleName)
  }

  function hasAnyRole(roleNames) {
    return roleNames.some(role => hasRole(role))
  }

  async function restoreSession() {
    // 从 sessionStorage 恢复用户会话
    try {
      const stored = sessionStorage.getItem('vuex')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.user) {
          setUser(parsed.user)
        }
      }
    } catch (error) {
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
    restoreSession,
  }
}, {
  persist: {
    key: 'user',
    storage: sessionStorage,
    paths: ['currentUser', 'isAuthenticated', 'permissions', 'roles', 'userGroups', 'isSuperuser', 'isStaff'],
  },
})
