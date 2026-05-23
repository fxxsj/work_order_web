<template>
  <div
    class="flex gap-3 rounded-xl border p-4"
    :class="typeClasses"
    role="alert"
  >
    <Icon
      v-if="showIcon !== false"
      :name="iconName"
      class="mt-0.5 h-5 w-5 flex-shrink-0"
      :class="iconColorClass"
    />
    <div class="flex-1">
      <h4 v-if="title || $slots.title" class="text-sm font-semibold">
        <slot name="title">{{ title }}</slot>
      </h4>
      <p v-if="description" class="mt-1 text-sm opacity-90">
        {{ description }}
      </p>
      <div v-if="$slots.default" :class="{ 'mt-2': title || description }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps({
  type: { type: String, default: 'info' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  closable: { type: Boolean, default: false },
  showIcon: { type: Boolean, default: true }
})

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'border-success-200 bg-success-50 text-success-800 dark:border-success-900/50 dark:bg-success-900/20 dark:text-success-300'
    case 'warning':
      return 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900/50 dark:bg-warning-900/20 dark:text-warning-300'
    case 'error':
      return 'border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300'
    default:
      return 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-300'
  }
})

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'success': return 'text-success-500'
    case 'warning': return 'text-warning-500'
    case 'error': return 'text-danger-500'
    default: return 'text-primary-500'
  }
})

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'checkCircle'
    case 'warning': return 'exclamationTriangle'
    case 'error': return 'xCircle'
    default: return 'infoCircle'
  }
})
</script>
