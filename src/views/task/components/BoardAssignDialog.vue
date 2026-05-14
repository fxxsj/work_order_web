<template>
  <el-dialog v-model="dialogVisible" title="分派任务" width="var(--ui-dialog-width-sm)" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="操作员" prop="operator_id">
        <el-select v-model="form.operator_id" filterable placeholder="请选择操作员" style="width: 100%">
          <el-option v-for="user in users" :key="user.id" :label="user.username" :value="user.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="分派说明"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入分派说明（可选）" /></el-form-item>
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
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const FORM_INITIAL = { operator_id: null, notes: '' }
const form = reactive({ ...FORM_INITIAL })
const rules = { operator_id: [{ required: true, message: '请选择操作员', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.visible, (val) => { if (val && props.task) initForm() })

const initForm = () => { Object.assign(form, { operator_id: props.task?.assigned_operator || null, notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }
const resetForm = () => { Object.assign(form, FORM_INITIAL); formRef.value?.resetFields() }
const handleConfirm = () => { formRef.value?.validate((valid) => { if (valid) emit('confirm', { ...form }) }) }
const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
