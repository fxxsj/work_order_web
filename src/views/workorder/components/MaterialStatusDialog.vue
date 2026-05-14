<template>
  <el-dialog v-model="dialogVisible" title="更新物料采购状态" width="var(--ui-dialog-width-sm)" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="物料名称"><el-input :value="material?.material_name" disabled /></el-form-item>
      <el-form-item label="当前状态"><el-tag :type="statusType" size="small">{{ material?.purchase_status_display }}</el-tag></el-form-item>
      <el-form-item label="更新为" prop="purchase_status">
        <el-select v-model="form.purchase_status" placeholder="请选择状态" style="width: 100%;" @change="handleStatusChange">
          <el-option v-for="s in availableStatuses" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.purchase_status === 'ordered'" label="采购日期" prop="purchase_date"><el-date-picker v-model="form.purchase_date" type="date" placeholder="选择采购日期" style="width: 100%;" value-format="YYYY-MM-DD" /></el-form-item>
      <el-form-item v-if="form.purchase_status === 'received'" label="回料日期" prop="received_date"><el-date-picker v-model="form.received_date" type="date" placeholder="选择回料日期" style="width: 100%;" value-format="YYYY-MM-DD" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  material: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ purchase_status: '', purchase_date: '', received_date: '' })
const rules = { purchase_status: [{ required: true, message: '请选择状态', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const statusType = computed(() => ({ pending: 'info', ordered: 'primary', received: 'success', cut: 'warning', completed: 'success' })[props.material?.purchase_status] || 'info')
const availableStatuses = computed(() => {
  const s = props.material?.purchase_status
  const map = { pending: [{ value: 'ordered', label: '已下单' }], ordered: [{ value: 'received', label: '已回料' }], received: [{ value: 'cut', label: '已开料' }], cut: [{ value: 'completed', label: '已完成' }] }
  return map[s] || []
})

const handleStatusChange = () => {}
const handleSubmit = () => { formRef.value?.validate((valid) => { if (valid) emit('submit', { id: props.material?.id, data: { ...form } }) }) }
const handleClose = () => { Object.assign(form, { purchase_status: '', purchase_date: '', received_date: '' }) }
</script>
