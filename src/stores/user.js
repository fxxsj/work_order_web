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
    currentUser.value = userData
    isAuthenticated.value = !!userData
    permissions.value = userData?.permissions || []
    roles.value = userData?.role_codes || []
    userGroups.value = userData?.groups || []
    isSuperuser.value = userData?.is_superuser || false
    isStaff.value = userData?.is_staff || false
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
