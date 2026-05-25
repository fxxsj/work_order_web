<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <LoadingSpinner />
    </div>

    <template v-else>
      <NotificationAlerts
        :unread-count="unreadNotificationCount"
        :pending-approval-count="(statistics as any).pending_approval_count || 0"
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
        :confirming-item="confirmingItem as any"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
import { LoadingSpinner } from '@/components/common'
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
const recentOrders = ref<any[]>([])
const myTasks = ref<any[]>([])
const unreadNotificationCount = ref(0)
const pendingArtworks = ref<any[]>([])
const pendingDies = ref<any[]>([])
const pendingFoilingPlates = ref<any[]>([])
const pendingEmbossingPlates = ref<any[]>([])
const confirmingItem = ref<string | null>(null)
const loading = ref(false)

const isSalesperson = computed(() => hasRole({ getters: userStore }, '业务员'))
const isSupervisor = computed(() => hasAnyRole({ getters: userStore }, ['主管', '经理', '管理员']))
const isOperator = computed(() => hasAnyRole({ getters: userStore }, ['操作员', '主管', '经理']))
const isDesigner = computed(() => hasRole({ getters: userStore }, '设计员'))
const isAdmin = computed(() => userStore.isSuperuser)
const businessAnalysis = computed(() => (statistics.value as any).business_analysis || {})
const departmentStatistics = computed(() => taskStatistics.value.department_statistics || [])
const urgentPriorityCount = computed(() => {
  const urgentWorkOrders = (statistics.value as any).priority_statistics?.find((p: any) => p.priority === 'urgent')
  return urgentWorkOrders?.count || 0
})
const upcomingDeadlineCount = computed(() => (statistics.value as any).upcoming_deadline_count || 0)
const taskStatistics = computed(() => (statistics.value as any).task_statistics || {})
const efficiencyAnalysis = computed(() => (statistics.value as any).efficiency_analysis || {})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const stats: any = await workOrderAPI.getStatistics().catch(() => null)
    statistics.value = stats || {}

    const response: any = await workOrderAPI.getList({
      page_size: 10,
      ordering: '-created_at'
    }).catch(() => ({ results: [] }))
    recentOrders.value = response.results || []

    if (isOperator.value) {
      const userInfo = userStore.currentUser
      if (userInfo && userInfo.id) {
        try {
          const taskResponse: any = await workOrderTaskAPI.getList({
            assigned_operator: userInfo.id,
            page_size: 10,
            ordering: '-created_at'
          })
          myTasks.value = taskResponse.results || []
        } catch (error: any) {
          ErrorHandler.handle(error, 'Dashboard.loadMyTasks')
        }
      }
    }

    try {
      const unreadResponse: any = await notificationAPI.getUnreadCount()
      unreadNotificationCount.value = unreadResponse?.unread_count || 0
    } catch (error: any) {
      ErrorHandler.handle(error, 'Dashboard.loadUnreadNotifications')
    }

    if (isDesigner.value) {
      await loadPendingPlates()
    }
  } catch (error: any) {
    ErrorHandler.showError('加载数据失败，请刷新重试')
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
    const artworkResponse: any = await artworkAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingArtworks.value = (artworkResponse.results || [])
      .filter((item: any) => !item.confirmed)
      .slice(0, 10)
      .map((item: any) => ({
        ...item,
        code: item.code || (item.base_code ? (item.base_code + (item.version > 1 ? '-v' + item.version : '')) : '-')
      }))
  } catch (error: any) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingArtworks')
  }

  try {
    const dieResponse: any = await dieAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingDies.value = (dieResponse.results || [])
      .filter((item: any) => !item.confirmed)
      .slice(0, 10)
  } catch (error: any) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingDies')
  }

  try {
    const foilingPlateResponse: any = await foilingPlateAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingFoilingPlates.value = (foilingPlateResponse.results || [])
      .filter((item: any) => !item.confirmed)
      .slice(0, 10)
  } catch (error: any) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingFoilingPlates')
  }

  try {
    const embossingPlateResponse: any = await embossingPlateAPI.getList({
      page_size: 50,
      ordering: '-created_at'
    })
    pendingEmbossingPlates.value = (embossingPlateResponse.results || [])
      .filter((item: any) => !item.confirmed)
      .slice(0, 10)
  } catch (error: any) {
    ErrorHandler.handle(error, 'Dashboard.loadPendingEmbossingPlates')
  }
}

const handlePlateConfirm = async (payload: any) => {
    const { type, item } = payload
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
    await (apiMap as any)[type].confirm(item.id)
    ErrorHandler.showSuccess(`${(labelMap as any)[type]}确认成功`);
    (listMap as any)[type].value = (listMap as any)[type].value.filter((i: any) => i.id !== item.id)
    await loadPendingPlates()
  } catch (error: any) {
    ErrorHandler.showError(error.response?.data?.error || `确认${(labelMap as any)[type]}失败`)
  } finally {
    confirmingItem.value = null
  }
}
</script>

