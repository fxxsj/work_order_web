<template>
  <Tag
    :type="tagType"
    :size="size"
    :effect="effect"
    :hit="hit"
    :disable-transitions="disableTransitions"
    :color="variantColor || color"
  >
    <slot>{{ displayText }}</slot>
    <Icon
      v-if="icon"
      :name="icon"
      size="sm"
    />
  </Tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'
import { getStatusMeta } from '@/constants/statusMeta'

interface Props {
  status?: string | number
  category?: string
  statusMap?: Record<string, any>
  label?: string
  size?: 'small' | 'default' | 'large'
  effect?: string
  hit?: boolean
  disableTransitions?: boolean
  color?: string
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  status: '',
  category: '',
  statusMap: () => ({}),
  label: '',
  size: 'default',
  effect: 'light',
  hit: false,
  disableTransitions: false,
  color: '',
  variant: undefined
})

// Variant color mapping
const variantColor = computed(() => {
  if (!props.variant) return ''
  const map: Record<string, string> = {
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6b7280'
  }
  return map[props.variant] || ''
})

const statusConfig = computed(() => {
  if (props.statusMap[props.status]) return props.statusMap[props.status]
  if (props.category) return getStatusMeta(props.category, props.status, { text: props.label })
  return {}
})
const tagType = computed(() => {
  if (props.variant) return props.variant
  return statusConfig.value.type || 'info'
})
const displayText = computed(() => props.label || statusConfig.value.text || props.status)
const icon = computed(() => statusConfig.value.icon || '')
</script>

<style>
.status-icon {
  margin-right: 4px;
}
.status-icon + span {
  margin-left: 4px;
}
</style>
