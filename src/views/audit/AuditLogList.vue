<template>
  <div class="audit-log-list">
    <TablePageLayout>
      <template #actions>
        <div class="space-y-4">
          <div class="flex justify-end gap-3">
            <BaseButton
              variant="secondary"
              icon="refresh"
              title="刷新"
              :loading="loading"
              @click="handleAuditSearch"
            />
            <BaseButton
              v-if="canExportAuditLog"
              variant="secondary"
              icon="download"
              @click="exportDialogVisible = true"
            >
              导出日志
            </BaseButton>
            <button
              v-if="canViewAuditExport"
              class="btn btn-secondary"
              @click="openExportList"
            >
              导出历史
            </button>
          </div>

          <FilterRow>
            <SearchInput
              v-model="searchText"
              class="w-full sm:w-56"
              placeholder="搜索对象/用户名/IP"
              @search="handleAuditSearch"
              @clear="handleAuditSearch"
            />
            <Select
              v-model="filters.action_type"
              :options="actionTypeOptions"
              class="w-full sm:w-36"
              placeholder="全部操作"
              clearable
              @change="handleAuditSearch"
            />
            <Select
              v-model="filters.model"
              :options="modelOptions"
              class="w-full sm:w-36"
              placeholder="全部对象"
              clearable
              @change="handleAuditSearch"
            />
            <DateRangePicker
              v-model="auditDateRange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleAuditSearch"
            />
            <button
              class="btn btn-secondary"
              @click="handleResetFilters"
            >
              重置
            </button>
          </FilterRow>

          <div
            v-if="stats"
            class="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <div class="card p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Icon
                    name="document"
                    size="md"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    总记录数
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ formatCount((stats as any).total_count) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    当前统计范围
                  </p>
                </div>
              </div>
            </div>
            <div class="card p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Icon
                    name="plus"
                    size="md"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    创建
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ formatCount((stats as any).action_type_stats?.create) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    新增操作
                  </p>
                </div>
              </div>
            </div>
            <div class="card p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Icon
                    name="edit"
                    size="md"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    更新
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ formatCount((stats as any).action_type_stats?.update) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    修改操作
                  </p>
                </div>
              </div>
            </div>
            <div class="card p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <Icon
                    name="trash"
                    size="md"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    删除
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ formatCount((stats as any).action_type_stats?.delete) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    删除操作
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            <div class="space-y-0.5">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formatDateParts(row.created_at).date }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDateParts(row.created_at).time }}
              </div>
            </div>
          </template>
          <template #cell-action_type="{ row }">
            <span
              class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
              :class="actionBadgeClass(row.action_type)"
            >
              {{ actionTypeLabel(row.action_type) }}
            </span>
          </template>
          <template #cell-username="{ row }">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-dark-700 dark:text-dark-300">
                <Icon
                  name="user"
                  size="sm"
                />
              </div>
              <div class="min-w-0">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ row.username || '-' }}
                </div>
                <div
                  v-if="row.user"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  ID: {{ row.user }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-content_type_name="{ row }">
            <span class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {{ row.content_type_name || '-' }}
            </span>
          </template>
          <template #cell-object_repr="{ row }">
            <span class="block max-w-[360px] whitespace-normal break-words font-medium text-gray-900 dark:text-white">
              {{ row.object_repr || '-' }}
            </span>
          </template>
          <template #cell-object_id="{ row }">
            <span class="font-mono text-xs text-gray-600 dark:text-gray-300">
              {{ row.object_id || '-' }}
            </span>
          </template>
          <template #cell-ip_address="{ row }">
            <span class="font-mono text-xs text-gray-600 dark:text-gray-300">
              {{ row.ip_address || '-' }}
            </span>
          </template>
          <template #cell-changed_fields="{ row }">
            <span class="inline-flex flex-wrap gap-1">
              <span
                v-for="field in row.changed_fields || []"
                :key="field"
                class="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20"
              >{{ field }}</span>
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
      title="导出历史"
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
import { BaseButton, Icon, Select, SearchInput, DateRangePicker, Pagination, TablePageLayout, DataTable, EmptyState, BaseDialog, DescriptionGrid, DescriptionItem, RowActions, FilterRow } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

const userStore = useUserStore()

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

const formatLocalDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getDefaultDateFilters = () => {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 6)
  return {
    start_date: formatLocalDate(weekAgo),
    end_date: formatLocalDate(now)
  }
}

const buildAuditParams = (params: any) => {
  const ordering = sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
  return { ...params, ordering }
}

const defaultDateFilters = getDefaultDateFilters()

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
  resetFilters: resetCrudFilters
} = useCrudList(auditLogAPI, 'getList', {
  initialFilters: {
    action_type: '',
    model: '',
    start_date: defaultDateFilters.start_date,
    end_date: defaultDateFilters.end_date
  },
  buildParams: buildAuditParams,
  errorContext: '加载审计日志失败'
})

const auditDateRange = computed<[string, string]>({
  get: (): [string, string] => [String(filters.value.start_date || ''), String(filters.value.end_date || '')],
  set: ([start, end]: [string, string]) => {
    filters.value.start_date = start
    filters.value.end_date = end
  }
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
  request_method: filters.value.request_method,
  search: searchText.value,
  ordering: sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
})

const buildStatsParams = () => ({
  action_type: filters.value.action_type,
  model: filters.value.model,
  start_date: filters.value.start_date,
  end_date: filters.value.end_date,
  search: searchText.value
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
    const response: any = await auditLogAPI.getStatistics(buildStatsParams())
    stats.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.loadStats')
  }
}

const handleAuditSearch = async () => {
  await handleSearch()
  loadStats()
}

const handleResetFilters = async () => {
  sortKey.value = 'created_at'
  sortOrder.value = 'desc'
  await resetCrudFilters(getDefaultDateFilters())
  loadStats()
}

const actionTypeLabel = (action: any) => {
  const option = actionTypeOptions.find((item: any) => item.value === action)
  return option ? option.label : action || '-'
}

const formatCount = (value: any) => Number(value || 0).toLocaleString()

const formatDateParts = (value: any) => {
  const formatted = formatDateTime(value)
  if (!formatted || formatted === '-') return { date: '-', time: '-' }
  const [date, ...timeParts] = String(formatted).split(' ')
  return {
    date,
    time: timeParts.join(' ') || '-'
  }
}

const actionBadgeClass = (action: any) => {
  const map = {
    create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    delete: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    view: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    export: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    import: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    approve: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    reject: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    login: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    logout: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return (map as any)[action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
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
