<template>
  <label
    class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border cursor-pointer transition-colors rounded-lg"
    :class="{
      'bg-primary-500 text-white border-primary-500': isChecked,
      'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700': !isChecked,
      'opacity-50 cursor-not-allowed': disabled
    }"
  >
    <input
      type="radio"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      class="sr-only"
      @change="handleChange"
    >
    <span>{{ label || value }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps({
  value: { type: [String, Number, Boolean], required: true },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['change'])

const group = inject('radioGroup', null)

const isChecked = computed(() => {
  if (group) {
    return (group as any).props.modelValue === props.value
  }
  return false
})

function handleChange() {
  if (!props.disabled) {
    if (group) {
      (group as any).changeEvent(props.value)
    }
    emit('change', props.value)
  }
}
</script>
