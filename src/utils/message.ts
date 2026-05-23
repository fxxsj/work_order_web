/**
 * Element Plus ElMessage compatible API using UIStore toasts
 */

import { useUIStore } from '@/stores/ui'

interface MessageOptions {
  message?: string
  duration?: number
}

function getStore() {
  try {
    return useUIStore()
  } catch {
    return null
  }
}

function show(type: 'success' | 'error' | 'warning' | 'info', content: string | MessageOptions, duration?: number) {
  const store = getStore()
  const msg = typeof content === 'string' ? content : content?.message || ''
  const dur = duration || (typeof content === 'object' ? content?.duration : undefined) || (type === 'error' ? 5000 : 3000)
  if (store) {
    store.showToast(type, msg, dur)
  } else {
    console.log(`[${type.toUpperCase()}]`, msg)
  }
}

export interface MessageInstance {
  success: (options: string | MessageOptions) => void
  error: (options: string | MessageOptions) => void
  warning: (options: string | MessageOptions) => void
  warn: (options: string | MessageOptions) => void
  info: (options: string | MessageOptions) => void
}

export const ElMessage: MessageInstance = {
  success(options) {
    show('success', options, 3000)
  },
  error(options) {
    show('error', options, 5000)
  },
  warning(options) {
    show('warning', options, 4000)
  },
  warn(options) {
    show('warning', options, 4000)
  },
  info(options) {
    show('info', options, 3000)
  },
}

export default ElMessage