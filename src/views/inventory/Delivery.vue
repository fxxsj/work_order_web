<template>
  <div class="delivery-container">
    <delivery-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="filters.customer" class="filter-select-control" placeholder="选择客户" clearable filterable @change="handleSearch">
            <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
          <el-select v-model="filters.status" class="filter-select-control" placeholder="发货状态" clearable @change="handleSearch">
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="received" />
            <el-option label="拒收" value="rejected" />
            <el-option label="已退货" value="returned" />
          </el-select>
          <el-input v-model="filters.tracking_number" class="filter-search-control" placeholder="搜索物流单号" clearable @input="handleSearchDebounced" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleCreate">新建发货单</el-button>
        </div>
      </div>

      <div v-if="tableData.length > 0" class="table-scroll">
      <el-table v-loading="loading" :data="tableData" border class="data-table">
        <el-table-column prop="order_number" label="发货单号" width="150" />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="sales_order_number" label="销售订单" width="150" />
        <el-table-column prop="receiver_name" label="收货人" width="100" />
        <el-table-column prop="receiver_phone" label="联系电话" width="120" />
        <el-table-column prop="delivery_address" label="送货地址" show-overflow-tooltip min-width="150" />
        <el-table-column prop="logistics_company" label="物流公司" width="120" />
        <el-table-column prop="tracking_number" label="物流单号" width="150">
          <template #default="scope">
            <el-link v-if="scope.row.tracking_number" :href="getTrackingUrl(scope.row)" target="_blank">{{ scope.row.tracking_number }}</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="delivery_date" label="发货日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" category="delivery" :label="scope.row.status_display" /></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit && scope.row.status === 'pending'" type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="canEdit && scope.row.status === 'pending'" type="text" size="small" style="color: #E6A23C;" @click="handleShip(scope.row)">发货</el-button>
            <el-button v-if="canEdit && (scope.row.status === 'shipped' || scope.row.status === 'in_transit')" type="text" size="small" style="color: #67C23A;" @click="handleReceive(scope.row)">签收</el-button>
            <el-button v-if="canDelete && scope.row.status === 'pending'" type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无发货单数据" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
        <el-button v-else-if="canCreate" type="primary" @click="handleCreate">创建第一个发货单</el-button>
      </el-empty>
    </el-card>

    <DeliveryDetailDialog v-model:visible="detailDialogVisible" :data="currentDelivery" />
    <DeliveryReceiveDialog v-model:visible="receiveDialogVisible" :delivery="currentDelivery" :loading="receiving" @confirm="handleConfirmReceive" />
    <DeliveryFormDialog v-model:visible="formDialogVisible" :is-edit="isEdit" :submitting="submitting" :form="form" :customer-list="customerList" :sales-order-list="salesOrderList" :product-list="productList" @submit="handleSubmit" @sales-order-change="handleSalesOrderChange" @customer-change="handleCustomerChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { deliveryOrderAPI, salesOrderAPI, productAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag } from '@/components/common'
import DeliveryStats from './components/DeliveryStats.vue'
import DeliveryDetailDialog from './components/DeliveryDetailDialog.vue'
import DeliveryReceiveDialog from './components/DeliveryReceiveDialog.vue'
import DeliveryFormDialog from './components/DeliveryFormDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('deliveryorder')

const statsLoading = ref(false)
const submitting = ref(false)
const receiving = ref(false)
const customerList = ref([])
const salesOrderList = ref([])
const productList = ref([])
const currentDelivery = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] })

const buildDeliveryParams = (params) => {
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

const fetchStats = async () => { statsLoading.value = true; try { const response = await deliveryOrderAPI.getStats(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false } }
const fetchCustomers = async () => { try { const response = await customerAPI.getList({ page_size: 1000 }); customerList.value = response?.results || [] } catch (error) {} }
const fetchSalesOrders = async () => { try { const response = await salesOrderAPI.getList({ page_size: 1000 }); salesOrderList.value = response?.results || [] } catch (error) {} }
const fetchProducts = async () => { try { const response = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error) {} }

const handleView = (row) => { currentDelivery.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; isEdit.value = false; Object.assign(form, { id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] }); formDialogVisible.value = true }
const handleEdit = (row) => { if (!canEdit.value) return; isEdit.value = true; currentDelivery.value = row; formDialogVisible.value = true }

const handleShip = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm('确认发货？')
    if (!confirmed) return
    await deliveryOrderAPI.ship(row.id)
    ElMessage.success('发货成功')
    loadData()
    fetchStats()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '发货失败') }
}

const handleReceive = async (row) => { currentDelivery.value = row; receiveDialogVisible.value = true }

const handleConfirmReceive = async (data) => {
  receiving.value = true
  try { await deliveryOrderAPI.receive(currentDelivery.value.id, data); ElMessage.success('签收成功'); receiveDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, '签收失败') } finally { receiving.value = false }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除发货单"${row.order_number}"吗？`)
    if (!confirmed) return
    await deliveryOrderAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const handleSubmit = async (data) => { submitting.value = true; try { if (isEdit.value) { await deliveryOrderAPI.update(currentDelivery.value.id, data); ElMessage.success('更新成功') } else { await deliveryOrderAPI.create(data); ElMessage.success('创建成功') } formDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false } }
const handleSalesOrderChange = (orderId) => { /* TODO */ }
const handleCustomerChange = (customerId) => { /* TODO */ }

const getTrackingUrl = (row) => row.tracking_url || (row.logistics_company === '顺丰' ? `https://www.sf-express.com/sf-service-owf-web/shipment/query?trackingNumber=${row.tracking_number}` : null)

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
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-search-control,
  .filter-select-control,
  .action-group .el-button {
    width: 100%;
  }
}
</style>
