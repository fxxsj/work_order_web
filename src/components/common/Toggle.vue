<template>
  <div class="w-full">
    <div class="flex items-center justify-between gap-4">
      <div v-if="label || hint || error" class="min-w-0">
        <label v-if="label" :for="id" class="input-label mb-0 block">
          {{ label }}
          <span v-if="required" class="text-red-500">*</span>
        </label>
        <p v-if="error" class="input-error-text mt-1">
          {{ error }}
        </p>
        <p v-else-if="hint" class="input-hint mt-1">
          {{ hint }}
        </p>
      </div>
      <button
        :id="id"
        type="button"
        :disabled="disabled"
        @click="toggle"
        class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-dark-800"
        :class="[modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-600', disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
        role="switch"
        :aria-checked="modelValue"
        :aria-label="ariaLabel"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="[modelValue ? 'translate-x-5' : 'translate-x-0']"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
  label?: string
  hint?: string
  error?: string
  id?: string
  required?: boolean
}>(), {
  disabled: false,
  label: '',
  hint: '',
  error: '',
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const ariaLabel = computed(() => props.label || 'Toggle')

function toggle() {
  if (props.disabled) return
  const nextValue = !props.modelValue
  emit('update:modelValue', nextValue)
  emit('change', nextValue)
}
</script>
