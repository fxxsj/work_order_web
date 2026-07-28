import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useUserStore } from '@/stores'
import { useApprovalConfigStore } from '@/stores/approvalConfig'
import { materialAPI, processAPI, supplierAPI, workOrderAPI, workOrderFlowAPI } from '@/api/modules'
import { purchaseOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

export function useWorkOrderDetail() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const approvalConfigStore = useApprovalConfigStore()

  const loading = ref(false)
  const workOrder = ref<any>(null)
  const processList = ref<any[]>([])
  const materialList = ref<any[]>([])
  const productList = ref<any[]>([])
  const availableMaterials = ref<any[]>([])
  const planningStockMaterials = ref<any[]>([])
  const planningSuppliers = ref<any[]>([])
  const availableProcesses = ref<any[]>([])
  const addMaterialDialog = ref(false)
  const addProcessDialog = ref(false)
  const printDialog = ref(false)
  const materialPlanDialog = ref(false)
  const materialPlanLoading = ref(false)
  const selectedMaterialPlan = ref<any>(null)
  const purchaseOrders = ref<any[]>([])
  const syncCheck = ref<any>(null)
  const taskGenerationSummary = ref<any>(null)
  const completenessErrors = ref<string[]>([])
  const submittingApproval = ref(false)

  const canEdit = computed(() => userStore.hasPermission('workorder.change_workorder'))
  const canSubmitApproval = computed(() =>
    approvalConfigStore.isEnabled('workorder') &&
    userStore.hasPermission('workorder.change_workorder') &&
    workOrder.value?.approval_status === 'draft'
  )
  const canApprove = computed(() =>
    approvalConfigStore.isEnabled('workorder') &&
    userStore.hasPermission('workorder.approve_workorder') &&
    workOrder.value?.approval_status === 'submitted'
  )
  const canResubmit = computed(() =>
    approvalConfigStore.isEnabled('workorder') &&
    workOrder.value?.approval_status === 'rejected'
  )
  const canSyncTasks = computed(() => Boolean(userStore.isSuperuser) && Boolean(syncCheck.value?.sync_needed))
  const showApprovalSection = computed(() =>
    canSubmitApproval.value ||
    canApprove.value ||
    canResubmit.value ||
    workOrder.value?.approval_logs?.length ||
    ['draft', 'submitted', 'rejected', 'approved'].includes(workOrder.value?.approval_status)
  )

  const listField = (value: any) => (Array.isArray(value) ? value.filter(Boolean) : [])
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
    Boolean(
      workOrder.value?.sales_order_total_amount ||
      workOrder.value?.sales_order_paid_amount ||
      workOrder.value?.sales_order_unpaid_amount ||
      workOrder.value?.invoice_count
    )
  )

  const withErrorHandler = async (fn: () => Promise<void>, context?: string) => {
    try {
      await fn()
    } catch (e: any) {
      ErrorHandler.showMessage(e, context)
    }
  }

  const loadPurchaseOrders = async (workOrderId: any) => {
    try {
      const res: any = await purchaseOrderAPI.getList({ work_order: workOrderId })
      purchaseOrders.value = Array.isArray(res) ? res : (res?.results || [])
    } catch (_e: any) {
      /* 忽略，采购单可能为空 */
    }
  }

  const loadSelectionOptions = async () => {
    try {
      const [materialsRes, stockMaterialsRes, suppliersRes, processesRes]: any[] = await Promise.all([
        materialAPI.getList({ page_size: 100 }),
        materialAPI.getList({
          page_size: 200,
          specification_level: 'stock',
          is_active: true
        }),
        supplierAPI.getList({ page_size: 100, status: 'active' }),
        processAPI.getAll({ is_active: true })
      ])
      availableMaterials.value = Array.isArray(materialsRes) ? materialsRes : (materialsRes?.results || [])
      planningStockMaterials.value = Array.isArray(stockMaterialsRes)
        ? stockMaterialsRes
        : (stockMaterialsRes?.results || [])
      planningSuppliers.value = Array.isArray(suppliersRes)
        ? suppliersRes
        : (suppliersRes?.results || [])
      availableProcesses.value = Array.isArray(processesRes) ? processesRes : (processesRes?.results || processesRes?.data || [])
    } catch (_e: any) {
      // 候选列表加载失败不影响详情阅读。
    }
  }

  const loadSyncCheck = async () => {
    syncCheck.value = null
    if (!userStore.isSuperuser || ['approved', 'submitted'].includes(workOrder.value?.approval_status)) return
    try {
      const processIds = processList.value.map((item: any) => item.id).filter(Boolean)
      syncCheck.value = await workOrderAPI.checkSyncNeeded(String(route.params.id), processIds)
    } catch (_e: any) {
      syncCheck.value = null
    }
  }

  const loadData = async () => {
    const res: any = await workOrderAPI.getDetail(String(route.params.id))
    workOrder.value = res
    if (res.task_generation) taskGenerationSummary.value = res.task_generation
    productList.value = res.products || []
    processList.value = res.order_processes || []
    materialList.value = res.materials || []
    await loadSyncCheck()

    if (res.approval_status === 'draft' || res.approval_status === 'rejected') {
      try {
        const checkRes: any = await workOrderAPI.checkCompleteness(String(route.params.id))
        completenessErrors.value = Array.isArray(checkRes?.errors) ? checkRes.errors : []
      } catch {
        completenessErrors.value = []
      }
    } else {
      completenessErrors.value = []
    }

    if (res.purchase_order_summaries?.length) {
      purchaseOrders.value = res.purchase_order_summaries
    } else {
      purchaseOrders.value = []
      loadPurchaseOrders(String(route.params.id))
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

  const handlePrint = () => { printDialog.value = true }
  const handleEdit = () => router.push(`/workorders/${route.params.id}/edit`)

  const handleStatusChange = async (status: any) => {
    await withErrorHandler(async () => {
      await workOrderAPI.updateStatus(String(route.params.id), status)
      useUIStore().showSuccess('状态已更新')
      loadData()
    })
  }

  const handleApprove = async (payload: any) => {
    await withErrorHandler(async () => {
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
    })
  }

  const handleSubmitApproval = async () => {
    submittingApproval.value = true
    await withErrorHandler(async () => {
      await workOrderFlowAPI.submitApproval(String(route.params.id), {})
      useUIStore().showSuccess('已提交审核')
      loadData()
    })
    submittingApproval.value = false
  }

  const handleResubmit = async () => {
    await withErrorHandler(async () => {
      await workOrderAPI.resubmitForApproval(String(route.params.id))
      useUIStore().showSuccess('已重新提交')
      loadData()
    })
  }

  const handleProcessClick = (process: any) => console.log('Process clicked', process)

  const handleSyncTasks = async () => {
    await withErrorHandler(async () => {
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
    }, '同步任务失败')
  }

  const handleAddMaterial = async (data: any) => {
    await withErrorHandler(async () => {
      await workOrderAPI.addMaterial(String(route.params.id), data)
      useUIStore().showSuccess('添加成功')
      addMaterialDialog.value = false
      loadData()
    })
  }

  const handleAddProcess = async (data: any) => {
    await withErrorHandler(async () => {
      await workOrderAPI.addProcess(String(route.params.id), data)
      useUIStore().showSuccess('添加成功')
      addProcessDialog.value = false
      loadData()
    })
  }

  const handleCreatePurchaseOrder = async () => {
    await withErrorHandler(async () => {
      const result: any = await purchaseOrderAPI.createFromWorkOrder(String(route.params.id))
      const poList = result.purchase_orders || []
      const createdItemCount = result.created_item_count || 0
      const skippedItemCount = result.skipped_item_count || 0
      const blockedItemCount = result.blocked_item_count || 0
      const summary = `已创建 ${poList.length} 个采购单，包含 ${createdItemCount} 个物料明细${skippedItemCount ? `，跳过 ${skippedItemCount} 项` : ''}${blockedItemCount ? `，${blockedItemCount} 项待处理` : ''}`
      if (!poList.length && blockedItemCount) useUIStore().showWarning(summary)
      else useUIStore().showSuccess(summary)
      await loadData()
    }, '创建采购单失败')
  }

  const handleViewPurchaseOrder = (id: any) => {
    router.push(id ? `/purchase-orders?purchase_order=${id}` : '/purchase-orders')
  }

  const refreshSelectedMaterialPlan = () => {
    if (!selectedMaterialPlan.value?.id) return
    selectedMaterialPlan.value = materialList.value.find(
      (item: any) => item.id === selectedMaterialPlan.value.id
    ) || selectedMaterialPlan.value
  }

  const handlePlanMaterial = (material: any) => {
    selectedMaterialPlan.value = material
    materialPlanDialog.value = true
  }

  const handleCalculateMaterialPlan = async (payload: any) => {
    materialPlanLoading.value = true
    try {
      await workOrderAPI.calculateMaterialPlan(selectedMaterialPlan.value.id, payload)
      await loadData()
      refreshSelectedMaterialPlan()
      useUIStore().showSuccess('物料计划计算完成，请核对后确认')
    } catch (error: any) {
      ErrorHandler.showMessage(error, '物料计划计算失败')
    } finally {
      materialPlanLoading.value = false
    }
  }

  const handleResolveMaterialSpecification = async (payload: any) => {
    materialPlanLoading.value = true
    try {
      await workOrderAPI.resolveMaterialSpecification(selectedMaterialPlan.value.id, payload)
      await loadData()
      refreshSelectedMaterialPlan()
      useUIStore().showSuccess('具体物料规格已选择，请核对后确认')
    } catch (error: any) {
      ErrorHandler.showMessage(error, '物料规格确认失败')
    } finally {
      materialPlanLoading.value = false
    }
  }

  const handleConfirmMaterialPlan = async () => {
    materialPlanLoading.value = true
    try {
      await workOrderAPI.confirmMaterialPlan(selectedMaterialPlan.value.id)
      await loadData()
      refreshSelectedMaterialPlan()
      useUIStore().showSuccess('物料计划已确认，库存已预留')
    } catch (error: any) {
      ErrorHandler.showMessage(error, '确认物料计划失败')
    } finally {
      materialPlanLoading.value = false
    }
  }

  const handleInvalidateMaterialPlan = async (reason: string) => {
    materialPlanLoading.value = true
    try {
      await workOrderAPI.invalidateMaterialPlan(selectedMaterialPlan.value.id, reason)
      await loadData()
      refreshSelectedMaterialPlan()
      useUIStore().showSuccess('物料计划已作废，库存预留已释放')
    } catch (error: any) {
      ErrorHandler.showMessage(error, '作废物料计划失败')
    } finally {
      materialPlanLoading.value = false
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await loadData()
      loadSelectionOptions()
    } catch (_e: any) {
      useUIStore().showError('加载失败')
    } finally {
      loading.value = false
    }
  })

  return {
    router,
    route,
    loading,
    workOrder,
    processList,
    materialList,
    productList,
    availableMaterials,
    planningStockMaterials,
    planningSuppliers,
    availableProcesses,
    addMaterialDialog,
    addProcessDialog,
    printDialog,
    materialPlanDialog,
    materialPlanLoading,
    selectedMaterialPlan,
    purchaseOrders,
    syncCheck,
    taskGenerationSummary,
    completenessErrors,
    canEdit,
    canSubmitApproval,
    canApprove,
    canResubmit,
    canSyncTasks,
    submittingApproval,
    showApprovalSection,
    artworkCodes,
    artworkNames,
    dieCodes,
    dieNames,
    foilingPlateCodes,
    foilingPlateNames,
    embossingPlateCodes,
    embossingPlateNames,
    hasPrepressResources,
    hasTraceFinance,
    loadData,
    loadSelectionOptions,
    loadPurchaseOrders,
    loadSyncCheck,
    handlePrint,
    handleEdit,
    handleStatusChange,
    handleApprove,
    handleSubmitApproval,
    handleResubmit,
    handleProcessClick,
    handleSyncTasks,
    handleAddMaterial,
    handleAddProcess,
    handleCreatePurchaseOrder,
    handleViewPurchaseOrder,
    handlePlanMaterial,
    handleCalculateMaterialPlan,
    handleResolveMaterialSpecification,
    handleConfirmMaterialPlan,
    handleInvalidateMaterialPlan,
    formatSyncPreviewMessage
  }
}
