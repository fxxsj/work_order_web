<template>
  <div>
    <div v-if="canApprove && isPendingApproval" class="card mt-6">
      <div class="mb-4 border-b border-gray-200 pb-2 font-bold dark:border-dark-700">业务员审核</div>
      <div class="space-y-4">
        <TextArea v-model="approvalForm.comment" label="审核意见" :rows="3" placeholder="请输入审核意见（可选）" />
        <TextArea v-if="showRejectionReason" v-model="approvalForm.rejection_reason" label="拒绝原因" :rows="3" placeholder="请填写拒绝原因（必填）" />
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="btn btn-success" :disabled="approving" @click="handleApprove('approved')"><Icon name="check" size="sm" /> 通过审核</button>
          <button type="button" class="btn btn-danger" :disabled="approving" @click="handleApprove('rejected')"><Icon name="x" size="sm" /> 拒绝审核</button>
        </div>
      </div>
    </div>
    <div v-if="canResubmit && isRejected" class="card mt-6">
      <div class="mb-4 border-b border-gray-200 pb-2 font-bold dark:border-dark-700">重新提交审核</div>
      <div class="space-y-4">
        <TextArea v-model="resubmitForm.reason" label="修改说明" :rows="3" placeholder="请说明修改了什么内容（可选）" />
        <button type="button" class="btn btn-primary" :disabled="resubmitting" @click="handleResubmit"><Icon name="upload" size="sm" /> 提交审核</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Icon, TextArea } from '@/components/common'

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

const handleApprove = (status: any) => emit('approve', status)
const handleResubmit = () => emit('resubmit')
</script>

