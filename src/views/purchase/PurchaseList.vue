<template>
  <TablePageLayout
    title="采购订单"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索采购订单号"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <SearchInput
          v-model="filters.supplier_name"
          class="w-full sm:w-64"
          placeholder="供应商名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          class="w-full sm:w-36"
          placeholder="状态"
          clearable
          @change="handleSearch"
        />
        <button
          class="btn btn-secondary"
          @click="resetFilters"
        >
          重置
        </button>
      </FilterRow>
    </template>
    
    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          variant="secondary"
          icon="bell"
          @click="showLowStockDialog"
        >
          库存预警
        </BaseButton>
        <BaseButton
          v-if="canCreate"
          variant="primary"
          icon="plus"
          @click="showCreateDialog"
        >
          新建采购订单
        </BaseButton>
      </div>
    </template>

    <template #table>
      <DataTable 
        :columns="columns" 
        :data="tableData" 
        :loading="loading" 
        :row-key="(row: any) => row.id"
        :server-side-sort="true"
        default-sort-key="created_at"
        default-sort-order="desc"
        @sort="handleSort"
      >
        <template #cell-order_number="{ row }">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ row.order_number }}</span>
        </template>
        
        <template #cell-status="{ row }">
          <StatusTag
            :status="['draft', 'submitted', 'rejected'].includes(row.approval_status) ? row.approval_status : row.status"
            category="purchaseOrder"
          />
        </template>
        
        <template #cell-work_order_number="{ row }">
          <span
            v-if="row.work_order_number"
            class="cursor-pointer text-primary-600 hover:underline dark:text-primary-400"
            @click="navigateToWorkOrder(row.work_order_number)"
          >
            {{ row.work_order_number }}<Icon
              name="arrowRight"
              size="sm"
              class="ml-0.5 inline"
            />
          </span>
          <span
            v-else
            class="text-gray-400"
          >-</span>
        </template>
        
        <template #cell-total_amount="{ row }">
          <span class="text-right">¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span>
        </template>
        
        <template #cell-ordered_date="{ row }">
          <span :class="row.ordered_date ? '' : 'text-gray-400'">{{ row.ordered_date || '-' }}</span>
        </template>
        
        <template #cell-expected_date="{ row }">
          <span :class="row.expected_date ? '' : 'text-gray-400'">{{ row.expected_date || '-' }}</span>
        </template>
        
        <template #cell-actual_received_date="{ row }">
          <span :class="row.actual_received_date ? '' : 'text-gray-400'">{{ row.actual_received_date || '-' }}</span>
        </template>
        
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
            <select
              v-if="hasStatusActions(row)"
              class="ml-1 rounded border-gray-300 bg-transparent py-1 pl-2 pr-6 text-xs text-gray-600 outline-none hover:bg-gray-50 dark:border-dark-600 dark:text-gray-400 dark:hover:bg-dark-700"
              @change="(e) => { handleStatusAction((e.target as HTMLSelectElement)?.value || '', row); (e.target as HTMLSelectElement).value = ''; }"
            >
              <option
                value=""
                disabled
                selected
              >
                更多
              </option>
              <option
                v-if="row.approval_status === 'draft'"
                value="submit"
              >
                提交
              </option>
              <option
                v-if="row.approval_status === 'submitted'"
                value="approve"
              >
                批准
              </option>
              <option
                v-if="row.approval_status === 'submitted'"
                value="reject"
              >
                拒绝
              </option>
              <option
                v-if="row.approval_status === 'approved' && row.status === 'pending'"
                value="placeOrder"
              >
                下单
              </option>
              <option
                v-if="row.status === 'ordered'"
                value="receive"
              >
                收货
              </option>
              <option
                v-if="row.status === 'ordered'"
                value="inspection"
              >
                质检
              </option>
              <option
                v-if="['draft', 'submitted', 'approved'].includes(row.approval_status) && !['cancelled', 'received'].includes(row.status)"
                value="cancel"
              >
                取消
              </option>
            </select>
          </div>
        </template>
        
        <template #empty>
          <EmptyState 
            :description="hasFilters ? '未找到匹配的采购订单' : '暂无采购订单数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个采购订单' : undefined"
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
    <PurchaseDetailDialog
      v-model:visible="detailDialogVisible"
      :purchase-id="currentPurchaseId"
      :detail-data="currentDetailData"
      @view-work-order="navigateToWorkOrder"
    />
    <LowStockAlertDialog
      v-model:visible="lowStockDialogVisible"
      @purchase="handleCreateFromLowStock"
    />
    <ReceiveDialog
      v-model:visible="receiveDialogVisible"
      :purchase-order="currentPurchaseOrder"
      :purchase-detail="currentDetailData"
      @success="handleReceiveSuccess"
    />
    <InspectionDialog
      v-model:visible="inspectionDialogVisible"
      :purchase-order-id="currentPurchaseId"
      @updated="loadData"
    />
    
    <ConfirmDialog
      :show="showCancelDialog"
      title="取消确认"
      :message="'确定要取消该采购订单吗？'"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { purchaseOrderAPI, workOrderAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { BaseButton, TablePageLayout, DataTable, EmptyState, SearchInput, Select, Icon, StatusTag, Pagination, ConfirmDialog, FilterRow, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { PurchaseFormDialog, PurchaseDetailDialog, LowStockAlertDialog, ReceiveDialog, InspectionDialog } from './components'

const showEditModal = ref(false)
const formDialogVisible = ref(false)
const submitting = ref(false)
const detailDialogVisible = ref(false)
const router = useRouter()
const lowStockDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const currentPurchaseId = ref<any>(null)
const currentPurchaseOrder = ref<any>(null)
const currentDetailData = ref<any>(null)
const form = reactive({ supplier: null as any, work_order: null as any, work_order_number: '', notes: '', items: [] as any[] })

const showCancelDialog = ref(false)
const canceling = ref(false)
const rowToCancel = ref<any>(null)

const columns: Column[] = [
  { key: 'order_number', label: '采购订单号', sortable: true, class: 'w-36' },
  { key: 'supplier_name', label: '供应商', sortable: true, class: 'w-44' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'work_order_number', label: '关联施工单', sortable: true, class: 'w-36' },
  { key: 'items_count', label: '明细数量', sortable: true, class: 'w-24 text-center' },
  { key: 'total_amount', label: '总金额', sortable: true, class: 'w-28 text-right' },
  { key: 'ordered_date', label: '下单日期', sortable: true, class: 'w-28 text-center' },
  { key: 'expected_date', label: '预计到货', sortable: true, class: 'w-28 text-center' },
  { key: 'actual_received_date', label: '实际到货', sortable: true, class: 'w-28 text-center' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-44' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  supplier_name: 'supplier__name',
  work_order_number: 'work_order__order_number'
}

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已提交' },
  { value: 'approved', label: '已批准' },
  { value: 'pending', label: '待下单' },
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
  initialFilters: { supplier_name: '', status: '' },
  buildParams: (params) => {
    const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
    const ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
    const apiParams: Record<string, any> = { ...params, ordering }
    if (['draft', 'submitted', 'approved', 'rejected'].includes(apiParams.status)) {
      apiParams.approval_status = apiParams.status
      delete apiParams.status
    }
    return apiParams
  }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('purchaseorder')

const showCreateDialog = () => { 
  if (!canCreate.value) return
  router.push('/purchase-orders/create')
}

const showEditDialog = (row: any) => { 
  if (!canEdit.value) return; 
  currentPurchaseId.value = row.id; 
  purchaseOrderAPI.getDetail(row.id).then((res: any) => { 
    Object.assign(form, {
      supplier: (res as any).supplier,
      work_order: (res as any).work_order,
      work_order_number: (res as any).work_order_number,
      notes: (res as any).notes,
      items: (res.items || []).map((item: any) => ({ ...item }))
    }); 
    showEditModal.value = true;
    formDialogVisible.value = true
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
      useUIStore().showSuccess('更新成功') 
    } else { 
      await purchaseOrderAPI.create(data); 
      useUIStore().showSuccess('创建成功') 
    } 
    closeFormDialog(); 
    loadData() 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, showEditModal.value ? '更新失败' : '创建失败') 
  } finally {
    submitting.value = false
  } 
}

const resetForm = () => { Object.assign(form, { supplier: null, work_order: null, work_order_number: '', notes: '', items: [] }) }

const closeFormDialog = () => {
  formDialogVisible.value = false
  showEditModal.value = false
  currentPurchaseId.value = null
  resetForm()
}

const hasStatusActions = (row: any) => ['draft', 'submitted', 'approved'].includes(row.approval_status) || ['ordered'].includes(row.status)

const handleStatusAction = async (cmd: any, row: any) => {
  if (!cmd) return
  try {
    switch (cmd) {
      case 'submit': await purchaseOrderAPI.submit(row.id); useUIStore().showSuccess('提交成功'); break
      case 'approve': await purchaseOrderAPI.approve(row.id); useUIStore().showSuccess('批准成功'); break
      case 'reject': await purchaseOrderAPI.reject(row.id); useUIStore().showSuccess('拒绝成功'); break
      case 'placeOrder': await purchaseOrderAPI.placeOrder(row.id); useUIStore().showSuccess('下单成功'); break
      case 'receive': await openReceiveDialog(row); return
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
    useUIStore().showSuccess('取消成功')
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
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: row.approval_status === 'draft' && canEdit.value }
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

const openReceiveDialog = async (row: any) => {
  try {
    currentPurchaseOrder.value = row
    currentPurchaseId.value = row.id
    currentDetailData.value = await purchaseOrderAPI.getDetail(row.id)
    receiveDialogVisible.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载采购订单详情')
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const navigateToWorkOrder = (workOrderNumber: any) => {
  workOrderAPI.getList({ search: workOrderNumber, approval_status: '' }).then(res => {
    const list = Array.isArray(res) ? res : ((res as any)?.results || (res as any)?.data || [])
    const matched = list.find((wo: any) => wo.order_number === workOrderNumber)
    if (matched) {
      router.push(`/workorders/${matched.id}`)
    } else {
      useUIStore().showError('未找到施工单 ' + workOrderNumber)
    }
  }).catch(() => useUIStore().showError('跳转失败'))
}

onMounted(() => { loadData() })
</script>
