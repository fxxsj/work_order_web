<template>
  <el-dialog v-model="dialogVisible" title="调整任务分派" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="分派部门">
        <el-select v-model="form.assigned_department" placeholder="请选择部门" filterable clearable style="width: 100%;" @change="handleDeptChange">
          <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="分派操作员">
        <el-select v-model="form.assigned_operator" placeholder="请选择操作员" filterable clearable style="width: 100%;">
          <el-option v-for="u in userList" :key="u.id" :label="u.username || u.id" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="调整原因"><el-input v-model="form.reason" type="textarea" :rows="2" placeholder="请输入调整原因（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, departmentList: { type: Array, default: () => [] }, userList: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ assigned_department: null, assigned_operator: null, reason: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

const handleDeptChange = (val) => { form.assigned_operator = null }
const handleSubmit = () => emit('submit', { taskId: props.task?.id, data: { ...form } })
const handleClose = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '' }) }
</script>
