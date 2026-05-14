<template>
  <el-dialog v-model="dialogVisible" title="采购收货" width="var(--ui-dialog-width-xl)" :close-on-click-modal="false" @close="handleClose">
    <div v-loading="loading">
      <el-descriptions :column="3" border size="small" class="mb-4">
        <el-descriptions-item label="采购单号">{{ purchaseOrder?.order_number }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ purchaseOrder?.supplier_name }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="getStatusType(purchaseOrder?.status)">{{ purchaseOrder?.status_display }}</el-tag></el-descriptions-item>
      </el-descriptions>
      <el-form :model="form" label-width="100px" class="mb-4">
        <el-row :gutter="20" class="responsive-form-row">
          <el-col :xs="24" :md="8"><el-form-item label="收货日期"><el-date-picker v-model="form.received_date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :xs="24" :md="8"><el-form-item label="送货单号"><el-input v-model="form.delivery_note_number" placeholder="输入送货单号" /></el-form-item></el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定收货</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, purchaseOrder: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ received_date: '', delivery_note_number: '' })
const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const getStatusType = (s) => ({ pending: 'info', submitted: 'primary', approved: 'success', received: 'warning', cancelled: 'danger' })[s] || 'info';
const handleSubmit = () => emit('submit', form)
const handleClose = () => { form.received_date = ''; form.delivery_note_number = '' }
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
