<template>
  <div
    ref="containerRef"
    class="relative w-full sm:w-auto"
  >
    <button
      type="button"
      class="month-range-trigger"
      :class="{ 'month-range-trigger-open': isOpen }"
      :disabled="disabled"
      @click="toggle"
    >
      <Icon
        name="calendar"
        size="sm"
        class="text-gray-400 dark:text-dark-400"
      />
      <span class="min-w-0 flex-1 truncate text-left">{{ displayValue }}</span>
      <Icon
        name="chevronDown"
        size="sm"
        class="shrink-0 text-gray-400 transition-transform duration-200 dark:text-dark-400"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition name="month-range-dropdown">
      <div
        v-if="isOpen"
        class="month-range-dropdown"
      >
        <div class="grid grid-cols-2 gap-1 p-2">
          <button
            v-for="preset in presets"
            :key="preset.value"
            type="button"
            class="month-range-preset"
            :class="{ 'month-range-preset-active': activePreset === preset.value }"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="border-t border-gray-100 dark:border-dark-700" />

        <div class="flex items-end gap-2 p-3">
          <label class="min-w-0 flex-1">
            <span class="month-range-label">开始月份</span>
            <input
              v-model="localStart"
              type="month"
              class="month-range-input"
              :max="localEnd || undefined"
              @change="activePreset = null"
            >
          </label>
          <div class="flex h-10 items-center justify-center text-gray-400 dark:text-dark-400">
            <Icon
              name="arrowRight"
              size="sm"
            />
          </div>
          <label class="min-w-0 flex-1">
            <span class="month-range-label">结束月份</span>
            <input
              v-model="localEnd"
              type="month"
              class="month-range-input"
              :min="localStart || undefined"
              @change="activePreset = null"
            >
          </label>
        </div>

        <p
          v-if="hasInvalidRange"
          class="px-3 pb-2 text-xs text-danger-500"
        >
          结束月份不能早于开始月份
        </p>

        <div class="flex justify-end gap-2 p-2 pt-0">
          <button
            v-if="hasValue"
            type="button"
            class="btn btn-secondary btn-sm"
            @click="clear"
          >
            清除
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="hasInvalidRange"
            @click="apply"
          >
            应用
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Icon from '@/components/icons/Icon.vue'

type MonthRange = [string, string]

interface Preset {
  label: string
  value: string
  getRange: () => MonthRange
}

const props = withDefaults(defineProps<{
  modelValue?: string[]
  placeholder?: string
  disabled?: boolean
}>(), {
  modelValue: () => ['', ''],
  placeholder: '选择月份范围',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: MonthRange): void
  (e: 'change', value: MonthRange): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const localStart = ref(props.modelValue[0] || '')
const localEnd = ref(props.modelValue[1] || '')
const activePreset = ref<string | null>(null)

const formatMonth = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const createRecentRange = (months: number): MonthRange => {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1)
  return [formatMonth(start), formatMonth(end)]
}

const presets: Preset[] = [
  {
    label: '本月',
    value: 'thisMonth',
    getRange: () => {
      const current = formatMonth(new Date())
      return [current, current]
    }
  },
  {
    label: '近3个月',
    value: 'last3Months',
    getRange: () => createRecentRange(3)
  },
  {
    label: '近6个月',
    value: 'last6Months',
    getRange: () => createRecentRange(6)
  },
  {
    label: '今年',
    value: 'thisYear',
    getRange: () => {
      const now = new Date()
      return [`${now.getFullYear()}-01`, formatMonth(now)]
    }
  }
]

const hasValue = computed(() => Boolean(localStart.value || localEnd.value))
const hasInvalidRange = computed(() => Boolean(localStart.value && localEnd.value && localStart.value > localEnd.value))

const displayValue = computed(() => {
  const start = props.modelValue[0]
  const end = props.modelValue[1]

  if (start && end) {
    return start === end ? start : `${start} - ${end}`
  }

  if (start) return `${start} 起`
  if (end) return `截至 ${end}`
  return props.placeholder
})

const syncPreset = () => {
  activePreset.value = null
  for (const preset of presets) {
    const [start, end] = preset.getRange()
    if (start === localStart.value && end === localEnd.value) {
      activePreset.value = preset.value
      break
    }
  }
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectPreset = (preset: Preset) => {
  const [start, end] = preset.getRange()
  localStart.value = start
  localEnd.value = end
  activePreset.value = preset.value
}

const apply = () => {
  if (hasInvalidRange.value) return
  const value: MonthRange = [localStart.value, localEnd.value]
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

const clear = () => {
  const value: MonthRange = ['', '']
  localStart.value = ''
  localEnd.value = ''
  activePreset.value = null
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (!containerRef.value?.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    localStart.value = value[0] || ''
    localEnd.value = value[1] || ''
    syncPreset()
  },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  syncPreset()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.month-range-trigger {
  @apply flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition-all duration-200;
  @apply hover:border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:border-dark-500 dark:disabled:bg-dark-900;
}

.month-range-trigger-open {
  @apply border-primary-500 ring-2 ring-primary-500/30;
}

.month-range-dropdown {
  @apply absolute left-0 z-[100] mt-2 min-w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/10;
  @apply dark:border-dark-700 dark:bg-dark-800 dark:shadow-black/30;
}

.month-range-preset {
  @apply rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:bg-dark-700;
}

.month-range-preset-active {
  @apply bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
}

.month-range-label {
  @apply mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.month-range-input {
  @apply w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-900;
  @apply focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply dark:border-dark-600 dark:bg-dark-700 dark:text-gray-100;
}

.month-range-input::-webkit-calendar-picker-indicator {
  @apply cursor-pointer opacity-60 hover:opacity-100;
}

.month-range-dropdown-enter-active,
.month-range-dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.month-range-dropdown-enter-from,
.month-range-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
