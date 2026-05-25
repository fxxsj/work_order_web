<template>
  <div class="inline-flex flex-col items-center">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="barColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        transform="rotate(-90 50 50)"
        class="transition-all duration-500"
      />
    </svg>
    <span
      v-if="showText"
      class="mt-1 text-xs text-gray-600 dark:text-gray-400"
    >{{ Math.round(percentage || 0) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  percentage: { type: Number, default: 0 },
  size: { type: Number, default: 60 },
  strokeWidth: { type: Number, default: 8 },
  color: { type: String, default: '' },
  trackColor: { type: String, default: '#e5e7eb' },
  showText: { type: Boolean, default: false }
})

const radius = computed(() => 50 - props.strokeWidth / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value - (Math.min(100, Math.max(0, props.percentage || 0)) / 100) * circumference.value)
const barColor = computed(() => props.color || (props.percentage >= 100 ? '#22c55e' : '#3b82f6'))
</script>
