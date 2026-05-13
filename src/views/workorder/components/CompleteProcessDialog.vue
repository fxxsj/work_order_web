<template>
  <el-dialog v-model="dialogVisible" title="完成工序" width="600px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="工序名称"><el-input :value="process?.process_name" disabled /></el-form-item>
      <el-form-item label="任务完成情况">
        <div v-if="process?.tasks">
          <div style="margin-bottom: 10px;"><span>总任务数：{{ process.tasks.length }}</span><span style="margin-left: 20px;">已完成：{{ completedCount }}</span><span v-if="incompleteCount > 0" style="margin-left: 20px; color: #E6A23C;">未完成：{{ incompleteCount }}</span></div>
          <el-alert v-if="incompleteCount > 0" type="warning" :closable="false" style="margin-bottom: 10px;"><template #title><p>该工序还有 {{ incompleteCount }} 个任务未完成。建议先完成任务，如需强制完成请勾选下方选项。</p></template></el-alert>
        </div>
      </el-form-item>
      <el-form-item label="完成数量"><el-input-number v-model="form.quantity_completed" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="不良品数量"><el-input-number v-model="form.quantity_defective" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item v-if="incompleteCount > 0"><el-checkbox v-model="form.force_complete">强制完成（即使任务未完成）</el-checkbox></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, process: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ quantity_completed: 0, quantity_defective: 0, force_complete: false })
const rules = { quantity_completed: [{ required: true, message: '请输入完成数量', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const completedCount = computed(() => props.process?.tasks?.filter(t => t.status === 'completed').length || 0)
const incompleteCount = computed(() => props.process?.tasks?.filter(t => t.status !== 'completed').length || 0)

const handleSubmit = () => { formRef.value?.validate((valid) => { if (valid) emit('submit', { processId: props.process?.id, data: { ...form } }) }) }
const handleClose = () => { Object.assign(form, { quantity_completed: 0, quantity_defective: 0, force_complete: false }) }
</script>
