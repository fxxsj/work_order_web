<template>
  <div class="dashboard">
    <NotificationAlerts
      :unread-count="unreadNotificationCount"
      :pending-approval-count="statistics.pending_approval_count || 0"
      :urgent-priority-count="urgentPriorityCount"
      :upcoming-deadline-count="upcomingDeadlineCount"
      :is-salesperson="isSalesperson"
      :is-admin="isAdmin"
      @view-notifications="goToNotifications"
      @view-pending-approvals="goToPendingApprovals"
      @view-urgent-priority="goToUrgentPriority"
      @view-upcoming-deadline="goToUpcomingDeadline"
    />

    <WorkOrderStatistics
      :statistics="statistics"
      @navigate="goToWorkOrderList"
      @navigate-upcoming-deadline="goToUpcomingDeadline"
    />

    <TaskStatistics
      v-if="isOperator || isSupervisor || isAdmin"
      :task-statistics="taskStatistics"
      :efficiency-analysis="efficiencyAnalysis"
      :show-efficiency="isSupervisor || isAdmin"
      @navigate="goToTaskList"
    />

    <DesignerPendingPlates
      v-if="isDesigner"
      :pending-artworks="pendingArtworks"
      :pending-dies="pendingDies"
      :pending-foiling-plates="pendingFoilingPlates"
      :pending-embossing-plates="pendingEmbossingPlates"
      :confirming-item="confirmingItem"
      @confirm="handlePlateConfirm"
    />

    <MyTasks
      v-if="isOperator && myTasks.length > 0"
      :tasks="myTasks"
      @view-all="goToMyTasks"
    />

    <BusinessAnalysis
      v-if="isAdmin"
      :business-analysis="businessAnalysis"
      :department-statistics="departmentStatistics"
      @navigate-tasks="goToTaskList"
    />

    <RecentWorkOrders :recent-orders="recentOrders" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  workOrderAPI,
  workOrderTaskAPI,
  notificationAPI,
  artworkAPI,
  dieAPI,
  foilingPlateAPI,
  embossingPlateAPI
} from '@/api/modules'
import { hasRole, hasAnyRole } from '@/utils/userRole'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import unwrapApiResponse from '@/utils/apiResponse'
import NotificationAlerts from './dashboard/components/NotificationAlerts.vue'
import WorkOrderStatistics from './dashboard/components/WorkOrderStatistics.vue'
import TaskStatistics from './dashboard/components/TaskStatistics.vue'
import DesignerPendingPlates from './dashboard/components/DesignerPendingPlates.vue'
import MyTasks from './dashboard/components/MyTasks.vue'
import BusinessAnalysis from './dashboard/components/BusinessAnalysis.vue'
import RecentWorkOrders from './dashboard/components/RecentWorkOrders.vue'

const router = useRouter()
const userStore = useUserStore()

const statistics = ref({})
const recentOrders = ref([])
const myTasks = ref([])
const unreadNotificationCount = ref(0)
const pendingArtworks = ref([])
const pendingDies = ref([])
const pendingFoilingPlates = ref([])
const pendingEmbossingPlates = ref([])
const confirmingItem = ref(null)
const loading = ref(false)

const isSalesperson = computed(() => hasRole({ getters: userStore }, '业务员'))
const isSupervisor = computed(() => hasAnyRole({ getters: userStore }, ['主管', '经理', '管理员']))
const isOperator = computed(() => hasAnyRole({ getters: userStore }, ['操作员', '主管', '经理']))
const isDesigner = computed(() => hasRole({ getters: userStore }, '设计员'))
const isAdmin = computed(() => userStore.isSuperuser)
const businessAnalysis = computed(() => statistics.value.business_analysis || {})
const departmentStatistics = computed(() => taskStatistics.value.department_statistics || [])
const urgentPriorityCount = computed(() => {
  const urgentWorkOrders = statistics.value.priority_statistics?.find(p => p.priority === 'urgent')
  return urgentWorkOrders?.count || 0
})
const upcomingDeadlineCount = computed(() => statistics.value.upcoming_deadline_count || 0)
const taskStatistics = computed(() => statistics.value.task_statistics || {})
const efficiencyAnalysis = computed(() => statistics.value.efficiency_analysis || {})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const stats = await workOrderAPI.getStatistics()
    statistics.value = unwrapApiResponse(stats) || {}

    const response = await workOrderAPI.getList({
      page_size: 10,
      ordering: '-created_at'
    })
    recentOrders.value = response.results || []

    if (isOperator.value) {
      const userInfo = userStore.currentUser
      if (userInfo && userInfo.id) {
        try {
          const taskResponse = await workOrderTaskAPI.getList({
            assigned_operator: userInfo.id,
            page_size: 10,
            ordering: '-created_at'
          })
          myTasks.value = taskResponse.results || []
        } catch (error) {
          ErrorHandler.handle(error, 'Dashboard.loadMyTasks')
        }
      }
    }

    try {
      const unreadResponse = await notificationAPI.getUnreadCount()
      const payload = unwrapApiResponse(unreadResponse)
      unreadNotificationCount.value = payload?.unread_count || 0
    } catch (error) {
      ErrorHandler.handle(error, 'Dashboard.loadUnreadNotifications')
    }

    if (isDesigner.value) {
      await loadPendingPlates()
    }
  } catch (error) {
    ElMessage.error('加载数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

const goToPendingApprovals = () => {
  router.push({ path: '/workorders', query: { approval_status: 'pending' } })
}

const goToWorkOrderList = (filters = {}) => {
  router.push({ path: '/workorders', query: { ...filters } })
}

const goToUpcomingDeadline = () => {
  router.push({ path: '/workorders', query: { ordering: 'delivery_date' } })
}

const goToTaskList = (filters = {}) => {
  router.push({ path: '/tasks', query: filters })
}

const goToMyTasks = () => {
  const userInfo = userStore.currentUser
  if (userInfo && userInfo.id) {
    goToTaskList({ assigned_operator: userInfo.id })
  }
}

const goToNotifications = () => {
  router.push('/notifications')
}

const goToUrgentPriority = () => {
  router.push({ path: '/workorders', query: { priority: 'urgent' } })
}

const loadPendingPlates = async () => {
  try {
    const artworkResponse = await artworkAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingArtworks.value = (artworkResponse.results || [])
      .filter(item => !item.confirmed)
      .slice(0, 10)
      .map(item => ({
        ...item,
        code: item.code || (item.base_code ? (item.base_code + (item.version > 1 ? '-v' + item.version : '')) : '-')
      }))
  } catch (error) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingArtworks')
  }

  try {
    const dieResponse = await dieAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingDies.value = (dieResponse.results || [])
      .filter(item => !item.confirmed)
      .slice(0, 10)
  } catch (error) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingDies')
  }

  try {
    const foilingPlateResponse = await foilingPlateAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingFoilingPlates.value = (foilingPlateResponse.results || [])
      .filter(item => !item.confirmed)
      .slice(0, 10)
  } catch (error) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingFoilingPlates')
  }

  try {
    const embossingPlateResponse = await embossingPlateAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingEmbossingPlates.value = (embossingPlateResponse.results || [])
      .filter(item => !item.confirmed)
      .slice(0, 10)
  } catch (error) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingEmbossingPlates')
  }
}

const handlePlateConfirm = async ({ type, item }) => {
  const itemKey = `${type}-${item.id}`
  confirmingItem.value = itemKey

  const apiMap = {
    artwork: artworkAPI,
    die: dieAPI,
    foiling_plate: foilingPlateAPI,
    embossing_plate: embossingPlateAPI
  }

  const labelMap = {
    artwork: '图稿',
    die: '刀模',
    foiling_plate: '烫金版',
    embossing_plate: '压凸版'
  }

  const listMap = {
    artwork: pendingArtworks,
    die: pendingDies,
    foiling_plate: pendingFoilingPlates,
    embossing_plate: pendingEmbossingPlates
  }

  try {
    await apiMap[type].confirm(item.id)
    ElMessage.success(`${labelMap[type]}确认成功`)
    listMap[type].value = listMap[type].value.filter(i => i.id !== item.id)
    await loadPendingPlates()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || `确认${labelMap[type]}失败`)
  } finally {
    confirmingItem.value = null
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
