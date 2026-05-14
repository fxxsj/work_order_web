<template>
  <el-dialog v-model="dialogVisible" title="更新任务" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="生产数量"><el-input-number :value="task?.production_quantity || 0" disabled style="width: 100%;" /></el-form-item>
      <el-form-item label="当前完成数量"><el-input-number :value="task?.quantity_completed || 0" disabled style="width: 100%;" /></el-form-item>
      <el-form-item label="本次完成数量" prop="quantity_completed" required>
        <el-input-number v-model="form.quantity_completed" :min="0" :max="maxCompleted" style="width: 100%;" />
        <div v-if="task?.production_quantity" style="color: #909399; font-size: 12px; margin-top: 4px;">
          计划：{{ task.production_quantity }}，当前：{{ task.quantity_completed || 0 }}，更新后：{{ (task.quantity_completed || 0) + (form.quantity_completed || 0) }}
          <span v-if="(task.quantity_completed || 0) + (form.quantity_completed || 0) >= task.production_quantity" style="color: #67C23A;">（将自动标记为已完成）</span>
          <span v-else style="color: #E6A23C;">（状态保持为进行中）</span>
        </div>
      </el-form-item>
      <el-form-item label="本次不良品数量"><el-input-number v-model="form.quantity_defective" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ quantity_completed: 0, quantity_defective: 0, notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const maxCompleted = computed(() => (props.task?.production_quantity || 0) - (props.task?.quantity_completed || 0))

const handleSubmit = () => emit('submit', { taskId: props.task?.id, data: { ...form } })
const handleClose = () => { Object.assign(form, { quantity_completed: 0, quantity_defective: 0, notes: '' }) }
</script>
