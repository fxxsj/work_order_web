<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :value="value"
      class="checkbox"
      @change="handleChange"
    />
    <span v-if="label" class="text-sm text-gray-700 dark:text-gray-300">
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [Boolean, Array], default: false },
  label: { type: String, default: '' },
  value: { type: [String, Number, Boolean], default: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleChange(e: any) {
  const checked = e.target.checked
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (checked) {
      if (!newValue.includes(props.value)) newValue.push(props.value)
    } else {
      newValue.splice(newValue.indexOf(props.value), 1)
    }
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', checked)
    emit('change', checked)
  }
}
</script>

<style scoped>
.checkbox {
  @apply h-4 w-4 rounded border-gray-300 dark:border-dark-600;
  @apply text-primary-600 dark:text-primary-400;
  @apply focus:ring-2 focus:ring-primary-500/30;
  @apply cursor-pointer;
}
.checkbox:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
