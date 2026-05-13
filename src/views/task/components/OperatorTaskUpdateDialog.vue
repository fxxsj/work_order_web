<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="任务内容"><div class="task-info">{{ task?.work_content }}</div></el-form-item>
      <el-form-item label="当前进度">
        <el-progress :percentage="currentProgress" :color="progressColor" />
        <div class="progress-text">{{ task?.quantity_completed || 0 }} / {{ task?.production_quantity || 0 }}</div>
      </el-form-item>
      <el-radio-group v-model="updateMode" style="margin-bottom: 20px;">
        <el-radio-button label="increment">增量更新</el-radio-button>
        <el-radio-button label="complete">直接完成</el-radio-button>
      </el-radio-group>
      <template v-if="updateMode === 'increment'">
        <el-form-item label="本次完成数量" prop="quantity_increment">
          <el-input-number v-model="form.quantity_increment" :min="0" :max="maxIncrement" :step="1" controls-position="right" style="width: 100%;" />
          <div class="hint">更新后进度: {{ projectedCompleted }} / {{ task?.production_quantity }}</div>
        </el-form-item>
        <el-form-item label="不良品数量" prop="quantity_defective"><el-input-number v-model="form.quantity_defective" :min="0" :step="1" controls-position="right" style="width: 100%;" /></el-form-item>
      </template>
      <template v-else>
        <el-form-item label="完成理由"><el-input v-model="form.completion_reason" type="textarea" :rows="2" placeholder="请输入完成理由（可选）" /></el-form-item>
        <el-form-item label="不良品数量"><el-input-number v-model="form.quantity_defective" :min="0" :max="task?.production_quantity" :step="1" controls-position="right" style="width: 100%;" /></el-form-item>
      </template>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ updateMode === 'complete' ? '确认完成' : '确认更新' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { workOrderTaskAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ visible: Boolean, task: { type: Object, default: () => ({}) } })
const emit = defineEmits(['success', 'update:visible'])

const formRef = ref(null)
const updateMode = ref('increment')
const submitting = ref(false)
const form = reactive({ quantity_increment: 1, quantity_defective: 0, completion_reason: '', notes: '' })
const rules = { quantity_increment: [{ required: true, message: '请输入完成数量', trigger: 'blur' }, { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const dialogTitle = computed(() => updateMode.value === 'complete' ? '完成任务' : '更新进度')
const currentProgress = computed(() => props.task?.production_quantity ? Math.round((props.task.quantity_completed / props.task.production_quantity) * 100) : 0)
const progressColor = computed(() => { const p = currentProgress.value; return p >= 100 ? '#67C23A' : p >= 50 ? '#409EFF' : '#E6A23C' })
const maxIncrement = computed(() => (props.task?.production_quantity || 0) - (props.task?.quantity_completed || 0))
const projectedCompleted = computed(() => (props.task?.quantity_completed || 0) + (form.quantity_increment || 0))

watch(() => props.visible, (val) => { if (val) resetForm() })

const resetForm = () => { updateMode.value = 'increment'; Object.assign(form, { quantity_increment: 1, quantity_defective: 0, completion_reason: '', notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { ...form, version: props.task.version }
    if (updateMode.value === 'complete') { await workOrderTaskAPI.complete(props.task.id, data); ErrorHandler.showSuccess('任务已完成') } else { await workOrderTaskAPI.updateQuantity(props.task.id, data); ErrorHandler.showSuccess('进度已更新') }
    emit('success'); handleClose()
  } catch (error) {
    if (error.response?.status === 409) ErrorHandler.showError('任务已被其他操作员更新，请刷新后重试')
    else ErrorHandler.showMessage(error, updateMode.value === 'complete' ? '完成任务' : '更新进度')
  } finally { submitting.value = false }
}

const handleClose = () => emit('update:visible', false)
</script>

<style scoped>
.task-info { background-color: #F5F7FA; padding: 12px; border-radius: 4px; color: #606266; font-size: 14px; line-height: 1.5; }
.progress-text { margin-top: 8px; font-size: 12px; color: #909399; }
.hint { margin-top: 8px; font-size: 12px; color: #909399; }
</style>
