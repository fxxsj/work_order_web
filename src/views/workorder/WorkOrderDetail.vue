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
        :completeness-errors="completenessErrors"
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
        @plan-material="handlePlanMaterial"
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
    <MaterialPlanDialog
      :show="materialPlanDialog"
      :material="selectedMaterialPlan"
      :stock-materials="planningStockMaterials"
      :artworks="workOrder?.artwork_details || []"
      :loading="materialPlanLoading"
      @close="materialPlanDialog = false"
      @calculate="handleCalculateMaterialPlan"
      @confirm="handleConfirmMaterialPlan"
      @invalidate="handleInvalidateMaterialPlan"
    />
  </div>
</template>

<script setup lang="ts">
import { BaseDialog, LoadingOverlay } from '@/components/common'
import {
  WorkOrderHeaderActions,
  WorkOrderBasicInfo,
  WorkOrderProducts,
  WorkOrderProcessTasks,
  WorkOrderMaterials
} from '@/components/workorder'
import { useWorkOrderDetail } from '@/composables'
import WorkOrderApproval from './components/WorkOrderApproval.vue'
import WorkOrderArtworkDie from './components/WorkOrderArtworkDie.vue'
import WorkOrderNotes from './components/WorkOrderNotes.vue'
import WorkOrderProcurement from './components/WorkOrderProcurement.vue'
import WorkOrderTraceFinance from './components/WorkOrderTraceFinance.vue'
import WorkOrderPrint from './components/WorkOrderPrint.vue'
import MaterialPlanDialog from './components/MaterialPlanDialog.vue'
import AddMaterialDialog from './components/AddMaterialDialog.vue'
import AddProcessDialog from './components/AddProcessDialog.vue'

const {
  router,
  loading,
  workOrder,
  processList,
  materialList,
  productList,
  availableMaterials,
  planningStockMaterials,
  availableProcesses,
  addMaterialDialog,
  addProcessDialog,
  printDialog,
  materialPlanDialog,
  materialPlanLoading,
  selectedMaterialPlan,
  purchaseOrders,
  taskGenerationSummary,
  completenessErrors,
  canEdit,
  canApprove,
  canResubmit,
  canSyncTasks,
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
  handlePrint,
  handleEdit,
  handleStatusChange,
  handleApprove,
  handleResubmit,
  handleProcessClick,
  handleSyncTasks,
  handleAddMaterial,
  handleAddProcess,
  handleCreatePurchaseOrder,
  handleViewPurchaseOrder,
  handlePlanMaterial,
  handleCalculateMaterialPlan,
  handleConfirmMaterialPlan,
  handleInvalidateMaterialPlan
} = useWorkOrderDetail()
</script>
