<template>
  <div>
    <div
      v-if="canApprove && workOrder?.approval_status === 'pending'"
      class="card mt-6"
    >
      <div class="mb-4 border-b border-gray-200 pb-2 font-bold dark:border-dark-700">
        业务员审核
      </div>
      <div class="space-y-4">
        <TextArea
          v-model="approvalForm.comment"
          label="审核意见"
          :rows="3"
          placeholder="请输入审核意见（可选）"
        />
        <TextArea
          v-if="showRejectionReason"
          v-model="approvalForm.rejection_reason"
          label="拒绝原因"
          :rows="3"
          placeholder="请填写拒绝原因（必填）"
        />
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="btn btn-success"
            :disabled="loading"
            @click="emit('approve', 'approved')"
          >
            <Icon
              name="check"
              size="sm"
            /> 通过审核
          </button>
          <button
            class="btn btn-danger"
            :disabled="loading"
            @click="emit('approve', 'rejected')"
          >
            <Icon
              name="x"
              size="sm"
            /> 拒绝审核
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="canResubmit && workOrder?.approval_status === 'rejected'"
      class="card mt-6"
    >
      <div class="mb-4 border-b border-gray-200 pb-2 font-bold dark:border-dark-700">
        重新提交审核
      </div>
      <div class="space-y-4">
        <TextArea
          v-model="resubmitForm.reason"
          label="修改说明"
          :rows="3"
          placeholder="请说明修改了什么内容（可选）"
        />
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="emit('resubmit')"
        >
          <Icon
            name="upload"
            size="sm"
          /> 提交审核
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon, TextArea } from '@/components/common'

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
