<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="产品名称"><el-input :value="stock?.product_name" disabled /></el-form-item>
      <el-form-item label="批次号"><el-input :value="stock?.batch_no" disabled /></el-form-item>
      <el-form-item label="当前库存"><el-input :value="stock?.quantity" disabled /></el-form-item>
      <el-form-item label="调整类型" prop="adjust_type"><el-radio-group v-model="form.adjust_type"><el-radio label="add">增加</el-radio><el-radio label="subtract">减少</el-radio><el-radio label="set">设置为</el-radio></el-radio-group></el-form-item>
      <el-form-item label="调整数量" prop="quantity"><el-input-number v-model="form.quantity" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
      <el-form-item label="调整后库存"><el-input :value="previewQuantity" disabled><template #suffix><span style="color: #67C23A;">{{ previewQuantity }}</span></template></el-input></el-form-item>
      <el-form-item label="调整原因"><el-input v-model="form.reason" type="textarea" :rows="2" placeholder="请输入调整原因" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="handleClose">取消</el-button><el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button></template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, stock: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ adjust_type: 'add', quantity: 0, reason: '' })
const rules = { adjust_type: [{ required: true, message: '请选择调整类型', trigger: 'change' }], quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const dialogTitle = computed(() => props.stock ? '库存调整' : '库存调整')
const previewQuantity = computed(() => {
  const current = props.stock?.quantity || 0
  if (form.adjust_type === 'add') return current + form.quantity
  if (form.adjust_type === 'subtract') return Math.max(0, current - form.quantity)
  return form.quantity
})
const handleSubmit = () => formRef.value?.validate((valid) => { if (valid) emit('submit', { ...form }) })
const handleClose = () => { Object.assign(form, { adjust_type: 'add', quantity: 0, reason: '' }) }
</script>
