<template>
  <div class="space-y-6">
    <DeliveryStats :stats="stats" :loading="statsLoading" />

    <CrudPageLayout
      title="发货管理"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search>
        <Select v-model="filters.customer" :options="customerOptions" class="w-40" placeholder="选择客户" clearable filterable @change="handleSearch" />
        <Select v-model="filters.status" :options="statusOptions" class="w-36" placeholder="发货状态" clearable @change="handleSearch" />
        <SearchInput v-model="filters.tracking_number" placeholder="搜索物流单号" @search="handleSearchDebounced" @clear="handleSearch" />
      </template>
      <template #actions>
        <button class="btn" :disabled="loading" @click="loadData">刷新</button>
        <button class="btn btn-primary" v-if="canCreate" @click="handleCreate">新建发货单</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
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
          <span class="truncate max-w-xs">{{ row.delivery_address }}</span>
        </template>
        <template #cell-logistics_company="{ row }">
          <span>{{ row.logistics_company }}</span>
        </template>
        <template #cell-tracking_number="{ row }">
          <a v-if="row.tracking_number" :href="getTrackingUrl(row)" target="_blank" class="text-primary hover:underline">{{ row.tracking_number }}</a>
          <span v-else>-</span>
        </template>
        <template #cell-delivery_date="{ row }">
          <span>{{ row.delivery_date }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusTag :status="row.status" category="delivery" :label="row.status_display" />
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
            <button class="btn btn-ghost btn-sm" v-if="canEdit && row.status === 'pending'" @click="handleEdit(row)">编辑</button>
            <button class="btn btn-ghost btn-sm" v-if="canEdit && row.status === 'pending'" style="color: #E6A23C;" @click="handleShip(row)">发货</button>
            <button class="btn btn-ghost btn-sm" v-if="canEdit && (row.status === 'shipped' || row.status === 'in_transit')" style="color: #67C23A;" @click="handleReceive(row)">签收</button>
            <button class="btn btn-ghost btn-sm" v-if="canDelete && row.status === 'pending'" style="color: #F56C6C;" @click="handleDelete(row)">删除</button>
          </div>
        </template>
        <template #empty>
          <EmptyState description="暂无发货单数据">
            <template #action>
              <button class="btn btn-primary" v-if="hasFilters" @click="handleReset">重置筛选</button>
              <button class="btn btn-primary" v-else-if="canCreate" @click="handleCreate">创建第一个发货单</button>
            </template>
          </EmptyState>
        </template>
      </DataTable>
    </CrudPageLayout>

    <DeliveryDetailDialog v-model:visible="detailDialogVisible" :data="currentDelivery" />
    <DeliveryReceiveDialog v-model:visible="receiveDialogVisible" :delivery="currentDelivery" :loading="receiving" @confirm="handleConfirmReceive" />
    <DeliveryFormDialog v-model:visible="formDialogVisible" :is-edit="isEdit" :submitting="submitting" :form="form" :customer-list="customerList" :sales-order-list="salesOrderList" :product-list="productList" @submit="handleSubmit" @sales-order-change="handleSalesOrderChange" @customer-change="handleCustomerChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { deliveryOrderAPI, salesOrderAPI, productAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, Icon, CrudPageLayout, DataTable, EmptyState, SearchInput } from '@/components/common'
import type { Column } from '@/components/common/types'
import DeliveryStats from './components/DeliveryStats.vue'
import DeliveryDetailDialog from './components/DeliveryDetailDialog.vue'
import DeliveryReceiveDialog from './components/DeliveryReceiveDialog.vue'
import DeliveryFormDialog from './components/DeliveryFormDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('deliveryorder')

const statsLoading = ref(false)
const submitting = ref(false)
const receiving = ref(false)
const customerList = ref<any[]>([])
const salesOrderList = ref<any[]>([])
const productList = ref<any[]>([])
const currentDelivery = ref<any>(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const isEdit = ref(false)

const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const statusOptions = [
  { value: 'pending', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'in_transit', label: '运输中' },
  { value: 'received', label: '已签收' },
  { value: 'rejected', label: '拒收' },
  { value: 'returned', label: '已退货' }
]
const form = reactive({ id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] })

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
  { key: 'actions', label: '操作', width: 192, fixed: 'right' }
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

const fetchStats = async () => { statsLoading.value = true; try { const response: any = await deliveryOrderAPI.getStats(); stats.value = response || {} } catch (error: any) { stats.value = {} } finally { statsLoading.value = false } }
const fetchCustomers = async () => { try { const response: any = await customerAPI.getList({ page_size: 1000 }); customerList.value = response?.results || [] } catch (error: any) {} }
const fetchSalesOrders = async () => { try { const response: any = await salesOrderAPI.getList({ page_size: 1000 }); salesOrderList.value = response?.results || [] } catch (error: any) {} }
const fetchProducts = async () => { try { const response: any = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error: any) {} }

const handleView = (row: any) => { currentDelivery.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; isEdit.value = false; Object.assign(form, { id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] }); formDialogVisible.value = true }
const handleEdit = (row: any) => { if (!canEdit.value) return; isEdit.value = true; currentDelivery.value = row; formDialogVisible.value = true }

const handleShip = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm('确认发货？')
    if (!confirmed) return
    await deliveryOrderAPI.ship(row.id)
    ElMessage.success('发货成功')
    loadData()
    fetchStats()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '发货失败') }
}

const handleReceive = async (row: any) => { currentDelivery.value = row; receiveDialogVisible.value = true }

const handleConfirmReceive = async (data: any) => {
  receiving.value = true
  try { await deliveryOrderAPI.receive(currentDelivery.value.id, data); ElMessage.success('签收成功'); receiveDialogVisible.value = false; loadData(); fetchStats() } catch (error: any) { ErrorHandler.showMessage(error, '签收失败') } finally { receiving.value = false }
}

const handleDelete = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除发货单"${row.order_number}"吗？`)
    if (!confirmed) return
    await deliveryOrderAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const handleSubmit = async (data: any) => { submitting.value = true; try { if (isEdit.value) { await deliveryOrderAPI.update(currentDelivery.value.id, data); ElMessage.success('更新成功') } else { await deliveryOrderAPI.create(data); ElMessage.success('创建成功') } formDialogVisible.value = false; loadData(); fetchStats() } catch (error: any) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false } }
const handleSalesOrderChange = (orderId: any) => { /* TODO */ }
const handleCustomerChange = (customerId: any) => { /* TODO */ }

const getTrackingUrl = (row: any) => row.tracking_url || (row.logistics_company === '顺丰' ? `https://www.sf-express.com/sf-service-owf-web/shipment/query?trackingNumber=${row.tracking_number}` : null)

onMounted(() => { loadData(); fetchStats(); fetchCustomers(); fetchSalesOrders(); fetchProducts() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.delivery-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-search-control { width: min(100%, 240px); }
.filter-select-control { width: min(100%, 180px); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.data-table { width: 100%; }
.card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-search-control,
  .filter-select-control,
  .action-group .btn {
    width: 100%;
  }
}
</style>
