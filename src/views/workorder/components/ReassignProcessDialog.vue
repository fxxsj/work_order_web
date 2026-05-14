<template>
  <el-dialog v-model="dialogVisible" title="批量调整工序分派" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
      <el-form-item label="工序名称"><el-input :value="process?.process_name" disabled /></el-form-item>
      <el-form-item label="任务数量"><el-input :value="process?.tasks?.length || 0" disabled /><div style="color: #909399; font-size: 12px; margin-top: 4px;">将调整该工序下所有任务的分派</div></el-form-item>
      <el-form-item label="新分派部门" prop="assigned_department">
        <el-select v-model="form.assigned_department" placeholder="请选择部门" filterable clearable style="width: 100%;" @change="handleDepartmentChange">
          <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="新分派操作员" prop="assigned_operator">
        <el-select v-model="form.assigned_operator" placeholder="请选择操作员（可选）" filterable clearable style="width: 100%;">
          <el-option v-for="u in userList" :key="u.id" :label="u.username || `${(u.first_name || '')}${(u.last_name || '')}`.trim() || u.id" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="调整原因" prop="reason"><el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入调整原因（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  process: { type: Object, default: null },
  departmentList: { type: Array, default: () => [] },
  userList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible', 'department-change'])

const formRef = ref(null)
const form = reactive({ assigned_department: null, assigned_operator: null, reason: '' })
const rules = { assigned_department: [{ required: true, message: '请选择部门', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

const handleDepartmentChange = (val) => { form.assigned_operator = null; emit('department-change', val) }
const handleSubmit = () => { formRef.value?.validate((valid) => { if (valid) emit('submit', { processId: props.process?.id, data: { ...form } }) }) }
const handleClose = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '' }) }
</script>
