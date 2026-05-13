<template>
  <div class="assignment-history">
    <el-row v-if="summary" :gutter="20" class="stats-section">
      <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total || 0 }}</div><div class="stat-label">总记录数</div></div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><Tickets /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_tasks || 0 }}</div><div class="stat-label">涉及任务数</div></div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><OfficeBuilding /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_departments || 0 }}</div><div class="stat-label">涉及部门数</div></div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><User /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.unique_operators || 0 }}</div><div class="stat-label">涉及操作员数</div></div></div></el-card></el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <div class="header-section">
        <div class="filter-group">
          <el-date-picker v-model="filters.date_range" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px;" @change="handleSearch" />
          <el-select v-model="filters.action_type" placeholder="操作类型" clearable style="width: 120px;" @change="handleSearch">
            <el-option label="分派" value="assign" />
            <el-option label="取消分派" value="unassign" />
            <el-option label="转交" value="transfer" />
            <el-option label="完成" value="complete" />
          </el-select>
          <el-select v-model="filters.department" placeholder="部门" clearable filterable style="width: 150px;" @change="handleSearch">
            <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
          <el-input v-model="filters.task_id" placeholder="任务ID" clearable style="width: 100px;" @change="handleSearch" />
        </div>
        <div class="action-group">
          <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
          <el-button :icon="Download" type="success" :loading="exporting" @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" border style="margin-top: 20px;">
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="action_type_display" label="操作类型" width="100">
          <template #default="scope"><el-tag :type="getActionTypeTag(scope.row.action_type)">{{ scope.row.action_type_display }}</el-tag></template>
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

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" style="margin-top: 20px;" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无分派历史" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight, Download, Document, Tickets, OfficeBuilding, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { taskAssignmentHistoryAPI, departmentAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const router = useRouter()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const exporting = ref(false)
const summary = ref({})
const departmentList = ref([])

const filters = reactive({
  date_range: null,
  action_type: '',
  department: '',
  task_id: ''
})

const handleSearch = () => { currentPage.value = 1; loadData() }
const resetFilters = () => { Object.assign(filters, { date_range: null, action_type: '', department: '', task_id: '' }); currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (filters.date_range?.length === 2) { params.start_date = filters.date_range[0]; params.end_date = filters.date_range[1] }
    if (filters.action_type) params.action_type = filters.action_type
    if (filters.department) params.department = filters.department
    if (filters.task_id) params.task_id = filters.task_id

    const response = await taskAssignmentHistoryAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const loadSummary = async () => {
  try { const res = await taskAssignmentHistoryAPI.getSummary(); summary.value = res?.data || res || {} } catch (error) {}
}

const loadDepartments = async () => {
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error) {}
}

const goToWorkOrder = (row) => { if (row.work_order_id) router.push(`/workorders/${row.work_order_id}`) }

const getActionTypeTag = (type) => ({ assign: 'success', unassign: 'warning', transfer: 'primary', complete: 'info' })[type] || 'info')

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    if (filters.date_range?.length === 2) { params.start_date = filters.date_range[0]; params.end_date = filters.date_range[1] }
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

<style scoped>
.assignment-history { padding: 20px; }
.stats-section { margin-bottom: 0; }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
</style>
