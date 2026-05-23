<template>
  <BaseDialog
    :show="dialogVisible"
    :title="title"
    :width="(width as any)"
    close-on-click-outside
    close-on-escape
    @close="handleClose"
  >
    <form ref="formRef" class="space-y-4" @submit.prevent="handleSubmit">
      <slot></slot>
    </form>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="loading"
          @click="handleClose"
        >
          取消
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
          @click="handleSubmit"
        >
          <svg
            v-if="loading"
            class="-ml-1 mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ submitText }}
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import BaseDialog from './BaseDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  width: { type: String, default: 'normal' },
  formData: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  submitText: { type: String, default: '确定' },
  labelWidth: { type: String, default: '100px' },
  labelPosition: { type: String, default: 'right' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'cancel', 'submit'])

const internalVisible = ref(false)
const formRef = ref<any>(null)

const dialogVisible = computed({
  get: () => props.modelValue || internalVisible.value,
  set: (value: any) => {
    internalVisible.value = value
    emit('update:modelValue', value)
  }
})

// Provide validation context
const errors = reactive<Record<string, string>>({})

const open = () => {
  dialogVisible.value = true
  emit('open')
}

const close = () => {
  dialogVisible.value = false
  emit('close')
}

const handleClose = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleSubmit = () => {
  emit('submit')
}

const validate = async () => {
  if (!props.rules || Object.keys(props.rules).length === 0) return true

  for (const [prop, fieldRules] of Object.entries(props.rules)) {
    const value = props.formData[prop]
    for (const rule of fieldRules) {
      if (rule.required) {
        const isEmpty = value === null || value === undefined || value === '' ||
          (Array.isArray(value) && value.length === 0)
        if (isEmpty) {
          errors[prop] = rule.message || '此字段为必填项'
          return false
        }
      }
      if (rule.type === 'number' && value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) { errors[prop] = rule.message || '请输入有效的数字'; return false }
        if (rule.min !== undefined && num < rule.min) { errors[prop] = rule.message || `值不能小于${rule.min}`; return false }
        if (rule.max !== undefined && num > rule.max) { errors[prop] = rule.message || `值不能大于${rule.max}`; return false }
      }
      if (rule.validator) {
        return new Promise((resolve: any) => {
          rule.validator(rule, value, (err: any) => {
            if (err) { errors[prop] = typeof err === 'string' ? err : err.message || '验证失败'; resolve(false) }
            else { errors[prop] = ''; resolve(true) }
          })
        })
      }
    }
    errors[prop] = ''
  }
  return true
}

const clearValidate = () => {
  Object.keys(errors).forEach((k: any) => errors[k] = '')
}

const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

defineExpose({
  open,
  close,
  validate,
  clearValidate,
  resetFields
})
</script>
