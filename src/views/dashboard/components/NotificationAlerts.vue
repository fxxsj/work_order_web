<template>
  <div class="space-y-3">
    <div
      v-if="unreadCount > 0"
      class="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
    >
      <Icon
        name="info"
        class="h-5 w-5"
      />
      <span>您有 <strong class="text-primary-600 dark:text-primary-400">{{ unreadCount }}</strong> 条未读通知</span>
      <button
        class="btn btn-primary btn-sm ml-auto"
        @click="emit('view-notifications')"
      >
        查看通知
      </button>
    </div>
    <div
      v-if="isSalesperson && pendingApprovalCount > 0"
      class="flex items-center gap-3 rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-900/20 dark:text-warning-400"
    >
      <Icon
        name="warning"
        class="h-5 w-5"
      />
      <span>您有 <strong class="text-warning-600 dark:text-warning-400">{{ pendingApprovalCount }}</strong> 个待审核的施工单，请及时处理。</span>
      <button
        class="btn btn-warning btn-sm ml-auto"
        @click="emit('view-pending-approvals')"
      >
        点击查看
      </button>
    </div>
    <div
      v-if="isAdmin && urgentPriorityCount > 0"
      class="flex items-center gap-3 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
    >
      <Icon
        name="xCircle"
        class="h-5 w-5"
      />
      <span>发现 <strong class="text-danger-600 dark:text-danger-400">{{ urgentPriorityCount }}</strong> 个紧急优先级施工单，请关注。</span>
      <button
        class="btn btn-danger btn-sm ml-auto"
        @click="emit('view-urgent')"
      >
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({
  unreadCount: { type: Number, default: 0 },
  pendingApprovalCount: { type: Number, default: 0 },
  urgentPriorityCount: { type: Number, default: 0 },
  isSalesperson: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})
const emit = defineEmits(['view-notifications', 'view-pending-approvals', 'view-urgent'])
</script>
