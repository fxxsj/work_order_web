<template>
  <div>
    <el-card v-if="canApprove && isPendingApproval" class="approval-card">
      <template #header><span>业务员审核</span></template>
      <el-form ref="approvalFormRef" :model="approvalForm" :rules="approvalRules" label-width="100px">
        <el-form-item label="审核意见" prop="comment"><el-input v-model="approvalForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见（可选）" /></el-form-item>
        <el-form-item v-if="showRejectionReason" label="拒绝原因" prop="rejection_reason"><el-input v-model="approvalForm.rejection_reason" type="textarea" :rows="3" placeholder="请填写拒绝原因（必填）" /></el-form-item>
        <el-form-item>
          <div class="approval-actions">
          <el-button type="success" :loading="approving" :icon="Check" @click="handleApprove('approved')">通过审核</el-button>
          <el-button type="danger" :loading="approving" :icon="Close" @click="handleApprove('rejected')">拒绝审核</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-if="canResubmit && isRejected" class="approval-card">
      <template #header><span>重新提交审核</span></template>
      <el-form ref="resubmitFormRef" :model="resubmitForm" label-width="100px">
        <el-form-item label="修改说明"><el-input v-model="resubmitForm.reason" type="textarea" :rows="3" placeholder="请说明修改了什么内容（可选）" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="resubmitting" :icon="Upload" @click="handleResubmit">提交审核</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

const emit = defineEmits(['approve', 'resubmit', 'update:approvalForm', 'update:resubmitForm'])

const approvalFormRef = ref(null)
const resubmitFormRef = ref(null)

const isPendingApproval = computed(() => props.workOrder?.approval_status === 'pending')
const isRejected = computed(() => props.workOrder?.approval_status === 'rejected')

const handleApprove = (status) => emit('approve', status)
const handleResubmit = () => emit('resubmit')
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
