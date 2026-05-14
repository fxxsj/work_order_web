<template>
  <div class="delivery-container">
    <delivery-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="filters.customer" placeholder="选择客户" clearable filterable style="width: 160px; margin-right: 10px;" @change="handleSearch">
            <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
          <el-select v-model="filters.status" placeholder="发货状态" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch">
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="received" />
            <el-option label="拒收" value="rejected" />
            <el-option label="已退货" value="returned" />
          </el-select>
          <el-input v-model="filters.tracking_number" placeholder="搜索物流单号" style="width: 200px;" clearable @input="handleSearchDebounced" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleCreate">新建发货单</el-button>
        </div>
      </div>

      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 20px;">
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
          <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status_display }}</el-tag></template>
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
import { deliveryOrderAPI, salesOrderAPI, customerAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import DeliveryStats from './components/DeliveryStats.vue'
import DeliveryDetailDialog from './components/DeliveryDetailDialog.vue'
import DeliveryReceiveDialog from './components/DeliveryReceiveDialog.vue'
import DeliveryFormDialog from './components/DeliveryFormDialog.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
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
const filters = reactive({ status: '', customer: '', tracking_number: '' })
const hasFilters = computed(() => filters.status || filters.customer || filters.tracking_number)
const canCreate = computed(() => userStore.hasPermission('workorder.add_deliveryorder'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_deliveryorder'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_deliveryorder'))

let searchTimer = null
const handleSearchDebounced = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { handleSearch() }, 300) }
const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(filters, { status: '', customer: '', tracking_number: '' }); currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (filters.status) params.status = filters.status
    if (filters.customer) params.customer = filters.customer
    if (filters.tracking_number) params.search = filters.tracking_number
    const response = await deliveryOrderAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const fetchStats = async () => { statsLoading.value = true; try { const response = await deliveryOrderAPI.getStats(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false } }
const fetchCustomers = async () => { try { const response = await customerAPI.getList({ page_size: 1000 }); customerList.value = response?.results || [] } catch (error) {} }
const fetchSalesOrders = async () => { try { const response = await salesOrderAPI.getList({ page_size: 1000 }); salesOrderList.value = response?.results || [] } catch (error) {} }
const fetchProducts = async () => { try { const response = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error) {} }

const handleView = (row) => { currentDelivery.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; isEdit.value = false; Object.assign(form, { id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: '', notes: '', items_data: [] }); formDialogVisible.value = true }
const handleEdit = (row) => { if (!canEdit.value) return; isEdit.value = true; currentDelivery.value = row; formDialogVisible.value = true }

const handleShip = async (row) => {
  try { await ErrorHandler.confirm('确认发货？'); await deliveryOrderAPI.ship(row.id); ElMessage.success('发货成功'); loadData(); fetchStats() } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '发货失败') }
}

const handleReceive = async (row) => { currentDelivery.value = row; receiveDialogVisible.value = true }

const handleConfirmReceive = async (data) => {
  receiving.value = true
  try { await deliveryOrderAPI.receive(currentDelivery.value.id, data); ElMessage.success('签收成功'); receiveDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, '签收失败') } finally { receiving.value = false }
}

const handleDelete = async (row) => {
  try { await ErrorHandler.confirm(`确定要删除发货单"${row.order_number}"吗？`); await deliveryOrderAPI.delete(row.id); ElMessage.success('删除成功'); loadData() } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const handleSubmit = async (data) => { submitting.value = true; try { if (isEdit.value) { await deliveryOrderAPI.update(currentDelivery.value.id, data); ElMessage.success('更新成功') } else { await deliveryOrderAPI.create(data); ElMessage.success('创建成功') } formDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false } }
const handleSalesOrderChange = (orderId) => { /* TODO */ }
const handleCustomerChange = (customerId) => { /* TODO */ }

const getStatusType = (status) => ({ pending: 'info', shipped: 'warning', in_transit: 'primary', received: 'success', rejected: 'danger', returned: 'warning' })[status] || ''
const getTrackingUrl = (row) => row.tracking_url || (row.logistics_company === '顺丰' ? `https://www.sf-express.com/sf-service-owf-web/shipment/query?trackingNumber=${row.tracking_number}` : null)

onMounted(() => { loadData(); fetchStats(); fetchCustomers(); fetchSalesOrders(); fetchProducts() })
</script>

<style scoped>
.delivery-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
</style>
