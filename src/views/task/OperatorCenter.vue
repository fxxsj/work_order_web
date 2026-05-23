<template>
  <div class="operator-center">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5">
      <div class="card summary-card"><div class="stat-value">{{ (summary as any).my_total || 0 }}</div><div class="stat-label">我的任务</div></div>
      <div class="card summary-card pending"><div class="stat-value">{{ (summary as any).my_pending || 0 }}</div><div class="stat-label">待开始</div></div>
      <div class="card summary-card progress"><div class="stat-value">{{ (summary as any).my_in_progress || 0 }}</div><div class="stat-label">进行中</div></div>
      <div class="card summary-card claimable"><div class="stat-value">{{ (summary as any).claimable_count || 0 }}</div><div class="stat-label">可认领</div></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between"><span>我的任务</span><Tag :type="getPoolType('my')">{{ (summary as any).my_total || 0 }}</Tag></div>
        </div>
        <div class="card-body">
        <div class="tabs-container">
          <div class="tabs-header flex border-b border-gray-200 dark:border-dark-700">
            <button type="button" class="tab-button px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none" :class="myTasksActiveTab === 'all' ? 'text-primary-600 border-b-2 border-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'" @click="myTasksActiveTab = 'all'">全部</button>
            <button type="button" class="tab-button px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none" :class="myTasksActiveTab === 'pending' ? 'text-primary-600 border-b-2 border-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'" @click="myTasksActiveTab = 'pending'">待开始</button>
            <button type="button" class="tab-button px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none" :class="myTasksActiveTab === 'in_progress' ? 'text-primary-600 border-b-2 border-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'" @click="myTasksActiveTab = 'in_progress'">进行中</button>
          </div>
          <div class="tabs-content mt-4">
            <operator-task-list v-show="myTasksActiveTab === 'all'" :tasks="myTasks" :empty-text="'暂无任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" />
            <operator-task-list v-show="myTasksActiveTab === 'pending'" :tasks="myTasksByStatus('pending')" :empty-text="'暂无待开始任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" />
            <operator-task-list v-show="myTasksActiveTab === 'in_progress'" :tasks="myTasksByStatus('in_progress')" :empty-text="'暂无进行中任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" />
          </div>
        </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between"><span>可认领任务</span><Tag type="warning">{{ (summary as any).claimable_count || 0 }}</Tag></div>
        </div>
        <div class="card-body">
        <operator-task-list :tasks="claimableTasks" :empty-text="'暂无可认领任务'" :show-claim-button="true" @task-click="handleTaskClick" @claim="handleClaim" />
        </div>
      </div>
    </div>

    <update-task-dialog :visible="updateDialogVisible" :task="currentTask" @confirm="handleUpdateTask" @update:visible="updateDialogVisible = $event" />
    <complete-task-dialog :visible="completeDialogVisible" :task="currentTask" @confirm="handleCompleteTask" @update:visible="completeDialogVisible = $event" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { workOrderTaskAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import OperatorTaskList from './components/OperatorTaskList.vue'
import UpdateTaskDialog from './components/UpdateTaskDialog.vue'
import CompleteTaskDialog from './components/CompleteTaskDialog.vue'

const router = useRouter()
const userStore = useUserStore()

const summary = ref({})
const myTasks = ref<any[]>([])
const claimableTasks = ref<any[]>([])
const myTasksActiveTab = ref('all')

const updateDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentTask = ref<any>(null)

const myTasksByStatus = (status: any) => myTasks.value.filter((t: any) => t.status === status)

const getPoolType = (pool: any) => pool === 'my' ? 'primary' : 'info'

const loadData = async () => {
  try {
    const [summaryRes, myTasksRes, claimableRes] = await Promise.all([
      workOrderTaskAPI.getOperatorSummary(),
      workOrderTaskAPI.getMyTasks(),
      workOrderTaskAPI.getClaimableTasks()
    ])
    summary.value = summaryRes?.data || summaryRes || {}
    myTasks.value = (myTasksRes as any)?.results || []
    claimableTasks.value = (claimableRes as any)?.results || []
  } catch (error: any) { ErrorHandler.showMessage(error, '加载数据失败') }
}

const handleTaskClick = (task: any) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }

const showUpdateDialog = (task: any) => { currentTask.value = task; updateDialogVisible.value = true }
const showCompleteDialog = (task: any) => { currentTask.value = task; completeDialogVisible.value = true }

const handleUpdateTask = async (data: any) => {
  try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); ElMessage.success('更新成功'); updateDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleCompleteTask = async (data: any) => {
  try { await workOrderTaskAPI.complete(currentTask.value.id, data); ElMessage.success('任务完成'); completeDialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, '完成任务失败') }
}

const handleClaim = async (task: any) => {
  try { await workOrderTaskAPI.claim(task.id); ElMessage.success('认领成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '认领失败') }
}

onMounted(() => { loadData() })
</script>

<style lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.operator-center { padding: var(--ui-page-padding); }
.summary-row { row-gap: var(--ui-section-gap); margin-bottom: var(--ui-section-gap); }
.summary-card { text-align: center; padding: 20px 0; }
.summary-card .stat-value { font-size: 32px; font-weight: bold; color: #303133; }
.summary-card .stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
.summary-card.pending .stat-value { color: #E6A23C; }
.summary-card.progress .stat-value { color: #409EFF; }
.summary-card.claimable .stat-value { color: #67C23A; }
.task-pools { row-gap: var(--ui-section-gap); margin-top: var(--ui-section-gap); }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
