/**
 * 导航加载状态组合式函数
 * 管理路由切换时的加载状态，支持防闪烁逻辑
 */

import { ref, readonly, computed } from 'vue'

export interface NavigationLoadingState {
  isLoading: any
  isNavigating: any
  startNavigation: () => void
  endNavigation: () => void
  cancelNavigation: () => void
  resetState: () => void
  getNavigationDuration: () => number | null
}

export function useNavigationLoading(): NavigationLoadingState {
  const _isLoading = ref(false)
  let navigationStartTime: number | null = null
  let showLoadingTimer: ReturnType<typeof setTimeout> | null = null
  const shouldShowLoading = ref(false)
  const ANTI_FLICKER_DELAY = 100

  const clearTimer = (): void => {
    if (showLoadingTimer !== null) {
      clearTimeout(showLoadingTimer)
      showLoadingTimer = null
    }
  }

  const startNavigation = (): void => {
    navigationStartTime = Date.now()
    _isLoading.value = true
    clearTimer()
    showLoadingTimer = setTimeout(() => {
      if (_isLoading.value) {
        shouldShowLoading.value = true
      }
    }, ANTI_FLICKER_DELAY)
  }

  const endNavigation = (): void => {
    clearTimer()
    _isLoading.value = false
    shouldShowLoading.value = false
    navigationStartTime = null
  }

  const cancelNavigation = (): void => {
    clearTimer()
    navigationStartTime = null
  }

  const resetState = (): void => {
    clearTimer()
    _isLoading.value = false
    shouldShowLoading.value = false
    navigationStartTime = null
  }

  const getNavigationDuration = (): number | null => {
    if (navigationStartTime === null) return null
    return Date.now() - navigationStartTime
  }

  const isLoading = computed(() => shouldShowLoading.value)
  const isNavigating = readonly(_isLoading)

  return {
    isLoading,
    isNavigating,
    startNavigation,
    endNavigation,
    cancelNavigation,
    resetState,
    getNavigationDuration
  }
}

let navigationLoadingInstance: ReturnType<typeof useNavigationLoading> | null = null

export function useNavigationLoadingState(): NavigationLoadingState {
  if (!navigationLoadingInstance) {
    navigationLoadingInstance = useNavigationLoading()
  }
  return navigationLoadingInstance
}
