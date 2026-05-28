<template>
  <div
    ref="containerRef"
    class="date-range-picker"
  >
    <button
      type="button"
      class="date-picker-trigger"
      :class="{ 'date-picker-trigger-open': isOpen }"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="date-picker-icon">
        <Icon
          name="calendar"
          size="sm"
        />
      </span>
      <span class="date-picker-value">{{ displayValue }}</span>
      <span class="date-picker-chevron">
        <Icon
          name="chevronDown"
          size="sm"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </span>
    </button>

    <Transition name="date-picker-dropdown">
      <div
        v-if="isOpen"
        class="date-picker-dropdown"
      >
        <div class="date-range-fields">
          <button
            type="button"
            class="date-range-value"
            :class="{ 'date-range-value-active': activeField === 'start' }"
            @focus="setActiveField('start')"
            @click="setActiveField('start')"
          >
            {{ startDate || startPlaceholder }}
          </button>

          <span class="date-range-separator">{{ rangeSeparator }}</span>

          <button
            type="button"
            class="date-range-value"
            :class="{ 'date-range-value-active': activeField === 'end' }"
            @focus="setActiveField('end')"
            @click="setActiveField('end')"
          >
            {{ endDate || endPlaceholder }}
          </button>
        </div>

        <div class="date-picker-header">
          <button
            type="button"
            class="date-picker-nav"
            aria-label="上个月"
            @click="moveMonth(-1)"
          >
            <Icon
              name="chevronLeft"
              size="sm"
            />
          </button>
          <div class="date-picker-title">
            {{ panelYear }} 年 {{ panelMonth + 1 }} 月
          </div>
          <button
            type="button"
            class="date-picker-nav"
            aria-label="下个月"
            @click="moveMonth(1)"
          >
            <Icon
              name="chevronRight"
              size="sm"
            />
          </button>
        </div>

        <div class="date-picker-weekdays">
          <span
            v-for="weekday in weekdays"
            :key="weekday"
          >
            {{ weekday }}
          </span>
        </div>

        <div class="date-picker-grid">
          <button
            v-for="day in calendarDays"
            :key="day.key"
            type="button"
            class="date-picker-cell"
            :class="{
              'date-picker-cell-muted': !day.inCurrentMonth,
              'date-picker-cell-today': day.value === today,
              'date-picker-cell-in-range': isInRange(day.value),
              'date-picker-cell-active': isSelectedDate(day.value),
            }"
            :disabled="isDateDisabled(day.value)"
            @click="selectDate(day.value)"
          >
            {{ day.day }}
          </button>
        </div>

        <div class="date-picker-actions">
          <button
            v-if="clearable && hasValue"
            type="button"
            class="btn btn-secondary btn-sm"
            @click="clear"
          >
            清除
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="isOpen = false"
          >
            完成
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Icon from '@/components/icons/Icon.vue'

type DateRange = [string, string]
type ActiveField = 'start' | 'end' | null

interface CalendarDay {
  key: string
  value: string
  day: number
  inCurrentMonth: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: string[]
  startPlaceholder?: string
  endPlaceholder?: string
  rangeSeparator?: string
  clearable?: boolean
  disabled?: boolean
  disabledDate?: ((date: Date) => boolean) | null
}>(), {
  modelValue: () => ['', ''],
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  rangeSeparator: '至',
  clearable: true,
  disabled: false,
  disabledDate: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void
  (e: 'change', value: DateRange): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const activeField = ref<ActiveField>('start')
const seedDate = new Date()
const panelYear = ref(seedDate.getFullYear())
const panelMonth = ref(seedDate.getMonth())

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const startDate = computed(() => props.modelValue?.[0] || '')
const endDate = computed(() => props.modelValue?.[1] || '')
const today = computed(() => formatDate(new Date()))
const hasValue = computed(() => Boolean(startDate.value || endDate.value))
const displayValue = computed(() => {
  if (startDate.value && endDate.value) {
    return startDate.value === endDate.value ? startDate.value : `${startDate.value} - ${endDate.value}`
  }
  if (startDate.value) return `${startDate.value} 起`
  if (endDate.value) return `截至 ${endDate.value}`
  return `${startPlaceholderShort.value}范围`
})
const startPlaceholderShort = computed(() => props.startPlaceholder.replace(/[起始开始]+$/, '') || props.startPlaceholder)

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = new Date(panelYear.value, panelMonth.value, 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const value = formatDate(date)
    return {
      key: `${value}-${index}`,
      value,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === panelMonth.value
    }
  })
})

const emitRange = (value: DateRange) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const setPanelTo = (value: string) => {
  const date = parseDate(value)
  if (!date) return
  panelYear.value = date.getFullYear()
  panelMonth.value = date.getMonth()
}

const setActiveField = (field: Exclude<ActiveField, null>) => {
  if (props.disabled) return
  isOpen.value = true
  activeField.value = field
  const seed = field === 'start'
    ? startDate.value || endDate.value
    : endDate.value || startDate.value
  if (seed) setPanelTo(seed)
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    const seed = startDate.value || endDate.value
    if (seed) setPanelTo(seed)
    activeField.value = startDate.value && !endDate.value ? 'end' : 'start'
  }
}

const moveMonth = (delta: number) => {
  const date = new Date(panelYear.value, panelMonth.value + delta, 1)
  panelYear.value = date.getFullYear()
  panelMonth.value = date.getMonth()
}

const selectDate = (value: string) => {
  if (activeField.value === 'start') {
    emitRange([value, endDate.value])
    if (!endDate.value || endDate.value < value) {
      activeField.value = 'end'
    }
    return
  }

  if (activeField.value === 'end') {
    emitRange([startDate.value, value])
    if (!startDate.value || startDate.value > value) {
      activeField.value = 'start'
    }
  }
}

const clear = () => {
  emitRange(['', ''])
  isOpen.value = false
}

const isSelectedDate = (value: string) => {
  return value === startDate.value || value === endDate.value
}

const isInRange = (value: string) => {
  return Boolean(startDate.value && endDate.value && value > startDate.value && value < endDate.value)
}

const isDateDisabled = (value: string) => {
  const date = parseDate(value)
  if (!date) return true
  if (props.disabledDate?.(date)) return true
  if (activeField.value === 'start') {
    return Boolean(endDate.value && value > endDate.value)
  }
  return Boolean(startDate.value && value < startDate.value)
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

onMounted(() => {
  const seed = startDate.value || endDate.value
  if (seed) setPanelTo(seed)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.date-range-picker {
  @apply relative w-full sm:w-auto;
}

.date-picker-trigger {
  @apply flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all duration-200;
  @apply hover:border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:border-dark-500 dark:disabled:bg-dark-900;
}

.date-picker-trigger-open {
  @apply border-primary-500 ring-2 ring-primary-500/30;
}

.date-picker-icon,
.date-picker-chevron {
  @apply shrink-0 text-gray-400 dark:text-dark-400;
}

.date-picker-value {
  @apply min-w-0 flex-1 truncate text-left font-medium;
}

.date-range-fields {
  @apply flex w-full items-center gap-2 p-3 pb-2;
}

.date-range-value {
  @apply flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm font-medium text-gray-700 transition-all duration-200;
  @apply hover:border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:border-dark-500 dark:disabled:bg-dark-900;
}

.date-range-value-active {
  @apply border-primary-500 ring-2 ring-primary-500/30;
}

.date-range-separator {
  @apply shrink-0 text-sm text-gray-400 dark:text-dark-400;
}

.date-picker-dropdown {
  @apply absolute left-0 z-[100] mt-2 w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/10;
  @apply dark:border-dark-700 dark:bg-dark-800 dark:shadow-black/30;
}

.date-picker-header {
  @apply flex items-center justify-between p-3 pb-2;
}

.date-picker-nav {
  @apply flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors duration-150 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:bg-dark-700;
}

.date-picker-title {
  @apply text-sm font-semibold text-gray-900 dark:text-gray-100;
}

.date-picker-weekdays {
  @apply grid grid-cols-7 px-3 pb-1 text-center text-xs font-medium text-gray-400 dark:text-dark-400;
}

.date-picker-grid {
  @apply grid grid-cols-7 gap-1 px-3 pb-3;
}

.date-picker-cell {
  @apply flex h-8 items-center justify-center rounded-md text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100;
  @apply disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent;
  @apply dark:text-gray-300 dark:hover:bg-dark-700 dark:disabled:text-dark-500;
}

.date-picker-cell-muted {
  @apply text-gray-300 dark:text-dark-500;
}

.date-picker-cell-today {
  @apply ring-1 ring-inset ring-primary-300 dark:ring-primary-700;
}

.date-picker-cell-in-range {
  @apply bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300;
}

.date-picker-cell-active {
  @apply bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600;
}

.date-picker-actions {
  @apply flex justify-end gap-2 border-t border-gray-100 p-2 dark:border-dark-700;
}

.date-picker-dropdown-enter-active,
.date-picker-dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.date-picker-dropdown-enter-from,
.date-picker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
