<template>
  <div class="assignment-history">
    <div v-if="summary" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5">
      <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><Icon name="document" /></div><div class="stat-info"><div class="stat-value">{{ (summary as any).total || 0 }}</div><div class="stat-label">总记录数</div></div></div></div>
      <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><Icon name="tickets" /></div><div class="stat-info"><div class="stat-value">{{ (summary as any).unique_tasks || 0 }}</div><div class="stat-label">涉及任务数</div></div></div></div>
      <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><Icon name="building" /></div><div class="stat-info"><div class="stat-value">{{ (summary as any).unique_departments || 0 }}</div><div class="stat-label">涉及部门数</div></div></div></div>
      <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><Icon name="user" /></div><div class="stat-info"><div class="stat-value">{{ (summary as any).unique_operators || 0 }}</div><div class="stat-label">涉及操作员数</div></div></div></div>
    </div>

    <div class="card history-card">
      <div class="header-section">
        <div class="filter-group">
          <input type="date" v-model="filters.start_date" class="input history-date-control" placeholder="开始日期" @change="handleSearch" />
          <input type="date" v-model="filters.end_date" class="input history-date-control" placeholder="结束日期" @change="handleSearch" />
          <select v-model="filters.action_type" class="select history-filter-control" placeholder="操作类型" @change="handleSearch">
            <option value="">全部</option>
            <option value="assign">分派</option>
            <option value="unassign">取消分派</option>
            <option value="transfer">转交</option>
            <option value="complete">完成</option>
          </select>
          <select v-model="filters.department" class="select history-filter-control" placeholder="部门" @change="handleSearch">
            <option value="">全部</option>
            <option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id">{{ dept.name }}</option>
          </select>
          <input v-model="filters.task_id" class="input history-filter-control" placeholder="任务ID" @change="handleSearch" />
        </div>
        <div class="action-group">
          <button class="btn" @click="resetFilters">重置</button>
          <button class="btn btn-success" :disabled="exporting" @click="handleExport">导出</button>
        </div>
      </div>

      <div class="table-scroll">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
              <th class="px-4 py-3 w-40">时间</th>
              <th class="px-4 py-3 w-24">操作类型</th>
              <th class="px-4 py-3 w-20">任务ID</th>
              <th class="px-4 py-3 w-36">施工单号</th>
              <th class="px-4 py-3 w-28">工序</th>
              <th class="px-4 py-3 w-48">原分派</th>
              <th class="px-4 py-3 w-48">新分派</th>
              <th class="px-4 py-3 w-24">操作人</th>
              <th class="px-4 py-3 min-w-36">原因</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
            <tr v-for="row in tableData" :key="row.id">
              <td class="px-4 py-3">{{ formatDateTime(row.created_at) }}</td>
              <td class="px-4 py-3"><StatusTag :status="row.action_type" category="assignmentAction" :label="row.action_type_display" /></td>
              <td class="px-4 py-3">{{ row.task_id }}</td>
              <td class="px-4 py-3"><a class="text-primary hover:underline cursor-pointer" @click.prevent="goToWorkOrder(row)">{{ row.work_order_number || '-' }}</a></td>
              <td class="px-4 py-3">{{ row.process_name }}</td>
              <td class="px-4 py-3">{{ row.from_department_name || '-' }}{{ row.from_operator_name ? ' / ' + row.from_operator_name : '' }}</td>
              <td class="px-4 py-3">{{ row.to_department_name || '-' }}{{ row.to_operator_name ? ' / ' + row.to_operator_name : '' }}</td>
              <td class="px-4 py-3">{{ row.operator_name }}</td>
              <td class="px-4 py-3 truncate max-w-xs">{{ row.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination v-if="total > 0" :total="total" :page="currentPage" :pageSize="pageSize" @update:page="handlePageChange" @update:pageSize="handleSizeChange" class="pagination-row" />

      <EmptyState v-if="!loading && tableData.length === 0" description="暂无分派历史" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { taskAssignmentHistoryAPI, departmentAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { StatusTag } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const router = useRouter()

const exporting = ref(false)
const summary = ref({})
const departmentList = ref<any[]>([])

const buildHistoryParams = (params: any) => {
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
  try { const res: any = await taskAssignmentHistoryAPI.getSummary(); summary.value = res?.data || res || {} } catch (error: any) {}
}

const loadDepartments = async () => {
  try { const res: any = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error: any) {}
}

const goToWorkOrder = (row: any) => { if (row.work_order_id) router.push(`/workorders/${row.work_order_id}`) }

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    if (filters.value.date_range?.length === 2) {
      (params as any).start_date = filters.value.date_range[0]
      (params as any).end_date = filters.value.date_range[1]
    }
    const response: any = await taskAssignmentHistoryAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `分派历史_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error: any) { ErrorHandler.showMessage(error, '导出失败') } finally { exporting.value = false }
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
