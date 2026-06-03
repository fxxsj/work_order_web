<template>
  <div
    ref="containerRef"
    class="relative"
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
        <div class="date-picker-presets">
          <button
            v-for="preset in presets"
            :key="preset.value"
            type="button"
            class="date-picker-preset"
            :class="{ 'date-picker-preset-active': isPresetActive(preset) }"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="date-picker-divider" />

        <div class="date-picker-custom">
          <div class="date-picker-field">
            <label class="date-picker-label">{{ startPlaceholder }}</label>
            <input
              v-model="localStartDate"
              type="date"
              :max="localEndDate || tomorrow"
              class="date-picker-input"
              @change="onDateChange"
            >
          </div>
          <div class="date-picker-separator">
            <Icon
              name="arrowRight"
              size="sm"
              class="text-gray-400"
            />
          </div>
          <div class="date-picker-field">
            <label class="date-picker-label">{{ endPlaceholder }}</label>
            <input
              v-model="localEndDate"
              type="date"
              :min="localStartDate"
              :max="tomorrow"
              class="date-picker-input"
              @change="onDateChange"
            >
          </div>
        </div>

        <div class="date-picker-actions">
          <button
            type="button"
            class="date-picker-apply"
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

type DateRange = [string, string]

interface DatePreset {
  label: string
  value: string
  getRange: () => DateRange
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
const localStartDate = ref(props.modelValue?.[0] || '')
const localEndDate = ref(props.modelValue?.[1] || '')
const activePreset = ref<string | null>(null)

const formatDateToString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = computed(() => formatDateToString(new Date()))
const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return formatDateToString(date)
})

const presets: DatePreset[] = [
  {
    label: '今天',
    value: 'today',
    getRange: () => [today.value, today.value]
  },
  {
    label: '昨天',
    value: 'yesterday',
    getRange: () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const value = formatDateToString(date)
      return [value, value]
    }
  },
  {
    label: '最近24小时',
    value: 'last24Hours',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return [formatDateToString(start), formatDateToString(end)]
    }
  },
  {
    label: '最近7天',
    value: '7days',
    getRange: () => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      return [formatDateToString(date), today.value]
    }
  },
  {
    label: '最近14天',
    value: '14days',
    getRange: () => {
      const date = new Date()
      date.setDate(date.getDate() - 13)
      return [formatDateToString(date), today.value]
    }
  },
  {
    label: '最近30天',
    value: '30days',
    getRange: () => {
      const date = new Date()
      date.setDate(date.getDate() - 29)
      return [formatDateToString(date), today.value]
    }
  },
  {
    label: '本月',
    value: 'thisMonth',
    getRange: () => {
      const now = new Date()
      return [formatDateToString(new Date(now.getFullYear(), now.getMonth(), 1)), today.value]
    }
  },
  {
    label: '上月',
    value: 'lastMonth',
    getRange: () => {
      const now = new Date()
      return [
        formatDateToString(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        formatDateToString(new Date(now.getFullYear(), now.getMonth(), 0))
      ]
    }
  }
]

const displayValue = computed(() => {
  if (activePreset.value) {
    const preset = presets.find(item => item.value === activePreset.value)
    if (preset) return preset.label
  }

  if (localStartDate.value && localEndDate.value) {
    if (localStartDate.value === localEndDate.value) return formatDisplayDate(localStartDate.value)
    return `${formatDisplayDate(localStartDate.value)} - ${formatDisplayDate(localEndDate.value)}`
  }

  if (localStartDate.value) return `${formatDisplayDate(localStartDate.value)} 起`
  if (localEndDate.value) return `截至 ${formatDisplayDate(localEndDate.value)}`
  return '选择日期范围'
})

const formatDisplayDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const syncActivePreset = () => {
  activePreset.value = null
  for (const preset of presets) {
    const [start, end] = preset.getRange()
    if (start === localStartDate.value && end === localEndDate.value) {
      activePreset.value = preset.value
      break
    }
  }
}

const isPresetActive = (preset: DatePreset) => activePreset.value === preset.value

const selectPreset = (preset: DatePreset) => {
  const [start, end] = preset.getRange()
  localStartDate.value = start
  localEndDate.value = end
  activePreset.value = preset.value
}

const onDateChange = () => {
  activePreset.value = null
  syncActivePreset()
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const emitRange = (value: DateRange) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const apply = () => {
  emitRange([localStartDate.value, localEndDate.value])
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

watch(
  () => props.modelValue,
  value => {
    localStartDate.value = value?.[0] || ''
    localEndDate.value = value?.[1] || ''
    syncActivePreset()
  },
  { deep: true }
)

onMounted(() => {
  syncActivePreset()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.date-picker-trigger {
  @apply flex w-full items-center justify-between gap-2;
  @apply rounded-xl px-4 py-2.5 text-sm;
  @apply bg-white dark:bg-dark-800;
  @apply border border-gray-200 dark:border-dark-600;
  @apply text-gray-900 dark:text-gray-100;
  @apply transition-all duration-200;
  @apply focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
  @apply hover:border-gray-300 dark:hover:border-dark-500;
  @apply cursor-pointer;
  min-height: 42px;
}

.date-picker-trigger-open {
  @apply border-primary-500 ring-2 ring-primary-500/30;
}

.date-picker-icon {
  @apply text-gray-400 dark:text-dark-400;
}

.date-picker-value {
  @apply flex-1 truncate text-left font-medium;
}

.date-picker-chevron {
  @apply text-gray-400 dark:text-dark-400;
}

.date-picker-dropdown {
  @apply absolute left-0 z-[100] mt-2;
  @apply bg-white dark:bg-dark-800;
  @apply rounded-xl;
  @apply border border-gray-200 dark:border-dark-700;
  @apply shadow-lg shadow-black/10 dark:shadow-black/30;
  @apply overflow-hidden;
  @apply min-w-[320px];
}

.date-picker-presets {
  @apply grid grid-cols-2 gap-1 p-2;
}

.date-picker-preset {
  @apply rounded-md px-3 py-1.5 text-xs font-medium;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-dark-700;
  @apply transition-colors duration-150;
}

.date-picker-preset-active {
  @apply bg-primary-100 dark:bg-primary-900/30;
  @apply text-primary-700 dark:text-primary-300;
}

.date-picker-divider {
  @apply border-t border-gray-100 dark:border-dark-700;
}

.date-picker-custom {
  @apply flex items-end gap-2 p-3;
}

.date-picker-field {
  @apply flex-1;
}

.date-picker-label {
  @apply mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.date-picker-input {
  @apply w-full rounded-md px-2 py-1.5 text-sm;
  @apply bg-gray-50 dark:bg-dark-700;
  @apply border border-gray-200 dark:border-dark-600;
  @apply text-gray-900 dark:text-gray-100;
  @apply focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30;
}

.date-picker-input::-webkit-calendar-picker-indicator {
  @apply cursor-pointer opacity-60 hover:opacity-100;
  filter: invert(0.5);
}

.dark .date-picker-input::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
}

.date-picker-separator {
  @apply flex items-center justify-center pb-1;
}

.date-picker-actions {
  @apply flex justify-end p-2 pt-0;
}

.date-picker-apply {
  @apply rounded-lg px-4 py-1.5 text-sm font-medium;
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-700;
  @apply transition-colors duration-150;
}

.date-picker-dropdown-enter-active,
.date-picker-dropdown-leave-active {
  transition: all 0.2s ease;
}

.date-picker-dropdown-enter-from,
.date-picker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
