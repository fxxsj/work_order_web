<template>
  <div v-loading="loading">
    <div v-if="workOrder" class="card">
      <WorkOrderHeaderActions :can-edit="canEdit" @back="router.back()" @print="handlePrint" @edit="handleEdit" @status-change="handleStatusChange" />
      <WorkOrderBasicInfo :work-order="workOrder" />
      <WorkOrderApproval v-if="canApprove" :work-order="workOrder" :can-approve="canApprove" :can-resubmit="canResubmit" @approve="handleApprove" @resubmit="handleResubmit" />
      <WorkOrderArtworkDie v-if="artworkCodes.length" :artwork-codes="artworkCodes" :die-codes="dieCodes" />
      <WorkOrderProducts v-if="workOrder.products?.length" :products="workOrder.products" />
      <WorkOrderProcessTasks :work-order="workOrder" :processes="processList" :view-mode="'list'" @add-process="addProcessDialog = true" @process-click="handleProcessClick" />
      <WorkOrderMaterials v-if="workOrder.materials?.length" :materials="workOrder.materials" @add-material="addMaterialDialog = true" />
      <WorkOrderNotes v-if="workOrder.notes" :notes="workOrder.notes" />
      <WorkOrderProcurement
        v-if="materialList.length > 0 || purchaseOrders.length > 0"
        :materials="materialList"
        :purchase-orders="purchaseOrders"
        @create-purchase="handleCreatePurchaseOrder"
        @view-purchase="handleViewPurchaseOrder"
      />
    </div>
    <div v-else class="p-10 text-center">施工单不存在或已被删除</div>

    <AddMaterialDialog v-model="addMaterialDialog" :material-list="materialList" @submit="handleAddMaterial" />
    <AddProcessDialog v-model="addProcessDialog" :process-list="allProcesses" @submit="handleAddProcess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { workOrderAPI } from '@/api/modules'
import { purchaseOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import WorkOrderHeaderActions from './components/WorkOrderHeaderActions.vue'
import WorkOrderBasicInfo from './components/WorkOrderBasicInfo.vue'
import WorkOrderApproval from './components/WorkOrderApproval.vue'
import WorkOrderArtworkDie from './components/WorkOrderArtworkDie.vue'
import WorkOrderProducts from './components/WorkOrderProducts.vue'
import WorkOrderProcessTasks from './components/WorkOrderProcessTasks.vue'
import WorkOrderMaterials from './components/WorkOrderMaterials.vue'
import WorkOrderNotes from './components/WorkOrderNotes.vue'
import WorkOrderProcurement from './components/WorkOrderProcurement.vue'
import AddMaterialDialog from './components/AddMaterialDialog.vue'
import AddProcessDialog from './components/AddProcessDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const workOrder = ref<any>(null)
const processList = ref<any[]>([])
const materialList = ref<any[]>([])
const allProcesses = ref<any[]>([])
const addMaterialDialog = ref(false)
const addProcessDialog = ref(false)
const purchaseOrders = ref<any[]>([])
const canEdit = computed(() => userStore.hasPermission('workorder.change_workorder'))
const canApprove = computed(() => userStore.hasPermission('workorder.approve_workorder') && workOrder.value?.approval_status === 'pending')
const canResubmit = computed(() => workOrder.value?.approval_status === 'rejected')
const artworkCodes = computed(() => workOrder.value?.artworks?.map((a: any) => a.code) || [])
const dieCodes = computed(() => workOrder.value?.dies?.map((d: any) => d.code) || [])

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await workOrderAPI.getDetail(String(route.params.id))
    workOrder.value = res
    processList.value = res.order_processes || []
    materialList.value = res.materials || []
    // 加载关联的采购单
    if (res.purchase_order_summaries?.length) {
      purchaseOrders.value = res.purchase_order_summaries
    } else {
      // 兼容：如果 API 没返回，通过 work_order_id 查询
      loadPurchaseOrders(String(route.params.id))
    }
  } catch (e: any) { ElMessage.error('加载失败') } finally { loading.value = false }
})

const loadPurchaseOrders = async (workOrderId: any) => {
  try {
    const res: any = await purchaseOrderAPI.getList({ work_order: workOrderId })
    purchaseOrders.value = res
  } catch (e: any) { /* 忽略，采购单可能为空 */ }
}

const handlePrint = () => window.print()
const handleEdit = () => router.push(`/workorders/${route.params.id}/edit`)
const handleStatusChange = async (status: any) => { try { await workOrderAPI.updateStatus(String(route.params.id), { status }); ElMessage.success('状态已更新'); loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleApprove = async (status: any) => { try { await workOrderAPI.approve(String(route.params.id), { status }); ElMessage.success('审核完成'); loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleResubmit = async () => { try { await workOrderAPI.resubmit(String(route.params.id)); ElMessage.success('已重新提交'); loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleProcessClick = (process: any) => console.log('Process clicked', process)
const handleAddMaterial = async (data: any) => { try { await workOrderAPI.addMaterial(String(route.params.id), data); ElMessage.success('添加成功'); addMaterialDialog.value = false; loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const handleAddProcess = async (data: any) => { try { await workOrderAPI.addProcess(String(route.params.id), data); ElMessage.success('添加成功'); addProcessDialog.value = false; loadData() } catch (e: any) { ErrorHandler.showMessage(e) } }
const loadData = async () => {
  const res: any = await workOrderAPI.getDetail(String(route.params.id))
  workOrder.value = res
  processList.value = res.order_processes || []
  materialList.value = res.materials || []
  if (res.purchase_order_summaries?.length) {
    purchaseOrders.value = res.purchase_order_summaries
  }
}
const handleCreatePurchaseOrder = async () => {
  try {
    const result: any = await purchaseOrderAPI.createFromWorkOrder(String(route.params.id))
    const poList = result.purchase_orders || []
    if (poList.length > 0) {
      ElMessage.success(`已创建 ${poList.length} 个采购单`)
      // 刷新采购单列表
      loadPurchaseOrders(String(route.params.id))
    }
  } catch (e: any) { ErrorHandler.showMessage(e, '创建采购单失败') }
}
const handleViewPurchaseOrder = (id: any) => { router.push('/purchase-orders') }
</script>

