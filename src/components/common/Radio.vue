<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="radio"
      :checked="modelValue === value"
      :disabled="disabled"
      :value="value"
      class="radio"
      @change="handleChange"
    >
    <span
      v-if="label"
      class="text-sm text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  label: { type: String, default: '' },
  value: { type: [String, Number, Boolean], required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleChange() {
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<style scoped>
.radio {
  @apply h-4 w-4 rounded-full border-gray-300 dark:border-dark-600;
  @apply text-primary-600 dark:text-primary-400;
  @apply focus:ring-2 focus:ring-primary-500/30;
  @apply cursor-pointer;
}
.radio:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
