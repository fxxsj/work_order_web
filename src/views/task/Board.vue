<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>

    <template v-else>
      <task-stats :tasks="tableData" class="mb-6" />

      <div class="card">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select v-model="selectedDepartment" :options="departmentOptions" class="w-full sm:w-44" placeholder="选择部门" clearable filterable @change="handleDepartmentChange" />
            <Select v-model="selectedStatus" :options="statusOptions" class="w-full sm:w-36" placeholder="任务状态" clearable @change="handleStatusChange" />
            <SearchInput v-model="searchText" placeholder="搜索任务内容、施工单号" @input="handleSearchDebounced" @clear="handleSearch" @search="handleSearch" />
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button class="btn btn-secondary btn-sm" :disabled="loading" @click="loadData"><Icon name="refresh" class="h-4 w-4" /> 刷新</button>
            <button class="btn btn-sm" :class="showListView ? 'btn-secondary' : 'btn-primary'" @click="toggleView"><Icon name="menu" class="h-4 w-4" /> {{ showListView ? '看板视图' : '列表视图' }}</button>
          </div>
        </div>

        <task-board-view v-if="!showListView && tableData.length > 0" :tasks-by-status="tasksByStatus" :editable="canEdit" :loading="loading" @task-click="handleTaskClick" @task-update="handleTaskUpdate" @task-assign="handleTaskAssign" @task-complete="handleTaskComplete" />

        <task-list-view v-if="showListView && tableData.length > 0" :tasks="tableData" @task-click="handleTaskClick" />

        <EmptyState v-if="!loading && tableData.length === 0" :title="hasFilters ? '未找到匹配的任务' : '暂无任务'" :action-text="hasFilters ? '重置筛选' : undefined" @action="handleReset" />
      </div>
    </template>

    <board-update-dialog :visible="updateDialogVisible" :task="currentTask" :loading="updating" @confirm="handleConfirmUpdate" @update:visible="updateDialogVisible = $event" />
    <board-assign-dialog :visible="assignDialogVisible" :task="currentTask" :users="userList" :loading="assigning" @confirm="handleConfirmAssign" @update:visible="assignDialogVisible = $event" />
    <board-complete-dialog :visible="completeDialogVisible" :task="currentTask" :loading="completing" @confirm="handleConfirmComplete" @update:visible="completeDialogVisible = $event" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon, SearchInput, Select, LoadingSpinner, EmptyState } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { departmentAPI, authAPI, workOrderTaskAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import TaskStats from './components/TaskStats.vue'
import TaskBoardView from './components/TaskBoardView.vue'
import TaskListView from './components/TaskListView.vue'
import BoardUpdateDialog from './components/BoardUpdateDialog.vue'
import BoardAssignDialog from './components/BoardAssignDialog.vue'
import BoardCompleteDialog from './components/BoardCompleteDialog.vue'

const router = useRouter()
const userStore = useUserStore()

const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(100)
const departmentList = ref<any[]>([])
const userList = ref<any[]>([])
const selectedDepartment = ref(null)
const selectedStatus = ref('')
const searchText = ref('')
const showListView = ref(false)

const updateDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentTask = ref<any>(null)
const updating = ref(false)
const assigning = ref(false)
const completing = ref(false)

const canEdit = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const hasFilters = computed(() => selectedDepartment.value || selectedStatus.value || searchText.value)

const departmentOptions = computed(() => departmentList.value.map((d: any) => ({ value: d.id, label: d.name })))
const statusOptions = [
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' }
]

const tasksByStatus = computed(() => {
  const grouped = { pending: [], in_progress: [], completed: [] }
  tableData.value.forEach((task: any) => { if ((grouped as any)[task.status]) (grouped as any)[task.status].push(task) })
  return grouped
})

let searchTimer: any = null
const handleSearchDebounced = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { handleSearch() }, 300) }
const handleSearch = () => { currentPage.value = 1; loadData() }
const handleDepartmentChange = (deptId: any) => { currentPage.value = 1; loadData(); if (deptId) loadUsers(deptId) }
const handleStatusChange = () => { currentPage.value = 1; loadData() }
const handleReset = () => { selectedDepartment.value = null; selectedStatus.value = ''; searchText.value = ''; currentPage.value = 1; loadData() }
const toggleView = () => { showListView.value = !showListView.value }

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: currentPage.value, page_size: pageSize.value, ordering: '-created_at' }
    if (selectedDepartment.value) params.assigned_department = selectedDepartment.value
    if (selectedStatus.value) params.status = selectedStatus.value
    if (searchText.value) params.search = searchText.value
    const response: any = await workOrderTaskAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error: any) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const loadDepartments = async () => {
  try { const res: any = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载部门列表') }
}

const loadUsers = async (departmentId: any) => {
  try { const res: any = await authAPI.getUsersByDepartment(departmentId); userList.value = res?.data || res || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载用户列表') }
}

const handleTaskClick = (task: any) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }
const handleTaskUpdate = (task: any) => { currentTask.value = task; updateDialogVisible.value = true }
const handleTaskAssign = (task: any) => { currentTask.value = task; assignDialogVisible.value = true }
const handleTaskComplete = (task: any) => { currentTask.value = task; completeDialogVisible.value = true }

const handleConfirmUpdate = async (data: any) => {
  updating.value = true
  try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); ElMessage.success('更新成功'); updateDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') } finally { updating.value = false }
}

const handleConfirmAssign = async (data: any) => {
  assigning.value = true
  try { await workOrderTaskAPI.assign(currentTask.value.id, data); ElMessage.success('分派成功'); assignDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '分派失败') } finally { assigning.value = false }
}

const handleConfirmComplete = async (data: any) => {
  completing.value = true
  try { await workOrderTaskAPI.complete(currentTask.value.id, data); ElMessage.success('完成任务'); completeDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '完成任务失败') } finally { completing.value = false }
}

onMounted(() => { loadDepartments(); loadData() })
</script>
