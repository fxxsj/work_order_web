<template>
  <span
    :class="[
      'inline-flex items-center font-medium',
      sizeClass,
      typeClass,
      roundedClass,
      $attrs.class || ''
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: string
  size?: 'small' | 'default' | 'large'
  effect?: string
  hit?: boolean
  disableTransitions?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  size: 'default',
  effect: 'light',
  hit: false,
  disableTransitions: false,
  color: ''
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small': return 'px-2 py-0.5 text-xs'
    case 'large': return 'px-3 py-1 text-sm'
    default: return 'px-2.5 py-0.5 text-sm'
  }
})

const typeClass = computed(() => {
  if (props.color) return ''
  switch (props.type) {
    case 'success':
      return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
    case 'warning':
      return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
    case 'danger':
      return 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
    case 'info':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'primary':
      return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
})

const roundedClass = computed(() => {
  return props.hit ? 'rounded-md border border-current' : 'rounded-full'
})
</script>
