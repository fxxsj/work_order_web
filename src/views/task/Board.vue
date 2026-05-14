<template>
  <div class="task-board">
    <task-stats :tasks="tableData" class="task-board-stats" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="selectedDepartment" class="board-filter-control" placeholder="选择部门" clearable filterable @change="handleDepartmentChange">
            <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
          <el-select v-model="selectedStatus" class="board-filter-control" placeholder="任务状态" clearable @change="handleStatusChange">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-input v-model="searchText" class="board-search-control" placeholder="搜索任务内容、施工单号" clearable @input="handleSearchDebounced" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button :type="showListView ? 'default' : 'primary'" :icon="Menu" @click="toggleView">{{ showListView ? '看板视图' : '列表视图' }}</el-button>
        </div>
      </div>

      <task-board-view v-if="!showListView && tableData.length > 0" :tasks-by-status="tasksByStatus" :editable="canEdit" :loading="loading" @task-click="handleTaskClick" @task-update="handleTaskUpdate" @task-assign="handleTaskAssign" @task-complete="handleTaskComplete" />

      <task-list-view v-if="showListView && tableData.length > 0" :tasks="tableData" @task-click="handleTaskClick" />

      <el-empty v-if="!loading && tableData.length === 0" :description="hasFilters ? '未找到匹配的任务' : '暂无任务'" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
      </el-empty>
    </el-card>

    <board-update-dialog :visible="updateDialogVisible" :task="currentTask" :loading="updating" @confirm="handleConfirmUpdate" @update:visible="updateDialogVisible = $event" />
    <board-assign-dialog :visible="assignDialogVisible" :task="currentTask" :users="userList" :loading="assigning" @confirm="handleConfirmAssign" @update:visible="assignDialogVisible = $event" />
    <board-complete-dialog :visible="completeDialogVisible" :task="currentTask" :loading="completing" @confirm="handleConfirmComplete" @update:visible="completeDialogVisible = $event" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(100)
const departmentList = ref([])
const userList = ref([])
const selectedDepartment = ref(null)
const selectedStatus = ref('')
const searchText = ref('')
const showListView = ref(false)

const updateDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentTask = ref(null)
const updating = ref(false)
const assigning = ref(false)
const completing = ref(false)

const canEdit = computed(() => userStore.hasPermission('workorder.change_workordertask'))
const hasFilters = computed(() => selectedDepartment.value || selectedStatus.value || searchText.value)

const tasksByStatus = computed(() => {
  const grouped = { pending: [], in_progress: [], completed: [] }
  tableData.value.forEach(task => { if (grouped[task.status]) grouped[task.status].push(task) })
  return grouped
})

let searchTimer = null
const handleSearchDebounced = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { handleSearch() }, 300) }
const handleSearch = () => { currentPage.value = 1; loadData() }
const handleDepartmentChange = (deptId) => { currentPage.value = 1; loadData(); if (deptId) loadUsers(deptId) }
const handleStatusChange = () => { currentPage.value = 1; loadData() }
const handleReset = () => { selectedDepartment.value = null; selectedStatus.value = ''; searchText.value = ''; currentPage.value = 1; loadData() }
const toggleView = () => { showListView.value = !showListView.value }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value, ordering: '-created_at' }
    if (selectedDepartment.value) params.assigned_department = selectedDepartment.value
    if (selectedStatus.value) params.status = selectedStatus.value
    if (searchText.value) params.search = searchText.value
    const response = await workOrderTaskAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const loadDepartments = async () => {
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error) { ErrorHandler.showMessage(error, '加载部门列表') }
}

const loadUsers = async (departmentId) => {
  try { const res = await authAPI.getUsersByDepartment(departmentId); userList.value = res?.data || res || [] } catch (error) { ErrorHandler.showMessage(error, '加载用户列表') }
}

const handleTaskClick = (task) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }
const handleTaskUpdate = (task) => { currentTask.value = task; updateDialogVisible.value = true }
const handleTaskAssign = (task) => { currentTask.value = task; assignDialogVisible.value = true }
const handleTaskComplete = (task) => { currentTask.value = task; completeDialogVisible.value = true }

const handleConfirmUpdate = async (data) => {
  updating.value = true
  try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); ElMessage.success('更新成功'); updateDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '更新失败') } finally { updating.value = false }
}

const handleConfirmAssign = async (data) => {
  assigning.value = true
  try { await workOrderTaskAPI.assign(currentTask.value.id, data); ElMessage.success('分派成功'); assignDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '分派失败') } finally { assigning.value = false }
}

const handleConfirmComplete = async (data) => {
  completing.value = true
  try { await workOrderTaskAPI.complete(currentTask.value.id, data); ElMessage.success('完成任务'); completeDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '完成任务失败') } finally { completing.value = false }
}

onMounted(() => { loadDepartments(); loadData() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.task-board {
  padding: var(--ui-page-padding);
}

.task-board-stats {
  margin-bottom: var(--ui-section-gap);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.filter-group,
.action-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.board-filter-control {
  width: min(100%, 180px);
}

.board-search-control {
  width: min(100%, 320px);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .board-filter-control,
  .board-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
