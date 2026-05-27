<template>
  <div class="audit-log-list space-y-6">
    <!-- Stats Cards -->
    <div
      v-if="stats"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
    >
      <div class="card rounded-[10px]">
        <div class="flex items-center gap-3">
          <div class="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-xl text-white bg-info-500">
            <Icon name="document" />
          </div>
          <div>
            <div class="text-[22px] font-semibold">
              {{ (stats as any).total_count || 0 }}
            </div>
            <div class="text-xs text-[var(--ui-color-text-secondary)]">
              总记录数
            </div>
          </div>
        </div>
      </div>
      <div class="card rounded-[10px]">
        <div class="flex items-center gap-3">
          <div class="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-xl text-white bg-success-500">
            <Icon name="plus" />
          </div>
          <div>
            <div class="text-[22px] font-semibold">
              {{ (stats as any).action_type_stats?.create || 0 }}
            </div>
            <div class="text-xs text-[var(--ui-color-text-secondary)]">
              创建
            </div>
          </div>
        </div>
      </div>
      <div class="card rounded-[10px]">
        <div class="flex items-center gap-3">
          <div class="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-xl text-white bg-warning-500">
            <Icon name="edit" />
          </div>
          <div>
            <div class="text-[22px] font-semibold">
              {{ (stats as any).action_type_stats?.update || 0 }}
            </div>
            <div class="text-xs text-[var(--ui-color-text-secondary)]">
              更新
            </div>
          </div>
        </div>
      </div>
      <div class="card rounded-[10px]">
        <div class="flex items-center gap-3">
          <div class="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-xl text-white bg-danger-500">
            <Icon name="trash" />
          </div>
          <div>
            <div class="text-[22px] font-semibold">
              {{ (stats as any).action_type_stats?.delete || 0 }}
            </div>
            <div class="text-xs text-[var(--ui-color-text-secondary)]">
              删除
            </div>
          </div>
        </div>
      </div>
    </div>

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select
              v-model="filters.action_type"
              :options="actionTypeOptions"
              class="w-[min(100%,170px)] md:w-auto"
              placeholder="操作类型"
              clearable
              @change="handleSearch"
            />
            <Select
              v-model="filters.model"
              :options="modelOptions"
              class="w-[min(100%,170px)] md:w-auto"
              placeholder="对象类型"
              clearable
              @change="handleSearch"
            />
            <input
              v-model="filters.user"
              class="input w-[min(100%,170px)] md:w-auto"
              placeholder="用户ID"
              @keyup.enter="handleSearch"
            >
            <input
              v-model="filters.object_id"
              class="input w-[min(100%,170px)] md:w-auto"
              placeholder="对象ID"
              @keyup.enter="handleSearch"
            >
            <input
              v-model="filters.ip_address"
              class="input w-[min(100%,170px)] md:w-auto"
              placeholder="IP地址"
              @keyup.enter="handleSearch"
            >
            <input
              v-model="filters.start_date"
              type="date"
              class="input w-[min(100%,170px)] md:w-auto"
              placeholder="开始日期"
              @change="handleSearch"
            >
            <input
              v-model="filters.end_date"
              type="date"
              class="input w-[min(100%,170px)] md:w-auto"
              placeholder="结束日期"
              @change="handleSearch"
            >
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3 items-center">
          <SearchInput
            v-model="searchText"
            class="w-[min(100%,280px)] md:w-auto"
            placeholder="搜索对象/用户名/IP"
            @search="handleSearch"
            @clear="handleSearch"
          />
          <button
            class="btn btn-secondary"
            @click="resetFilters"
          >
            重置
          </button>
          <button
            v-if="canExportAuditLog"
            class="btn btn-primary"
            @click="exportDialogVisible = true"
          >
            导出
          </button>
          <button
            v-if="canViewAuditExport"
            class="btn btn-secondary"
            @click="openExportList"
          >
            导出记录
          </button>
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          row-key="id"
          :server-side-sort="true"
          default-sort-key="created_at"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-created_at="{ row }">
            <span>{{ formatDateTime(row.created_at) }}</span>
          </template>
          <template #cell-action_type="{ row }">
            <Tag
              :type="actionTagType(row.action_type)"
              size="small"
            >
              {{ actionTypeLabel(row.action_type) }}
            </Tag>
          </template>
          <template #cell-username="{ row }">
            <span>{{ row.username }}</span>
          </template>
          <template #cell-content_type_name="{ row }">
            <span>{{ row.content_type_name }}</span>
          </template>
          <template #cell-object_repr="{ row }">
            <span>{{ row.object_repr }}</span>
          </template>
          <template #cell-object_id="{ row }">
            <span>{{ row.object_id }}</span>
          </template>
          <template #cell-ip_address="{ row }">
            <span>{{ row.ip_address || '-' }}</span>
          </template>
          <template #cell-changed_fields="{ row }">
            <span class="inline-flex flex-wrap gap-1">
              <Tag
                v-for="field in row.changed_fields || []"
                :key="field"
                size="small"
              >{{ field }}</Tag>
            </span>
            <span v-if="!row.changed_fields || row.changed_fields.length === 0">-</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无审计日志数据" />
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @update:page-size="handleSizeChange"
          @update:page="handlePageChange"
        />
      </template>
    </TablePageLayout>

    <BaseDialog
      :show="diffVisible"
      title="变更详情"
      width="normal"
      @close="diffVisible = false"
    >
      <div
        v-if="diffLoading"
        class="space-y-4"
      >
        <div class="h-4 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div v-else>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="操作类型">
            {{ actionTypeLabel(diffData?.action_type) }}
          </DescriptionItem>
          <DescriptionItem label="用户">
            {{ diffData?.user || diffData?.username || '-' }}
          </DescriptionItem>
          <DescriptionItem label="对象">
            {{ diffData?.object_repr || '-' }}
          </DescriptionItem>
          <DescriptionItem label="时间">
            {{ formatDateTime(diffData?.created_at) }}
          </DescriptionItem>
        </DescriptionGrid>
        <div class="mt-4">
          <div class="mb-2 font-semibold">
            变更内容
          </div>
          <pre class="max-h-90 overflow-auto rounded border border-[var(--ui-color-border)] bg-[var(--ui-color-fill-light)] p-3 text-xs leading-relaxed whitespace-pre-wrap">{{ formattedDiff }}</pre>
        </div>
      </div>
      <template #footer>
        <button
          class="btn btn-secondary"
          @click="diffVisible = false"
        >
          关闭
        </button>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="exportDialogVisible"
      title="导出审计日志"
      width="narrow"
      @close="exportDialogVisible = false"
    >
      <form
        id="export-form"
        class="space-y-5"
        @submit.prevent="handleExport(buildExportFilters())"
      >
        <div>
          <label class="input-label mb-1.5 block">日期范围</label>
          <div class="flex gap-2 items-center">
            <input
              v-model="exportStartDate"
              type="date"
              class="input flex-1"
            >
            <span class="text-gray-400">至</span>
            <input
              v-model="exportEndDate"
              type="date"
              class="input flex-1"
            >
          </div>
        </div>
        <div>
          <label class="input-label mb-1.5 block">操作类型</label>
          <Select
            v-model="exportFilters.action_type"
            :options="actionTypeOptions"
            clearable
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">对象类型</label>
          <Select
            v-model="exportFilters.model"
            :options="modelOptions"
            clearable
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">用户ID</label>
          <input
            v-model="exportFilters.user_id"
            class="input w-full"
            placeholder="可选"
          >
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            type="button"
            @click="exportDialogVisible = false"
          >
            取消
          </button>
          <button
            form="export-form"
            type="submit"
            class="btn btn-primary"
            :disabled="exportLoading"
          >
            确认导出
          </button>
        </div>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="exportListVisible"
      title="导出记录"
      width="wide"
      @close="exportListVisible = false"
    >
      <div class="flex flex-wrap gap-3 items-center mb-3 md:flex-row md:items-center md:gap-[var(--ui-control-gap)]">
        <div>
          <label class="input-label mb-1.5 block">状态</label>
          <Select
            v-model="exportListFilters.status"
            :options="exportStatusOptions"
            class="w-40"
            placeholder="状态"
            clearable
            @change="loadExportList"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">用户ID</label>
          <input
            v-model="exportListFilters.user_id"
            class="input w-40"
            placeholder="用户ID"
            @keyup.enter="loadExportList"
          >
        </div>
        <div>
          <label class="input-label mb-1.5 block">开始日期</label>
          <input
            v-model="exportListFilters.start_date"
            type="date"
            class="input w-40"
            placeholder="开始日期"
            @change="loadExportList"
          >
        </div>
        <div>
          <label class="input-label mb-1.5 block">结束日期</label>
          <input
            v-model="exportListFilters.end_date"
            type="date"
            class="input w-40"
            placeholder="结束日期"
            @change="loadExportList"
          >
        </div>
      </div>
      <DataTable
        :columns="exportListColumns"
        :data="exportList"
        :loading="exportListLoading"
        row-key="id"
      >
        <template #cell-created_at="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
        <template #cell-status_display="{ row }">
          {{ row.status_display }}
        </template>
        <template #cell-file_size="{ row }">
          {{ formatFileSize(row.file_size) }}
        </template>
        <template #cell-error_message="{ row }">
          {{ row.error_message || '-' }}
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getExportRowActions(row)"
            @action="() => downloadExport(row)"
          />
        </template>
      </DataTable>
      <Pagination
        v-if="exportListTotal > 0"
        v-model:page="exportListPage"
        v-model:page-size="exportListPageSize"
        :total="exportListTotal"
        layout="total, sizes, prev, pager, next"
        @update:page-size="handleExportPageSizeChange"
        @update:page="handleExportPageChange"
      />
      <template #footer>
        <button
          class="btn btn-secondary"
          @click="exportListVisible = false"
        >
          关闭
        </button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { auditLogAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList, useExportJob } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import { Icon, Select, SearchInput, Tag, Pagination, TablePageLayout, DataTable, EmptyState, BaseDialog, DescriptionGrid, DescriptionItem, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

const userStore = useUserStore()

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

const buildAuditParams = (params: any) => {
  const ordering = sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
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
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(auditLogAPI, 'getList', {
  initialFilters: {
    action_type: '',
    model: '',
    user: '',
    object_id: '',
    ip_address: '',
    start_date: '',
    end_date: ''
  },
  buildParams: buildAuditParams,
  errorContext: '加载审计日志失败'
})

const columns: Column[] = [
  { key: 'created_at', label: '时间', width: 176, sortable: true },
  { key: 'action_type', label: '操作类型', width: 112, sortable: true },
  { key: 'username', label: '用户', width: 112, sortable: true },
  { key: 'content_type_name', label: '对象类型', width: 128, sortable: true },
  { key: 'object_repr', label: '对象', minWidth: 208 },
  { key: 'object_id', label: '对象ID', width: 112, sortable: true },
  { key: 'ip_address', label: 'IP', width: 128, sortable: true },
  { key: 'changed_fields', label: '变更字段', minWidth: 176 },
  { key: 'actions', label: '操作', width: 112, fixed: 'right' }
]

const actionTypeOptions = [
  { value: 'create', label: '创建' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'view', label: '查看' },
  { value: 'export', label: '导出' },
  { value: 'import', label: '导入' },
  { value: 'approve', label: '审核通过' },
  { value: 'reject', label: '审核拒绝' },
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' }
]

const modelOptions = [
  { value: 'workorder', label: '施工单' },
  { value: 'workorderprocess', label: '施工单工序' },
  { value: 'workordertask', label: '施工单任务' },
  { value: 'customer', label: '客户' },
  { value: 'product', label: '产品' },
  { value: 'material', label: '物料' }
]

const diffVisible = ref(false)
const diffLoading = ref(false)
const diffData = ref<any>(null)
const stats = ref(null)

const exportStatusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' }
]

const {
  dialogVisible: exportDialogVisible,
  loading: exportLoading,
  startDate: exportStartDate,
  endDate: exportEndDate,
  filters: exportFilters,
  submitExport: handleExport,
  listVisible: exportListVisible,
  listLoading: exportListLoading,
  list: exportList,
  listPage: exportListPage,
  listPageSize: exportListPageSize,
  listTotal: exportListTotal,
  listFilters: exportListFilters,
  openList: openExportList,
  loadList: loadExportList,
  handlePageChange: handleExportPageChange,
  handlePageSizeChange: handleExportPageSizeChange,
  download: downloadExport
} = useExportJob({
  createExport: (payload) => auditLogAPI.exportLogs(payload),
  getExportList: (params) => auditLogAPI.getExportList(params),
  downloadExport: (id) => auditLogAPI.downloadExport(id),
  errorContext: 'AuditLogList'
})

const canExportAuditLog = computed(() => userStore.hasPermission('workorder.add_auditlogexport'))
const canViewAuditExport = computed(() => userStore.hasPermission('workorder.view_auditlogexport'))

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key === 'content_type_name' ? 'content_type__model' : key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const buildExportFilters = () => ({
  action_type: exportFilters.action_type,
  model: exportFilters.model,
  user_id: exportFilters.user_id,
  object_id: filters.value.object_id,
  ip_address: filters.value.ip_address,
  request_method: filters.value.request_method,
  search: searchText.value,
  ordering: sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
})

const formattedDiff = computed(() => {
  if (!diffData.value || !diffData.value.changes) return '-'
  try {
    const masked = maskSensitiveFields(diffData.value.changes)
    return JSON.stringify(masked, null, 2)
  } catch (e: any) {
    return String(diffData.value.changes)
  }
})

const loadStats = async () => {
  try {
    const response: any = await auditLogAPI.getStatistics()
    stats.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.loadStats')
  }
}

const actionTypeLabel = (action: any) => {
  const option = actionTypeOptions.find((item: any) => item.value === action)
  return option ? option.label : action || '-'
}

const actionTagType = (action: any) => {
  const map = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    view: 'info',
    export: 'info',
    import: 'info',
    approve: 'success',
    reject: 'danger',
    login: 'success',
    logout: 'info'
  }
  return (map as any)[action] || 'info'
}

const exportListColumns: Column[] = [
  { key: 'created_at', label: '创建时间', width: 176 },
  { key: 'username', label: '用户', width: 112 },
  { key: 'status_display', label: '状态', width: 112 },
  { key: 'record_count', label: '记录数', width: 96, align: 'right' },
  { key: 'file_size', label: '文件大小', width: 96 },
  { key: 'error_message', label: '错误信息', minWidth: 176 },
  { key: 'actions', label: '操作', width: 112, fixed: 'right' }
]

const getRowActions = (row: any): RowAction[] => [
  { key: 'diff', label: '查看变更', icon: 'document', tone: 'primary' }
]

const getExportRowActions = (row: any): RowAction[] => [
  { key: 'download', label: '下载', icon: 'download', tone: 'primary', disabled: row.status !== 'completed' }
]

const handleRowAction = (action: RowAction, row: any) => {
  if (action.key === 'diff') openDiff(row)
}

const openDiff = async (row: any) => {
  diffVisible.value = true
  diffLoading.value = true
  diffData.value = null
  try {
    const response: any = await auditLogAPI.getDiff(row.id)
    diffData.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.openDiff')
    useUIStore().showError('获取变更详情失败')
  } finally {
    diffLoading.value = false
  }
}

const formatFileSize = (size: any) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const maskSensitiveFields = (input: any) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'csrf', 'api_key', 'access', 'refresh']
  const isSensitive = (key: unknown) => {
    if (!key) return false
    const normalized = String(key).toLowerCase()
    return sensitiveKeys.some((item: any) => normalized.includes(item))
  }
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map((item: any) => walk(item))
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      Object.keys(value).forEach((key: any) => {
        (result as any)[key] = isSensitive(key) ? '***' : walk((value as any)[key])
      })
      return result
    }
    return value
  }
  return walk(input)
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>
