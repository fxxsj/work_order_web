<template>
  <el-select
    v-model="selectedValue"
    :remote="true"
    :remote-method="remoteMethod"
    :loading="loading"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder"
    :collapse-tags="collapseTags"
    @change="handleChange"
    @focus="handleFocus"
  >
    <el-option
      v-for="item in options"
      :key="item[valueKey]"
      :label="item[labelKey]"
      :value="item[valueKey]"
    >
      <slot name="option" :option="item">
        {{ item[labelKey] }}
      </slot>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, watch } from 'vue'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  fetchMethod: { type: Function, required: true },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  modelValue: { type: [String, Number, Array], default: null },
  clearable: { type: Boolean, default: true },
  filterable: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
  collapseTags: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus'])

const selectedValue = ref(props.modelValue)
const options = ref([])
const loading = ref(false)

watch(() => props.modelValue, (val) => {
  selectedValue.value = val
})

watch(selectedValue, (val) => {
  emit('update:modelValue', val)
})

const remoteMethod = async (query) => {
  loading.value = true
  try {
    const res = await props.fetchMethod(query)
    options.value = res?.results || res || []
  } catch (error) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
}

const handleChange = (val) => emit('change', val)
const handleFocus = () => emit('focus')

// 初始加载
remoteMethod('')
</script>
