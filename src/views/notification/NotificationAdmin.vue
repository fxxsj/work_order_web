<template>
  <TablePageLayout
    title="系统通知管理"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索通知标题、内容"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.kind"
          :options="kindOptions"
          class="w-full sm:w-36"
          placeholder="发布类型"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          class="w-full sm:w-36"
          placeholder="优先级"
          clearable
          @change="handleSearch"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          v-if="hasFilters"
          class="btn btn-secondary"
          @click="resetFilters"
        >
          重置筛选
        </button>
        <button
          :disabled="loading"
          class="btn btn-secondary"
          title="刷新"
          @click="loadData"
        >
          <Icon
            name="refresh"
            size="md"
            :class="loading ? 'animate-spin' : ''"
          />
        </button>
        <button
          v-if="canCreate"
          class="btn btn-primary"
          @click="showCreateDialog"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          发布系统通知
        </button>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.batch_id || row.id"
        :server-side-sort="true"
        default-sort-key="created_at"
        default-sort-order="desc"
        @sort="handleSort"
      >
        <template #cell-kind="{ row }">
          <Tag :type="row.data?.kind === 'urgent_alert' ? 'danger' : 'info'">
            {{ kindLabel(row.data?.kind) }}
          </Tag>
        </template>
        <template #cell-priority="{ row }">
          <Tag :type="priorityTagType(row.priority)">
            {{ row.priority_display || priorityLabel(row.priority) }}
          </Tag>
        </template>
        <template #cell-recipient_count="{ row }">
          {{ row.recipient_count ?? 0 }} 人
        </template>
        <template #cell-read_count="{ row }">
          {{ row.read_count ?? 0 }} 已读 / {{ row.unread_count ?? 0 }} 未读
        </template>
        <template #cell-created_at="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-expires_at="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的系统通知' : '暂无系统通知发布记录'"
            :action-text="canCreate && !hasFilters ? '发布第一条通知' : undefined"
            @action="showCreateDialog"
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        :total="total"
        :page="currentPage"
        :page-size="pageSize"
        @update:page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </template>
  </TablePageLayout>

  <BaseDialog
    :show="formDialogVisible"
    title="发布系统通知"
    width="normal"
    @close="formDialogVisible = false"
  >
    <div class="space-y-4">
      <Input
        v-model="form.title"
        label="标题"
        placeholder="2-200 位标题"
      />
      <TextArea
        v-model="form.content"
        label="内容"
        :rows="5"
      />
      <Select
        v-model="form.kind"
        :options="kindOptions"
        label="发布类型"
      />
      <Select
        v-if="form.kind === 'announcement'"
        v-model="form.priority"
        :options="priorityOptions"
        label="优先级"
      />
      <Toggle
        v-model="form.only_staff"
        label="仅发送给员工账号"
      />
      <InputNumber
        v-if="form.kind === 'announcement'"
        v-model="form.expires_in_days"
        label="有效天数"
        :min="0"
        :max="365"
        :step="1"
        hint="0 表示不设置过期时间"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        :disabled="submitting"
        @click="formDialogVisible = false"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleFormSubmit"
      >
        {{ submitting ? '发布中...' : '发布' }}
      </button>
    </template>
  </BaseDialog>

  <BaseDialog
    :show="detailDialogVisible"
    title="系统通知详情"
    width="wide"
    @close="detailDialogVisible = false"
  >
    <DescriptionGrid
      v-if="currentRow"
      :columns="2"
    >
      <DescriptionItem label="标题">
        {{ currentRow.title || '-' }}
      </DescriptionItem>
      <DescriptionItem label="发布类型">
        {{ kindLabel(currentRow.data?.kind) }}
      </DescriptionItem>
      <DescriptionItem label="优先级">
        {{ currentRow.priority_display || priorityLabel(currentRow.priority) }}
      </DescriptionItem>
      <DescriptionItem label="接收人数">
        {{ currentRow.recipient_count ?? 0 }}
      </DescriptionItem>
      <DescriptionItem label="已读">
        {{ currentRow.read_count ?? 0 }}
      </DescriptionItem>
      <DescriptionItem label="未读">
        {{ currentRow.unread_count ?? 0 }}
      </DescriptionItem>
      <DescriptionItem label="发布时间">
        {{ formatDateTime(currentRow.created_at) }}
      </DescriptionItem>
      <DescriptionItem label="过期时间">
        {{ formatDateTime(currentRow.expires_at) }}
      </DescriptionItem>
      <DescriptionItem
        label="内容"
        :span="2"
      >
        {{ currentRow.content || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="detailDialogVisible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showRevokeDialog"
    title="撤回系统通知"
    :message="`确定要撤回「${currentRow?.title}」吗？该批次已发送给 ${currentRow?.recipient_count ?? 0} 人，撤回后接收人将不再看到。`"
    confirm-text="撤回"
    cancel-text="取消"
    :danger="true"
    :loading="revoking"
    @confirm="handleRevoke"
    @cancel="showRevokeDialog = false"
  />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { systemNotificationAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import {
  BaseDialog,
  ConfirmDialog,
  DataTable,
  DescriptionGrid,
  DescriptionItem,
  EmptyState,
  FilterRow,
  Icon,
  Input,
  InputNumber,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  TablePageLayout,
  Tag,
  TextArea,
  Toggle
} from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'title', label: '通知标题', sortable: true, class: 'w-64' },
  { key: 'kind', label: '发布类型', sortable: false, class: 'w-32' },
  { key: 'priority', label: '优先级', sortable: true, class: 'w-28' },
  { key: 'recipient_count', label: '接收范围', sortable: true, class: 'w-28' },
  { key: 'read_count', label: '阅读情况', sortable: true, class: 'w-40' },
  { key: 'created_at', label: '发布时间', sortable: true, class: 'w-44' },
  { key: 'expires_at', label: '过期时间', sortable: false, class: 'w-44' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-40' }
]

const kindOptions = [
  { label: '系统公告', value: 'announcement' },
  { label: '紧急警报', value: 'urgent_alert' }
]
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const buildParams = (params: Record<string, unknown>) => ({
  ...params,
  ordering: sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
})

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  hasFilters,
  resetFilters
} = useCrudList(systemNotificationAPI, 'getList', {
  initialFilters: { kind: '', priority: '' },
  buildParams,
  errorContext: '加载系统通知失败'
})

const { canCreate, canDelete } = useCrudPermission('systemnotificationsettings')
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const showRevokeDialog = ref(false)
const submitting = ref(false)
const revoking = ref(false)
const currentRow = ref<any>(null)
const form = reactive({
  title: '',
  content: '',
  kind: 'announcement',
  priority: 'normal',
  only_staff: false,
  expires_in_days: 0
})

const kindLabel = (value: string) => kindOptions.find(option => option.value === value)?.label || value || '-'
const priorityLabel = (value: string) => priorityOptions.find(option => option.value === value)?.label || value || '-'
const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'
const priorityTagType = (value: string) => {
  if (value === 'urgent') return 'danger'
  if (value === 'high') return 'warning'
  if (value === 'low') return 'info'
  return 'success'
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    content: '',
    kind: 'announcement',
    priority: 'normal',
    only_staff: false,
    expires_in_days: 0
  })
}

const showCreateDialog = () => {
  if (!canCreate.value) return
  resetForm()
  formDialogVisible.value = true
}

const validateForm = () => {
  form.title = form.title.trim()
  form.content = form.content.trim()
  if (form.title.length < 2 || form.title.length > 200) {
    useUIStore().showWarning('通知标题长度必须为 2-200')
    return false
  }
  if (form.content.length < 2) {
    useUIStore().showWarning('请输入通知内容')
    return false
  }
  return true
}

const handleFormSubmit = async () => {
  if (!validateForm()) return
  submitting.value = true
  try {
    const payload: Record<string, unknown> = {
      title: form.title,
      content: form.content,
      only_staff: form.only_staff
    }
    if (form.kind === 'urgent_alert') {
      await systemNotificationAPI.sendUrgentAlert(payload)
    } else {
      payload.priority = form.priority
      if (form.expires_in_days > 0) {
        payload.expires_in_days = form.expires_in_days
      }
      await systemNotificationAPI.createAnnouncement(payload)
    }
    useUIStore().showSuccess('发布成功')
    formDialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '发布系统通知')
  } finally {
    submitting.value = false
  }
}

const getRowActions = (_row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'delete', label: '撤回', icon: 'trash', tone: 'danger', visible: canDelete.value }
]

const handleRowAction = (action: string, row: any) => {
  currentRow.value = row
  if (action === 'view') {
    detailDialogVisible.value = true
  } else if (action === 'delete') {
    showRevokeDialog.value = true
  }
}

const handleRevoke = async () => {
  if (!currentRow.value) return
  revoking.value = true
  try {
    await systemNotificationAPI.revoke(currentRow.value.batch_id || currentRow.value.id)
    useUIStore().showSuccess('撤回成功')
    showRevokeDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '撤回系统通知')
  } finally {
    revoking.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
