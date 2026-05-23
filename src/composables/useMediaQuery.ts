import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'

export const BREAKPOINTS = {
  phone: 767,
  tablet: 1023,
  desktop: 1439,
  wide: Infinity
} as const

export type BreakpointName = keyof typeof BREAKPOINTS
export type MediaQueryType = 'max' | 'min'

/**
 * Reactive media query composable
 * @param breakpoint - Breakpoint name
 * @param type - Media query type
 * @returns Whether the media query matches
 */
export function useMediaQuery(breakpoint: BreakpointName = 'phone', type: MediaQueryType = 'max'): Ref<boolean> {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

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

export function useIsMobile(): Ref<boolean> {
  return useMediaQuery('phone', 'max')
}

export function useIsTablet(): Ref<boolean> {
  const isTabletOrBelow = useMediaQuery('tablet', 'max')
  const isDesktopOrAbove = useMediaQuery('desktop', 'min')
  return computed(() => isTabletOrBelow.value && !isDesktopOrAbove.value)
}

export function useIsDesktop(): Ref<boolean> {
  return useMediaQuery('desktop', 'min')
}

export function useBreakpoint(): Ref<BreakpointName | 'wide'> {
  const breakpoint = ref<BreakpointName | 'wide'>('desktop')

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
