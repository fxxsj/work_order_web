/**
 * UI Store
 * 管理侧边栏折叠状态、主题、语言、Toast 通知、Loading 状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Toast } from '@/types'

export const useUIStore = defineStore('ui', () => {
  // ==================== State ====================

  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const toasts = ref<Toast[]>([])
  const globalLoading = ref(false)
  let loadingRefCount = 0

  let toastIdCounter = 0

  // ==================== Getters ====================

  const hasActiveToasts = computed(() => toasts.value.length > 0)
  const isLoading = computed(() => globalLoading.value)

  // ==================== Toast Actions ====================

  function showToast(type: Toast['type'], message: string, duration = 3000): string {
    const id = `toast-${++toastIdCounter}`
    toasts.value.push({
      id,
      type,
      message,
      duration,
      title: '',
      startTime: duration !== undefined ? Date.now() : undefined
    })
    if (duration !== undefined) {
      setTimeout(() => hideToast(id), duration)
    }
    return id
  }

  function showSuccess(message: string, duration = 3000): string {
    return showToast('success', message, duration)
  }

  function showError(message: string, duration = 5000): string {
    return showToast('error', message, duration)
  }

  function showWarning(message: string, duration = 4000): string {
    return showToast('warning', message, duration)
  }

  function showInfo(message: string, duration = 3000): string {
    return showToast('info', message, duration)
  }

  function hideToast(id: string): void {
    const index = toasts.value.findIndex((t: any) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAllToasts(): void {
    toasts.value = []
  }

  // ==================== Loading Actions ====================

  /**
   * Increment loading reference counter (use when starting an async operation)
   */
  function incLoading(): void {
    loadingRefCount++
    if (loadingRefCount === 1) {
      globalLoading.value = true
    }
  }

  /**
   * Decrement loading reference counter (use when completing an async operation)
   */
  function decLoading(): void {
    loadingRefCount = Math.max(0, loadingRefCount - 1)
    if (loadingRefCount === 0) {
      globalLoading.value = false
    }
  }

  /**
   * Set loading state directly (useful for replacing multiple operations)
   */
  function setLoading(loading: boolean): void {
    globalLoading.value = loading
    loadingRefCount = loading ? 1 : 0
  }

  /**
   * Wrap an async operation with loading state management
   * Automatically handles increment/decrement of loading ref counter
   */
  async function withLoading<T>(operation: () => Promise<T>): Promise<T> {
    incLoading()
    try {
      return await operation()
    } finally {
      decLoading()
    }
  }

  /**
   * Wrap an async operation with loading state and error handling
   * Shows error toast on failure
   */
  async function withLoadingAndError<T>(
    operation: () => Promise<T>,
    errorMessage = '操作失败'
  ): Promise<T | null> {
    incLoading()
    try {
      return await operation()
    } catch (error: any) {
      showError(errorMessage)
      return null
    } finally {
      decLoading()
    }
  }

  // ==================== UI Actions ====================

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme
    // 同步到 document class
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    // 同步到 localStorage
    localStorage.setItem('theme', newTheme)
  }

  function toggleTheme(): void {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  function setLanguage(lang: string): void {
    language.value = lang
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    toasts,
    globalLoading,
    hasActiveToasts,
    isLoading,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    clearAllToasts,
    incLoading,
    decLoading,
    setLoading,
    withLoading,
    withLoadingAndError,
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    setTheme,
    setLanguage
  }
})
