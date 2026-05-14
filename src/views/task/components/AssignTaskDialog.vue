<template>
  <el-dialog v-model="dialogVisible" title="调整任务分派" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="formData" label-width="120px">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="分派部门" prop="assigned_department">
        <el-select v-model="formData.assigned_department" placeholder="请选择部门" filterable clearable style="width: 100%;" :loading="loadingDepartments" @change="handleDepartmentChange">
          <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <div style="color: #909399; font-size: 12px; margin-top: 4px;">选择任务分派到的部门，留空表示不清空现有分派</div>
      </el-form-item>
      <el-form-item label="分派操作员" prop="assigned_operator">
        <el-select v-model="formData.assigned_operator" placeholder="请选择操作员" filterable clearable style="width: 100%;" :loading="loadingUsers">
          <el-option v-for="user in userList" :key="user.id" :label="user.username || `${(user.first_name || '')}${(user.last_name || '')}`.trim() || user.id" :value="user.id" />
        </el-select>
        <div style="color: #909399; font-size: 12px; margin-top: 4px;">选择任务分派到的操作员，留空表示不清空现有分派</div>
      </el-form-item>
      <el-form-item label="调整原因"><el-input v-model="formData.reason" type="textarea" :rows="2" placeholder="请输入调整原因（可选）" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="formData.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  departmentList: { type: Array, default: () => [] },
  userList: { type: Array, default: () => [] },
  loadingDepartments: { type: Boolean, default: false },
  loadingUsers: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'close', 'update:visible', 'department-change'])

const formRef = ref(null)
const submitting = ref(false)

const formData = reactive({ assigned_department: null, assigned_operator: null, reason: '', notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.task, (newTask) => { if (newTask) initFormData(newTask) })
watch(() => props.visible, (val) => { if (val && props.task) initFormData(props.task) })

const initFormData = (task) => { Object.assign(formData, { assigned_department: task.assigned_department || null, assigned_operator: task.assigned_operator || null, reason: '', notes: '' }) }

const handleDepartmentChange = (departmentId) => {
  emit('department-change', departmentId)
  if (departmentId && formData.assigned_operator) {
    const currentOperator = props.userList.find(u => u.id === formData.assigned_operator)
    if (!currentOperator) formData.assigned_operator = null
  }
}

const handleConfirm = () => emit('confirm', { ...formData })
const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { assigned_department: null, assigned_operator: null, reason: '', notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }
</script>
