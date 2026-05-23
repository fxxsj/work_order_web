<template>
  <div class="flex flex-wrap gap-3">
    <slot>
      <Checkbox
        v-for="option in options"
        :key="getOptionValue(option)"
        :model-value="modelValue"
        :value="getOptionValue(option)"
        :label="getOptionLabel(option)"
        :disabled="isOptionDisabled(option)"
        @change="handleChange(getOptionValue(option), $event)"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import Checkbox from './Checkbox.vue'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  options: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false }
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
