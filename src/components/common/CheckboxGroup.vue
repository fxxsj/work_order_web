<template>
  <div class="w-full">
    <div
      v-if="label"
      class="input-label mb-1.5 block"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot>
        <template v-for="option in options" :key="getOptionValue(option)">
          <button
            v-if="useChipMode(option)"
            type="button"
            :disabled="disabled || isOptionDisabled(option)"
            :class="[
              'toggle-chip',
              isOptionSelected(option) && 'toggle-chip-active',
              getOptionColor(option) && 'toggle-chip-color'
            ]"
            :style="getChipStyle(option)"
            @click="handleChipClick(option)"
          >
            <span
              v-if="getOptionColor(option)"
              class="toggle-chip-dot"
              :style="{ backgroundColor: getOptionColor(option) }"
            />
            <span>{{ getOptionLabel(option) }}</span>
          </button>
          <Checkbox
            v-else
            :model-value="isOptionSelected(option)"
            :value="getOptionValue(option)"
            :label="getOptionLabel(option)"
            :disabled="disabled || isOptionDisabled(option)"
            @change="handleChange(getOptionValue(option), $event)"
          />
        </template>
      </slot>
    </div>
    <p
      v-if="error"
      class="input-error-text mt-1.5"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      class="input-hint mt-1.5"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import Checkbox from './Checkbox.vue'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  options: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  variant: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

function getOptionValue(option: any) {
  if (typeof option === 'object' && option !== null) return option.value
  return option
}

function getOptionLabel(option: any) {
  if (typeof option === 'object' && option !== null) return option.label ?? String(option.value)
  return String(option)
}

function getOptionColor(option: any) {
  if (typeof option === 'object' && option !== null) return option.color || ''
  return ''
}

function isOptionDisabled(option: any) {
  if (typeof option === 'object' && option !== null) return !!option.disabled
  return false
}

function isOptionSelected(option: any) {
  return props.modelValue.includes(getOptionValue(option))
}

function useChipMode(option: any) {
  return props.variant === 'chip' || !!getOptionColor(option)
}

function getChipStyle(option: any) {
  const color = getOptionColor(option)
  const selected = isOptionSelected(option)
  if (!selected) return {}
  if (color) {
    return {
      backgroundColor: `${color}18`,
      borderColor: color,
      color: color
    }
  }
  return {}
}

function handleChipClick(option: any) {
  const value = getOptionValue(option)
  const selected = isOptionSelected(option)
  handleChange(value, !selected)
}

function handleChange(optionValue: any, checked: any) {
  const newValue = [...props.modelValue]
  if (checked) {
    if (!newValue.includes(optionValue)) newValue.push(optionValue)
  } else {
    const idx = newValue.indexOf(optionValue)
    if (idx > -1) newValue.splice(idx, 1)
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.toggle-chip {
  @apply inline-flex items-center gap-1.5;
  @apply rounded-lg px-3 py-1.5 text-sm font-medium;
  @apply border border-gray-200 dark:border-dark-600;
  @apply bg-white dark:bg-dark-800;
  @apply text-gray-600 dark:text-gray-400;
  @apply cursor-pointer select-none;
  @apply transition-all duration-150;
}

.toggle-chip:not(:disabled):hover {
  @apply border-gray-300 dark:border-dark-500;
  @apply bg-gray-50 dark:bg-dark-700;
}

.toggle-chip-active {
  @apply font-semibold;
  @apply border-primary-500 dark:border-primary-400;
  @apply bg-primary-50 dark:bg-primary-900/20;
  @apply text-primary-700 dark:text-primary-300;
}

.toggle-chip-color.toggle-chip-active {
  @apply border-transparent bg-transparent;
}

.toggle-chip:disabled {
  @apply cursor-not-allowed opacity-50;
}

.toggle-chip-dot {
  @apply h-2.5 w-2.5 rounded-full flex-shrink-0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
</style>
