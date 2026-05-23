<template>
  <div class="audit-log-list space-y-6">
    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #409EFF;">
            <Icon name="document" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).total_count || 0 }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #67C23A;">
            <Icon name="plus" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.create || 0 }}</div>
            <div class="stat-label">创建</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #E6A23C;">
            <Icon name="edit" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.update || 0 }}</div>
            <div class="stat-label">更新</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #F56C6C;">
            <Icon name="trash" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.delete || 0 }}</div>
            <div class="stat-label">删除</div>
          </div>
        </div>
      </div>
    </div>

    <CrudPageLayout
      title="审计日志"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search>
        <Select v-model="filters.action_type" :options="actionTypeOptions" class="audit-filter-control" placeholder="操作类型" clearable @change="handleSearch" />
        <Select v-model="filters.model" :options="modelOptions" class="audit-filter-control" placeholder="对象类型" clearable @change="handleSearch" />
        <input v-model="filters.user" class="input audit-filter-control" placeholder="用户ID" @keyup.enter="handleSearch" />
        <input v-model="filters.object_id" class="input audit-filter-control" placeholder="对象ID" @keyup.enter="handleSearch" />
        <input v-model="filters.ip_address" class="input audit-filter-control" placeholder="IP地址" @keyup.enter="handleSearch" />
        <input type="date" v-model="filters.start_date" class="input audit-filter-control" placeholder="开始日期" @change="handleSearch" />
        <input type="date" v-model="filters.end_date" class="input audit-filter-control" placeholder="结束日期" @change="handleSearch" />
      </template>
      <template #actions>
        <SearchInput v-model="searchText" class="audit-search-control" placeholder="搜索对象/用户名/IP" @search="handleSearch" @clear="handleSearch" />
        <button class="btn" @click="resetFilters">重置</button>
        <button class="btn btn-primary" v-if="canExportAuditLog" @click="exportDialogVisible = true">导出</button>
        <button class="btn btn-secondary" v-if="canViewAuditExport" @click="openExportList">导出记录</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
        <template #cell-created_at="{ row }"><span>{{ formatDateTime(row.created_at) }}</span></template>
        <template #cell-action_type="{ row }"><Tag :type="actionTagType(row.action_type)" size="small">{{ actionTypeLabel(row.action_type) }}</Tag></template>
        <template #cell-username="{ row }"><span>{{ row.username }}</span></template>
        <template #cell-content_type_name="{ row }"><span>{{ row.content_type_name }}</span></template>
        <template #cell-object_repr="{ row }"><span>{{ row.object_repr }}</span></template>
        <template #cell-object_id="{ row }"><span>{{ row.object_id }}</span></template>
        <template #cell-ip_address="{ row }"><span>{{ row.ip_address || '-' }}</span></template>
        <template #cell-changed_fields="{ row }">
          <span class="changed-fields">
            <Tag v-for="field in row.changed_fields || []" :key="field" size="small">{{ field }}</Tag>
          </span>
          <span v-if="!row.changed_fields || row.changed_fields.length === 0">-</span>
        </template>
        <template #cell-actions="{ row }">
          <button class="btn btn-ghost btn-sm" @click="openDiff(row)">查看变更</button>
        </template>
        <template #empty>
          <EmptyState description="暂无审计日志数据" />
        </template>
      </DataTable>
    </CrudPageLayout>

    <BaseDialog :show="diffVisible" title="变更详情" width="normal">
      <div v-if="diffLoading" class="space-y-4">
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div v-else>
        <div class="descriptions-grid" style="--col: 2; font-size: 14px;">
          <div class="description-item"><div class="description-label">操作类型</div><div class="description-value">{{ actionTypeLabel(diffData?.action_type) }}</div></div>
          <div class="description-item"><div class="description-label">用户</div><div class="description-value">{{ diffData?.user || diffData?.username || '-' }}</div></div>
          <div class="description-item"><div class="description-label">对象</div><div class="description-value">{{ diffData?.object_repr || '-' }}</div></div>
          <div class="description-item"><div class="description-label">时间</div><div class="description-value">{{ formatDateTime(diffData?.created_at) }}</div></div>
        </div>
        <div class="diff-section">
          <div class="diff-title">变更内容</div>
          <pre class="diff-content">{{ formattedDiff }}</pre>
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="diffVisible = false">关闭</button>
      </template>
    </BaseDialog>

    <BaseDialog :show="exportDialogVisible" title="导出审计日志" width="narrow">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-20 text-sm text-gray-600 dark:text-gray-400 pt-2">日期范围</label>
          <div class="flex-1 flex gap-2">
            <input type="date" v-model="exportStartDate" class="input flex-1" />
            <span class="text-gray-400 pt-2">至</span>
            <input type="date" v-model="exportEndDate" class="input flex-1" />
          </div>
        </div>
        <div class="flex items-start gap-3">
          <label class="w-20 text-sm text-gray-600 dark:text-gray-400 pt-2">操作类型</label>
          <Select v-model="exportFilters.action_type" :options="actionTypeOptions" clearable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-20 text-sm text-gray-600 dark:text-gray-400 pt-2">对象类型</label>
          <Select v-model="exportFilters.model" :options="modelOptions" clearable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-20 text-sm text-gray-600 dark:text-gray-400 pt-2">用户ID</label>
          <input v-model="exportFilters.user_id" class="input flex-1" placeholder="可选" />
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="exportDialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="exportLoading" @click="handleExport">确认导出</button>
      </template>
    </BaseDialog>

    <BaseDialog :show="exportListVisible" title="导出记录" width="wide">
      <div class="export-filter">
        <Select v-model="exportListFilters.status" :options="exportStatusOptions" class="audit-filter-control" placeholder="状态" clearable @change="loadExportList" />
        <input v-model="exportListFilters.user_id" class="input audit-filter-control" placeholder="用户ID" @keyup.enter="loadExportList" />
        <input type="date" v-model="exportListFilters.start_date" class="input audit-filter-control" placeholder="开始日期" @change="loadExportList" />
        <input type="date" v-model="exportListFilters.end_date" class="input audit-filter-control" placeholder="结束日期" @change="loadExportList" />
      </div>
      <div class="table-scroll">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
              <th class="px-3 py-3 w-44">创建时间</th>
              <th class="px-3 py-3 w-28">用户</th>
              <th class="px-3 py-3 w-28">状态</th>
              <th class="px-3 py-3 w-24">记录数</th>
              <th class="px-3 py-3 w-24">文件大小</th>
              <th class="px-3 py-3 min-w-44">错误信息</th>
              <th class="px-3 py-3 w-28">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
            <tr v-for="row in exportList" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-dark-800">
              <td class="px-3 py-2">{{ formatDateTime(row.created_at) }}</td>
              <td class="px-3 py-2">{{ row.username }}</td>
              <td class="px-3 py-2">{{ row.status_display }}</td>
              <td class="px-3 py-2">{{ row.record_count }}</td>
              <td class="px-3 py-2">{{ formatFileSize(row.file_size) }}</td>
              <td class="px-3 py-2">{{ row.error_message || '-' }}</td>
              <td class="px-3 py-2">
                <button class="btn btn-ghost btn-sm" :disabled="row.status !== 'completed'" @click="downloadExport(row)">下载</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-if="exportListTotal > 0" v-model:page="exportListPage" v-model:page-size="exportListPageSize" :total="exportListTotal" layout="total, sizes, prev, pager, next" @update:page-size="handleExportPageSizeChange" @update:page="handleExportPageChange" />
      <template #footer>
        <button class="btn" @click="exportListVisible = false">关闭</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { auditLogAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import unwrapApiResponse from '@/utils/apiResponse'
import { formatDateTime } from '@/utils/filter'
import { Icon, Select, SearchInput, Tag, Pagination, CrudPageLayout, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common/types'

const userStore = useUserStore()

const buildAuditParams = (params: any) => ({ ordering: '-created_at', ...params })

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
  { key: 'created_at', label: '时间', width: 176 },
  { key: 'action_type', label: '操作类型', width: 112 },
  { key: 'username', label: '用户', width: 112 },
  { key: 'content_type_name', label: '对象类型', width: 128 },
  { key: 'object_repr', label: '对象', minWidth: 208 },
  { key: 'object_id', label: '对象ID', width: 112 },
  { key: 'ip_address', label: 'IP', width: 128 },
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

const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportStartDate = ref('')
const exportEndDate = ref('')
const exportFilters = reactive({
  action_type: '',
  model: '',
  user_id: ''
})

const exportStatusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' }
]

const exportListVisible = ref(false)
const exportListLoading = ref(false)
const exportList = ref<any[]>([])
const exportListPage = ref(1)
const exportListPageSize = ref(20)
const exportListTotal = ref(0)
const exportListFilters = reactive({
  status: '',
  user_id: '',
  start_date: '',
  end_date: ''
})

const canExportAuditLog = computed(() => userStore.hasPermission('workorder.add_auditlogexport'))
const canViewAuditExport = computed(() => userStore.hasPermission('workorder.view_auditlogexport'))

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
    stats.value = unwrapApiResponse(response) || {}
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

const openDiff = async (row: any) => {
  diffVisible.value = true
  diffLoading.value = true
  diffData.value = null
  try {
    const response: any = await auditLogAPI.getDiff(row.id)
    diffData.value = unwrapApiResponse(response) || {}
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.openDiff')
    ElMessage.error('获取变更详情失败')
  } finally {
    diffLoading.value = false
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const expFilters = {}
    if ((exportFilters as any).action_type) (expFilters as any).action_type = exportFilters.action_type
    if ((exportFilters as any).model) (expFilters as any).model = exportFilters.model
    if ((exportFilters as any).user_id) (expFilters as any).user_id = exportFilters.user_id

    const payload = { start_date: exportStartDate.value, end_date: exportEndDate.value, filters: expFilters }
    const response: any = await auditLogAPI.exportLogs(payload)
    const exportInfo = unwrapApiResponse(response) || {}
    ElMessage.success(`导出任务已创建: ${exportInfo?.export_id || '-'}`)
    exportDialogVisible.value = false
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.handleExport')
    ElMessage.error('创建导出任务失败')
  } finally {
    exportLoading.value = false
  }
}

const openExportList = async () => {
  exportListVisible.value = true
  exportListPage.value = 1
  await loadExportList()
}

const loadExportList = async () => {
  exportListLoading.value = true
  try {
    const params: Record<string, any> = {
      page: exportListPage.value,
      page_size: exportListPageSize.value
    }
    if (exportListFilters.status) params.status = exportListFilters.status
    if (exportListFilters.user_id) params.user_id = exportListFilters.user_id
    if (exportListFilters.start_date) params.start_date = exportListFilters.start_date
    if (exportListFilters.end_date) params.end_date = exportListFilters.end_date

    const response: any = await auditLogAPI.getExportList(params)
    const payload = response || {}
    exportList.value = payload?.results || payload?.items || []
    exportListTotal.value = payload?.count || payload?.pagination?.total_items || 0
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.loadExportList')
    ElMessage.error('加载导出记录失败')
  } finally {
    exportListLoading.value = false
  }
}

const handleExportPageChange = (page: any) => {
  exportListPage.value = page
  loadExportList()
}

const handleExportPageSizeChange = (size: any) => {
  exportListPageSize.value = size
  exportListPage.value = 1
  loadExportList()
}

const downloadExport = async (row: any) => {
  try {
    const blob: any = await auditLogAPI.downloadExport(row.id)
    const filename = getExportFilename(row)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.downloadExport')
    ElMessage.error('下载导出文件失败')
  }
}

const getExportFilename = (row: any) => {
  if (row.file_path) {
    const parts = String(row.file_path).split('/')
    return parts[parts.length - 1]
  }
  return `audit_log_${row.id}.csv`
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

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.header-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
  justify-content: space-between;
}

.filter-group,
.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
}

.audit-filter-control {
  width: min(100%, 170px);
}

.audit-search-control {
  width: min(100%, 280px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.audit-table {
  width: 100%;
}

.changed-fields {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.diff-section {
  margin-top: 16px;
}

.diff-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.diff-content {
  background: #f7f9fb;
  border: 1px solid #e6ebf5;
  padding: 12px;
  border-radius: 4px;
  max-height: 360px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.stats-section {
  row-gap: var(--ui-section-gap);
  margin-bottom: var(--ui-section-gap);
}

.stat-card {
  border-radius: 10px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.export-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
  margin-bottom: 12px;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .export-filter,
  .audit-filter-control,
  .audit-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group,
  .export-filter {
    flex-direction: column;
  }
}
</style>
