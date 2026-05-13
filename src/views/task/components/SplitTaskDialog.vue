<template>
  <el-dialog v-model="dialogVisible" title="拆分任务" width="800px" @close="handleClose">
    <el-form ref="formRef" :model="formData" label-width="120px">
      <el-form-item label="父任务"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="生产数量"><el-input-number :value="task?.production_quantity" disabled style="width: 100%;" /></el-form-item>
      <el-form-item label="子任务列表" prop="splits" required>
        <div style="margin-bottom: 10px;">
          <el-button type="primary" size="small" :icon="Plus" @click="addSplitItem">添加子任务</el-button>
          <span style="color: #909399; font-size: 12px; margin-left: 10px;">至少需要2个子任务，子任务数量总和不能超过父任务数量</span>
        </div>
        <el-table :data="formData.splits" border style="width: 100%;">
          <el-table-column label="序号" width="60" align="center"><template #default="scope">{{ scope.$index + 1 }}</template></el-table-column>
          <el-table-column label="生产数量" width="150">
            <template #default="scope"><el-input-number v-model="scope.row.production_quantity" :min="1" style="width: 100%;" /></template>
          </el-table-column>
          <el-table-column label="分派部门" width="180">
            <template #default="scope">
              <el-select v-model="scope.row.assigned_department" placeholder="请选择部门" filterable clearable style="width: 100%;" :loading="loadingDepartments">
                <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="分派操作员" width="180">
            <template #default="scope">
              <el-select v-model="scope.row.assigned_operator" placeholder="请选择操作员" filterable clearable style="width: 100%;" :loading="loadingUsers">
                <el-option v-for="user in userList" :key="user.id" :label="user.username || `${(user.first_name || '')}${(user.last_name || '')}`.trim() || user.id" :value="user.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="工作内容" min-width="200">
            <template #default="scope"><el-input v-model="scope.row.work_content" placeholder="可选，默认使用父任务内容" /></template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope"><el-button type="danger" size="small" :icon="Delete" :disabled="formData.splits.length <= 2" @click="removeSplitItem(scope.$index)" /></template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px; color: #909399; font-size: 12px;">
          子任务数量总和：{{ getTotalSplitQuantity() }} / {{ task?.production_quantity || 0 }}
          <span v-if="getTotalSplitQuantity() > (task?.production_quantity || 0)" style="color: #F56C6C;">（超出父任务数量）</span>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确定拆分</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  departmentList: { type: Array, default: () => [] },
  userList: { type: Array, default: () => [] },
  loadingDepartments: { type: Boolean, default: false },
  loadingUsers: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const submitting = ref(false)
const formData = reactive({ splits: [] })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.task, (newTask) => { if (newTask) initFormData(newTask) })
watch(() => props.visible, (val) => { if (val && props.task) initFormData(props.task) })

const initFormData = (task) => {
  const defaultQuantity = Math.floor(task.production_quantity / 2)
  formData.splits = [
    { production_quantity: defaultQuantity, assigned_department: null, assigned_operator: null, work_content: '' },
    { production_quantity: task.production_quantity - defaultQuantity, assigned_department: null, assigned_operator: null, work_content: '' }
  ]
}

const addSplitItem = () => { formData.splits.push({ production_quantity: 0, assigned_department: null, assigned_operator: null, work_content: '' }) }
const removeSplitItem = (index) => { if (formData.splits.length > 2) formData.splits.splice(index, 1) }
const getTotalSplitQuantity = () => formData.splits.reduce((sum, item) => sum + (item.production_quantity || 0), 0)

const handleConfirm = () => {
  if (!formData.splits || formData.splits.length < 2) { ElMessage.error('至少需要2个子任务'); return }
  const total = getTotalSplitQuantity()
  if (total > (props.task?.production_quantity || 0)) { ElMessage.error('子任务数量总和不能超过父任务数量'); return }
  emit('confirm', { splits: formData.splits.map(split => ({ production_quantity: split.production_quantity, assigned_department: split.assigned_department || null, assigned_operator: split.assigned_operator || null, work_content: split.work_content || '' })) })
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { formData.splits = []; nextTick(() => { formRef.value?.clearValidate() }) }
</script>
