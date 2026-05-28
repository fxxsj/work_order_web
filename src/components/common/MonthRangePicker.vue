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
      <span class="min-w-0 flex-1 truncate text-left font-medium">{{ displayValue }}</span>
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

        <div class="flex items-end gap-2 p-3 pb-2">
          <div class="min-w-0 flex-1">
            <span class="month-range-label">开始月份</span>
            <button
              type="button"
              class="month-range-value"
              :class="{ 'month-range-value-active': activeField === 'start' }"
              @focus="setActiveField('start')"
              @click="setActiveField('start')"
            >
              {{ localStart || '选择开始月份' }}
            </button>
          </div>
          <div class="flex h-10 items-center justify-center text-gray-400 dark:text-dark-400">
            <Icon
              name="arrowRight"
              size="sm"
            />
          </div>
          <div class="min-w-0 flex-1">
            <span class="month-range-label">结束月份</span>
            <button
              type="button"
              class="month-range-value"
              :class="{ 'month-range-value-active': activeField === 'end' }"
              @focus="setActiveField('end')"
              @click="setActiveField('end')"
            >
              {{ localEnd || '选择结束月份' }}
            </button>
          </div>
        </div>

        <p
          v-if="hasInvalidRange"
          class="px-3 pb-2 text-xs text-danger-500"
        >
          结束月份不能早于开始月份
        </p>

        <div
          v-if="activeField"
          class="border-t border-gray-100 dark:border-dark-700"
        />

        <div
          v-if="activeField"
          class="month-picker-panel"
        >
          <div class="month-picker-header">
            <button
              type="button"
              class="month-picker-nav"
              aria-label="上一年"
              @click="panelYear -= 1"
            >
              <Icon
                name="chevronLeft"
                size="sm"
              />
            </button>
            <div class="month-picker-year">
              {{ panelYear }} 年
            </div>
            <button
              type="button"
              class="month-picker-nav"
              aria-label="下一年"
              @click="panelYear += 1"
            >
              <Icon
                name="chevronRight"
                size="sm"
              />
            </button>
          </div>
          <div class="month-picker-grid">
            <button
              v-for="month in monthOptions"
              :key="month.value"
              type="button"
              class="month-picker-cell"
              :class="{
                'month-picker-cell-active': isSelectedMonth(month.value),
                'month-picker-cell-in-range': isInRange(month.value),
              }"
              :disabled="isMonthDisabled(month.value)"
              @click="selectMonth(month.value)"
            >
              {{ month.label }}
            </button>
          </div>
        </div>

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
const activeField = ref<'start' | 'end' | null>(null)

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

const panelYear = ref(Number((props.modelValue[0] || props.modelValue[1] || formatMonth(new Date())).slice(0, 4)))

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
const monthOptions = computed(() => (
  Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0')
    return {
      label: `${index + 1}月`,
      value: `${panelYear.value}-${month}`
    }
  })
))

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
  if (isOpen.value) {
    activeField.value = null
    const seed = localStart.value || localEnd.value
    panelYear.value = Number((seed || formatMonth(new Date())).slice(0, 4))
  }
}

const selectPreset = (preset: Preset) => {
  const [start, end] = preset.getRange()
  localStart.value = start
  localEnd.value = end
  activePreset.value = preset.value
  activeField.value = null
  panelYear.value = Number(end.slice(0, 4))
}

const setActiveField = (field: 'start' | 'end') => {
  activeField.value = field
  const seed = field === 'start' ? localStart.value || localEnd.value : localEnd.value || localStart.value
  panelYear.value = Number((seed || formatMonth(new Date())).slice(0, 4))
}

const selectMonth = (value: string) => {
  if (activeField.value === 'start') {
    localStart.value = value
    if (!localEnd.value || localEnd.value < value) {
      activeField.value = 'end'
    }
  } else {
    localEnd.value = value
    if (!localStart.value || localStart.value > value) {
      activeField.value = 'start'
    }
  }
  activePreset.value = null
  syncPreset()
}

const isSelectedMonth = (value: string) => {
  return value === localStart.value || value === localEnd.value
}

const isInRange = (value: string) => {
  return Boolean(localStart.value && localEnd.value && value > localStart.value && value < localEnd.value)
}

const isMonthDisabled = (value: string) => {
  if (activeField.value === 'start') {
    return Boolean(localEnd.value && value > localEnd.value)
  }
  return Boolean(localStart.value && value < localStart.value)
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
    const seed = localStart.value || localEnd.value
    if (seed) panelYear.value = Number(seed.slice(0, 4))
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
  @apply flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all duration-200;
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

.month-range-value {
  @apply flex h-9 w-full items-center rounded-md border border-gray-200 bg-gray-50 px-2 text-left text-sm font-medium text-gray-900 transition-all duration-150;
  @apply focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply hover:border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-100 dark:hover:border-dark-500;
}

.month-range-value-active {
  @apply border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20;
  @apply dark:bg-primary-900/30 dark:text-primary-300;
}

.month-picker-panel {
  @apply p-3;
}

.month-picker-header {
  @apply mb-2 flex items-center justify-between;
}

.month-picker-nav {
  @apply flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:bg-dark-700;
}

.month-picker-year {
  @apply text-sm font-semibold text-gray-900 dark:text-gray-100;
}

.month-picker-grid {
  @apply grid grid-cols-4 gap-1;
}

.month-picker-cell {
  @apply rounded-md px-2 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100;
  @apply disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent;
  @apply dark:text-gray-300 dark:hover:bg-dark-700 dark:disabled:text-dark-500;
}

.month-picker-cell-in-range {
  @apply bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300;
}

.month-picker-cell-active {
  @apply bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600;
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
