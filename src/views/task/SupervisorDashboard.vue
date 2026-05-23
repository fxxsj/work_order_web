<template>
  <div class="supervisor-dashboard">
    <div v-loading="loading" class="card">
      <div class="card-header">
        <div class="header-section">
          <div class="header-title"><Icon name="chartBar" /><span>主管看板</span></div>
          <div class="header-actions">
            <select v-if="departmentList.length > 1" v-model="selectedDepartment" class="select" placeholder="选择部门" @change="handleDepartmentChange">
              <option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id">{{ dept.name }}</option>
            </select>
            <Tag v-else-if="departmentList.length === 1" type="info">{{ departmentList[0].name }}</Tag>
            <div class="inline-flex overflow-hidden rounded-xl border border-gray-200 dark:border-dark-600">
              <button class="btn btn-secondary" @click="viewMode = 'dashboard'"><Icon name="chartBar" class="h-4 w-4" /> 统计视图</button>
              <button class="btn btn-secondary" @click="viewMode = 'dragdrop'"><Icon name="arrowsUpDown" class="h-4 w-4" /> 拖拽分派</button>
            </div>
            <button class="btn" @click="loadWorkloadData"><Icon name="refresh" class="h-4 w-4" /> 刷新</button>
          </div>
        </div>
      </div>
      <div class="card-body">

      <Alert v-if="!isSupervisor" title="权限不足" type="error" description="您没有权限访问主管看板，需要具有施工单修改权限。" :closable="false" show-icon style="margin-bottom: 20px;" />

      <div v-else-if="viewMode === 'dragdrop'">
        <task-drag-drop-list v-if="!loading && departmentTasks.length > 0" :tasks="departmentTasks" :operators="operators" @task-assigned="handleTaskAssigned" @task-reassigned="handleTaskReassigned" @task-unassigned="handleTaskUnassigned" />
        <EmptyState v-else-if="!loading && departmentTasks.length === 0" title="暂无任务数据" />
      </div>

      <div v-else-if="viewMode === 'dashboard' && workloadData">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><Icon name="user" size="lg" /></div><div class="stat-info"><div class="stat-value">{{ workloadData.total_operators || 0 }}</div><div class="stat-label">操作员数</div></div></div></div>
          <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><Icon name="checkCircle" size="lg" /></div><div class="stat-info"><div class="stat-value">{{ workloadData.total_tasks || 0 }}</div><div class="stat-label">总任务数</div></div></div></div>
          <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><Icon name="clock" size="lg" /></div><div class="stat-info"><div class="stat-value">{{ workloadData.in_progress_count || 0 }}</div><div class="stat-label">进行中</div></div></div></div>
          <div class="card stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #F56C6C;"><Icon name="exclamationTriangle" size="lg" /></div><div class="stat-info"><div class="stat-value">{{ workloadData.overdue_count || 0 }}</div><div class="stat-label">逾期任务</div></div></div></div>
        </div>

        <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />

        <h4>操作员工作负载</h4>
        <div class="table-scroll">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-4 py-3 w-36">操作员</th>
                <th class="px-4 py-3 w-24 text-center">进行中</th>
                <th class="px-4 py-3 w-24 text-center">已完成</th>
                <th class="px-4 py-3 w-48">工作负载</th>
                <th class="px-4 py-3 w-36 text-center">平均完成时间</th>
                <th class="px-4 py-3 w-24 text-center">效率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="row in operatorWorkloads" :key="row.operator_name">
                <td class="px-4 py-3">{{ row.operator_name }}</td>
                <td class="px-4 py-3 text-center">{{ row.in_progress_count || 0 }}</td>
                <td class="px-4 py-3 text-center">{{ row.completed_count || 0 }}</td>
                <td class="px-4 py-3"><ProgressBar :percentage="row.load_percentage || 0" :color="getLoadColor(row.load_percentage)" /></td>
                <td class="px-4 py-3 text-center">{{ row.avg_completion_time ? row.avg_completion_time.toFixed(1) + 'h' : '-' }}</td>
                <td class="px-4 py-3 text-center">{{ row.efficiency_rate ? (row.efficiency_rate * 100).toFixed(0) + '%' : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />

        <h4>工序统计</h4>
        <div class="table-scroll">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-4 py-3 w-36">工序</th>
                <th class="px-4 py-3 w-24 text-center">总任务</th>
                <th class="px-4 py-3 w-24 text-center">进行中</th>
                <th class="px-4 py-3 w-24 text-center">已完成</th>
                <th class="px-4 py-3 w-36 text-center">平均耗时</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="row in processStats" :key="row.process_name">
                <td class="px-4 py-3">{{ row.process_name }}</td>
                <td class="px-4 py-3 text-center">{{ row.total_count || 0 }}</td>
                <td class="px-4 py-3 text-center">{{ row.in_progress_count || 0 }}</td>
                <td class="px-4 py-3 text-center">{{ row.completed_count || 0 }}</td>
                <td class="px-4 py-3 text-center">{{ row.avg_duration ? row.avg_duration.toFixed(1) + 'h' : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { supervisorAPI, departmentAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import TaskDragDropList from './components/TaskDragDropList.vue'

const userStore = useUserStore()

const loading = ref(false)
const viewMode = ref('dashboard')
const departmentList = ref<any[]>([])
const selectedDepartment = ref(null)
const workloadData = ref<any>(null)
const departmentTasks = ref<any[]>([])
const operators = ref<any[]>([])

const isSupervisor = computed(() => userStore.hasPermission('workorder.change_workorder'))
const operatorWorkloads = computed(() => workloadData.value?.by_operator || [])
const processStats = computed(() => workloadData.value?.by_process || [])

const loadDepartments = async () => {
  try { const res: any = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || []; if (departmentList.value.length === 1) selectedDepartment.value = departmentList.value[0].id } catch (error: any) {}
}

const handleDepartmentChange = () => { loadWorkloadData() }

const loadWorkloadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (selectedDepartment.value) (params as any).department = selectedDepartment.value
    const [workloadRes, tasksRes] = await Promise.all([
      supervisorAPI.getWorkload(params),
      supervisorAPI.getDepartmentTasks(params)
    ])
    workloadData.value = (workloadRes as any)?.data || workloadRes
    departmentTasks.value = (tasksRes as any)?.results || []
    operators.value = workloadData.value?.operators || []
  } catch (error: any) { ErrorHandler.showMessage(error, '加载数据失败') } finally { loading.value = false }
}

const handleTaskAssigned = async (data: any) => { try { await supervisorAPI.assignTask(data); ElMessage.success('分派成功'); loadWorkloadData() } catch (error: any) { ErrorHandler.showMessage(error, '分派失败') } }
const handleTaskReassigned = async (data: any) => { try { await supervisorAPI.reassignTask(data); ElMessage.success('重新分派成功'); loadWorkloadData() } catch (error: any) { ErrorHandler.showMessage(error, '分派失败') } }
const handleTaskUnassigned = async (taskId: any) => { try { await supervisorAPI.unassignTask(taskId); ElMessage.success('取消分派成功'); loadWorkloadData() } catch (error: any) { ErrorHandler.showMessage(error, '取消分派失败') } }

const getLoadColor = (load: any) => load < 50 ? '#67C23A' : load < 80 ? '#E6A23C' : '#F56C6C'

onMounted(() => { loadDepartments(); if (isSupervisor.value) loadWorkloadData() })
</script>

<style lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.supervisor-dashboard { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.header-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: bold; }
.header-actions { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
.table-scroll { margin-top: var(--ui-control-gap); overflow-x: auto; }
.dashboard-table { width: 100%; }
h4 { margin: var(--ui-section-gap) 0 var(--ui-control-gap); color: #303133; }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions :deep(.relative),
  .header-actions > .inline-flex,
  .header-actions > button {
    width: 100%;
  }

  .header-actions .inline-flex button {
    flex: 1;
  }
}
</style>
