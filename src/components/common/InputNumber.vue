<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="input-label mb-1.5 block">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative inline-flex items-center">
      <button
        type="button"
        class="input-number-btn input-number-btn-minus"
        :disabled="disabled || isAtMin"
        @click="decrement"
        @mousedown.prevent
      >
        <Icon name="minus" size="sm" />
      </button>
      <input
        :id="id"
        type="text"
        inputmode="decimal"
        :value="displayValue"
        :disabled="disabled"
        :required="required"
        class="input-number-input"
        :class="[
          disabled ? 'cursor-not-allowed opacity-60' : '',
          error ? 'input-error ring-2 ring-red-500/20' : ''
        ]"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <button
        type="button"
        class="input-number-btn input-number-btn-plus"
        :disabled="disabled || isAtMax"
        @click="increment"
        @mousedown.prevent
      >
        <Icon name="plus" size="sm" />
      </button>
    </div>
    <p v-if="error" class="input-error-text mt-1.5">
      {{ error }}
    </p>
    <p v-else-if="hint" class="input-hint mt-1.5">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  precision: { type: Number, default: 0 },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: undefined },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const focused = ref(false)

const displayValue = computed(() => {
  if (focused.value) {
    return String(props.modelValue ?? '')
  }
  return Number(props.modelValue).toFixed(props.precision)
})

const isAtMin = computed(() => {
  return props.modelValue <= props.min
})

const isAtMax = computed(() => {
  return props.modelValue >= props.max
})

function clamp(value: any) {
  if (value < props.min) return props.min
  if (value > props.max) return props.max
  return value
}

function increment() {
  if (props.disabled) return
  const newVal = Number(props.modelValue) + props.step
  emit('update:modelValue', clamp(newVal))
  emit('change', clamp(newVal))
}

function decrement() {
  if (props.disabled) return
  const newVal = Number(props.modelValue) - props.step
  emit('update:modelValue', clamp(newVal))
  emit('change', clamp(newVal))
}

function handleChange(e: any) {
  const raw = e.target.value
  const val = parseFloat(raw)
  if (isNaN(val)) {
    e.target.value = displayValue.value
    return
  }
  emit('update:modelValue', clamp(val))
  emit('change', clamp(val))
}

function handleFocus() {
  focused.value = true
  emit('focus')
}

function handleBlur(e: any) {
  focused.value = false
  emit('blur', e)
}
</script>

<style scoped>
.input-number-btn {
  @apply flex items-center justify-center w-8 h-10 rounded-none;
  @apply border border-gray-200 dark:border-dark-600;
  @apply bg-gray-50 dark:bg-dark-800;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-dark-700;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  @apply transition-colors duration-150;
}

.input-number-btn-minus {
  @apply border-r-0 rounded-l-xl;
}

.input-number-btn-plus {
  @apply border-l-0 rounded-r-xl;
}

.input-number-input {
  @apply w-20 h-10 px-2 text-center text-sm;
  @apply border border-gray-200 dark:border-dark-600;
  @apply bg-white dark:bg-dark-800;
  @apply text-gray-900 dark:text-gray-100;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30;
  @apply rounded-none border-x-0;
}

.input-number-input::-webkit-inner-spin-button,
.input-number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-number-input[type='number'] {
  -moz-appearance: textfield;
}
</style>
