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

      <Alert v-if="!isSupervisor" title="权限不足" type="error" description="您没有权限访问主管看板，需要具有施工单修改权限。" :closable="false" show-icon class="mb-5" />

      <div v-else-if="viewMode === 'dragdrop'">
        <task-drag-drop-list v-if="!loading && departmentTasks.length > 0" :tasks="departmentTasks" :operators="operators" @task-assigned="handleTaskAssigned" @task-reassigned="handleTaskReassigned" @task-unassigned="handleTaskUnassigned" />
        <EmptyState v-else-if="!loading && departmentTasks.length === 0" title="暂无任务数据" />
      </div>

      <div v-else-if="viewMode === 'dashboard' && workloadData">
        <StatsCards :items="statItems" :loading="loading" layout="media" />

        <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />

        <h4 class="my-4 text-base font-semibold text-gray-900 dark:text-gray-100">操作员工作负载</h4>
        <SummaryTable :columns="operatorColumns" :data="operatorWorkloads" row-key="operator_name">
          <template #cell-load_percentage="{ value }">
            <ProgressBar :percentage="value || 0" :color="getLoadColor(value)" />
          </template>
        </SummaryTable>

        <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />

        <h4 class="my-4 text-base font-semibold text-gray-900 dark:text-gray-100">工序统计</h4>
        <SummaryTable :columns="processColumns" :data="processStats" row-key="process_name" />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon, StatsCards, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
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

const statItems = computed(() => [
  { key: 'operators', label: '操作员数', value: workloadData.value?.total_operators || 0, format: 'number', iconName: 'user', tone: 'primary' },
  { key: 'tasks', label: '总任务数', value: workloadData.value?.total_tasks || 0, format: 'number', iconName: 'checkCircle', tone: 'success' },
  { key: 'in-progress', label: '进行中', value: workloadData.value?.in_progress_count || 0, format: 'number', iconName: 'clock', tone: 'warning' },
  { key: 'overdue', label: '逾期任务', value: workloadData.value?.overdue_count || 0, format: 'number', iconName: 'exclamationTriangle', tone: 'danger' },
])

const operatorColumns: Column[] = [
  { key: 'operator_name', label: '操作员', minWidth: 144 },
  { key: 'in_progress_count', label: '进行中', align: 'center', width: 96, formatter: value => String(value || 0) },
  { key: 'completed_count', label: '已完成', align: 'center', width: 96, formatter: value => String(value || 0) },
  { key: 'load_percentage', label: '工作负载', minWidth: 192 },
  { key: 'avg_completion_time', label: '平均完成时间', align: 'center', width: 144, formatter: value => value ? `${Number(value).toFixed(1)}h` : '-' },
  { key: 'efficiency_rate', label: '效率', align: 'center', width: 96, formatter: value => value ? `${(Number(value) * 100).toFixed(0)}%` : '-' },
]

const processColumns: Column[] = [
  { key: 'process_name', label: '工序', minWidth: 144 },
  { key: 'total_count', label: '总任务', align: 'center', width: 96, formatter: value => String(value || 0) },
  { key: 'in_progress_count', label: '进行中', align: 'center', width: 96, formatter: value => String(value || 0) },
  { key: 'completed_count', label: '已完成', align: 'center', width: 96, formatter: value => String(value || 0) },
  { key: 'avg_duration', label: '平均耗时', align: 'center', width: 144, formatter: value => value ? `${Number(value).toFixed(1)}h` : '-' },
]

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
