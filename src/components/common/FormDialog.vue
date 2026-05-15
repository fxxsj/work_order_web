<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
    >
      <slot></slot>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="loading" @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ submitText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, defineExpose } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  width: { type: String, default: 'var(--ui-dialog-width-md)' },
  formData: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  submitText: { type: String, default: '确定' },
  labelWidth: { type: String, default: '100px' },
  labelPosition: { type: String, default: 'right' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'cancel', 'submit'])

const internalVisible = ref(false)
const formRef = ref(null)

const dialogVisible = computed({
  get: () => props.modelValue || internalVisible.value,
  set: (value) => {
    internalVisible.value = value
    emit('update:modelValue', value)
  }
})

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
  return formRef.value?.validate()
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

defineExpose({
  open,
  close,
  validate,
  clearValidate,
  resetFields
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-control-gap);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .dialog-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .dialog-footer .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
