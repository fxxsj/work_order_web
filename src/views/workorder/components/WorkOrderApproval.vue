<template>
  <div>
    <div
      v-if="approvalGuide"
      class="card mb-6 border-l-4 p-4"
      :class="approvalGuide.class"
    >
      <div class="font-medium">
        {{ approvalGuide.title }}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-dark-300">
        {{ approvalGuide.message }}
      </div>
    </div>
    <div
      v-if="canApprove && workOrder?.approval_status === 'pending'"
      class="card p-6"
    >
      <div class="mb-4 font-bold">
        业务员审核
      </div>
      <div class="space-y-4">
        <TextArea
          v-model="approvalFormState.comment"
          label="审核意见"
          :rows="3"
          placeholder="请输入审核意见（可选）"
        />
        <TextArea
          v-if="rejecting"
          v-model="approvalFormState.rejection_reason"
          label="拒绝原因"
          :rows="3"
          placeholder="请填写拒绝原因（必填）"
        />
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="btn btn-success"
            :disabled="approving"
            @click="handleApprove"
          >
            <Icon
              name="check"
              size="sm"
            /> 通过审核
          </button>
          <button
            class="btn btn-danger"
            :disabled="approving"
            @click="handleReject"
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
      class="card mt-6 p-6"
    >
      <div class="mb-4 font-bold">
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
          :disabled="resubmitting"
          @click="emit('resubmit')"
        >
          <Icon
            name="upload"
            size="sm"
          /> 提交审核
        </button>
      </div>
    </div>
    <div class="card mt-6 p-6">
      <div class="mb-4 text-lg font-bold">
        审批记录
      </div>
      <div
        v-if="approvalLogs.length"
        class="space-y-3"
      >
        <div
          v-for="log in approvalLogs"
          :key="log.id || `${log.approved_at}-${log.approval_status}`"
          class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <StatusTag
              :status="log.approval_status"
              :label="log.approval_status_display || log.approval_status"
              category="approval"
              size="small"
            />
            <span class="text-xs text-gray-500 dark:text-dark-400">{{ formatDate(log.approved_at) }}</span>
          </div>
          <div class="mt-2 text-sm text-gray-600 dark:text-dark-300">
            审核人：{{ log.approved_by_name || '-' }}
          </div>
          <div
            v-if="log.approval_comment"
            class="mt-1 text-sm text-gray-600 dark:text-dark-300"
          >
            说明：{{ log.approval_comment }}
          </div>
          <div
            v-if="log.rejection_reason"
            class="mt-1 text-sm text-danger-600"
          >
            拒绝原因：{{ log.rejection_reason }}
          </div>
        </div>
      </div>
      <div
        v-else
        class="py-4 text-sm text-gray-400"
      >
        暂无审批记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Icon, TextArea, StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

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
const rejecting = ref(false)
const approvalFormState = reactive({
  comment: '',
  rejection_reason: ''
})
const handleApprove = () => {
  emit('approve', {
    status: 'approved',
    comment: approvalFormState.comment
  })
}
const handleReject = () => {
  if (!rejecting.value) {
    rejecting.value = true
    return
  }
  if (!approvalFormState.rejection_reason.trim()) {
    window.alert('请填写拒绝原因')
    return
  }
  emit('approve', {
    status: 'rejected',
    comment: approvalFormState.comment,
    rejection_reason: approvalFormState.rejection_reason
  })
}
const approvalLogs = computed(() => Array.isArray(props.workOrder?.approval_logs) ? props.workOrder.approval_logs : [])
const approvalGuide = computed(() => {
  const status = props.workOrder?.approval_status
  if (status === 'draft') {
    return { title: '待提交审核', message: '补齐资料后提交审核，审核通过后将生成部门任务。', class: 'border-primary-500' }
  }
  if (status === 'pending' || status === 'submitted') {
    return { title: '等待审核', message: '审核通过后将进入生产任务流转。', class: 'border-warning-500' }
  }
  if (status === 'rejected') {
    const reason = props.workOrder?.rejection_reason || '请根据退回意见修改后重新提交。'
    return { title: '审核退回', message: reason, class: 'border-danger-500' }
  }
  if (status === 'approved') {
    return { title: '审核通过', message: '施工单已进入后续生产流程。', class: 'border-success-500' }
  }
  return null
})
</script>
