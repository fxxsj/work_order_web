<template>
  <el-dialog v-model="dialogVisible" title="拆分任务" width="800px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="父任务"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="生产数量"><el-input-number :value="task?.production_quantity || 0" disabled style="width: 100%;" /></el-form-item>
      <el-form-item label="子任务列表" prop="splits">
        <div style="margin-bottom: 10px;"><el-button type="primary" size="small" @click="addSplitItem">添加子任务</el-button><span style="color: #909399; font-size: 12px; margin-left: 10px;">至少需要2个子任务</span></div>
        <el-table :data="form.splits" border style="width: 100%;">
          <el-table-column label="序号" width="60" align="center"><template #default="scope">{{ scope.$index + 1 }}</template></el-table-column>
          <el-table-column label="生产数量" width="150"><template #default="scope"><el-input-number v-model="scope.row.production_quantity" :min="1" :max="task?.production_quantity || 999999" style="width: 100%;" /></template></el-table-column>
          <el-table-column label="分派部门" width="180"><template #default="scope"><el-select v-model="scope.row.assigned_department" placeholder="选择部门" filterable clearable style="width: 100%;" @change="v => handleDeptChange(scope.$index, v)"><el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.id" /></el-select></template></el-table-column>
          <el-table-column label="分派操作员" width="180"><template #default="scope"><el-select v-model="scope.row.assigned_operator" placeholder="选择操作员" filterable clearable style="width: 100%;"><el-option v-for="u in userList" :key="u.id" :label="u.username || u.id" :value="u.id" /></el-select></template></el-table-column>
          <el-table-column label="操作" width="80"><template #default="scope"><el-button type="danger" size="small" @click="removeSplit(scope.$index)" :disabled="form.splits.length <= 2">删除</el-button></template></el-table-column>
        </el-table>
        <div v-if="form.splits.length >= 2" style="margin-top: 10px; color: #E6A23C; font-size: 12px;">子任务数量总和: {{ totalQuantity }} / {{ task?.production_quantity || 0 }}</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, departmentList: { type: Array, default: () => [] }, userList: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ splits: [] })
const rules = { splits: [{ required: true, validator: (rule, value, callback) => value.length >= 2 ? callback() : callback(new Error('至少需要2个子任务')), trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const totalQuantity = computed(() => form.splits.reduce((sum, s) => sum + (s.production_quantity || 0), 0))

const addSplitItem = () => form.splits.push({ production_quantity: Math.floor((props.task?.production_quantity || 0) / 2), assigned_department: null, assigned_operator: null })
const removeSplit = (index) => form.splits.splice(index, 1)
const handleDeptChange = (index, val) => { form.splits[index].assigned_operator = null }
const handleSubmit = () => formRef.value?.validate((valid) => { if (valid) emit('submit', { taskId: props.task?.id, splits: form.splits }) })
const handleClose = () => { form.splits = [] }
</script>
