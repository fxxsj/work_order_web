<template>
  <TablePageLayout
    title="采购订单"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput v-model="searchText" class="w-full sm:w-64" placeholder="搜索采购单号" @search="handleSearch" @clear="handleSearch" />
        <SearchInput v-model="filters.supplier_name" class="w-full sm:w-64" placeholder="供应商名称" @search="handleSearch" @clear="handleSearch" />
        <Select v-model="filters.status" :options="statusOptions" class="w-40" placeholder="状态" clearable @change="handleSearch" />
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
      </FilterRow>
    </template>
    
    <template #actions>
      <div class="flex justify-end gap-3">
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button class="btn btn-secondary" @click="showLowStockDialog">
          <Icon name="bell" size="md" class="mr-2" />
          库存预警
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
          <Icon name="plus" size="md" class="mr-2" />
          新增采购单
        </button>
      </div>
    </template>

    <template #table>
      <DataTable 
        :columns="columns" 
        :data="tableData" 
        :loading="loading" 
        :row-key="(row: any) => row.id"
      >
        <template #cell-order_number="{ row }">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ row.order_number }}</span>
        </template>
        
        <template #cell-status="{ row }">
          <StatusTag :status="row.status" category="purchaseOrder" :label="row.status_display" />
        </template>
        
        <template #cell-work_order_number="{ row }">
          <span v-if="row.work_order_number" class="cursor-pointer text-primary-600 hover:underline dark:text-primary-400" @click="navigateToWorkOrder(row.work_order_number)">
            {{ row.work_order_number }}<Icon name="arrowRight" size="sm" class="ml-0.5 inline" />
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
        
        <template #cell-total_amount="{ row }">
          <span class="text-right">¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span>
        </template>
        
        <template #cell-received_date="{ row }">
          <span :class="row.received_date ? '' : 'text-gray-400'">{{ row.received_date || '-' }}</span>
        </template>
        
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
            <select v-if="hasStatusActions(row)" class="ml-1 rounded border-gray-300 bg-transparent py-1 pl-2 pr-6 text-xs text-gray-600 outline-none hover:bg-gray-50 dark:border-dark-600 dark:text-gray-400 dark:hover:bg-dark-700" @change="(e) => { handleStatusAction((e.target as HTMLSelectElement)?.value || '', row); (e.target as HTMLSelectElement).value = ''; }">
              <option value="" disabled selected>更多</option>
              <option v-if="row.status === 'draft'" value="submit">提交</option>
              <option v-if="row.status === 'submitted'" value="approve">批准</option>
              <option v-if="row.status === 'submitted'" value="reject">拒绝</option>
              <option v-if="row.status === 'approved'" value="placeOrder">下单</option>
              <option v-if="row.status === 'ordered'" value="receive">收货</option>
              <option v-if="row.status === 'ordered'" value="inspection">质检</option>
              <option v-if="['draft', 'submitted', 'approved'].includes(row.status)" value="cancel">取消</option>
            </select>
          </div>
        </template>
        
        <template #empty>
          <EmptyState 
            :description="hasFilters ? '未找到匹配的采购单' : '暂无采购单数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个采购单' : undefined"
            @action="showCreateDialog" 
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        :total="total"
        :page="currentPage"
        :page-size="pageSize"
        @update:page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </template>

    <PurchaseFormDialog
      v-model:visible="formDialogVisible"
      :form-data="form"
      :is-edit="showEditModal"
      :submitting="submitting"
      @confirm="handleFormConfirm"
      @close="closeFormDialog"
    />
    <PurchaseDetailDialog v-model:visible="detailDialogVisible" :purchase-id="currentPurchaseId" :detail-data="currentDetailData" @view-work-order="navigateToWorkOrder" />
    <LowStockAlertDialog v-model:visible="lowStockDialogVisible" @create-purchase="handleCreateFromLowStock" />
    <ReceiveDialog v-model:visible="receiveDialogVisible" :purchase-order="currentPurchaseOrder" @success="handleReceiveSuccess" />
    <InspectionDialog v-model:visible="inspectionDialogVisible" :purchase-order-id="currentPurchaseId" @updated="loadData" />
    
    <ConfirmDialog
      :show="showCancelDialog"
      title="取消确认"
      :message="'确定要取消该采购单吗？'"
      confirm-text="确定"
      cancel-text="取消"
      :danger="true"
      :loading="canceling"
      loading-text="取消中..."
      @confirm="executeCancel"
      @cancel="cancelCancelDialog"
    />
  </TablePageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { purchaseOrderAPI, workOrderAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Select, Icon, StatusTag, Pagination, ConfirmDialog, FilterRow, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { PurchaseFormDialog, PurchaseDetailDialog, LowStockAlertDialog, ReceiveDialog, InspectionDialog } from './components'

const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const detailDialogVisible = ref(false)
const router = useRouter()
const lowStockDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const currentPurchaseId = ref<any>(null)
const currentPurchaseOrder = ref<any>(null)
const currentDetailData = ref<any>(null)
const form = reactive({ supplier: null as any, work_order_number: '', notes: '', items: [] as any[] })

const showCancelDialog = ref(false)
const canceling = ref(false)
const rowToCancel = ref<any>(null)

const formDialogVisible = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (visible: boolean) => {
    if (!visible) closeFormDialog()
  }
})

const columns: Column[] = [
  { key: 'order_number', label: '采购单号', sortable: true, class: 'w-36' },
  { key: 'supplier_name', label: '供应商', sortable: true, class: 'w-44' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'work_order_number', label: '关联施工单', sortable: true, class: 'w-36' },
  { key: 'items_count', label: '明细数量', sortable: false, class: 'w-24 text-center' },
  { key: 'total_amount', label: '总金额', sortable: true, class: 'w-28 text-right' },
  { key: 'order_date', label: '下单日期', sortable: true, class: 'w-28 text-center' },
  { key: 'expected_date', label: '预计到货', sortable: true, class: 'w-28 text-center' },
  { key: 'received_date', label: '实际到货', sortable: true, class: 'w-28 text-center' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-44' }
]

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已提交' },
  { value: 'approved', label: '已批准' },
  { value: 'ordered', label: '已下单' },
  { value: 'received', label: '已收货' },
  { value: 'cancelled', label: '已取消' }
]

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters,
  hasFilters
} = useCrudList(purchaseOrderAPI, 'getList', {
  initialFilters: { supplier_name: '', status: '' }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('purchaseorder')

const showCreateDialog = () => { 
  if (!canCreate.value) return; 
  showEditModal.value = false;
  currentPurchaseId.value = null;
  Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }); 
  showCreateModal.value = true 
}

const showEditDialog = (row: any) => { 
  if (!canEdit.value) return; 
  currentPurchaseId.value = row.id; 
  purchaseOrderAPI.getDetail(row.id).then((res: any) => { 
    Object.assign(form, { supplier: (res as any).supplier, work_order_number: (res as any).work_order_number, notes: (res as any).notes, items: res.items || [] }); 
    showCreateModal.value = false;
    showEditModal.value = true 
  }).catch(e => ErrorHandler.showMessage(e, '加载详情')) 
}

const handleView = (row: any) => { 
  currentPurchaseId.value = row.id; 
  detailDialogVisible.value = true; 
  purchaseOrderAPI.getDetail(row.id).then((res: any) => { 
    currentDetailData.value = res 
  }).catch(() => { 
    currentDetailData.value = null 
  }) 
}

const handleFormConfirm = async (data: any) => { 
  submitting.value = true
  try { 
    if (showEditModal.value) { 
      await purchaseOrderAPI.update(currentPurchaseId.value, data); 
      ElMessage.success('更新成功') 
    } else { 
      await purchaseOrderAPI.create(data); 
      ElMessage.success('创建成功') 
    } 
    closeFormDialog(); 
    loadData() 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, showEditModal.value ? '更新失败' : '创建失败') 
  } finally {
    submitting.value = false
  } 
}

const resetForm = () => { Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }) }

const closeFormDialog = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentPurchaseId.value = null
  resetForm()
}

const hasStatusActions = (row: any) => ['draft', 'submitted', 'approved', 'ordered'].includes(row.status)

const handleStatusAction = async (cmd: any, row: any) => {
  if (!cmd) return
  try {
    switch (cmd) {
      case 'submit': await purchaseOrderAPI.submit(row.id); ElMessage.success('提交成功'); break
      case 'approve': await purchaseOrderAPI.approve(row.id); ElMessage.success('批准成功'); break
      case 'reject': await purchaseOrderAPI.reject(row.id); ElMessage.success('拒绝成功'); break
      case 'placeOrder': await purchaseOrderAPI.placeOrder(row.id); ElMessage.success('下单成功'); break
      case 'receive': currentPurchaseOrder.value = row; receiveDialogVisible.value = true; return
      case 'inspection': currentPurchaseId.value = row.id; inspectionDialogVisible.value = true; return
      case 'cancel': 
        rowToCancel.value = row;
        showCancelDialog.value = true;
        return
    }
    loadData()
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '操作失败') 
  }
}

const executeCancel = async () => {
  if (!rowToCancel.value) return;
  canceling.value = true
  try {
    await purchaseOrderAPI.cancel(rowToCancel.value.id)
    ElMessage.success('取消成功')
    showCancelDialog.value = false;
    rowToCancel.value = null
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '操作失败')
  } finally {
    canceling.value = false
  }
}

const cancelCancelDialog = () => {
  if (canceling.value) return
  showCancelDialog.value = false
  rowToCancel.value = null
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: row.status === 'draft' && canEdit.value }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'edit': showEditDialog(row); break
  }
}

const handleReceiveSuccess = () => { receiveDialogVisible.value = false; loadData() }
const handleCreateFromLowStock = (data: any) => { lowStockDialogVisible.value = false; showCreateDialog() }
const showLowStockDialog = () => { lowStockDialogVisible.value = true }

const navigateToWorkOrder = (workOrderNumber: any) => {
  workOrderAPI.getList({ search: workOrderNumber, approval_status: '' }).then(res => {
    const list = Array.isArray(res) ? res : ((res as any)?.results || (res as any)?.data || [])
    const matched = list.find((wo: any) => wo.order_number === workOrderNumber)
    if (matched) {
      router.push(`/workorders/${matched.id}`)
    } else {
      ElMessage.error('未找到施工单 ' + workOrderNumber)
    }
  }).catch(() => ElMessage.error('跳转失败'))
}

onMounted(() => { loadData() })
</script>
