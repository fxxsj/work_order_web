<template>
  <div>
    <el-card v-if="canApprove && workOrder?.approval_status === 'pending'" style="margin-top: 20px;">
      <template #header><span>业务员审核</span></template>
      <el-form :model="approvalForm" :rules="approvalRules" label-width="100px">
        <el-form-item label="审核意见"><el-input v-model="approvalForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见（可选）" /></el-form-item>
        <el-form-item v-if="showRejectionReason" label="拒绝原因"><el-input v-model="approvalForm.rejection_reason" type="textarea" :rows="3" placeholder="请填写拒绝原因（必填）" /></el-form-item>
        <el-form-item>
          <el-button type="success" :loading="approving" :icon="Check" @click="handleApprove('approved')">通过审核</el-button>
          <el-button type="danger" :loading="approving" style="margin-left: 10px;" :icon="Close" @click="handleApprove('rejected')">拒绝审核</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-if="canResubmit && workOrder?.approval_status === 'rejected'" style="margin-top: 20px;">
      <template #header><span>重新提交审核</span></template>
      <el-form :model="resubmitForm" label-width="100px">
        <el-form-item label="修改说明"><el-input v-model="resubmitForm.reason" type="textarea" :rows="3" placeholder="请说明修改了什么内容（可选）" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="resubmitting" :icon="Upload" @click="emit('resubmit')">提交审核</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { Check, Close, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
  canApprove: { type: Boolean, default: false },
  canResubmit: { type: Boolean, default: false },
  approving: { type: Boolean, default: false },
  resubmitting: { type: Boolean, default: false },
  approvalForm: { type: Object, default: () => ({}) },
  resubmitForm: { type: Object, default: () => ({}) },
  approvalRules: { type: Object, default: () => ({}) },
  showRejectionReason: { type: Boolean, default: false }
})

const emit = defineEmits(['approve', 'resubmit'])
const handleApprove = (status) => emit('approve', status)
</script>
