import { ref, onMounted, onUnmounted, computed } from 'vue'

const BREAKPOINTS = {
  phone: 767,
  tablet: 1023,
  desktop: 1439,
  wide: Infinity
}

/**
 * Reactive media query composable
 * @param {'phone'|'tablet'|'desktop'|'wide'} breakpoint - Breakpoint name
 * @param {'max'|'min'} type - Media query type
 * @returns {Ref<boolean>} Whether the media query matches
 */
export function useMediaQuery(breakpoint = 'phone', type = 'max') {
  const matches = ref(false)
  let mediaQuery = null

  const mediaQueryString = computed(() => {
    const value = BREAKPOINTS[breakpoint]
    if (type === 'max') {
      return `(max-width: ${value}px)`
    }
    return `(min-width: ${value + 1}px)`
  })

  const updateMatch = () => {
    if (mediaQuery) {
      matches.value = mediaQuery.matches
    }
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(mediaQueryString.value)
    updateMatch()
    mediaQuery.addEventListener('change', updateMatch)
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateMatch)
    }
  })

  return matches
}

/**
 * Shorthand composables for common breakpoints
 */
export function useIsMobile() {
  return useMediaQuery('phone', 'max')
}

export function useIsTablet() {
  const isTabletOrBelow = useMediaQuery('tablet', 'max')
  const isDesktopOrAbove = useMediaQuery('desktop', 'min')
  return computed(() => isTabletOrBelow.value && !isDesktopOrAbove.value)
}

export function useIsDesktop() {
  return useMediaQuery('desktop', 'min')
}

/**
 * Get current breakpoint name
 */
export function useBreakpoint() {
  const breakpoint = ref('desktop')

  const updateBreakpoint = () => {
    const width = window.innerWidth
    if (width <= BREAKPOINTS.phone) {
      breakpoint.value = 'phone'
    } else if (width <= BREAKPOINTS.tablet) {
      breakpoint.value = 'tablet'
    } else if (width <= BREAKPOINTS.desktop) {
      breakpoint.value = 'desktop'
    } else {
      breakpoint.value = 'wide'
    }
  }

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint)
  })

  return breakpoint
}

export default {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useBreakpoint,
  BREAKPOINTS
}
