<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          操作员任务中心
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          认领部门任务，填报生产进度，处理我的待办。
        </p>
      </div>
      <BaseButton
        variant="secondary"
        class="self-start lg:self-auto"
        icon="refresh"
        title="刷新"
        :loading="loading"
        @click="loadOperatorCenter"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in statCards"
        :key="item.key"
        class="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-700 dark:bg-dark-800"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ item.label }}</span>
          <Icon
            :name="item.icon"
            size="md"
            :class="item.iconClass"
          />
        </div>
        <div class="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
          {{ item.value }}
        </div>
      </div>
    </div>

    <div
      v-if="departmentNotice"
      class="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/20 dark:text-warning-300"
    >
      {{ departmentNotice }}
    </div>

    <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-dark-700 dark:bg-dark-800">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SearchInput
          v-model="filters.search"
          placeholder="搜索施工单、客户、任务内容"
          class="xl:col-span-2"
          @search="handleFilterInput"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          placeholder="任务状态"
          @change="handleFilterChange"
        />
        <Select
          v-model="filters.task_type"
          :options="taskTypeOptions"
          placeholder="任务类型"
          @change="handleFilterChange"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          placeholder="优先级"
          @change="handleFilterChange"
        />
      </div>
      <div
        v-if="hasFilters"
        class="mt-3 flex justify-end"
      >
        <BaseButton
          variant="secondary"
          size="sm"
          icon="rotateCcw"
          @click="resetFilters"
        >
          重置筛选
        </BaseButton>
      </div>
    </div>

    <div class="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-dark-700 dark:bg-dark-800">
      <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="activeTab === tab.key ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-white'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span class="ml-1 text-xs opacity-70">({{ tab.count }})</span>
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <div
          v-if="loading && currentTasks.length === 0"
          class="flex justify-center py-16"
        >
          <Icon
            name="refresh"
            class="animate-spin text-gray-400"
            size="xl"
          />
        </div>

        <EmptyState
          v-else-if="currentTasks.length === 0"
          :title="activeTab === 'mine' ? '暂无我的任务' : '暂无可认领任务'"
          :description="emptyDescription"
        />

        <div
          v-else
          class="space-y-3"
        >
          <article
            v-for="task in currentTasks"
            :key="task.id"
            class="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-primary-300 dark:border-dark-600 dark:bg-dark-800"
          >
            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <button
                    v-if="getWorkOrderId(task)"
                    class="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                    @click="goToWorkOrder(task)"
                  >
                    {{ getWorkOrderNumber(task) }}
                  </button>
                  <span
                    v-else
                    class="font-semibold text-gray-900 dark:text-white"
                  >
                    {{ getWorkOrderNumber(task) }}
                  </span>
                  <StatusTag
                    :status="task.status"
                    category="taskUser"
                    :label="task.status_display"
                    size="small"
                  />
                  <Tag
                    :type="getPriorityType(task)"
                    size="small"
                  >
                    {{ getPriorityLabel(task) }}
                  </Tag>
                  <Tag
                    v-if="task.is_subtask"
                    type="info"
                    size="small"
                  >
                    子任务
                  </Tag>
                </div>

                <div class="mb-2 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                  {{ task.work_content || '-' }}
                </div>

                <div class="grid gap-2 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-2 xl:grid-cols-4">
                  <span>客户：{{ getCustomerName(task) }}</span>
                  <span>工序：{{ getProcessName(task) }}</span>
                  <span>部门：{{ task.assigned_department_name || '-' }}</span>
                  <span>交期：{{ getDeliveryDate(task) }}</span>
                </div>

                <div class="mt-3">
                  <TaskRelatedInfo :task="task" />
                </div>
              </div>

              <div class="w-full shrink-0 xl:w-80">
                <div class="mb-3 flex items-center justify-between gap-3 text-sm">
                  <span class="text-gray-500 dark:text-gray-400">进度</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ getQuantityText(task) }}</span>
                </div>
                <ProgressBar
                  :percentage="getProgress(task)"
                  :status="task.status === 'completed' ? 'success' : 'active'"
                  :stroke-width="8"
                />
                <div
                  v-if="task.quantity_defective"
                  class="mt-2 text-xs text-danger-600 dark:text-danger-400"
                >
                  不良品：{{ task.quantity_defective }}
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-dark-700">
              <div class="text-xs text-gray-400">
                更新：{{ formatTaskTime(task.updated_at || task.created_at) }}
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <BaseButton
                  v-if="getWorkOrderId(task)"
                  variant="secondary"
                  size="sm"
                  icon="document"
                  @click="goToWorkOrder(task)"
                >
                  施工单
                </BaseButton>
                <BaseButton
                  v-if="task.logs?.length"
                  variant="secondary"
                  size="sm"
                  icon="list"
                  @click="toggleLogs(task)"
                >
                  {{ expandedLogIds.has(task.id) ? '收起记录' : '操作记录' }}
                </BaseButton>
                <template v-if="activeTab === 'mine'">
                  <BaseButton
                    v-if="canUpdateTask(task)"
                    variant="primary"
                    size="sm"
                    icon="edit"
                    @click="showUpdateDialog(task)"
                  >
                    更新进度
                  </BaseButton>
                  <BaseButton
                    v-if="canCompleteTask(task)"
                    variant="success"
                    size="sm"
                    icon="check"
                    @click="showCompleteDialog(task)"
                  >
                    完成
                  </BaseButton>
                </template>
                <BaseButton
                  v-else
                  variant="primary"
                  size="sm"
                  icon="user"
                  :loading="claimingTaskId === task.id"
                  @click="claimTask(task)"
                >
                  认领
                </BaseButton>
              </div>
            </div>

            <div
              v-if="expandedLogIds.has(task.id)"
              class="mt-4"
            >
              <TaskLogs :task="task" />
            </div>
          </article>

          <div
            v-if="currentListMeta.total > currentListMeta.returned"
            class="flex flex-col gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-dark-600 dark:bg-dark-700/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <span class="text-gray-500 dark:text-gray-400">
              已显示 {{ currentListMeta.returned }} / {{ currentListMeta.total }} 条
            </span>
            <BaseButton
              variant="secondary"
              size="sm"
              icon="chevronDown"
              :loading="loading"
              @click="loadMoreCurrentTab"
            >
              加载更多
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <OperatorTaskUpdateDialog
      :visible="updateDialogVisible"
      :task="currentTask"
      :initial-mode="updateDialogMode"
      @success="handleTaskChanged"
      @update:visible="updateDialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { workOrderTaskAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { BaseButton, EmptyState, Icon, ProgressBar, SearchInput, Select, StatusTag, Tag } from '@/components/common'
import { OperatorTaskUpdateDialog, TaskLogs, TaskRelatedInfo } from '@/components/task'
import { useUIStore } from '@/stores/ui'

type TabKey = 'mine' | 'claimable'
type UpdateDialogMode = 'increment' | 'complete'

interface OperatorSummary {
  my_total?: number
  my_pending?: number
  my_in_progress?: number
  my_completed?: number
  claimable_count?: number
}

interface StatCard {
  key: string
  label: string
  value: number
  icon: 'inbox' | 'clock' | 'sync' | 'checkCircle'
  iconClass: string
}

interface OperatorCenterMeta {
  my_count?: number
  my_returned?: number
  my_limit?: number
  my_has_more?: boolean
  claimable_count?: number
  claimable_returned?: number
  claimable_limit?: number
  claimable_has_more?: boolean
}

const DEFAULT_MY_LIMIT = 100
const DEFAULT_CLAIMABLE_LIMIT = 50
const MY_LIMIT_STEP = 100
const CLAIMABLE_LIMIT_STEP = 50

const router = useRouter()
const uiStore = useUIStore()

const loading = ref(false)
const claimingTaskId = ref<number | null>(null)
const activeTab = ref<TabKey>('mine')
const summary = ref<OperatorSummary>({})
const meta = ref<OperatorCenterMeta>({})
const myTasks = ref<any[]>([])
const claimableTasks = ref<any[]>([])
const myLimit = ref(DEFAULT_MY_LIMIT)
const claimableLimit = ref(DEFAULT_CLAIMABLE_LIMIT)
const departmentNotice = ref('')
const expandedLogIds = ref<Set<number>>(new Set())
const currentTask = ref<any>(null)
const updateDialogVisible = ref(false)
const updateDialogMode = ref<UpdateDialogMode>('increment')
const filters = reactive({
  search: '',
  status: '',
  task_type: '',
  priority: ''
})

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const taskTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'plate_making', label: '制版' },
  { value: 'cutting', label: '开料' },
  { value: 'printing', label: '印刷' },
  { value: 'foiling', label: '烫金' },
  { value: 'embossing', label: '压凸' },
  { value: 'die_cutting', label: '模切' },
  { value: 'packaging', label: '包装' },
  { value: 'general', label: '通用' }
]

const priorityOptions = [
  { value: '', label: '全部优先级' },
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '低' }
]

const statCards = computed<StatCard[]>(() => [
  {
    key: 'claimable',
    label: '可认领',
    value: summary.value.claimable_count ?? claimableTasks.value.length,
    icon: 'inbox',
    iconClass: 'text-primary-500'
  },
  {
    key: 'pending',
    label: '我的待开始',
    value: summary.value.my_pending ?? countByStatus(myTasks.value, 'pending'),
    icon: 'clock',
    iconClass: 'text-warning-500'
  },
  {
    key: 'in_progress',
    label: '进行中',
    value: summary.value.my_in_progress ?? countByStatus(myTasks.value, 'in_progress'),
    icon: 'sync',
    iconClass: 'text-amber-500'
  },
  {
    key: 'total',
    label: '我的任务',
    value: summary.value.my_total ?? myTasks.value.length,
    icon: 'checkCircle',
    iconClass: 'text-success-500'
  }
])

const tabs = computed(() => [
  { key: 'mine' as const, label: '我的任务', count: summary.value.my_total ?? meta.value.my_count ?? myTasks.value.length },
  { key: 'claimable' as const, label: '可认领', count: summary.value.claimable_count ?? meta.value.claimable_count ?? claimableTasks.value.length }
])

const currentTasks = computed(() => activeTab.value === 'mine' ? myTasks.value : claimableTasks.value)
const currentListMeta = computed(() => {
  if (activeTab.value === 'mine') {
    return {
      total: meta.value.my_count ?? summary.value.my_total ?? myTasks.value.length,
      returned: meta.value.my_returned ?? myTasks.value.length
    }
  }
  return {
    total: meta.value.claimable_count ?? summary.value.claimable_count ?? claimableTasks.value.length,
    returned: meta.value.claimable_returned ?? claimableTasks.value.length
  }
})
const emptyDescription = computed(() => {
  if (hasFilters.value) return '未找到符合筛选条件的任务。'
  if (activeTab.value === 'mine') return '当前没有分派给你的待办任务。'
  if (departmentNotice.value) return departmentNotice.value
  return '当前部门没有等待认领的任务。'
})
const hasFilters = computed(() => Object.values(filters).some(value => String(value || '').trim()))

const countByStatus = (tasks: any[], status: string) => tasks.filter(task => task.status === status).length

const unwrapOperatorData = (response: any) => response?.data || response || {}
const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  Object.entries(filters).forEach(([key, value]) => {
    const normalized = String(value || '').trim()
    if (normalized) params[key] = normalized
  })
  if (myLimit.value !== DEFAULT_MY_LIMIT) params.my_limit = myLimit.value
  if (claimableLimit.value !== DEFAULT_CLAIMABLE_LIMIT) params.claimable_limit = claimableLimit.value
  return params
}

const loadOperatorCenter = async () => {
  loading.value = true
  try {
    const response: any = await workOrderTaskAPI.getOperatorCenterData(buildFilterParams())
    const data = unwrapOperatorData(response)
    myTasks.value = Array.isArray(data.my_tasks) ? data.my_tasks : []
    claimableTasks.value = Array.isArray(data.claimable_tasks) ? data.claimable_tasks : []
    summary.value = data.summary || {}
    meta.value = data.meta || {}
    departmentNotice.value = data.detail || ''
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载操作员任务中心失败')
  } finally {
    loading.value = false
  }
}

const handleFilterInput = () => {
  // SearchInput 已负责防抖，此处直接查询，避免叠加两层 300ms 延迟。
  resetLimits()
  loadOperatorCenter()
}

const handleFilterChange = () => {
  resetLimits()
  loadOperatorCenter()
}

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.task_type = ''
  filters.priority = ''
  resetLimits()
  loadOperatorCenter()
}

const resetLimits = () => {
  myLimit.value = DEFAULT_MY_LIMIT
  claimableLimit.value = DEFAULT_CLAIMABLE_LIMIT
}

const loadMoreCurrentTab = async () => {
  if (activeTab.value === 'mine') {
    const total = meta.value.my_count ?? summary.value.my_total ?? myTasks.value.length + MY_LIMIT_STEP
    myLimit.value = Math.min(total, myLimit.value + MY_LIMIT_STEP)
  } else {
    const total = meta.value.claimable_count ?? summary.value.claimable_count ?? claimableTasks.value.length + CLAIMABLE_LIMIT_STEP
    claimableLimit.value = Math.min(total, claimableLimit.value + CLAIMABLE_LIMIT_STEP)
  }
  await loadOperatorCenter()
}

const getWorkOrder = (task: any) => task?.work_order_process_info?.work_order || {}
const getProcess = (task: any) => task?.work_order_process_info?.process || {}
const getWorkOrderId = (task: any) => getWorkOrder(task).id
const getWorkOrderNumber = (task: any) => getWorkOrder(task).order_number || task.work_order_number || '未关联施工单'
const getCustomerName = (task: any) => getWorkOrder(task).customer_name || '-'
const getProcessName = (task: any) => getProcess(task).name || task.process_name || '-'
const getDeliveryDate = (task: any) => getWorkOrder(task).delivery_date || task.delivery_date || '-'

const getProgress = (task: any) => {
  const total = Number(task.production_quantity || 0)
  if (!total) return 0
  return Math.min(100, Math.round((Number(task.quantity_completed || 0) / total) * 100))
}

const getQuantityText = (task: any) => {
  const completed = task.quantity_completed ?? 0
  const total = task.production_quantity ?? 0
  return `${completed} / ${total}`
}

const priorityMeta: Record<string, { label: string; type: string }> = {
  urgent: { label: '紧急', type: 'danger' },
  high: { label: '高', type: 'warning' },
  normal: { label: '普通', type: 'primary' },
  low: { label: '低', type: 'info' }
}

const getPriorityValue = (task: any) => getWorkOrder(task).priority || task.priority || 'normal'
const getPriorityLabel = (task: any) => getWorkOrder(task).priority_display || priorityMeta[getPriorityValue(task)]?.label || getPriorityValue(task)
const getPriorityType = (task: any) => priorityMeta[getPriorityValue(task)]?.type || 'info'

const formatTaskTime = (value: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

const canUpdateTask = (task: any) => ['pending', 'in_progress'].includes(task.status) && !task.auto_calculate_quantity
const canCompleteTask = (task: any) => ['pending', 'in_progress'].includes(task.status)

const goToWorkOrder = (task: any) => {
  const workOrderId = getWorkOrderId(task)
  if (workOrderId) router.push(`/workorders/${workOrderId}`)
}

const toggleLogs = (task: any) => {
  const next = new Set(expandedLogIds.value)
  if (next.has(task.id)) next.delete(task.id)
  else next.add(task.id)
  expandedLogIds.value = next
}

const claimTask = async (task: any) => {
  claimingTaskId.value = task.id
  try {
    await workOrderTaskAPI.claimTask(task.id, { notes: '' })
    uiStore.showSuccess('任务认领成功')
    await loadOperatorCenter()
    activeTab.value = 'mine'
  } catch (error: any) {
    const responseData = error?.response?.data || {}
    const conflictData = responseData.data || responseData
    if (error?.response?.status === 409) {
      ErrorHandler.showConflictMessage({
        type: 'conflict',
        message: responseData.message || conflictData.detail || '该任务已被其他操作员认领',
        currentOwner: conflictData.current_owner,
        taskId: conflictData.task_id,
        retry: conflictData.retry
      })
    } else {
      ErrorHandler.showMessage(error, '认领任务失败')
    }
  } finally {
    claimingTaskId.value = null
  }
}

const showUpdateDialog = (task: any) => {
  currentTask.value = task
  updateDialogMode.value = 'increment'
  updateDialogVisible.value = true
}

const showCompleteDialog = (task: any) => {
  currentTask.value = task
  updateDialogMode.value = 'complete'
  updateDialogVisible.value = true
}

const handleTaskChanged = async () => {
  updateDialogVisible.value = false
  await loadOperatorCenter()
}

onMounted(() => {
  loadOperatorCenter()
})

</script>
