<template>
  <el-dialog v-model="dialogVisible" :title="`批量分派 ${taskCount} 个任务`" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="分派部门" prop="assigned_department">
        <el-select v-model="form.assigned_department" placeholder="请选择部门" filterable clearable :loading="loadingDepartments" @change="handleDepartmentChange">
          <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="分派操作员" prop="assigned_operator">
        <el-select v-model="form.assigned_operator" placeholder="请选择操作员" filterable clearable :loading="loadingOperators" :disabled="!form.assigned_department">
          <el-option v-for="op in operatorList" :key="op.id" :label="op.username || `${op.first_name}${op.last_name}`" :value="op.id" />
        </el-select>
        <div class="form-tip">留空则只分派部门，不分派具体操作员</div>
      </el-form-item>
      <el-form-item label="调整原因" prop="reason"><el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入调整原因（可选）" /></el-form-item>
      <el-form-item label="备注" prop="notes"><el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定分派</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { authAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import unwrapApiResponse from '@/utils/apiResponse'

const props = defineProps({
  visible: { type: Boolean, default: false },
  taskCount: { type: Number, default: 0 },
  departmentList: { type: Array, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const operatorList = ref([])
const loadingOperators = ref(false)
const loadingDepartments = ref(false)
const submitting = ref(false)

const form = reactive({ assigned_department: null, assigned_operator: null, reason: '', notes: '' })
const rules = { assigned_department: [{ required: true, message: '请选择分派部门', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.visible, (val) => { if (val) resetForm() })

const resetForm = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '', notes: '' }); operatorList.value = []; nextTick(() => { formRef.value?.clearValidate() }) }

const handleDepartmentChange = async (departmentId) => {
  form.assigned_operator = null
  if (!departmentId) { operatorList.value = []; return }
  loadingOperators.value = true
  try { operatorList.value = (await authAPI.getUserList({ department: departmentId }))?.results || [] } catch (error) { ErrorHandler.showMessage(error, '加载操作员列表') } finally { loadingOperators.value = false }
}

const handleClose = () => { resetForm(); emit('update:visible', false) }

const handleSubmit = () => {
  formRef.value?.validate((valid) => { if (valid) emit('confirm', { ...form }) })
}
</script>

<style scoped>
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
