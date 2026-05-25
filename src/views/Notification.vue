<template>
  <TablePageLayout>
    <template #actions>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="font-bold">通知中心</span>
        <div class="flex flex-wrap items-center gap-3">
          <button
            v-if="unreadCount > 0"
            class="btn btn-primary btn-sm"
            :disabled="markingAll"
            @click="markAllRead"
          >
            标记全部已读
          </button>
          <button class="btn btn-secondary btn-sm" @click="loadData">
            <Icon name="refresh" class="h-3 w-3" />
            刷新
          </button>
        </div>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="notificationList"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :row-class="getRowClass"
      >
        <template #cell-status="{ row }">
          <span v-if="!row.is_read" class="relative flex justify-center">
            <span class="h-2 w-2 rounded-full bg-primary-500"></span>
          </span>
          <span v-else class="text-gray-400">已读</span>
        </template>

        <template #cell-content="{ row }">
          <span class="block max-w-xs truncate">{{ row.content }}</span>
        </template>

        <template #cell-created_at="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="(action) => handleRowAction(action, row)"
          />
        </template>

        <template #empty>
          <EmptyState description="暂无通知" />
        </template>
      </DataTable>
    </template>
  </TablePageLayout>
</template>

<script setup lang="ts">
import { TablePageLayout, DataTable, RowActions, EmptyState, Icon } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { formatDateTime } from '@/utils/filter'

defineProps({
  notificationList: { type: Array as any, default: () => [] },
  unreadCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  markingAll: { type: Boolean, default: false }
})

const emit = defineEmits(['mark-read', 'mark-all-read', 'click', 'refresh'])

const columns: Column[] = [
  { key: 'status', label: '状态', width: 80, align: 'center' },
  { key: 'notification_type_display', label: '类型', width: 128 },
  { key: 'title', label: '标题', minWidth: 192 },
  { key: 'content', label: '内容', minWidth: 256 },
  { key: 'created_at', label: '时间', width: 160 },
  { key: 'actions', label: '操作', width: 144, fixed: 'right' }
]

const getRowClass = (row: any) =>
  row.is_read ? '' : 'bg-primary-50/50 dark:bg-primary-900/10'

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  {
    key: 'mark-read',
    label: '标记已读',
    icon: 'checkCircle',
    tone: 'success',
    visible: !row.is_read
  }
]

const handleRowAction = (action: RowAction, row: any) => {
  if (action.key === 'view') emit('click', row)
  if (action.key === 'mark-read') emit('mark-read', row)
}

const markAllRead = () => emit('mark-all-read')
const loadData = () => emit('refresh')
</script>
