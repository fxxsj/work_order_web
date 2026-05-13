<template>
  <div class="supervisor-dashboard">
    <el-card v-loading="loading">
      <template #header>
        <div class="header-section">
          <div class="header-title"><el-icon><DataAnalysis /></el-icon><span>主管看板</span></div>
          <div class="header-actions">
            <el-select v-if="departmentList.length > 1" v-model="selectedDepartment" placeholder="选择部门" filterable @change="handleDepartmentChange">
              <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
            </el-select>
            <el-tag v-else-if="departmentList.length === 1" type="info">{{ departmentList[0].name }}</el-tag>
            <el-button-group style="margin-left: 10px;">
              <el-button :type="viewMode === 'dashboard' ? 'primary' : ''" :icon="DataAnalysis" @click="viewMode = 'dashboard'">统计视图</el-button>
              <el-button :type="viewMode === 'dragdrop' ? 'primary' : ''" :icon="Rank" @click="viewMode = 'dragdrop'">拖拽分派</el-button>
            </el-button-group>
            <el-button :icon="Refresh" @click="loadWorkloadData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-alert v-if="!isSupervisor" title="权限不足" type="error" description="您没有权限访问主管看板，需要具有施工单修改权限。" :closable="false" show-icon style="margin-bottom: 20px;" />

      <div v-else-if="viewMode === 'dragdrop'">
        <task-drag-drop-list v-if="!loading && departmentTasks.length > 0" :tasks="departmentTasks" :operators="operators" @task-assigned="handleTaskAssigned" @task-reassigned="handleTaskReassigned" @task-unassigned="handleTaskUnassigned" />
        <el-empty v-else-if="!loading && departmentTasks.length === 0" description="暂无任务数据" />
      </div>

      <div v-else-if="viewMode === 'dashboard' && workloadData">
        <el-row :gutter="20">
          <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><User /></el-icon></div><div class="stat-info"><div class="stat-value">{{ workloadData.total_operators || 0 }}</div><div class="stat-label">操作员数</div></div></div></el-card></el-col>
          <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ workloadData.total_tasks || 0 }}</div><div class="stat-label">总任务数</div></div></div></el-card></el-col>
          <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ workloadData.in_progress_count || 0 }}</div><div class="stat-label">进行中</div></div></div></el-card></el-col>
          <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #F56C6C;"><el-icon><Warning /></el-icon></div><div class="stat-info"><div class="stat-value">{{ workloadData.overdue_count || 0 }}</div><div class="stat-label">逾期任务</div></div></div></el-card></el-col>
        </el-row>

        <el-divider />

        <h4>操作员工作负载</h4>
        <el-table :data="operatorWorkloads" border style="margin-top: 15px;">
          <el-table-column prop="operator_name" label="操作员" width="150" />
          <el-table-column label="进行中" width="100" align="center"><template #default="scope">{{ scope.row.in_progress_count || 0 }}</template></el-table-column>
          <el-table-column label="已完成" width="100" align="center"><template #default="scope">{{ scope.row.completed_count || 0 }}</template></el-table-column>
          <el-table-column label="工作负载" width="200">
            <template #default="scope"><el-progress :percentage="scope.row.load_percentage || 0" :color="getLoadColor(scope.row.load_percentage)" /></template>
          </el-table-column>
          <el-table-column label="平均完成时间" width="150" align="center"><template #default="scope">{{ scope.row.avg_completion_time ? scope.row.avg_completion_time.toFixed(1) + 'h' : '-' }}</template></el-table-column>
          <el-table-column prop="efficiency_rate" label="效率" width="150" align="center"><template #default="scope">{{ scope.row.efficiency_rate ? (scope.row.efficiency_rate * 100).toFixed(0) + '%' : '-' }}</template></el-table-column>
        </el-table>

        <el-divider />

        <h4>工序统计</h4>
        <el-table :data="processStats" border style="margin-top: 15px;">
          <el-table-column prop="process_name" label="工序" width="150" />
          <el-table-column label="总任务" width="100" align="center"><template #default="scope">{{ scope.row.total_count || 0 }}</template></el-table-column>
          <el-table-column label="进行中" width="100" align="center"><template #default="scope">{{ scope.row.in_progress_count || 0 }}</template></el-table-column>
          <el-table-column label="已完成" width="100" align="center"><template #default="scope">{{ scope.row.completed_count || 0 }}</template></el-table-column>
          <el-table-column label="平均耗时" width="150" align="center"><template #default="scope">{{ scope.row.avg_duration ? scope.row.avg_duration.toFixed(1) + 'h' : '-' }}</template></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DataAnalysis, Refresh, User, CircleCheck, Clock, Warning, Rank } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { supervisorAPI, departmentAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import TaskDragDropList from './components/TaskDragDropList.vue'

const userStore = useUserStore()

const loading = ref(false)
const viewMode = ref('dashboard')
const departmentList = ref([])
const selectedDepartment = ref(null)
const workloadData = ref(null)
const departmentTasks = ref([])
const operators = ref([])

const isSupervisor = computed(() => userStore.hasPermission('workorder.change_workorder'))
const operatorWorkloads = computed(() => workloadData.value?.by_operator || [])
const processStats = computed(() => workloadData.value?.by_process || [])

const loadDepartments = async () => {
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || []; if (departmentList.value.length === 1) selectedDepartment.value = departmentList.value[0].id } catch (error) {}
}

const handleDepartmentChange = () => { loadWorkloadData() }

const loadWorkloadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (selectedDepartment.value) params.department = selectedDepartment.value
    const [workloadRes, tasksRes] = await Promise.all([
      supervisorAPI.getWorkload(params),
      supervisorAPI.getDepartmentTasks(params)
    ])
    workloadData.value = workloadRes?.data || workloadRes
    departmentTasks.value = tasksRes?.results || []
    operators.value = workloadData.value?.operators || []
  } catch (error) { ErrorHandler.showMessage(error, '加载数据失败') } finally { loading.value = false }
}

const handleTaskAssigned = async (data) => { try { await supervisorAPI.assignTask(data); ElMessage.success('分派成功'); loadWorkloadData() } catch (error) { ErrorHandler.showMessage(error, '分派失败') } }
const handleTaskReassigned = async (data) => { try { await supervisorAPI.reassignTask(data); ElMessage.success('重新分派成功'); loadWorkloadData() } catch (error) { ErrorHandler.showMessage(error, '分派失败') } }
const handleTaskUnassigned = async (taskId) => { try { await supervisorAPI.unassignTask(taskId); ElMessage.success('取消分派成功'); loadWorkloadData() } catch (error) { ErrorHandler.showMessage(error, '取消分派失败') } }

const getLoadColor = (load) => load < 50 ? '#67C23A' : load < 80 ? '#E6A23C' : '#F56C6C'

onMounted(() => { loadDepartments(); if (isSupervisor.value) loadWorkloadData() })
</script>

<style scoped>
.supervisor-dashboard { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; }
.header-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: bold; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
h4 { margin: 20px 0 10px; color: #303133; }
</style>
