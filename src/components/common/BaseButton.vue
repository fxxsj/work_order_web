<template>
  <button
    :type="type"
    :class="[
      'btn',
      `btn-${variant}`,
      sizeClass
    ]"
    :disabled="disabled || loading"
  >
    <!-- Loading spinner, replaces icon or prepends if no icon -->
    <template v-if="loading">
      <span
        class="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
        :class="spinnerSizeClass"
        role="status"
        aria-label="加载中"
      />
    </template>

    <!-- Left icon -->
    <template v-else-if="icon && iconPosition === 'left'">
      <Icon
        :name="icon as any"
        :size="iconSize"
      />
    </template>

    <!-- Button Text / Content -->
    <span v-if="$slots.default">
      <slot />
    </span>

    <!-- Right icon -->
    <template v-if="!loading && icon && iconPosition === 'right'">
      <Icon
        :name="icon as any"
        :size="iconSize"
      />
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  icon: '',
  iconPosition: 'left',
  loading: false,
  disabled: false,
  type: 'button'
})

// Button size class mapping
const sizeClass = computed(() => {
  if (props.size === 'sm') return 'btn-sm'
  if (props.size === 'lg') return 'btn-lg'
  return '' // 'md' matches base '.btn' size/padding py-2.5
})

// Proportional Icon size mapping
const iconSize = computed(() => {
  if (props.size === 'sm') return 'xs' // h-3 w-3 (12px)
  if (props.size === 'lg') return 'md' // h-5 w-5 (20px)
  return 'sm' // 'md' button -> 'sm' icon -> h-4 w-4 (16px)
})

// Loading spinner size class
const spinnerSizeClass = computed(() => {
  if (props.size === 'sm') return 'h-3.5 w-3.5 border-[1.5px]'
  if (props.size === 'lg') return 'h-5 w-5 border-2'
  return 'h-4 w-4 border-2' // 'md' button spinner
})
</script>
