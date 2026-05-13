<template>
  <div v-loading="loading" class="workorder-detail">
    <el-card v-if="workOrder">
      <WorkOrderHeaderActions :can-edit="canEdit" @back="router.back()" @print="handlePrint" @edit="handleEdit" @status-change="handleStatusChange" />
      <WorkOrderBasicInfo :work-order="workOrder" />
      <WorkOrderApproval v-if="canApprove" :work-order="workOrder" :can-approve="canApprove" :can-resubmit="canResubmit" @approve="handleApprove" @resubmit="handleResubmit" />
      <WorkOrderArtworkDie v-if="artworkCodes.length" :artwork-codes="artworkCodes" :die-codes="dieCodes" />
      <WorkOrderProducts v-if="workOrder.products?.length" :products="workOrder.products" />
      <WorkOrderProcessTasks :work-order="workOrder" :processes="processList" :view-mode="'list'" @add-process="addProcessDialog = true" @process-click="handleProcessClick" />
      <WorkOrderMaterials v-if="workOrder.materials?.length" :materials="workOrder.materials" @add-material="addMaterialDialog = true" />
      <WorkOrderNotes v-if="workOrder.notes" :notes="workOrder.notes" />
    </el-card>
    <div v-else style="padding: 40px; text-align: center;">施工单不存在或已被删除</div>
    
    <AddMaterialDialog v-model="addMaterialDialog" :material-list="materialList" @submit="handleAddMaterial" />
    <AddProcessDialog v-model="addProcessDialog" :process-list="allProcesses" @submit="handleAddProcess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { workOrderAPI } from '@/api/modules'
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
import AddMaterialDialog from './components/AddMaterialDialog.vue'
import AddProcessDialog from './components/AddProcessDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const workOrder = ref(null)
const processList = ref([])
const materialList = ref([])
const allProcesses = ref([])
const addMaterialDialog = ref(false)
const addProcessDialog = ref(false)
const canEdit = computed(() => userStore.hasPermission('workorder.change_workorder'))
const canApprove = computed(() => userStore.hasPermission('workorder.approve_workorder') && workOrder.value?.approval_status === 'pending')
const canResubmit = computed(() => workOrder.value?.approval_status === 'rejected')
const artworkCodes = computed(() => workOrder.value?.artworks?.map(a => a.code) || [])
const dieCodes = computed(() => workOrder.value?.dies?.map(d => d.code) || [])

onMounted(async () => {
  loading.value = true
  try { const res = await workOrderAPI.getDetail(route.params.id); workOrder.value = res; processList.value = res.order_processes || [] } catch (e) { ElMessage.error('加载失败') } finally { loading.value = false }
})

const handlePrint = () => window.print()
const handleEdit = () => router.push(`/workorders/${route.params.id}/edit`)
const handleStatusChange = async (status) => { try { await workOrderAPI.updateStatus(route.params.id, { status }); ElMessage.success('状态已更新'); loadData() } catch (e) { ErrorHandler.showMessage(e) } }
const handleApprove = async (status) => { try { await workOrderAPI.approve(route.params.id, { status }); ElMessage.success('审核完成'); loadData() } catch (e) { ErrorHandler.showMessage(e) } }
const handleResubmit = async () => { try { await workOrderAPI.resubmit(route.params.id); ElMessage.success('已重新提交'); loadData() } catch (e) { ErrorHandler.showMessage(e) } }
const handleProcessClick = (process) => console.log('Process clicked', process)
const handleAddMaterial = async (data) => { try { await workOrderAPI.addMaterial(route.params.id, data); ElMessage.success('添加成功'); addMaterialDialog.value = false; loadData() } catch (e) { ErrorHandler.showMessage(e) } }
const handleAddProcess = async (data) => { try { await workOrderAPI.addProcess(route.params.id, data); ElMessage.success('添加成功'); addProcessDialog.value = false; loadData() } catch (e) { ErrorHandler.showMessage(e) } }
const loadData = async () => { const res = await workOrderAPI.getDetail(route.params.id); workOrder.value = res }
</script>

<style scoped>
.workorder-detail { padding: 20px; }
</style>
