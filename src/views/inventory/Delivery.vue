<template>
  <div class="space-y-6">
    <DeliveryStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <FilterRow>
          <SearchInput
            v-model="searchText"
            placeholder="搜索单号/客户/物流"
            class="w-full sm:w-64"
            @search="searchAndRefreshStats"
            @clear="searchAndRefreshStats"
          />
          <Select
            v-model="filters.customer"
            :options="customerOptions"
            class="w-full sm:w-36"
            placeholder="选择客户"
            clearable
            filterable
            @change="searchAndRefreshStats"
          />
          <Select
            v-model="filters.status"
            :options="statusOptions"
            class="w-full sm:w-36"
            placeholder="发货状态"
            clearable
            @change="searchAndRefreshStats"
          />
          <Select
            v-model="filters.todo"
            :options="todoOptions"
            class="w-full sm:w-40"
            placeholder="待办事项"
            clearable
            @change="searchAndRefreshStats"
          />
          <input
            v-model="filters.start_date"
            type="date"
            class="input w-full sm:w-40"
            @change="searchAndRefreshStats"
          >
          <input
            v-model="filters.end_date"
            type="date"
            class="input w-full sm:w-40"
            @change="searchAndRefreshStats"
          >
        </FilterRow>
      </template>
      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            v-if="hasFilters"
            class="btn btn-secondary"
            @click="handleReset"
          >
            重置筛选
          </button>
          <button
            class="btn btn-secondary"
            :disabled="loading"
            title="刷新"
            @click="reloadData"
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
          :server-side-sort="true"
          default-sort-key="created_at"
          default-sort-order="desc"
          @sort="handleSort"
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
          <template #cell-items_count="{ row }">
            <span>{{ row.items_count ?? '-' }}</span>
          </template>
          <template #cell-total_quantity="{ row }">
            <span>{{ formatAmount(row.total_quantity) }}</span>
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
      :sales-order-list="availableSalesOrderList"
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
import { deliveryOrderAPI, salesOrderAPI, productAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
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
const todoOptions = [
  { value: 'pending_receive', label: '待签收' },
  { value: 'pending_invoice', label: '待开票' },
  { value: 'rejected_followup', label: '拒收待处理' }
]
const getFormInitialValues = () => ({ id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] })
const form = reactive(getFormInitialValues())
const deliveryEligibleSalesOrderStatuses = new Set(['approved', 'in_production', 'completed'])

const normalizeId = (value: any) => {
  if (value && typeof value === 'object') return normalizeId(value.id)
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
}
const sameId = (left: any, right: any) => {
  const leftId = normalizeId(left)
  const rightId = normalizeId(right)
  return leftId !== null && rightId !== null && String(leftId) === String(rightId)
}
const getCustomerId = (record: any) => normalizeId(record?.customer_id ?? record?.customer?.id ?? record?.customer)
const getSalesOrderId = (record: any) => normalizeId(record?.sales_order_id ?? record?.sales_order?.id ?? record?.sales_order)

const availableSalesOrderList = computed(() => {
  const selectedCustomerId = normalizeId(form.customer)
  const selectedSalesOrderId = normalizeId(form.sales_order)
  return salesOrderList.value.filter((order: any) => {
    const isCurrentOrder = selectedSalesOrderId !== null && sameId(order.id, selectedSalesOrderId)
    const statusAllowed = deliveryEligibleSalesOrderStatuses.has(order.status) || isCurrentOrder
    const customerMatched = !selectedCustomerId || sameId(getCustomerId(order), selectedCustomerId)
    return statusAllowed && customerMatched
  })
})

const columns: Column[] = [
  { key: 'order_number', label: '发货单号', width: 144, sortable: true },
  { key: 'customer_name', label: '客户名称', width: 144, sortable: true },
  { key: 'sales_order_number', label: '销售订单', width: 144, sortable: true },
  { key: 'items_count', label: '明细数', width: 80 },
  { key: 'total_quantity', label: '发货数量', width: 96 },
  { key: 'logistics_company', label: '物流公司', width: 112, sortable: true },
  { key: 'tracking_number', label: '物流单号', width: 144, sortable: true },
  { key: 'delivery_date', label: '发货日期', width: 112, sortable: true },
  { key: 'status', label: '状态', width: 96, sortable: true },
  { key: 'actions', label: '操作', width: 200, fixed: 'right' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  customer_name: 'customer__name',
  sales_order_number: 'sales_order__order_number'
}

const buildDeliveryParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  return {
    ...params,
    ordering: sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  }
}

const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  hasFilters,
  searchText,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(deliveryOrderAPI, 'getList', {
  initialFilters: { status: '', customer: '', todo: '', start_date: '', end_date: '' },
  buildParams: buildDeliveryParams
})

const reloadData = async () => {
  await loadData()
  fetchStats()
}
const searchAndRefreshStats = async () => {
  await handleSearch()
  fetchStats()
}
const handleReset = async () => {
  await resetFilters()
  fetchStats()
}
const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  reloadData()
}
const resetForm = () => Object.assign(form, getFormInitialValues())

const fetchStats = async () => { 
  statsLoading.value = true
  try { 
    const response: any = await deliveryOrderAPI.getSummary(buildDeliveryParams({
      search: searchText.value,
      status: filters.value.status,
      customer: filters.value.customer,
      todo: filters.value.todo,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    }))
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
  loadDeliveryForEdit(row)
}

const mapDeliveryItemToForm = (item: any) => ({
  product: normalizeId(item.product_id ?? item.product?.id ?? item.product),
  sales_order_item: normalizeId(item.sales_order_item_id ?? item.sales_order_item?.id ?? item.sales_order_item),
  quantity: Number(item.quantity || 0),
  unit: item.unit || '件',
  unit_price: Number(item.unit_price || 0),
  stock_batch: item.stock_batch || '',
  notes: item.notes || ''
})

const mapDeliveryToForm = (delivery: any) => ({
  id: delivery.id ?? null,
  sales_order: getSalesOrderId(delivery),
  customer: getCustomerId(delivery),
  delivery_date: delivery.delivery_date || '',
  receiver_name: delivery.receiver_name || '',
  receiver_phone: delivery.receiver_phone || '',
  delivery_address: delivery.delivery_address || '',
  logistics_company: delivery.logistics_company || '',
  tracking_number: delivery.tracking_number || '',
  freight: Number(delivery.freight || 0),
  package_count: Number(delivery.package_count || 1),
  package_weight: delivery.package_weight ?? '',
  notes: delivery.notes || '',
  items_data: (delivery.items || []).map(mapDeliveryItemToForm)
})

const loadDeliveryForEdit = async (row: any) => {
  try {
    const detail: any = await deliveryOrderAPI.getDetail(row.id)
    currentDelivery.value = detail
    Object.assign(form, getFormInitialValues(), mapDeliveryToForm(detail))
    showCreateModal.value = false
    showEditModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载发货单失败')
  }
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
    if (data.received === 'rejected') {
      await deliveryOrderAPI.reject(currentDelivery.value.id, {
        reject_reason: data.received_notes
      })
      useUIStore().showSuccess('拒收处理成功')
    } else {
      await deliveryOrderAPI.receive(currentDelivery.value.id, {
        received_notes: data.received_notes
      })
      useUIStore().showSuccess('签收成功')
    }
    receiveDialogVisible.value = false
    reloadData()
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

const pickFirstText = (...values: any[]) => values.find(value => typeof value === 'string' && value.trim())?.trim() || ''

const prefillReceiverFromCustomer = (customerId: any) => {
  const customer = customerList.value.find((item: any) => sameId(item.id, customerId))
  if (!customer) return
  if (!form.receiver_name) form.receiver_name = pickFirstText(customer.contact_person, customer.name)
  if (!form.receiver_phone) form.receiver_phone = pickFirstText(customer.phone)
  if (!form.delivery_address) form.delivery_address = pickFirstText(customer.address)
}

const mapSalesOrderItemToDeliveryItem = (item: any) => {
  const quantity = Number(item.quantity || 0)
  const deliveredQuantity = Number(item.delivered_quantity || 0)
  const remainingQuantity = Math.max(quantity - deliveredQuantity, 0)
  if (remainingQuantity <= 0) return null
  return {
    product: normalizeId(item.product_id ?? item.product?.id ?? item.product),
    sales_order_item: normalizeId(item.id),
    quantity: remainingQuantity,
    unit: item.unit || '件',
    unit_price: Number(item.unit_price || 0),
    stock_batch: '',
    notes: ''
  }
}

const applySalesOrderToForm = (salesOrder: any) => {
  const customerId = getCustomerId(salesOrder)
  if (customerId) form.customer = customerId
  form.receiver_name = pickFirstText(salesOrder.contact_person, salesOrder.customer_contact, form.receiver_name)
  form.receiver_phone = pickFirstText(salesOrder.contact_phone, salesOrder.customer_phone, form.receiver_phone)
  form.delivery_address = pickFirstText(salesOrder.shipping_address, salesOrder.customer_address, form.delivery_address)
  prefillReceiverFromCustomer(form.customer)
}

const handleSalesOrderChange = async (orderId: any) => {
  form.sales_order = normalizeId(orderId)
  if (!form.sales_order) {
    form.items_data = []
    return
  }

  const listOrder = salesOrderList.value.find((item: any) => sameId(item.id, form.sales_order))
  if (listOrder) applySalesOrderToForm(listOrder)

  try {
    const detail: any = await salesOrderAPI.getDetail(form.sales_order)
    applySalesOrderToForm(detail)
    const items = (detail.items || [])
      .map(mapSalesOrderItemToDeliveryItem)
      .filter(Boolean)
    form.items_data = items
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载销售订单明细失败')
  }
}

const handleCustomerChange = (customerId: any) => {
  form.customer = normalizeId(customerId)
  prefillReceiverFromCustomer(form.customer)
  const selectedSalesOrder = salesOrderList.value.find((item: any) => sameId(item.id, form.sales_order))
  if (selectedSalesOrder && !sameId(getCustomerId(selectedSalesOrder), form.customer)) {
    form.sales_order = null
    form.items_data = []
  }
}

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
const formatAmount = (value: unknown) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

onMounted(() => { reloadData(); fetchCustomers(); fetchSalesOrders(); fetchProducts() })
</script>
