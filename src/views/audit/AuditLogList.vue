<template>
  <div class="audit-log-list">
    <el-card>
      <el-row v-if="stats" :gutter="20" class="stats-section">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #409EFF;">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total_count || 0 }}</div>
                <div class="stat-label">总记录数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #67C23A;">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.action_type_stats?.create || 0 }}</div>
                <div class="stat-label">创建</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #E6A23C;">
                <el-icon><Edit /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.action_type_stats?.update || 0 }}</div>
                <div class="stat-label">更新</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #F56C6C;">
                <el-icon><Delete /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.action_type_stats?.delete || 0 }}</div>
                <div class="stat-label">删除</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="filters.action_type" placeholder="操作类型" clearable style="width: 140px;" @change="handleSearch">
            <el-option v-for="item in actionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="filters.model" placeholder="对象类型" clearable style="width: 160px;" @change="handleSearch">
            <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="filters.user" placeholder="用户ID" clearable style="width: 120px;" @clear="handleSearch" @keyup.enter="handleSearch" />
          <el-input v-model="filters.object_id" placeholder="对象ID" clearable style="width: 140px;" @clear="handleSearch" @keyup.enter="handleSearch" />
          <el-input v-model="filters.ip_address" placeholder="IP地址" clearable style="width: 150px;" @clear="handleSearch" @keyup.enter="handleSearch" />
          <el-date-picker v-model="filters.start_date" type="date" placeholder="开始日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 150px;" @change="handleSearch" />
          <el-date-picker v-model="filters.end_date" type="date" placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 150px;" @change="handleSearch" />
        </div>
        <div class="action-group">
          <el-input v-model="searchText" placeholder="搜索对象/用户名/IP" clearable style="width: 240px;" @input="handleSearchDebounced" @clear="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-button @click="resetFilters">重置</el-button>
          <el-button v-if="canExportAuditLog" type="primary" :icon="Download" @click="exportDialogVisible = true">导出</el-button>
          <el-button v-if="canViewAuditExport" type="info" :icon="Document" @click="openExportList">导出记录</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="action_type" label="操作类型" width="120">
          <template #default="scope">
            <el-tag :type="actionTagType(scope.row.action_type)" size="small">{{ actionTypeLabel(scope.row.action_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="content_type_name" label="对象类型" width="140" />
        <el-table-column prop="object_repr" label="对象" min-width="220" />
        <el-table-column prop="object_id" label="对象ID" width="120" />
        <el-table-column prop="ip_address" label="IP" width="140">
          <template #default="scope">{{ scope.row.ip_address || '-' }}</template>
        </el-table-column>
        <el-table-column prop="changed_fields" label="变更字段" min-width="180">
          <template #default="scope">
            <el-tag v-for="field in scope.row.changed_fields || []" :key="field" size="mini" style="margin: 2px 4px 2px 0;">{{ field }}</el-tag>
            <span v-if="!scope.row.changed_fields || scope.row.changed_fields.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="openDiff(scope.row)">查看变更</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />
    </el-card>

    <el-dialog v-model="diffVisible" title="变更详情" width="720px">
      <el-skeleton v-if="diffLoading" :rows="8" animated />
      <div v-else>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="操作类型">{{ actionTypeLabel(diffData?.action_type) }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ diffData?.user || diffData?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="对象">{{ diffData?.object_repr || '-' }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ formatDateTime(diffData?.created_at) }}</el-descriptions-item>
        </el-descriptions>
        <div class="diff-section">
          <div class="diff-title">变更内容</div>
          <pre class="diff-content">{{ formattedDiff }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="diffVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="exportDialogVisible" title="导出审计日志" width="520px">
      <el-form label-width="90px">
        <el-form-item label="日期范围">
          <el-date-picker v-model="exportRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="exportFilters.action_type" clearable style="width: 100%;">
            <el-option v-for="item in actionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象类型">
          <el-select v-model="exportFilters.model" clearable style="width: 100%;">
            <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="exportFilters.user_id" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="exportLoading" @click="handleExport">确认导出</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="exportListVisible" title="导出记录" width="860px">
      <div class="export-filter">
        <el-select v-model="exportListFilters.status" placeholder="状态" clearable style="width: 160px;" @change="loadExportList">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已完成" value="completed" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-input v-model="exportListFilters.user_id" placeholder="用户ID" clearable style="width: 140px;" @clear="loadExportList" @keyup.enter="loadExportList" />
        <el-date-picker v-model="exportListFilters.start_date" type="date" placeholder="开始日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 150px;" @change="loadExportList" />
        <el-date-picker v-model="exportListFilters.end_date" type="date" placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 150px;" @change="loadExportList" />
      </div>
      <el-table v-loading="exportListLoading" :data="exportList" style="width: 100%;">
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="status_display" label="状态" width="120" />
        <el-table-column prop="record_count" label="记录数" width="100" />
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="scope">{{ formatFileSize(scope.row.file_size) }}</template>
        </el-table-column>
        <el-table-column prop="error_message" label="错误信息" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" :disabled="scope.row.status !== 'completed'" @click="downloadExport(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="exportListTotal > 0" v-model:current-page="exportListPage" v-model:page-size="exportListPageSize" :total="exportListTotal" layout="total, sizes, prev, pager, next" @size-change="handleExportPageSizeChange" @current-change="handleExportPageChange" />
      <template #footer>
        <el-button @click="exportListVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Download, Document, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { auditLogAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import unwrapApiResponse from '@/utils/apiResponse'
import { formatDateTime } from '@/utils/filter'

const userStore = useUserStore()

const searchText = ref('')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  action_type: '',
  model: '',
  user: '',
  object_id: '',
  ip_address: '',
  start_date: '',
  end_date: ''
})

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
const diffData = ref(null)
const stats = ref(null)

const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportRange = ref([])
const exportFilters = reactive({
  action_type: '',
  model: '',
  user_id: ''
})

const exportListVisible = ref(false)
const exportListLoading = ref(false)
const exportList = ref([])
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
  } catch (e) {
    return String(diffData.value.changes)
  }
})

let searchTimer = null

const handleSearchDebounced = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const resetFilters = () => {
  searchText.value = ''
  Object.assign(filters, {
    action_type: '',
    model: '',
    user: '',
    object_id: '',
    ip_address: '',
    start_date: '',
    end_date: ''
  })
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ordering: '-created_at'
    }
    if (searchText.value) params.search = searchText.value
    if (filters.action_type) params.action_type = filters.action_type
    if (filters.model) params.model = filters.model
    if (filters.user) params.user = filters.user
    if (filters.object_id) params.object_id = filters.object_id
    if (filters.ip_address) params.ip_address = filters.ip_address
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date

    const response = await auditLogAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await auditLogAPI.getStatistics()
    stats.value = unwrapApiResponse(response) || {}
  } catch (error) {
    ErrorHandler.handle(error, 'AuditLogList.loadStats')
  }
}

const actionTypeLabel = (action) => {
  const option = actionTypeOptions.find(item => item.value === action)
  return option ? option.label : action || '-'
}

const actionTagType = (action) => {
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
  return map[action] || 'info'
}

const openDiff = async (row) => {
  diffVisible.value = true
  diffLoading.value = true
  diffData.value = null
  try {
    const response = await auditLogAPI.getDiff(row.id)
    diffData.value = unwrapApiResponse(response) || {}
  } catch (error) {
    ErrorHandler.handle(error, 'AuditLogList.openDiff')
    ElMessage.error('获取变更详情失败')
  } finally {
    diffLoading.value = false
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const [startDate, endDate] = exportRange.value || []
    const expFilters = {}
    if (exportFilters.action_type) expFilters.action_type = exportFilters.action_type
    if (exportFilters.model) expFilters.model = exportFilters.model
    if (exportFilters.user_id) expFilters.user_id = exportFilters.user_id

    const payload = { start_date: startDate, end_date: endDate, filters: expFilters }
    const response = await auditLogAPI.exportLogs(payload)
    const exportInfo = unwrapApiResponse(response) || {}
    ElMessage.success(`导出任务已创建: ${exportInfo?.export_id || '-'}`)
    exportDialogVisible.value = false
  } catch (error) {
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
    const params = {
      page: exportListPage.value,
      page_size: exportListPageSize.value
    }
    if (exportListFilters.status) params.status = exportListFilters.status
    if (exportListFilters.user_id) params.user_id = exportListFilters.user_id
    if (exportListFilters.start_date) params.start_date = exportListFilters.start_date
    if (exportListFilters.end_date) params.end_date = exportListFilters.end_date

    const response = await auditLogAPI.getExportList(params)
    const payload = response || {}
    exportList.value = payload?.results || payload?.items || []
    exportListTotal.value = payload?.count || payload?.pagination?.total_items || 0
  } catch (error) {
    ErrorHandler.handle(error, 'AuditLogList.loadExportList')
    ElMessage.error('加载导出记录失败')
  } finally {
    exportListLoading.value = false
  }
}

const handleExportPageChange = (page) => {
  exportListPage.value = page
  loadExportList()
}

const handleExportPageSizeChange = (size) => {
  exportListPageSize.value = size
  exportListPage.value = 1
  loadExportList()
}

const downloadExport = async (row) => {
  try {
    const blob = await auditLogAPI.downloadExport(row.id)
    const filename = getExportFilename(row)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ErrorHandler.handle(error, 'AuditLogList.downloadExport')
    ElMessage.error('下载导出文件失败')
  }
}

const getExportFilename = (row) => {
  if (row.file_path) {
    const parts = String(row.file_path).split('/')
    return parts[parts.length - 1]
  }
  return `audit_log_${row.id}.csv`
}

const formatFileSize = (size) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const maskSensitiveFields = (input) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'csrf', 'api_key', 'access', 'refresh']
  const isSensitive = (key) => {
    if (!key) return false
    const normalized = String(key).toLowerCase()
    return sensitiveKeys.some(item => normalized.includes(item))
  }
  const walk = (value) => {
    if (Array.isArray(value)) return value.map(item => walk(item))
    if (value && typeof value === 'object') {
      const result = {}
      Object.keys(value).forEach((key) => {
        result[key] = isSensitive(key) ? '***' : walk(value[key])
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

<style scoped>
.header-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.filter-group,
.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
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
  margin-bottom: 20px;
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
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}
</style>
