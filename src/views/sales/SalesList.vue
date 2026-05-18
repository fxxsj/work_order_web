<template>
  <div class="sales-order-list">
    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-input v-model="filters.search" class="filter-search-control" placeholder="搜索订单号/客户名称" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
          <el-select v-model="filters.status" class="filter-select-control" placeholder="订单状态" clearable @change="handleSearch">
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已审核" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="生产中" value="in_production" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="filters.payment_status" class="filter-select-control" placeholder="付款状态" clearable @change="handleSearch">
            <el-option label="未付款" value="unpaid" />
            <el-option label="部分付款" value="partial" />
            <el-option label="已付款" value="paid" />
          </el-select>
        </div>
        <div class="action-group">
          <el-button :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button type="success" :icon="Operation" :disabled="!canBatchConvert" @click="handleBatchConvert">批量转换</el-button>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleAdd">新建销售订单</el-button>
        </div>
      </div>

      <div v-if="tableData.length > 0" class="table-scroll">
      <el-table ref="salesTable" v-loading="loading" :data="tableData" class="data-table" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="order_number" label="订单号" width="150" fixed="left">
          <template #default="scope"><el-link type="primary" @click="handleView(scope.row)">{{ scope.row.order_number }}</el-link></template>
        </el-table-column>
        <el-table-column prop="customer_name" label="客户名称" width="150" show-overflow-tooltip />
        <el-table-column prop="order_date" label="订单日期" width="120" />
        <el-table-column label="交货日期" width="120">
          <template #default="scope">
            <span :class="{ 'text-danger': isOverdue(scope.row) }">{{ scope.row.delivery_date }}</span>
            <el-tooltip v-if="isOverdue(scope.row)" content="已逾期" placement="top"><el-icon style="color: #f56c6c;"><Warning /></el-icon></el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单金额" width="120" align="right">
          <template #default="scope"><span class="amount-text">¥{{ formatAmount(scope.row.total_amount) }}</span></template>
        </el-table-column>
        <el-table-column label="订单状态" width="100" align="center">
          <template #default="scope"><StatusTag :status="scope.row.status" category="salesOrder" effect="plain" /></template>
        </el-table-column>
        <el-table-column label="付款状态" width="100" align="center">
          <template #default="scope"><StatusTag :status="scope.row.payment_status" category="payment" effect="plain" /></template>
        </el-table-column>
        <el-table-column prop="items_count" label="明细数" width="80" align="center">
          <template #default="scope"><el-tag size="mini" type="info">{{ scope.row.items_count || 0 }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="canEdit(scope.row)" content="编辑订单" placement="top"><el-button size="mini" type="primary" :icon="Edit" @click="handleEdit(scope.row)" /></el-tooltip>
              <el-tooltip v-if="canConvert(scope.row)" content="转换为施工单" placement="top"><el-button size="mini" type="success" :icon="Operation" @click="handleConvert(scope.row)" /></el-tooltip>
              <el-tooltip v-if="scope.row.status === 'draft'" content="提交审核" placement="top"><el-button size="mini" type="success" :icon="Upload" @click="handleSubmit(scope.row)" /></el-tooltip>
              <template v-if="scope.row.status === 'submitted'">
                <el-tooltip content="审核通过" placement="top"><el-button size="mini" type="success" :icon="Check" @click="handleApprove(scope.row)" /></el-tooltip>
                <el-tooltip content="审核拒绝" placement="top"><el-button size="mini" type="warning" :icon="Close" @click="handleReject(scope.row)" /></el-tooltip>
              </template>
              <el-tooltip content="查看详情" placement="top"><el-button size="mini" :icon="View" @click="handleView(scope.row)" /></el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />
      <el-empty v-if="!loading && tableData.length === 0" description="暂无销售订单数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, RefreshRight, Edit, View, Operation, Upload, Check, Close, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import { StatusTag } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const salesTable = ref(null)
const selectedRows = ref([])

const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange
} = useCrudList(salesOrderAPI, 'getList', {
  initialFilters: { search: '', status: '', payment_status: '' }
})

const canCreate = computed(() => userStore.hasPermission('workorder.add_salesorder'))
const canBatchConvert = computed(() => selectedRows.value.length > 0)

const handleSelectionChange = (rows) => { selectedRows.value = rows }
const handleSortChange = ({ prop, order }) => { /* TODO */ }

const handleAdd = () => { router.push('/sales/create') }
const handleView = (row) => { router.push(`/sales/${row.id}`) }
const handleEdit = (row) => { router.push(`/sales/${row.id}/edit`) }

const canEdit = (row) => row.status === 'draft' && userStore.hasPermission('workorder.change_salesorder')
const canConvert = (row) => ['approved', 'in_production'].includes(row.status) && userStore.hasPermission('workorder.add_workorder')

const handleConvert = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将订单"${row.order_number}"转换为施工单？`)
    if (!confirmed) return
    const response = await salesOrderAPI.convertToWorkOrder(row.id)
    ElMessage.success('转换成功')
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '转换失败') }
}

const handleBatchConvert = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将 ${selectedRows.value.length} 个订单转换为施工单？`)
    if (!confirmed) return
    const orderIds = selectedRows.value.map(r => r.id)
    const response = await salesOrderAPI.batchConvertToWorkOrder(orderIds)
    ElMessage.success(`成功转换 ${response.success_count} 个订单`)
    selectedRows.value = []
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '批量转换失败') }
}

const handleSubmit = async (row) => {
  try { await salesOrderAPI.submit(row.id); ElMessage.success('提交成功'); loadData() } catch (error) { ErrorHandler.showMessage(error, '提交失败') }
}

const handleApprove = async (row) => {
  try { await salesOrderAPI.approve(row.id); ElMessage.success('审核通过'); loadData() } catch (error) { ErrorHandler.showMessage(error, '审核失败') }
}

const handleReject = async (row) => {
  try { await salesOrderAPI.reject(row.id); ElMessage.success('已拒绝'); loadData() } catch (error) { ErrorHandler.showMessage(error, '操作失败') }
}

const isOverdue = (row) => row.delivery_date && new Date(row.delivery_date) < new Date() && !['completed', 'cancelled'].includes(row.status)
const formatAmount = (amount) => amount ? amount.toLocaleString() : '0.00'

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.sales-order-list { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-search-control { width: min(100%, 260px); }
.filter-select-control { width: min(100%, 140px); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.data-table { width: 100%; }
.text-danger { color: #f56c6c; font-weight: bold; }
.amount-text { font-weight: 500; }
.action-buttons { display: flex; gap: 4px; justify-content: center; }

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
