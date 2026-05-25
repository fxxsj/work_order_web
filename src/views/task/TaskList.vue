<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="filters.search"
          placeholder="搜索任务内容、施工单号"
          class="w-full sm:w-64"
          @input="handleSearchDebounced"
          @clear="handleSearchDebounced"
          @search="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="taskStatusOptions"
          placeholder="任务状态"
          clearable
          class="w-full sm:w-36"
          @change="handleSearchDebounced"
        />
        <Select
          v-model="filters.assigned_department"
          :options="departmentOptions"
          placeholder="分派部门"
          clearable
          filterable
          class="w-full sm:w-36"
          @change="handleSearchDebounced"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          placeholder="优先级"
          clearable
          class="w-full sm:w-36"
          @change="handleSearchDebounced"
        />
        <button
          class="btn btn-secondary"
          title="重置"
          @click="resetFilters"
        >
          <Icon
            name="rotateCcw"
            size="md"
            class="mr-1"
          />重置
        </button>
      </FilterRow>
    </template>
    <template #actions>
      <div class="flex justify-end gap-3 items-center w-full">
        <RadioGroup
          v-model="viewMode"
          size="small"
        >
          <RadioButton
            value="table"
            label="列表视图"
          />
          <RadioButton
            value="kanban"
            label="看板视图"
          />
        </RadioGroup>
        <button
          class="btn btn-secondary"
          title="刷新"
          :disabled="loading"
          @click="loadData"
        >
          <Icon
            name="refresh"
            size="md"
            :class="loading ? 'animate-spin' : ''"
          />
        </button>
        <button
          v-if="canExport"
          class="btn btn-success"
          :disabled="exporting"
          @click="handleExport"
        >
          <Icon
            name="download"
            size="md"
            :class="exporting ? 'animate-spin' : ''"
            class="mr-1"
          />导出
        </button>
      </div>
    </template>

    <template #table>
      <SkeletonLoader
        v-if="loading && tableData.length === 0"
        type="table"
        :rows="5"
      />

      <TaskKanban
        v-if="viewMode === 'kanban'"
        :tasks="tableData"
        @task-click="handleTaskClickFromKanban"
      />

      <template v-if="viewMode === 'table'">
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          row-key="id"
        >
          <template #cell-selection="{ row }">
            <input
              type="checkbox"
              :checked="isSelected(row)"
              @change="toggleSelect(row)"
            >
          </template>
          <template #cell-expand="{ row }">
            <button
              class="btn btn-ghost btn-xs"
              @click="toggleExpand(row)"
            >
              {{ expandedRows.has(row.id) ? '−' : '+' }}
            </button>
          </template>
          <template #cell-id="{ row }">
            <span>{{ row.id }}</span>
          </template>
          <template #cell-source="{ row }">
            <template v-if="row.work_order_process_info?.work_order">
              <span>{{ getSourceText(row) }}</span>
            </template>
            <span v-else>-</span>
          </template>
          <template #cell-process_name="{ row }">
            <span>{{ row.work_order_process_info?.process?.name || '-' }}</span>
          </template>
          <template #cell-work_content="{ row }">
            <span class="truncate max-w-xs">{{ row.work_content }}</span>
          </template>
          <template #cell-assigned_department_name="{ row }">
            <span>{{ row.assigned_department_name || '-' }}</span>
          </template>
          <template #cell-assigned_operator_name="{ row }">
            <span>{{ row.assigned_operator_name || '-' }}</span>
          </template>
          <template #cell-related_info="{ row }">
            <TaskRelatedInfo :task="row" />
          </template>
          <template #cell-quantity="{ row }">
            <span class="text-right">{{ getQuantityText(row) }}</span>
          </template>
          <template #cell-progress="{ row }">
            <ProgressBar :percentage="taskService.calculateProgress(row)" />
          </template>
          <template #cell-delivery_date="{ row }">
            <span>{{ getDeliveryDateDisplay(row) }}</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="task"
              :label="row.status_display"
              size="small"
            />
          </template>
          <template #cell-followup="{ row }">
            <span>{{ getFollowUpText(row) }}</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              size="sm"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState
              :description="hasFilters ? '未找到匹配的任务' : '暂无任务数据'"
              :action-text="hasFilters ? '重置筛选' : undefined"
              @action="resetFilters"
            />
          </template>
        </DataTable>

        <!-- Expanded row content -->
        <template
          v-for="row in tableData"
          :key="'expand-' + row.id"
        >
          <div
            v-if="expandedRows.has(row.id)"
            class="px-3 py-3 bg-gray-50 dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700"
          >
            <TaskLogs :task="row" />
          </div>
        </template>
      </template>
    </template>

    <template #pagination>
      <Pagination
        v-if="viewMode === 'table' && total > 0"
        :page="currentPage"
        :page-size="pageSize"
        :total="total"
        @update:page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </template>
  </TablePageLayout>

  <BatchActionBar
    v-if="selectedTasks.length > 0"
    :selected-count="selectedTasks.length"
    :loading="batchOperationLoading"
    :can-batch-assign="canBatchAssign"
    :can-batch-complete="canBatchComplete"
    :can-batch-delete="canBatchDelete"
    :can-batch-cancel="canBatchCancel"
    @batch-assign="handleBatchAssign"
    @batch-complete="handleBatchComplete"
    @batch-delete="handleBatchDelete"
    @batch-cancel="handleBatchCancel"
    @clear-selection="clearSelection"
  />

  <ConfirmDialog
    :show="confirmDialogVisible"
    :title="confirmDialogTitle"
    :message="confirmDialogMessage"
    confirm-text="确定"
    cancel-text="取消"
    :danger="confirmDialogAction === 'delete' || confirmDialogAction === 'cancel'"
    :loading="batchOperationLoading"
    loading-text="处理中..."
    @confirm="handleConfirmDialog"
    @cancel="confirmDialogVisible = false"
  />

  <CompleteTaskDialog
    :visible="completeTaskDialogVisible"
    :task="currentTask"
    @confirm="handleConfirmCompleteTask"
    @update:visible="completeTaskDialogVisible = $event"
  />
  <UpdateTaskDialog
    :visible="updateDialogVisible"
    :task="currentTask"
    @confirm="handleUpdateTask"
    @update:visible="updateDialogVisible = $event"
  />
  <AssignTaskDialog
    :visible="assignDialogVisible"
    :task="currentTask"
    :department-list="departmentList"
    :user-list="userList"
    :loading-departments="loadingDepartments"
    :loading-users="loadingUsers"
    @confirm="handleAssignTask"
    @department-change="handleDepartmentChange"
    @update:visible="assignDialogVisible = $event"
  />
  <SplitTaskDialog
    :visible="splitDialogVisible"
    :task="currentSplitTask"
    :department-list="departmentList"
    :user-list="userList"
    :loading-departments="loadingDepartments"
    :loading-users="loadingUsers"
    @confirm="handleSplitTask"
    @update:visible="splitDialogVisible = $event"
  />
  <BatchAssignDialog
    :visible="batchAssignDialogVisible"
    :task-count="selectedTasks.length"
    :department-list="departmentList"
    @confirm="handleConfirmBatchAssign"
    @update:visible="batchAssignDialogVisible = $event"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { workOrderTaskAPI, departmentAPI, authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import taskService from '@/services/TaskService'
import { PriorityChoices } from '@/constants'
import { StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, RadioGroup, RadioButton, TablePageLayout, DataTable, ConfirmDialog, RowActions, Tag, ProgressBar, FilterRow } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import TaskKanban from '@/components/TaskKanban.vue'
import {
  TaskLogs,
  TaskRelatedInfo,
  CompleteTaskDialog,
  UpdateTaskDialog,
  AssignTaskDialog,
  SplitTaskDialog,
  BatchActionBar,
  BatchAssignDialog,
} from '@/components/task'

const router = useRouter()
const userStore = useUserStore()

const exporting = ref(false)
const viewMode = ref('table')
const selectedTasks = ref<any[]>([])
const expandedRows = ref(new Set())
const batchOperationLoading = ref(false)

const allSelected = computed(() => tableData.value.length > 0 && tableData.value.every((row: any) => selectedTasks.value.some((t: any) => t.id === row.id)))
const isSelected = (row: any) => selectedTasks.value.some((t: any) => t.id === row.id)
const toggleSelect = (row: any) => {
  const idx = selectedTasks.value.findIndex(t => t.id === row.id)
  if (idx >= 0) selectedTasks.value.splice(idx, 1)
  else selectedTasks.value.push(row)
}
const toggleSelectAll = () => {
  if (allSelected.value) selectedTasks.value = []
  else selectedTasks.value = [...tableData.value]
}
const toggleExpand = (row: any) => {
  if (expandedRows.value.has(row.id)) expandedRows.value.delete(row.id)
  else expandedRows.value.add(row.id)
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
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(workOrderTaskAPI, 'getList', {
  initialFilters: { search: '', status: '', task_type: '', work_order_process: '', assigned_department: '', priority: '' },
  errorContext: '加载任务失败'
})

const columns: Column[] = [
  { key: 'selection', label: '', width: 48, align: 'center' },
  { key: 'expand', label: '', width: 56 },
  { key: 'id', label: 'ID', width: 80 },
  { key: 'source', label: '来源', width: 160 },
  { key: 'process_name', label: '工序', width: 112 },
  { key: 'work_content', label: '任务内容', minWidth: 192 },
  { key: 'assigned_department_name', label: '分派部门', width: 112 },
  { key: 'assigned_operator_name', label: '分派操作员', width: 112 },
  { key: 'related_info', label: '关联对象', width: 144 },
  { key: 'quantity', label: '数量', width: 96, align: 'right' },
  { key: 'progress', label: '进度', width: 80, align: 'right' },
  { key: 'delivery_date', label: '交期', width: 120 },
  { key: 'status', label: '状态', width: 96 },
  { key: 'followup', label: '待办', width: 120 },
  { key: 'actions', label: '操作', width: 200, fixed: 'right' }
]

const processList = ref<any[]>([])
const departmentList = ref<any[]>([])
const userList = ref<any[]>([])
const loadingDepartments = ref(false)
const loadingUsers = ref(false)

const currentTask = ref<any>(null)
const currentSplitTask = ref<any>(null)
const completeTaskDialogVisible = ref(false)
const updateDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const splitDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)

const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogAction = ref('')

const taskStatusOptions = [
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const priorityOptions = PriorityChoices
const departmentOptions = computed(() => departmentList.value.map((d: any) => ({ value: d.id, label: d.name })))
const hasFilters = computed(() => Object.values(filters.value).some((v: any) => v))

const canExport = computed(() => userStore.hasPermission('workorder.view_workordertask'))
const canBatchAssign = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const canBatchComplete = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const canBatchDelete = computed(() => userStore.hasPermission('workorder.delete_workordertask'))
const canBatchCancel = computed(() => userStore.hasPermission('workorder.change_workordertask'))

const getRowActions = (row: any): RowAction[] => [
  { key: 'view_order', label: '查看施工单', icon: 'document', tone: 'default', visible: !!row.work_order_process_info?.work_order?.id },
  { key: 'complete', label: '完成', icon: 'check', tone: 'success', visible: row.status !== 'completed' },
  { key: 'update', label: '更新', icon: 'edit', tone: 'primary', visible: row.status !== 'completed' && !row.auto_calculate_quantity },
  { key: 'assign', label: '分派', icon: 'user', tone: 'warning' },
  { key: 'split', label: '拆分', icon: 'copy', tone: 'default', visible: row.status !== 'completed' && !row.is_subtask && !row.subtasks_count }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view_order': handleViewOrder(row); break
    case 'complete': handleCompleteTask(row); break
    case 'update': showUpdateDialog(row); break
    case 'assign': showAssignDialog(row); break
    case 'split': showSplitDialog(row); break
  }
}

const handleSortChange = (payload: any) => { const { prop, order } = payload; /* TODO */ }
const clearSelection = () => { selectedTasks.value = [] }

const loadDepartments = async () => {
  loadingDepartments.value = true
  try { 
    const res: any = await departmentAPI.getList({ page_size: 100 })
    departmentList.value = Array.isArray(res) ? res : (res?.results || res?.data || [])
  } catch (error: any) {} finally { loadingDepartments.value = false }
}

const loadUsers = async (departmentId: any) => {
  loadingUsers.value = true
  try { 
    const params = departmentId ? { department: departmentId, page_size: 100 } : { page_size: 100 }
    const res: any = await authAPI.getUsers(params)
    userList.value = Array.isArray(res) ? res : (res?.results || res?.data || [])
  } catch (error: any) {} finally { loadingUsers.value = false }
}

const handleDepartmentChange = (deptId: any) => { userList.value = []; if (deptId) loadUsers(deptId) }

const handleTaskClickFromKanban = (task: any) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }
const goToWorkOrderDetail = (workOrder: any) => { router.push(`/workorders/${workOrder.id}`) }
const handleViewOrder = (row: any) => { router.push(`/workorders/${row.work_order_process_info?.work_order?.id}`) }
const getSourceText = (row: any): string => {
  const customerName = row.work_order_process_info?.work_order?.customer_name?.trim() || ''
  const orderNumber = row.work_order_process_info?.work_order?.order_number?.trim() || ''
  if (customerName && orderNumber) return `${customerName} · ${orderNumber}`
  if (customerName) return customerName
  if (orderNumber) return orderNumber
  return '-'
}
const getQuantityText = (row: any): string => {
  const total = row.production_quantity
  const completed = row.quantity_completed
  if (total == null && completed == null) return '-'
  const totalText = total == null ? '-' : String(total)
  const completedText = completed == null ? '-' : String(completed)
  return `${completedText} / ${totalText}`
}
const getDeliveryDateDisplay = (row: any): string => {
  const deliveryDateStr = row.delivery_date || row.work_order_process_info?.work_order?.delivery_date
  if (!deliveryDateStr) return '-'
  return deliveryDateStr.split('T')[0]
}
const getFollowUpText = (row: any): string => {
  const status = row.status || ''
  const hasOperator = (row.assigned_operator_name || '').trim().length > 0
  switch (status) {
    case 'pending': return hasOperator ? '待开工生产' : '待分派/开工'
    case 'in_progress': return '跟进生产进度'
    case 'completed': return '推进质检/入库'
    case 'cancelled': return '任务已取消'
    default: return '-'
  }
}
const getRowKey = (row: any) => row.id
const checkRowSelectable = () => true

const handleCompleteTask = (task: any) => { currentTask.value = task; completeTaskDialogVisible.value = true }
const showUpdateDialog = (task: any) => { currentTask.value = task; updateDialogVisible.value = true }
const showAssignDialog = (task: any) => { currentTask.value = task; assignDialogVisible.value = true }
const showSplitDialog = (task: any) => { currentSplitTask.value = task; splitDialogVisible.value = true }

const handleConfirmCompleteTask = async (data: any) => { try { await workOrderTaskAPI.complete(currentTask.value.id, data); useUIStore().showSuccess('任务已完成'); completeTaskDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '完成任务失败') } }
const handleUpdateTask = async (data: any) => { try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); useUIStore().showSuccess('更新成功'); updateDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') } }
const handleAssignTask = async (data: any) => { try { await workOrderTaskAPI.assign(currentTask.value.id, data); useUIStore().showSuccess('分派成功'); assignDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '分派失败') } }
const handleSplitTask = async (data: any) => { try { await workOrderTaskAPI.split(currentTask.value.id, data); useUIStore().showSuccess('拆分成功'); splitDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '拆分失败') } }

const handleBatchAssign = () => { batchAssignDialogVisible.value = true }

const handleBatchComplete = () => {
  confirmDialogTitle.value = '批量完成'
  confirmDialogMessage.value = `确定要完成 ${selectedTasks.value.length} 个任务？`
  confirmDialogAction.value = 'complete'
  confirmDialogVisible.value = true
}

const handleBatchDelete = () => {
  confirmDialogTitle.value = '批量删除'
  confirmDialogMessage.value = `确定要删除 ${selectedTasks.value.length} 个任务？`
  confirmDialogAction.value = 'delete'
  confirmDialogVisible.value = true
}

const handleBatchCancel = () => {
  confirmDialogTitle.value = '批量取消'
  confirmDialogMessage.value = `确定要取消 ${selectedTasks.value.length} 个任务？`
  confirmDialogAction.value = 'cancel'
  confirmDialogVisible.value = true
}

const handleConfirmDialog = async () => {
  const action = confirmDialogAction.value
  const ids = selectedTasks.value.map((t: any) => t.id)
  confirmDialogVisible.value = false

  try {
    batchOperationLoading.value = true
    if (action === 'complete') {
      await workOrderTaskAPI.batchComplete({ task_ids: ids })
      useUIStore().showSuccess('批量完成成功')
    } else if (action === 'delete') {
      await workOrderTaskAPI.batchDeleteTasks({ task_ids: ids })
      useUIStore().showSuccess('批量删除成功')
    } else if (action === 'cancel') {
      await workOrderTaskAPI.batchCancel({ task_ids: ids })
      useUIStore().showSuccess('批量取消成功')
    }
    selectedTasks.value = []
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, `批量操作失败`)
  } finally {
    batchOperationLoading.value = false
  }
}

const handleConfirmBatchAssign = async (data: any) => { try { const ids = selectedTasks.value.map((t: any) => t.id); await workOrderTaskAPI.batchAssign({ task_ids: ids, ...data }); useUIStore().showSuccess('批量分派成功'); batchAssignDialogVisible.value = false; selectedTasks.value = []; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '批量分派失败') } }

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    Object.entries(params).forEach(([k, v]: [string, any]) => { if (v) (params as any)[k] = v })
    const response: any = await workOrderTaskAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `任务列表_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    useUIStore().showSuccess('导出成功')
  } catch (error: any) { ErrorHandler.showMessage(error, '导出失败') } finally { exporting.value = false }
}

onMounted(() => { loadData(); loadDepartments() })
</script>
