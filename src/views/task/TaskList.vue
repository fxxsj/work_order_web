<template>
  <div class="task-list">
    <el-card>
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="7" :lg="5">
            <el-input v-model="filters.search" placeholder="搜索任务内容、施工单号" clearable @input="handleSearchDebounced" @clear="handleSearchDebounced">
              <template #append><el-button :icon="Search" @click="handleSearch" /></template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="5" :lg="3">
            <el-select v-model="filters.status" placeholder="任务状态" clearable style="width: 100%;" @change="handleSearchDebounced">
              <el-option v-for="status in taskStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="5" :lg="3">
            <el-select v-model="filters.assigned_department" placeholder="分派部门" clearable filterable style="width: 100%;" @change="handleSearchDebounced">
              <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="5" :lg="3">
            <el-select v-model="filters.priority" placeholder="优先级" clearable style="width: 100%;" @change="handleSearchDebounced">
              <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value"><span :style="{ color: p.color }">{{ p.label }}</span></el-option>
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="7" class="filter-actions">
            <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
            <el-button v-if="canExport" type="success" :icon="Download" :loading="exporting" @click="handleExport">导出</el-button>
            <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
          </el-col>
        </el-row>
      </div>

      <div class="view-mode-bar">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="table">列表视图</el-radio-button>
          <el-radio-button label="kanban">看板视图</el-radio-button>
        </el-radio-group>
      </div>

      <SkeletonLoader v-if="loading && tableData.length === 0" class="task-skeleton" type="table" :rows="5" />

      <TaskKanban v-if="viewMode === 'kanban'" :tasks="tableData" @task-click="handleTaskClickFromKanban" />

      <template v-if="viewMode === 'table'">
        <div v-if="!shouldUseVirtualScroll" class="table-scroll">
        <el-table ref="taskTable" v-loading="loading && tableData.length > 0" :data="tableData" border class="task-table" :row-key="getRowKey" @sort-change="handleSortChange" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" :selectable="checkRowSelectable" />
          <el-table-column type="expand" width="50">
            <template #default="scope"><TaskLogs :task="scope.row" /></template>
          </el-table-column>
          <el-table-column prop="id" label="ID" width="80" sortable="custom" />
          <el-table-column label="施工单号" width="150">
            <template #default="scope">
              <el-link v-if="scope.row.work_order_process_info?.work_order?.id" type="primary" @click="goToWorkOrderDetail(scope.row.work_order_process_info.work_order)">{{ scope.row.work_order_process_info.work_order.order_number || '-' }}</el-link>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="工序" width="120"><template #default="scope">{{ scope.row.work_order_process_info?.process?.name || '-' }}</template></el-table-column>
          <el-table-column prop="work_content" label="任务内容" min-width="200" show-overflow-tooltip />
          <el-table-column label="分派部门" width="120"><template #default="scope">{{ scope.row.assigned_department_name || '-' }}</template></el-table-column>
          <el-table-column label="分派操作员" width="120"><template #default="scope">{{ scope.row.assigned_operator_name || '-' }}</template></el-table-column>
          <el-table-column label="关联对象" width="150"><template #default="scope"><TaskRelatedInfo :task="scope.row" /></template></el-table-column>
          <el-table-column prop="production_quantity" label="生产数量" width="100" align="right" />
          <el-table-column prop="quantity_completed" label="完成数量" width="100" align="right" />
          <el-table-column label="进度" width="80" align="right"><template #default="scope">{{ taskService.calculateProgress(scope.row) }}%</template></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope"><StatusTag :status="scope.row.status" category="task" :label="scope.row.status_display" size="small" /></template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <TaskActions :task="scope.row" @complete="handleCompleteTask" @update="showUpdateDialog" @assign="showAssignDialog" @split="showSplitDialog" />
            </template>
          </el-table-column>
        </el-table>
        </div>

        <div v-if="shouldUseVirtualScroll" class="table-scroll">
        <VirtualTable ref="virtualTaskTable" v-loading="loading && tableData.length > 0" :data="tableData" :item-height="60" class="task-table" :row-key="getRowKey" @sort-change="handleSortChange">
          <el-table-column type="selection" width="55" :selectable="checkRowSelectable" />
          <el-table-column type="expand" width="50"><template #default="scope"><TaskLogs :task="scope.row" /></template></el-table-column>
          <el-table-column prop="id" label="ID" width="80" sortable="custom" />
          <el-table-column label="施工单号" width="150"><template #default="scope"><el-link type="primary">{{ scope.row.work_order_process_info?.work_order?.order_number || '-' }}</el-link></template></el-table-column>
          <el-table-column label="工序" width="120"><template #default="scope">{{ scope.row.work_order_process_info?.process?.name || '-' }}</template></el-table-column>
          <el-table-column prop="work_content" label="任务内容" min-width="200" />
          <el-table-column label="状态" width="100"><template #default="scope"><StatusTag :status="scope.row.status" category="task" :label="scope.row.status_display" size="small" /></template></el-table-column>
          <el-table-column label="操作" width="200" fixed="right"><template #default="scope"><TaskActions :task="scope.row" @complete="handleCompleteTask" @update="showUpdateDialog" @assign="showAssignDialog" /></template></el-table-column>
        </VirtualTable>
        </div>

        <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />
      </template>

      <el-empty v-if="!loading && tableData.length === 0" :description="hasFilters ? '未找到匹配的任务' : '暂无任务数据'" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="resetFilters">重置筛选</el-button>
      </el-empty>
    </el-card>

    <BatchActionBar v-if="selectedTasks.length > 0" :selected-count="selectedTasks.length" :loading="batchOperationLoading" :can-batch-assign="canBatchAssign" :can-batch-complete="canBatchComplete" :can-batch-delete="canBatchDelete" :can-batch-cancel="canBatchCancel" @batch-assign="handleBatchAssign" @batch-complete="handleBatchComplete" @batch-delete="handleBatchDelete" @batch-cancel="handleBatchCancel" @clear-selection="clearSelection" />

    <CompleteTaskDialog :visible="completeTaskDialogVisible" :task="currentTask" @confirm="handleConfirmCompleteTask" @update:visible="completeTaskDialogVisible = $event" />
    <UpdateTaskDialog :visible="updateDialogVisible" :task="currentTask" @confirm="handleUpdateTask" @update:visible="updateDialogVisible = $event" />
    <AssignTaskDialog :visible="assignDialogVisible" :task="currentTask" :department-list="departmentList" :user-list="userList" :loading-departments="loadingDepartments" :loading-users="loadingUsers" @confirm="handleAssignTask" @department-change="handleDepartmentChange" @update:visible="assignDialogVisible = $event" />
    <SplitTaskDialog :visible="splitDialogVisible" :task="currentSplitTask" :department-list="departmentList" :user-list="userList" :loading-departments="loadingDepartments" :loading-users="loadingUsers" @confirm="handleSplitTask" @update:visible="splitDialogVisible = $event" />
    <BatchAssignDialog :visible="batchAssignDialogVisible" :task-count="selectedTasks.length" :department-list="departmentList" @confirm="handleConfirmBatchAssign" @update:visible="batchAssignDialogVisible = $event" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, RefreshRight, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { workOrderTaskAPI, departmentAPI, authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import taskService from '@/services/TaskService'
import { PriorityChoices } from '@/constants'
import { StatusTag } from '@/components/common'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import VirtualTable from '@/components/VirtualTable.vue'
import TaskKanban from '@/components/TaskKanban.vue'
import TaskLogs from './components/TaskLogs.vue'
import TaskRelatedInfo from './components/TaskRelatedInfo.vue'
import TaskActions from './components/TaskActions.vue'
import CompleteTaskDialog from './components/CompleteTaskDialog.vue'
import UpdateTaskDialog from './components/UpdateTaskDialog.vue'
import AssignTaskDialog from './components/AssignTaskDialog.vue'
import SplitTaskDialog from './components/SplitTaskDialog.vue'
import BatchActionBar from './components/BatchActionBar.vue'
import BatchAssignDialog from './components/BatchAssignDialog.vue'

const router = useRouter()
const userStore = useUserStore()

const exporting = ref(false)
const viewMode = ref('table')
const shouldUseVirtualScroll = computed(() => total.value > 500)
const taskTable = ref(null)
const virtualTaskTable = ref(null)
const selectedTasks = ref([])
const batchOperationLoading = ref(false)

const {
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
} = useCrudList(workOrderTaskAPI, 'getList', {
  initialFilters: { search: '', status: '', task_type: '', work_order_process: '', assigned_department: '', priority: '' },
  errorContext: '加载任务失败'
})

const processList = ref([])
const departmentList = ref([])
const userList = ref([])
const loadingDepartments = ref(false)
const loadingUsers = ref(false)

const currentTask = ref(null)
const currentSplitTask = ref(null)
const completeTaskDialogVisible = ref(false)
const updateDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const splitDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)

const taskStatusOptions = [
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const priorityOptions = PriorityChoices
const hasFilters = computed(() => Object.values(filters).some(v => v))

const canExport = computed(() => userStore.hasPermission('workorder.view_workordertask'))
const canBatchAssign = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const canBatchComplete = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const canBatchDelete = computed(() => userStore.hasPermission('workorder.delete_workordertask'))
const canBatchCancel = computed(() => userStore.hasPermission('workorder.change_workordertask'))

const handleSortChange = ({ prop, order }) => { /* TODO */ }
const handleSelectionChange = (rows) => { selectedTasks.value = rows }
const clearSelection = () => { taskTable.value?.clearSelection() }

const loadDepartments = async () => {
  loadingDepartments.value = true
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error) {} finally { loadingDepartments.value = false }
}

const loadUsers = async (departmentId) => {
  loadingUsers.value = true
  try { const params = departmentId ? { department: departmentId, page_size: 1000 } : { page_size: 1000 }; const res = await authAPI.getUsers(params); userList.value = res?.results || [] } catch (error) {} finally { loadingUsers.value = false }
}

const handleDepartmentChange = (deptId) => { userList.value = []; if (deptId) loadUsers(deptId) }

const handleTaskClickFromKanban = (task) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }
const goToWorkOrderDetail = (workOrder) => { router.push(`/workorders/${workOrder.id}`) }
const getRowKey = (row) => row.id
const checkRowSelectable = () => true

const handleCompleteTask = (task) => { currentTask.value = task; completeTaskDialogVisible.value = true }
const showUpdateDialog = (task) => { currentTask.value = task; updateDialogVisible.value = true }
const showAssignDialog = (task) => { currentTask.value = task; assignDialogVisible.value = true }
const showSplitDialog = (task) => { currentSplitTask.value = task; splitDialogVisible.value = true }

const handleConfirmCompleteTask = async (data) => { try { await workOrderTaskAPI.complete(currentTask.value.id, data); ElMessage.success('任务已完成'); completeTaskDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '完成任务失败') } }
const handleUpdateTask = async (data) => { try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); ElMessage.success('更新成功'); updateDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '更新失败') } }
const handleAssignTask = async (data) => { try { await workOrderTaskAPI.assign(currentTask.value.id, data); ElMessage.success('分派成功'); assignDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '分派失败') } }
const handleSplitTask = async (data) => { try { await workOrderTaskAPI.split(currentTask.value.id, data); ElMessage.success('拆分成功'); splitDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '拆分失败') } }

const handleBatchAssign = () => { batchAssignDialogVisible.value = true }
const handleBatchComplete = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要完成 ${selectedTasks.value.length} 个任务？`)
    if (!confirmed) return
    const ids = selectedTasks.value.map(t => t.id)
    await workOrderTaskAPI.batchComplete(ids)
    ElMessage.success('批量完成成功')
    selectedTasks.value = []
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '批量完成失败') }
}
const handleBatchDelete = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除 ${selectedTasks.value.length} 个任务？`)
    if (!confirmed) return
    const ids = selectedTasks.value.map(t => t.id)
    await workOrderTaskAPI.batchDelete(ids)
    ElMessage.success('批量删除成功')
    selectedTasks.value = []
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '批量删除失败') }
}
const handleBatchCancel = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要取消 ${selectedTasks.value.length} 个任务？`)
    if (!confirmed) return
    const ids = selectedTasks.value.map(t => t.id)
    await workOrderTaskAPI.batchCancel(ids)
    ElMessage.success('批量取消成功')
    selectedTasks.value = []
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '批量取消失败') }
}
const handleConfirmBatchAssign = async (data) => { try { const ids = selectedTasks.value.map(t => t.id); await workOrderTaskAPI.batchAssign({ task_ids: ids, ...data }); ElMessage.success('批量分派成功'); batchAssignDialogVisible.value = false; selectedTasks.value = []; loadData() } catch (error) { ErrorHandler.showMessage(error, '批量分派失败') } }

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    Object.entries(filters.value).forEach(([k, v]) => { if (v) params[k] = v })
    const response = await workOrderTaskAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `任务列表_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) { ErrorHandler.showMessage(error, '导出失败') } finally { exporting.value = false }
}

onMounted(() => { loadData(); loadDepartments() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.filter-section {
  margin-bottom: var(--ui-section-gap);
}

.task-skeleton,
.table-scroll {
  margin-top: var(--ui-section-gap);
}

.table-scroll {
  overflow-x: auto;
}

.task-table {
  width: 100%;
}

.filter-actions,
.view-mode-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-control-gap);
}

.view-mode-bar {
  margin: var(--ui-section-gap) 0 var(--ui-control-gap);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .filter-actions,
  .view-mode-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
