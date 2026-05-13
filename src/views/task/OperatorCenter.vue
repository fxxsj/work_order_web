<template>
  <div class="operator-center">
    <el-row :gutter="20" class="summary-row">
      <el-col :span="6"><el-card class="summary-card"><div class="stat-value">{{ summary.my_total || 0 }}</div><div class="stat-label">我的任务</div></el-card></el-col>
      <el-col :span="6"><el-card class="summary-card pending"><div class="stat-value">{{ summary.my_pending || 0 }}</div><div class="stat-label">待开始</div></el-card></el-col>
      <el-col :span="6"><el-card class="summary-card progress"><div class="stat-value">{{ summary.my_in_progress || 0 }}</div><div class="stat-label">进行中</div></el-card></el-col>
      <el-col :span="6"><el-card class="summary-card claimable"><div class="stat-value">{{ summary.claimable_count || 0 }}</div><div class="stat-label">可认领</div></el-card></el-col>
    </el-row>

    <el-row :gutter="20" class="task-pools">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header"><span>我的任务</span><el-tag :type="getPoolType('my')">{{ summary.my_total || 0 }}</el-tag></div>
          </template>
          <el-tabs v-model="myTasksActiveTab">
            <el-tab-pane label="全部" name="all"><operator-task-list :tasks="myTasks" :empty-text="'暂无任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" /></el-tab-pane>
            <el-tab-pane label="待开始" name="pending"><operator-task-list :tasks="myTasksByStatus('pending')" :empty-text="'暂无待开始任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" /></el-tab-pane>
            <el-tab-pane label="进行中" name="in_progress"><operator-task-list :tasks="myTasksByStatus('in_progress')" :empty-text="'暂无进行中任务'" :show-update-buttons="true" @task-click="handleTaskClick" @update="showUpdateDialog" @complete="showCompleteDialog" /></el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header"><span>可认领任务</span><el-tag type="warning">{{ summary.claimable_count || 0 }}</el-tag></div>
          </template>
          <operator-task-list :tasks="claimableTasks" :empty-text="'暂无可认领任务'" :show-claim-button="true" @task-click="handleTaskClick" @claim="handleClaim" />
        </el-card>
      </el-col>
    </el-row>

    <update-task-dialog :visible="updateDialogVisible" :task="currentTask" @confirm="handleUpdateTask" @update:visible="updateDialogVisible = $event" />
    <complete-task-dialog :visible="completeDialogVisible" :task="currentTask" @confirm="handleCompleteTask" @update:visible="completeDialogVisible = $event" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { workOrderTaskAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import OperatorTaskList from './components/OperatorTaskList.vue'
import UpdateTaskDialog from './components/UpdateTaskDialog.vue'
import CompleteTaskDialog from './components/CompleteTaskDialog.vue'

const router = useRouter()
const userStore = useUserStore()

const summary = ref({})
const myTasks = ref([])
const claimableTasks = ref([])
const myTasksActiveTab = ref('all')

const updateDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentTask = ref(null)

const myTasksByStatus = (status) => myTasks.value.filter(t => t.status === status)

const getPoolType = (pool) => pool === 'my' ? 'primary' : 'info'

const loadData = async () => {
  try {
    const [summaryRes, myTasksRes, claimableRes] = await Promise.all([
      workOrderTaskAPI.getOperatorSummary(),
      workOrderTaskAPI.getMyTasks(),
      workOrderTaskAPI.getClaimableTasks()
    ])
    summary.value = summaryRes?.data || summaryRes || {}
    myTasks.value = myTasksRes?.results || []
    claimableTasks.value = claimableRes?.results || []
  } catch (error) { ErrorHandler.showMessage(error, '加载数据失败') }
}

const handleTaskClick = (task) => { router.push(`/workorders/${task.work_order_process_info?.work_order?.id}`) }

const showUpdateDialog = (task) => { currentTask.value = task; updateDialogVisible.value = true }
const showCompleteDialog = (task) => { currentTask.value = task; completeDialogVisible.value = true }

const handleUpdateTask = async (data) => {
  try { await workOrderTaskAPI.updateQuantity(currentTask.value.id, data); ElMessage.success('更新成功'); updateDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleCompleteTask = async (data) => {
  try { await workOrderTaskAPI.complete(currentTask.value.id, data); ElMessage.success('任务完成'); completeDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '完成任务失败') }
}

const handleClaim = async (task) => {
  try { await workOrderTaskAPI.claim(task.id); ElMessage.success('认领成功'); loadData() } catch (error) { ErrorHandler.showMessage(error, '认领失败') }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.operator-center { padding: 20px; }
.summary-row { margin-bottom: 20px; }
.summary-card { text-align: center; padding: 20px 0; }
.summary-card .stat-value { font-size: 32px; font-weight: bold; color: #303133; }
.summary-card .stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
.summary-card.pending .stat-value { color: #E6A23C; }
.summary-card.progress .stat-value { color: #409EFF; }
.summary-card.claimable .stat-value { color: #67C23A; }
.task-pools { margin-top: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
