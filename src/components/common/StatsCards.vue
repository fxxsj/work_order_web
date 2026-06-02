<template>
  <div
    v-if="title"
    class="card mb-6"
  >
    <div class="card-header flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ title }}</span>
    </div>
    <div class="card-body">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="(item, index) in items"
          :key="item.key || `stat-card-${index}`"
          class="stat-card"
        >
          <div
            v-if="loading"
            class="skeleton h-16 w-full rounded-xl"
          />
          <div
            v-else
            class="flex items-start gap-4"
          >
            <Icon
              v-if="item.iconName"
              class="stat-icon"
              :class="`stat-icon-${item.tone || item.type || 'primary'}`"
              :name="item.iconName"
              size="md"
            />
            <div class="min-w-0">
              <div
                v-if="layout === 'stacked'"
                class="stat-label"
              >
                {{ item.label }}
              </div>
              <div class="stat-value">
                {{ formatValue(item.value, item.format) }}
              </div>
              <div
                v-if="layout !== 'stacked'"
                class="stat-label"
              >
                {{ item.label }}
              </div>
              <div
                v-if="item.subtext"
                class="stat-subtext"
              >
                {{ item.subtext }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6"
  >
    <div
      v-for="(item, index) in items"
      :key="item.key || `stat-card-${index}`"
      class="stat-card"
    >
      <div
        v-if="loading"
        class="skeleton h-16 w-full rounded-xl"
      />
      <div
        v-else
        class="flex items-start gap-4"
      >
        <Icon
          v-if="item.iconName"
          class="stat-icon"
          :class="`stat-icon-${item.tone || item.type || 'primary'}`"
          :name="item.iconName"
          size="md"
        />
        <div class="min-w-0">
          <div
            v-if="layout === 'stacked'"
            class="stat-label"
          >
            {{ item.label }}
          </div>
          <div class="stat-value">
            {{ formatValue(item.value, item.format) }}
          </div>
          <div
            v-if="layout !== 'stacked'"
            class="stat-label"
          >
            {{ item.label }}
          </div>
          <div
            v-if="item.subtext"
            class="stat-subtext"
          >
            {{ item.subtext }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array as any, default: () => [] },
  span: { type: Number, default: 6 },
  gutter: { type: Number, default: 20 },
  layout: {
    type: String,
    default: 'stacked',
    validator: (value: any) => ['stacked', 'media'].includes(value)
  },
  loading: { type: Boolean, default: false }
})

const layoutClass = computed(() => `is-${props.layout}`)

const formatValue = (value: any, format: any) => {
  const normalizedValue = value ?? 0
  if (format === 'number') {
    return Number(normalizedValue).toLocaleString()
  }
  if (format === 'currency') {
    return `¥${Number(normalizedValue).toFixed(2)}`
  }
  if (format === 'percent') {
    return `${(Number(normalizedValue) * 100).toFixed(2)}%`
  }
  return normalizedValue
}
</script>
