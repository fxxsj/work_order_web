<template>
  <div class="h-[400px]">
    <div class="h-full overflow-y-auto">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="mb-3 cursor-pointer rounded-lg border border-l-4 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        :class="{ 'border-l-danger-500': task.priority === 'urgent', 'border-l-warning-500': task.priority === 'high', 'border-l-primary-500': task.priority === 'normal', 'border-l-gray-400': task.priority === 'low' }"
        @click="emit('task-click', task)"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <StatusTag
            :status="task.status"
            category="task"
            :label="task.status_display"
            size="small"
          />
          <Tag
            v-if="task.priority === 'urgent'"
            type="danger"
            size="small"
          >
            紧急
          </Tag>
        </div>
        <div class="mb-2 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {{ task.work_content }}
        </div>
        <div class="mb-2 flex justify-between text-xs text-gray-400">
          {{ task.work_order_process_info?.work_order?.order_number || '-' }} / {{ task.work_order_process_info?.process?.name || '-' }}
        </div>
        <div
          v-if="task.production_quantity"
          class="mb-2 flex items-center gap-2"
        >
          <ProgressBar
            :percentage="getProgress(task)"
            :stroke-width="6"
            :show-text="false"
            class="flex-1"
          />
          <span class="min-w-12 text-right text-xs text-gray-500">{{ task.quantity_completed }}/{{ task.production_quantity }}</span>
        </div>
        <div
          v-if="showClaimButton && !task.assigned_operator"
          class="mt-3 text-right"
        >
          <BaseButton
            variant="primary"
            size="sm"
            :loading="claimingTaskId === task.id"
            @click.stop="emit('claim', task)"
          >
            认领
          </BaseButton>
        </div>
        <div
          v-if="showUpdateButtons && isMyTask(task)"
          class="mt-3 flex justify-end gap-2"
        >
          <BaseButton
            variant="secondary"
            size="sm"
            icon="edit"
            @click.stop="emit('update', task)"
          >
            更新
          </BaseButton>
          <BaseButton
            v-if="canComplete(task)"
            variant="success"
            size="sm"
            icon="check"
            @click.stop="emit('complete', task)"
          >
            完成
          </BaseButton>
        </div>
      </div>
    </div>
    <EmptyState
      v-if="tasks.length === 0"
      :title="emptyText"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton, StatusTag } from '@/components/common'
import { useUserStore } from '@/stores'

defineProps({
  tasks: { type: Array as any, default: () => [] },
  showClaimButton: { type: Boolean, default: false },
  showUpdateButtons: { type: Boolean, default: false },
  claimingTaskId: { type: Number, default: null },
  emptyText: { type: String, default: '暂无任务' }
})

const emit = defineEmits(['task-click', 'claim', 'update', 'complete'])

const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)

const getProgress = (task: any) => task.production_quantity ? Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100) : 0
const isMyTask = (task: any) => task.assigned_operator === currentUser.value?.id
const canComplete = (task: any) => isMyTask(task) && ['pending', 'in_progress'].includes(task.status)
</script>