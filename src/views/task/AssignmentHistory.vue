<template>
  <div class="assignment-history">
    <el-row v-if="summary" :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total || 0 }}</div><div class="stat-label">总记录数</div></div></div></el-card></el-col>
      <el-col :xs="24" :sm="12" :md="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><Tickets /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_tasks || 0 }}</div><div class="stat-label">涉及任务数</div></div></div></el-card></el-col>
      <el-col :xs="24" :sm="12" :md="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><OfficeBuilding /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_departments || 0 }}</div><div class="stat-label">涉及部门数</div></div></div></el-card></el-col>
      <el-col :xs="24" :sm="12" :md="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><User /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_operators || 0 }}</div><div class="stat-label">涉及操作员数</div></div></div></el-card></el-col>
    </el-row>

    <el-card class="history-card">
      <div class="header-section">
        <div class="filter-group">
          <el-date-picker v-model="filters.date_range" class="history-date-control" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="handleSearch" />
          <el-select v-model="filters.action_type" class="history-filter-control" placeholder="操作类型" clearable @change="handleSearch">
            <el-option label="分派" value="assign" />
            <el-option label="取消分派" value="unassign" />
            <el-option label="转交" value="transfer" />
            <el-option label="完成" value="complete" />
          </el-select>
          <el-select v-model="filters.department" class="history-filter-control" placeholder="部门" clearable filterable @change="handleSearch">
            <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
          <el-input v-model="filters.task_id" class="history-filter-control" placeholder="任务ID" clearable @change="handleSearch" />
        </div>
        <div class="action-group">
          <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
          <el-button :icon="Download" type="success" :loading="exporting" @click="handleExport">导出</el-button>
        </div>
      </div>

      <div class="table-scroll">
      <el-table v-loading="loading" :data="tableData" border class="history-table">
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="action_type_display" label="操作类型" width="100">
          <template #default="scope"><StatusTag :status="scope.row.action_type" category="assignmentAction" :label="scope.row.action_type_display" /></template>
        </el-table-column>
        <el-table-column prop="task_id" label="任务ID" width="80" />
        <el-table-column prop="work_order_number" label="施工单号" width="150">
          <template #default="scope">
            <el-link type="primary" @click="goToWorkOrder(scope.row)">{{ scope.row.work_order_number || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="process_name" label="工序" width="120" />
        <el-table-column label="原分派" width="200">
          <template #default="scope">
            <span v-if="scope.row.from_department_name">{{ scope.row.from_department_name }}</span>
            <span v-if="scope.row.from_operator_name"> / {{ scope.row.from_operator_name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="新分派" width="200">
          <template #default="scope">
            <span v-if="scope.row.to_department_name">{{ scope.row.to_department_name }}</span>
            <span v-if="scope.row.to_operator_name"> / {{ scope.row.to_operator_name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator_name" label="操作人" width="100" />
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
      </el-table>
      </div>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" class="pagination-row" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无分派历史" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight, Download, Document, Tickets, OfficeBuilding, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { taskAssignmentHistoryAPI, departmentAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { StatusTag } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const router = useRouter()

const exporting = ref(false)
const summary = ref({})
const departmentList = ref([])

const buildHistoryParams = (params) => {
  const { date_range, ...nextParams } = params
  if (date_range?.length === 2) {
    nextParams.start_date = date_range[0]
    nextParams.end_date = date_range[1]
  }
  return nextParams
}

const {
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
  resetFilters
} = useCrudList(taskAssignmentHistoryAPI, 'getList', {
  initialFilters: { date_range: null, action_type: '', department: '', task_id: '' },
  buildParams: buildHistoryParams,
  errorContext: '加载分派历史失败'
})

const loadSummary = async () => {
  try { const res = await taskAssignmentHistoryAPI.getSummary(); summary.value = res?.data || res || {} } catch (error) {}
}

const loadDepartments = async () => {
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error) {}
}

const goToWorkOrder = (row) => { if (row.work_order_id) router.push(`/workorders/${row.work_order_id}`) }

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    if (filters.value.date_range?.length === 2) {
      params.start_date = filters.value.date_range[0]
      params.end_date = filters.value.date_range[1]
    }
    const response = await taskAssignmentHistoryAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `分派历史_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) { ErrorHandler.showMessage(error, '导出失败') } finally { exporting.value = false }
}

onMounted(() => { loadData(); loadSummary(); loadDepartments() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.assignment-history { padding: var(--ui-page-padding); }
.stats-section { row-gap: var(--ui-section-gap); margin-bottom: 0; }
.history-card { margin-top: var(--ui-section-gap); }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.history-date-control { width: min(100%, 280px); }
.history-filter-control { width: min(100%, 160px); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.history-table { width: 100%; }
.pagination-row { margin-top: var(--ui-section-gap); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .history-date-control,
  .history-filter-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }

  .pagination-row {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
