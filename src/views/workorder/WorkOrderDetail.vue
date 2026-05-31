<template>
  <div class="relative">
    <LoadingOverlay :show="loading" />
    <div
      v-if="workOrder"
      class="space-y-6"
    >
      <WorkOrderHeaderActions
        :can-edit="canEdit"
        @back="router.back()"
        @print="handlePrint"
        @edit="handleEdit"
      />
      <section class="card p-6">
        <div class="mb-4 border-b border-gray-200 pb-4 text-lg font-bold text-gray-900 dark:border-dark-700 dark:text-white">
          基本信息
        </div>
        <WorkOrderBasicInfo
          :work-order="workOrder"
          :can-edit="canEdit"
          @status-change="handleStatusChange"
        />
      </section>
      <WorkOrderProducts
        :products="productList"
      />
      <WorkOrderMaterials
        :materials="materialList"
        @add-material="addMaterialDialog = true"
      />
      <WorkOrderApproval
        v-if="showApprovalSection"
        :work-order="workOrder"
        :can-approve="canApprove"
        :can-resubmit="canResubmit"
        :task-generation-summary="taskGenerationSummary"
        @approve="handleApprove"
        @resubmit="handleResubmit"
      />
      <WorkOrderArtworkDie
        v-if="hasPrepressResources"
        :artwork-codes="artworkCodes"
        :artwork-names="artworkNames"
        :die-codes="dieCodes"
        :die-names="dieNames"
        :foiling-plate-codes="foilingPlateCodes"
        :foiling-plate-names="foilingPlateNames"
        :embossing-plate-codes="embossingPlateCodes"
        :embossing-plate-names="embossingPlateNames"
        :printing-type="workOrder.printing_type"
        :printing-type-display="workOrder.printing_type_display"
        :printing-colors-display="workOrder.printing_colors_display"
        :artwork-colors="workOrder.artwork_colors"
      />
      <WorkOrderTraceFinance
        v-if="hasTraceFinance"
        :work-order="workOrder"
      />
      <WorkOrderProcessTasks
        :work-order="workOrder"
        :processes="processList"
        :view-mode="'list'"
        :can-sync-tasks="canSyncTasks"
        @add-process="addProcessDialog = true"
        @process-click="handleProcessClick"
        @sync-tasks="handleSyncTasks"
        @open-task-assignment="router.push('/tasks')"
      />
      <WorkOrderNotes
        v-if="workOrder.notes"
        :notes="workOrder.notes"
      />
      <WorkOrderProcurement
        v-if="materialList.length > 0 || purchaseOrders.length > 0"
        :materials="materialList"
        :purchase-orders="purchaseOrders"
        @create-purchase="handleCreatePurchaseOrder"
        @view-purchase="handleViewPurchaseOrder"
      />
    </div>
    <div
      v-else
      class="p-10 text-center"
    >
      施工单不存在或已被删除
    </div>

    <AddMaterialDialog
      v-model="addMaterialDialog"
      :material-list="availableMaterials"
      @submit="handleAddMaterial"
    />
    <AddProcessDialog
      v-model="addProcessDialog"
      :process-list="availableProcesses"
      @submit="handleAddProcess"
    />
    <BaseDialog
      :show="printDialog"
      title="施工单打印预览"
      width="full"
      @close="printDialog = false"
    >
      <WorkOrderPrint
        :work-order="workOrder"
        :products="workOrder?.products || []"
        :materials="materialList"
        :processes="processList"
      />
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { BaseDialog, LoadingOverlay } from '@/components/common'
import { materialAPI, processAPI, workOrderAPI, workOrderFlowAPI } from '@/api/modules'
import { purchaseOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import { WorkOrderHeaderActions, WorkOrderBasicInfo, WorkOrderProducts, WorkOrderProcessTasks, WorkOrderMaterials } from '@/components/workorder'
import WorkOrderApproval from './components/WorkOrderApproval.vue'
import WorkOrderArtworkDie from './components/WorkOrderArtworkDie.vue'
import WorkOrderNotes from './components/WorkOrderNotes.vue'
import WorkOrderProcurement from './components/WorkOrderProcurement.vue'
import WorkOrderTraceFinance from './components/WorkOrderTraceFinance.vue'
import WorkOrderPrint from './components/WorkOrderPrint.vue'
import AddMaterialDialog from './components/AddMaterialDialog.vue'
import AddProcessDialog from './components/AddProcessDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const workOrder = ref<any>(null)
const processList = ref<any[]>([])
const materialList = ref<any[]>([])
const productList = ref<any[]>([])
const availableMaterials = ref<any[]>([])
const availableProcesses = ref<any[]>([])
const addMaterialDialog = ref(false)
const addProcessDialog = ref(false)
const printDialog = ref(false)
const purchaseOrders = ref<any[]>([])
const syncCheck = ref<any>(null)
const taskGenerationSummary = ref<any>(null)
const canEdit = computed(() => userStore.hasPermission('workorder.change_workorder'))
const canApprove = computed(() => userStore.hasPermission('workorder.approve_workorder') && workOrder.value?.approval_status === 'submitted')
const canResubmit = computed(() => workOrder.value?.approval_status === 'rejected')
const canSyncTasks = computed(() => Boolean(userStore.isSuperuser) && Boolean(syncCheck.value?.sync_needed))
const showApprovalSection = computed(() => canApprove.value || canResubmit.value || workOrder.value?.approval_logs?.length || ['draft', 'submitted', 'rejected', 'approved'].includes(workOrder.value?.approval_status))
const listField = (value: any) => Array.isArray(value) ? value.filter(Boolean) : []
const artworkCodes = computed(() => listField(workOrder.value?.artwork_codes))
const artworkNames = computed(() => listField(workOrder.value?.artwork_names))
const dieCodes = computed(() => listField(workOrder.value?.die_codes))
const dieNames = computed(() => listField(workOrder.value?.die_names))
const foilingPlateCodes = computed(() => listField(workOrder.value?.foiling_plate_codes))
const foilingPlateNames = computed(() => listField(workOrder.value?.foiling_plate_names))
const embossingPlateCodes = computed(() => listField(workOrder.value?.embossing_plate_codes))
const embossingPlateNames = computed(() => listField(workOrder.value?.embossing_plate_names))
const hasPrepressResources = computed(() =>
  artworkCodes.value.length > 0 ||
  dieCodes.value.length > 0 ||
  foilingPlateCodes.value.length > 0 ||
  embossingPlateCodes.value.length > 0 ||
  Boolean(workOrder.value?.printing_colors_display || (workOrder.value?.printing_type && workOrder.value.printing_type !== 'none'))
)
const hasTraceFinance = computed(() =>
  listField(workOrder.value?.sales_order_summaries).length > 0 ||
  listField(workOrder.value?.quality_inspection_summaries).length > 0 ||
  listField(workOrder.value?.invoice_summaries).length > 0 ||
  Boolean(workOrder.value?.sales_order_total_amount || workOrder.value?.sales_order_paid_amount || workOrder.value?.sales_order_unpaid_amount || workOrder.value?.invoice_count)
)

onMounted(async () => {
  loading.value = true
  try {
    await loadData()
    loadSelectionOptions()
  } catch (e: any) { useUIStore().showError('加载失败') } finally { loading.value = false }
})

const loadPurchaseOrders = async (workOrderId: any) => {
  try {
    const res: any = await purchaseOrderAPI.getList({ work_order: workOrderId })
    purchaseOrders.value = Array.isArray(res) ? res : (res?.results || [])
  } catch (e: any) { /* 忽略，采购单可能为空 */ }
}

const loadSelectionOptions = async () => {
  try {
    const [materialsRes, processesRes]: any[] = await Promise.all([
      materialAPI.getList({ page_size: 100 }),
      processAPI.getAll({ is_active: true })
    ])
    availableMaterials.value = Array.isArray(materialsRes) ? materialsRes : (materialsRes?.results || [])
    availableProcesses.value = Array.isArray(processesRes) ? processesRes : (processesRes?.results || processesRes?.data || [])
  } catch (e: any) {
    // 候选列表加载失败不影响详情阅读。
  }
}

const handlePrint = () => { printDialog.value = true }
const handleEdit = () => router.push(`/workorders/${route.params.id}/edit`)
const handleStatusChange = async (status: any) => { try { await workOrderAPI.updateStatus(String(route.params.id), status); useUIStore().showSuccess('状态已更新'); loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleApprove = async (payload: any) => {
  try {
    const status = typeof payload === 'string' ? payload : payload?.status
    let result: any
    if (status === 'rejected') {
      result = await workOrderFlowAPI.reject(String(route.params.id), payload)
    } else {
      result = await workOrderFlowAPI.approve(String(route.params.id), payload)
    }
    const generation = result?.task_generation
    if (generation) taskGenerationSummary.value = generation
    const suffix = generation
      ? `，生成 ${generation.created_count || 0} 个任务，分派 ${generation.dispatched_count || 0} 个任务`
      : ''
    useUIStore().showSuccess(`审核完成${suffix}`)
    loadData()
  } catch (e: any) { ErrorHandler.showMessage(e) }
}
const handleResubmit = async () => { try { await workOrderAPI.resubmitForApproval(String(route.params.id)); useUIStore().showSuccess('已重新提交'); loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleProcessClick = (process: any) => console.log('Process clicked', process)
const handleSyncTasks = async () => {
  try {
    const processIds = processList.value.map((item: any) => item.id).filter(Boolean)
    if (!processIds.length) return
    const response: any = await workOrderAPI.syncTasksPreview(String(route.params.id), processIds)
    const preview: any = response?.preview || response || {}
    const blockedCount = Number(preview.tasks_blocked || preview.blocked_task_ids?.length || 0)
    const message = formatSyncPreviewMessage(preview)
    if (!window.confirm(message)) return
    if (blockedCount > 0) {
      useUIStore().showError(`存在 ${blockedCount} 个已开始或已完成任务，不能自动同步删除`)
      return
    }
    const result: any = await workOrderAPI.syncTasksExecute(String(route.params.id), processIds)
    const payload = result?.result || result || {}
    useUIStore().showSuccess(payload.message || `任务同步完成，新增 ${payload.added_count || 0} 个，删除 ${payload.deleted_count || 0} 个，分派 ${payload.dispatched_count || 0} 个`)
    await loadData()
  } catch (e: any) { ErrorHandler.showMessage(e, '同步任务失败') }
}
const handleAddMaterial = async (data: any) => { try { await workOrderAPI.addMaterial(String(route.params.id), data); useUIStore().showSuccess('添加成功'); addMaterialDialog.value = false; loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleAddProcess = async (data: any) => { try { await workOrderAPI.addProcess(String(route.params.id), data); useUIStore().showSuccess('添加成功'); addProcessDialog.value = false; loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const loadData = async () => {
  const res: any = await workOrderAPI.getDetail(String(route.params.id))
  workOrder.value = res
  if (res.task_generation) taskGenerationSummary.value = res.task_generation
  productList.value = res.products || []
  processList.value = res.order_processes || []
  materialList.value = res.materials || []
  await loadSyncCheck()
  if (res.purchase_order_summaries?.length) {
    purchaseOrders.value = res.purchase_order_summaries
  } else {
    purchaseOrders.value = []
    loadPurchaseOrders(String(route.params.id))
  }
}
const loadSyncCheck = async () => {
  syncCheck.value = null
  if (!userStore.isSuperuser || ['approved', 'submitted'].includes(workOrder.value?.approval_status)) return
  try {
    const processIds = processList.value.map((item: any) => item.id).filter(Boolean)
    syncCheck.value = await workOrderAPI.checkSyncNeeded(String(route.params.id), processIds)
  } catch (e: any) {
    syncCheck.value = null
  }
}
const formatSyncPreviewMessage = (preview: any) => {
  const parts = [
    '确认同步工序任务？',
    `将新增任务：${preview.tasks_to_add || 0}`,
    `将删除未开始任务：${preview.tasks_to_remove || 0}`,
    `阻断任务：${preview.tasks_blocked || preview.blocked_task_ids?.length || 0}`,
    `缺失任务工序：${(preview.missing_process_ids || []).join(', ') || '无'}`,
    `移除工序：${(preview.removed_process_ids || []).join(', ') || '无'}`
  ]
  return parts.join('\n')
}
const handleCreatePurchaseOrder = async () => {
  try {
    const result: any = await purchaseOrderAPI.createFromWorkOrder(String(route.params.id))
    const poList = result.purchase_orders || []
    const createdItemCount = result.created_item_count || 0
    const skippedItemCount = result.skipped_item_count || 0
    useUIStore().showSuccess(`已创建 ${poList.length} 个采购单，包含 ${createdItemCount} 个物料明细${skippedItemCount ? `，跳过 ${skippedItemCount} 项` : ''}`)
    await loadData()
  } catch (e: any) {
    ErrorHandler.showMessage(e, '创建采购单失败')
    const text = `${e?.message || ''} ${e?.response?.data?.message || ''}`
    if (text.includes('供应商') && window.confirm('存在物料缺少默认供应商，是否前往物料档案维护？')) {
      router.push('/materials')
    }
  }
}
const handleViewPurchaseOrder = (id: any) => { router.push(id ? `/purchase-orders?purchase_order=${id}` : '/purchase-orders') }
</script>
