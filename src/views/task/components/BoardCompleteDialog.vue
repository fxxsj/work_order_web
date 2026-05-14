<template>
  <el-dialog v-model="dialogVisible" title="完成任务" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="生产数量"><el-input :value="task?.production_quantity" disabled /></el-form-item>
      <el-form-item label="完成数量" prop="quantity_completed"><el-input-number v-model="form.quantity_completed" :min="0" :max="task?.production_quantity || 999999" class="number-control" /></el-form-item>
      <el-form-item label="不良品数量" prop="quantity_defective"><el-input-number v-model="form.quantity_defective" :min="0" :max="form.quantity_completed" class="number-control" /></el-form-item>
      <el-form-item label="完成说明"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入完成说明（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const FORM_INITIAL = { quantity_completed: 0, quantity_defective: 0, notes: '' }
const form = reactive({ ...FORM_INITIAL })
const rules = { quantity_completed: [{ required: true, message: '请输入完成数量', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.visible, (val) => { if (val && props.task) initForm() })

const initForm = () => { Object.assign(form, { quantity_completed: props.task?.quantity_completed || 0, quantity_defective: props.task?.quantity_defective || 0, notes: props.task?.notes || '' }); nextTick(() => { formRef.value?.clearValidate() }) }
const resetForm = () => { Object.assign(form, FORM_INITIAL); formRef.value?.resetFields() }
const handleConfirm = () => { formRef.value?.validate((valid) => { if (valid) emit('confirm', { ...form }) }) }
const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>

<style scoped>
.number-control {
  width: min(100%, 220px);
}
</style>
