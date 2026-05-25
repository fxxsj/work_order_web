<template>
  <div class="space-y-6">
    <DeliveryStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <FilterRow>
          <Select
            v-model="filters.customer"
            :options="customerOptions"
            class="w-40"
            placeholder="选择客户"
            clearable
            filterable
            @change="handleSearch"
          />
          <Select
            v-model="filters.status"
            :options="statusOptions"
            class="w-36"
            placeholder="发货状态"
            clearable
            @change="handleSearch"
          />
          <SearchInput
            v-model="filters.tracking_number"
            placeholder="搜索物流单号"
            class="w-full sm:w-64"
            @search="handleSearchDebounced"
            @clear="handleSearch"
          />
        </FilterRow>
      </template>
      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            :disabled="loading"
            title="刷新"
            @click="loadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
          </button>
          <button
            v-if="canCreate"
            class="btn btn-primary"
            @click="handleCreate"
          >
            <Icon
              name="plus"
              size="md"
              class="mr-2"
            />
            新建发货单
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
            <span>{{ row.order_number }}</span>
          </template>
          <template #cell-customer_name="{ row }">
            <span>{{ row.customer_name }}</span>
          </template>
          <template #cell-sales_order_number="{ row }">
            <span>{{ row.sales_order_number }}</span>
          </template>
          <template #cell-receiver_name="{ row }">
            <span>{{ row.receiver_name }}</span>
          </template>
          <template #cell-receiver_phone="{ row }">
            <span>{{ row.receiver_phone }}</span>
          </template>
          <template #cell-delivery_address="{ row }">
            <span class="truncate max-w-xs block">{{ row.delivery_address }}</span>
          </template>
          <template #cell-logistics_company="{ row }">
            <span>{{ row.logistics_company }}</span>
          </template>
          <template #cell-tracking_number="{ row }">
            <a
              v-if="row.tracking_number"
              :href="getTrackingUrl(row)"
              target="_blank"
              class="text-primary hover:underline"
            >{{ row.tracking_number }}</a>
            <span v-else>-</span>
          </template>
          <template #cell-delivery_date="{ row }">
            <span>{{ row.delivery_date }}</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="delivery"
              :label="row.status_display"
            />
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无发货单数据">
              <template #action>
                <button
                  v-if="hasFilters"
                  class="btn btn-primary"
                  @click="handleReset"
                >
                  重置筛选
                </button>
                <button
                  v-else-if="canCreate"
                  class="btn btn-primary"
                  @click="handleCreate"
                >
                  创建第一个发货单
                </button>
              </template>
            </EmptyState>
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          :page="currentPage"
          :page-size="pageSize"
          :total="total"
          @update:page="handlePageChange"
          @update:page-size="handleSizeChange"
        />
      </template>
    </TablePageLayout>

    <DeliveryDetailDialog
      v-model:visible="detailDialogVisible"
      :data="currentDelivery"
    />
    <DeliveryReceiveDialog
      v-model:visible="receiveDialogVisible"
      :delivery="currentDelivery"
      :loading="receiving"
      @confirm="handleConfirmReceive"
    />
    <DeliveryFormDialog
      v-model:visible="formDialogVisible"
      :is-edit="showEditModal"
      :submitting="submitting"
      :form="form"
      :customer-list="customerList"
      :sales-order-list="salesOrderList"
      :product-list="productList"
      @submit="handleSubmit"
      @sales-order-change="handleSalesOrderChange"
      @customer-change="handleCustomerChange"
    />

    <ConfirmDialog
      :show="showShipDialog"
      title="发货确认"
      :message="`确定要将发货单「${selectedRowAction?.order_number}」状态更新为发货吗？`"
      confirm-text="确认发货"
      cancel-text="取消"
      :loading="shipping"
      loading-text="发货中..."
      @confirm="handleShip"
      @cancel="cancelShip"
    />

    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除确认"
      :message="`确定要删除发货单「${selectedRowAction?.order_number}」吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      :danger="true"
      :loading="deleting"
      loading-text="删除中..."
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { deliveryOrderAPI, salesOrderAPI, productAPI, customerAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, Icon, TablePageLayout, DataTable, EmptyState, SearchInput, Pagination, ConfirmDialog, FilterRow, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { DeliveryStats } from '@/components/inventory'
import DeliveryDetailDialog from './components/DeliveryDetailDialog.vue'
import DeliveryReceiveDialog from './components/DeliveryReceiveDialog.vue'
import DeliveryFormDialog from './components/DeliveryFormDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('deliveryorder')

const statsLoading = ref(false)
const submitting = ref(false)
const receiving = ref(false)
const shipping = ref(false)
const deleting = ref(false)
const customerList = ref<any[]>([])
const salesOrderList = ref<any[]>([])
const productList = ref<any[]>([])
const currentDelivery = ref<any>(null)
const stats = ref({})

// Dialog states
const detailDialogVisible = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const receiveDialogVisible = ref(false)
const showDeleteDialog = ref(false)
const showShipDialog = ref(false)
const selectedRowAction = ref<any>(null)

const formDialogVisible = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (visible: boolean) => {
    if (!visible) closeFormDialog()
  }
})

const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const statusOptions = [
  { value: 'pending', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'in_transit', label: '运输中' },
  { value: 'received', label: '已签收' },
  { value: 'rejected', label: '拒收' },
  { value: 'returned', label: '已退货' }
]
const getFormInitialValues = () => ({ id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] })
const form = reactive(getFormInitialValues())

const columns: Column[] = [
  { key: 'order_number', label: '发货单号', width: 144 },
  { key: 'customer_name', label: '客户名称', width: 144 },
  { key: 'sales_order_number', label: '销售订单', width: 144 },
  { key: 'receiver_name', label: '收货人', width: 96 },
  { key: 'receiver_phone', label: '联系电话', width: 112 },
  { key: 'delivery_address', label: '送货地址', minWidth: 144 },
  { key: 'logistics_company', label: '物流公司', width: 112 },
  { key: 'tracking_number', label: '物流单号', width: 144 },
  { key: 'delivery_date', label: '发货日期', width: 112 },
  { key: 'status', label: '状态', width: 96 },
  { key: 'actions', label: '操作', width: 200, fixed: 'right' }
]

const buildDeliveryParams = (params: any) => {
  const { tracking_number, ...nextParams } = params
  if (tracking_number) nextParams.search = tracking_number
  return nextParams
}

const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  hasFilters,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(deliveryOrderAPI, 'getList', {
  initialFilters: { status: '', customer: '', tracking_number: '' },
  buildParams: buildDeliveryParams
})

const handleReset = () => resetFilters()
const resetForm = () => Object.assign(form, getFormInitialValues())

const fetchStats = async () => { 
  statsLoading.value = true
  try { 
    const response: any = await deliveryOrderAPI.getStats()
    stats.value = response || {} 
  } catch (error: any) { 
    stats.value = {} 
  } finally { 
    statsLoading.value = false 
  } 
}

const fetchCustomers = async () => { 
  try { 
    const response: any = await customerAPI.getList({ page_size: 50 })
    customerList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {} 
}

const fetchSalesOrders = async () => { 
  try { 
    const response: any = await salesOrderAPI.getList({ page_size: 50 })
    salesOrderList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {} 
}

const fetchProducts = async () => { 
  try { 
    const response: any = await productAPI.getList({ page_size: 50 })
    productList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {} 
}

const handleView = (row: any) => { currentDelivery.value = row; detailDialogVisible.value = true }
const handleCreate = () => {
  if (!canCreate.value) return
  currentDelivery.value = null
  showEditModal.value = false
  resetForm()
  showCreateModal.value = true
}
const handleEdit = (row: any) => {
  if (!canEdit.value) return
  currentDelivery.value = row
  showCreateModal.value = false
  showEditModal.value = true
}

const closeFormDialog = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentDelivery.value = null
  resetForm()
}

const confirmShip = (row: any) => {
  selectedRowAction.value = row
  showShipDialog.value = true
}

const handleShip = async () => {
  const row = selectedRowAction.value
  if (!row) return
  shipping.value = true
  try {
    await deliveryOrderAPI.ship(row.id)
    useUIStore().showSuccess('发货成功')
    showShipDialog.value = false
    selectedRowAction.value = null
    loadData()
    fetchStats()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '发货失败')
  } finally {
    shipping.value = false
  }
}

const cancelShip = () => {
  if (shipping.value) return
  showShipDialog.value = false
  selectedRowAction.value = null
}

const handleReceive = async (row: any) => { currentDelivery.value = row; receiveDialogVisible.value = true }

const handleConfirmReceive = async (data: any) => {
  receiving.value = true
  try { 
    await deliveryOrderAPI.receive(currentDelivery.value.id, data)
    useUIStore().showSuccess('签收成功')
    receiveDialogVisible.value = false
    loadData()
    fetchStats() 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '签收失败') 
  } finally { 
    receiving.value = false 
  }
}

const confirmDelete = (row: any) => {
  selectedRowAction.value = row
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  const row = selectedRowAction.value
  if (!row) return
  deleting.value = true
  try {
    await deliveryOrderAPI.delete(row.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    selectedRowAction.value = null
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleting.value = false
  }
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  selectedRowAction.value = null
}

const handleSubmit = async (data: any) => { 
  submitting.value = true
  try { 
    if (showEditModal.value) { 
      await deliveryOrderAPI.update(currentDelivery.value.id, data)
      useUIStore().showSuccess('更新成功') 
    } else { 
      await deliveryOrderAPI.create(data)
      useUIStore().showSuccess('创建成功') 
    } 
    closeFormDialog()
    loadData()
    fetchStats() 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, showEditModal.value ? '更新失败' : '创建失败') 
  } finally { 
    submitting.value = false 
  } 
}

const handleSalesOrderChange = (orderId: any) => { /* TODO */ }
const handleCustomerChange = (customerId: any) => { /* TODO */ }

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value && row.status === 'pending' },
  { key: 'ship', label: '发货', icon: 'truck', tone: 'warning', visible: canEdit.value && row.status === 'pending' },
  { key: 'receive', label: '签收', icon: 'check', tone: 'success', visible: canEdit.value && (row.status === 'shipped' || row.status === 'in_transit') },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value && row.status === 'pending' }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'edit': handleEdit(row); break
    case 'ship': confirmShip(row); break
    case 'receive': handleReceive(row); break
    case 'delete': confirmDelete(row); break
  }
}

const getTrackingUrl = (row: any) => row.tracking_url || (row.logistics_company === '顺丰' ? `https://www.sf-express.com/sf-service-owf-web/shipment/query?trackingNumber=${row.tracking_number}` : null)

onMounted(() => { loadData(); fetchStats(); fetchCustomers(); fetchSalesOrders(); fetchProducts() })
</script>

