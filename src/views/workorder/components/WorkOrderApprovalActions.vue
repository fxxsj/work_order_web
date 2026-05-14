<template>
  <div>
    <el-card v-if="canApprove && workOrder?.approval_status === 'pending'" class="approval-card">
      <template #header><span>业务员审核</span></template>
      <el-form ref="approvalFormRef" :model="approvalForm" :rules="approvalRules" label-width="100px">
        <el-form-item label="审核意见" prop="comment"><el-input v-model="approvalForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见（可选）" /></el-form-item>
        <el-form-item v-if="showRejectionReason" label="拒绝原因" prop="rejection_reason"><el-input v-model="approvalForm.rejection_reason" type="textarea" :rows="3" placeholder="请填写拒绝原因（必填）" /></el-form-item>
        <el-form-item>
          <div class="approval-actions">
          <el-button type="success" :loading="loading" :icon="Check" @click="emit('approve', 'approved')">通过审核</el-button>
          <el-button type="danger" :loading="loading" :icon="Close" @click="emit('approve', 'rejected')">拒绝审核</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-if="canResubmit && workOrder?.approval_status === 'rejected'" class="approval-card">
      <template #header><span>重新提交审核</span></template>
      <el-form ref="resubmitFormRef" :model="resubmitForm" label-width="100px">
        <el-form-item label="修改说明"><el-input v-model="resubmitForm.reason" type="textarea" :rows="3" placeholder="请说明修改了什么内容（可选）" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" :icon="Upload" @click="emit('resubmit')">提交审核</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Check, Close, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
  canApprove: { type: Boolean, default: false },
  canResubmit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  approvalForm: { type: Object, default: () => ({}) },
  resubmitForm: { type: Object, default: () => ({}) },
  approvalRules: { type: Object, default: () => ({}) },
  showRejectionReason: { type: Boolean, default: false }
})

const emit = defineEmits(['approve', 'resubmit'])
const approvalFormRef = ref(null)
const resubmitFormRef = ref(null)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.approval-card {
  margin-top: var(--ui-section-gap);
}

.approval-actions {
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.approval-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .approval-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .approval-actions .el-button {
    width: 100%;
  }
}
</style>
