<template>
  <div class="flex items-center gap-1">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      type="button"
      class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      :class="toneClass(action.tone)"
      :disabled="action.disabled || action.loading"
      :title="action.title || action.label"
      @click.stop="emitAction(action)"
    >
      <Icon
        :name="(action.loading ? 'refresh' : action.icon) as any"
        size="sm"
        :class="action.loading ? 'animate-spin' : ''"
      />
      <span class="text-xs">{{ action.loading ? action.loadingLabel || action.label : action.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import type { RowAction, RowActionTone } from './types'

export type { RowAction, RowActionTone } from './types'

const props = defineProps<{
  actions: RowAction[]
}>()

const emit = defineEmits<{
  action: [action: RowAction]
}>()

const visibleActions = computed(() => props.actions.filter(action => action.visible !== false))

function toneClass(tone: RowActionTone = 'default') {
  const classes: Record<RowActionTone, string> = {
    default: 'hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400',
    primary: 'hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400',
    success: 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400',
    warning: 'hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400',
    danger: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400',
  }

  return classes[tone]
}

function emitAction(action: RowAction) {
  if (action.disabled || action.loading) return
  emit('action', action)
}
</script>
