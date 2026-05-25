<template>
  <div class="flex w-full items-center gap-2">
    <div
      class="progress flex-1"
      :style="{ height: (strokeWidth || 8) + 'px' }"
    >
      <div
        class="progress-bar h-full rounded-full transition-all duration-300"
        :style="barStyle"
      />
    </div>
    <span
      v-if="showText !== false"
      class="w-8 text-right text-xs text-gray-500 dark:text-gray-400"
    >
      {{ Math.round(percentage || 0) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  percentage: { type: Number, default: 0 },
  color: { type: String, default: '' },
  status: { type: String, default: '' },
  strokeWidth: { type: Number, default: 8 },
  showText: { type: Boolean, default: true }
})

const statusColorMap: Record<string, string> = {
  success: '#22c55e',
  exception: '#ef4444',
  danger: '#ef4444',
  warning: '#f59e0b'
}

const barStyle = computed(() => {
  const pct = Math.min(100, Math.max(0, props.percentage || 0))
  const color = props.color || statusColorMap[props.status] || ''
  return {
    width: pct + '%',
    ...(color ? { background: color } : {})
  }
})
</script>
