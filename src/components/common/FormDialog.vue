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
import { ref, defineExpose } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  width: { type: String, default: '600px' },
  formData: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  submitText: { type: String, default: '确定' },
  labelWidth: { type: String, default: '100px' },
  labelPosition: { type: String, default: 'right' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['open', 'close', 'cancel', 'submit'])

const dialogVisible = ref(false)
const formRef = ref(null)

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

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
