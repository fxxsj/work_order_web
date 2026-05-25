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
    <div class="flex flex-wrap gap-3">
      <slot>
        <Checkbox
          v-for="option in options"
          :key="getOptionValue(option)"
          :model-value="isOptionSelected(option)"
          :value="getOptionValue(option)"
          :label="getOptionLabel(option)"
          :disabled="disabled || isOptionDisabled(option)"
          @change="handleChange(getOptionValue(option), $event)"
        />
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
  required: { type: Boolean, default: false }
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

function isOptionDisabled(option: any) {
  if (typeof option === 'object' && option !== null) return !!option.disabled
  return false
}

function isOptionSelected(option: any) {
  return props.modelValue.includes(getOptionValue(option))
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
