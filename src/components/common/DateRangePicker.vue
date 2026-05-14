<template>
  <div class="date-range-picker">
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :range-separator="rangeSeparator"
      :clearable="clearable"
      :value-format="valueFormat"
      :format="format"
      :unlink-panels="unlinkPanels"
      :disabled="disabled"
      :shortcuts="shortcuts"
      :disabled-date="disabledDate"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  startPlaceholder: { type: String, default: '开始日期' },
  endPlaceholder: { type: String, default: '结束日期' },
  rangeSeparator: { type: String, default: '至' },
  clearable: { type: Boolean, default: true },
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  format: { type: String, default: 'YYYY-MM-DD' },
  disabled: { type: Boolean, default: false },
  unlinkPanels: { type: Boolean, default: false },
  shortcuts: { type: Array, default: () => [] },
  disabledDate: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'change'])

const dateRange = ref(props.modelValue || [])

watch(() => props.modelValue, (val) => {
  dateRange.value = val || []
}, { immediate: true })

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.date-range-picker {
  display: inline-block;
}
</style>
