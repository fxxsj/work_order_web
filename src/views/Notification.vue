<template>
  <TablePageLayout :loading="loading">
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索标题、内容、类型"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.is_read"
          :options="readStatusOptions"
          class="w-full sm:w-36"
          placeholder="阅读状态"
          @change="handleSearch"
        />
        <Select
          v-model="filters.notification_type"
          :options="notificationTypeOptions"
          class="w-full sm:w-44"
          placeholder="通知类型"
          @change="handleSearch"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          class="w-full sm:w-36"
          placeholder="优先级"
          @change="handleSearch"
        />
        <button
          class="btn btn-secondary"
          @click="resetNotificationFilters"
        >
          重置
        </button>
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            通知中心
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            未读 {{ unreadCount }} / 共 {{ total }} 条
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            v-if="unreadCount > 0"
            class="btn btn-primary btn-sm"
            :disabled="markingAll"
            @click="markAllAsRead"
          >
            <Icon
              name="checkCircle"
              class="h-4 w-4"
            />
            全部已读
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="loading"
            @click="refreshData"
          >
            <Icon
              name="refresh"
              class="h-4 w-4"
              :class="loading ? 'animate-spin' : ''"
            />
            刷新
          </button>
        </div>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: NotificationRow) => row.id"
        :row-class="getRowClass"
        :server-side-sort="true"
        default-sort-key="created_at"
        default-sort-order="desc"
        @sort="handleSort"
      >
        <template #cell-status="{ row }">
          <span
            v-if="!row.is_read"
            class="relative flex justify-center"
          >
            <span class="h-2 w-2 rounded-full bg-primary-500" />
          </span>
          <span
            v-else
            class="text-gray-400"
          >已读</span>
        </template>

        <template #cell-notification_type_display="{ row }">
          <Tag
            type="info"
            size="small"
          >
            {{ row.notification_type_display || typeLabel(row.notification_type) }}
          </Tag>
        </template>

        <template #cell-priority_display="{ row }">
          <Tag
            :type="priorityTagType(row.priority)"
            size="small"
          >
            {{ row.priority_display || priorityLabel(row.priority) }}
          </Tag>
        </template>

        <template #cell-content="{ row }">
          <span
            class="block max-w-[28rem] truncate"
            :title="row.content"
          >{{ row.content }}</span>
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
          <EmptyState :description="hasFilters || searchText ? '未找到匹配的通知' : '暂无通知'" />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @update:page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </template>
  </TablePageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { notificationAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { TablePageLayout, DataTable, RowActions, EmptyState, Icon, FilterRow, SearchInput, Select, Tag, Pagination } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { formatDateTime } from '@/utils/filter'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'

type NotificationRow = {
  id: number | string
  notification_type: string
  notification_type_display?: string
  priority: string
  priority_display?: string
  title: string
  content: string
  is_read: boolean
  created_at: string
  work_order_id?: number | null
  task_id?: number | null
  purchase_order_id?: number | null
}

const router = useRouter()
const uiStore = useUIStore()
const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const markingAll = ref(false)
const unreadCount = ref(0)

const sortFieldMap: Record<string, string> = {
  notification_type_display: 'notification_type',
  priority_display: 'priority',
}

const buildParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  const ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  return { ...params, ordering }
}

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  hasFilters,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters,
} = useCrudList<NotificationRow>(notificationAPI, 'getList', {
  initialFilters: {
    is_read: '',
    notification_type: '',
    priority: '',
  },
  buildParams,
  errorContext: '加载通知失败',
})

const columns: Column[] = [
  { key: 'status', label: '状态', width: 80, align: 'center', sortable: true },
  { key: 'notification_type_display', label: '类型', width: 132, sortable: true },
  { key: 'priority_display', label: '优先级', width: 112, sortable: true },
  { key: 'title', label: '标题', minWidth: 192, sortable: false },
  { key: 'content', label: '内容', minWidth: 280, sortable: false },
  { key: 'created_at', label: '时间', width: 180, sortable: true },
  { key: 'actions', label: '操作', width: 160, fixed: 'right' },
]

const readStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '未读', value: false },
  { label: '已读', value: true },
]

const notificationTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '施工单创建', value: 'workorder_created' },
  { label: '施工单更新', value: 'workorder_updated' },
  { label: '审核通过', value: 'approval_passed' },
  { label: '审核拒绝', value: 'approval_rejected' },
  { label: '请求审核', value: 'approval_requested' },
  { label: '任务分派', value: 'task_assigned' },
  { label: '任务开始', value: 'task_started' },
  { label: '任务逾期', value: 'task_overdue' },
  { label: '任务即将到期', value: 'task_due_soon' },
  { label: '工序完成', value: 'process_completed' },
  { label: '采购单提醒', value: 'purchase_order_submitted' },
  { label: '库存不足预警', value: 'low_stock_warning' },
  { label: '系统通知', value: 'system' },
]

const priorityOptions = [
  { label: '全部优先级', value: '' },
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]

const refreshUnreadCount = async () => {
  try {
    const response: any = await notificationAPI.getUnreadCount()
    unreadCount.value = response?.unread_count ?? response?.data?.unread_count ?? 0
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载未读通知数失败')
  }
}

const refreshData = async () => {
  await loadData()
  await refreshUnreadCount()
}

const resetNotificationFilters = async () => {
  await resetFilters()
  await refreshUnreadCount()
}

const getRowClass = (row: NotificationRow) =>
  row.is_read ? '' : 'bg-primary-50/50 dark:bg-primary-900/10'

const getRowActions = (row: NotificationRow): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  {
    key: 'mark-read',
    label: '标记已读',
    icon: 'checkCircle',
    tone: 'success',
    visible: !row.is_read,
  },
]

const handleRowAction = async (action: RowAction, row: NotificationRow) => {
  if (action.key === 'view') {
    await openNotification(row)
  }
  if (action.key === 'mark-read') {
    await markRead(row)
  }
}

const markRead = async (row: NotificationRow) => {
  try {
    await notificationAPI.markAsRead(row.id)
    await refreshData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '标记通知已读失败')
  }
}

const markAllAsRead = async () => {
  markingAll.value = true
  try {
    await notificationAPI.markAllAsRead()
    await refreshData()
    uiStore.showSuccess('已全部标记为已读')
  } catch (error: any) {
    ErrorHandler.showMessage(error, '批量标记已读失败')
  } finally {
    markingAll.value = false
  }
}

const openNotification = async (row: NotificationRow) => {
  if (!row.is_read) {
    await markRead(row)
  }
  if (row.work_order_id) {
    router.push(`/workorders/${row.work_order_id}`)
    return
  }
  if (row.task_id) {
    router.push('/tasks')
    return
  }
  if (row.purchase_order_id) {
    router.push('/purchase-orders')
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key === 'status' ? 'is_read' : key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const priorityTagType = (priority: string) => {
  if (priority === 'urgent') return 'danger'
  if (priority === 'high') return 'warning'
  if (priority === 'low') return 'info'
  return 'primary'
}

const priorityLabel = (priority: string) => {
  const match = priorityOptions.find((item) => item.value === priority)
  return match?.label || priority || '-'
}

const typeLabel = (type: string) => {
  const match = notificationTypeOptions.find((item) => item.value === type)
  return match?.label || type || '-'
}

onMounted(() => {
  refreshData()
})
</script>
