import { computed } from 'vue'
import { useUserStore } from '@/stores'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = (permission: string): boolean => {
    if (userStore.isSuperuser) return true
    if (userStore.permissions.includes('*')) return true
    return userStore.permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return false
    return requiredPermissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true
    return requiredPermissions.every(permission => hasPermission(permission))
  }

  const hasRole = (roleName: string): boolean => {
    return userStore.hasRole(roleName)
  }

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!roleNames || roleNames.length === 0) return false
    return roleNames.some((role: any) => userStore.hasRole(role))
  }

  const currentUser = computed(() => userStore.currentUser)
  const isAuthenticated = computed(() => userStore.isAuthenticated)
  const isSuperuser = computed(() => userStore.isSuperuser)

  return {
    currentUser,
    isAuthenticated,
    isSuperuser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
}
