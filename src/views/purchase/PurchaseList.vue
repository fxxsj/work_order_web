<template>
  <div class="page-container">
    <div class="header-section">
      <div class="filter-group">
        <el-input v-model="searchText" placeholder="搜索采购单号" prefix-icon="Search" clearable style="width: 200px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-input v-model="filters.supplier_name" placeholder="供应商名称" clearable style="width: 180px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已提交" value="submitted" />
          <el-option label="已批准" value="approved" />
          <el-option label="已下单" value="ordered" />
          <el-option label="已收货" value="received" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
      </div>
      <div class="action-group">
        <el-button v-if="canCreate" type="primary" :icon="Plus" @click="showCreateDialog">新增采购单</el-button>
        <el-button :icon="Warning" @click="showLowStockDialog">库存预警</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="order_number" label="采购单号" width="150" />
        <el-table-column prop="supplier_name" label="供应商" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status_display }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="items_count" label="明细数量" width="100" align="center" />
        <el-table-column prop="total_amount" label="总金额" width="120" align="right">
          <template #default="scope">¥{{ scope.row.total_amount ? scope.row.total_amount.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="order_date" label="下单日期" width="120" />
        <el-table-column prop="expected_date" label="预计到货" width="120" />
        <el-table-column prop="received_date" label="实际到货" width="120">
          <template #default="scope">{{ scope.row.received_date || '-' }}</template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="text" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="scope.row.status === 'draft' && canEdit" type="text" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-dropdown v-if="hasStatusActions(scope.row)" trigger="click" @command="(cmd) => handleStatusAction(cmd, scope.row)">
              <el-button type="text">更多<i class="el-icon-arrow-down el-icon--right"></i></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 'draft'" command="submit">提交</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 'submitted'" command="approve">批准</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 'submitted'" command="reject">拒绝</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 'approved'" command="placeOrder">下单</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 'ordered'" command="receive">收货</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 'ordered'" command="inspection">质检</el-dropdown-item>
                  <el-dropdown-item v-if="['draft', 'submitted', 'approved'].includes(scope.row.status)" command="cancel" divided><span style="color: #F56C6C">取消</span></el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无采购单数据">
        <el-button v-if="canCreate" type="primary" @click="showCreateDialog">创建第一个采购单</el-button>
      </el-empty>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />
    </el-card>

    <PurchaseFormDialog v-model:visible="dialogVisible" :form-data="form" :is-edit="isEditMode" @confirm="handleFormConfirm" @close="resetForm" />
    <PurchaseDetailDialog v-model:visible="detailDialogVisible" :purchase-id="currentPurchaseId" />
    <LowStockAlertDialog v-model:visible="lowStockDialogVisible" @create-purchase="handleCreateFromLowStock" />
    <ReceiveDialog v-model:visible="receiveDialogVisible" :purchase-order="currentPurchaseOrder" @success="handleReceiveSuccess" />
    <InspectionDialog v-model:visible="inspectionDialogVisible" :purchase-order-id="currentPurchaseId" @updated="loadData" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { purchaseOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import { PurchaseFormDialog, PurchaseDetailDialog, LowStockAlertDialog, ReceiveDialog, InspectionDialog } from './components'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchText = ref('')
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const lowStockDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const isEditMode = ref(false)
const currentPurchaseId = ref(null)
const currentPurchaseOrder = ref(null)
const form = reactive({ supplier: null, work_order_number: '', notes: '', items: [] })

const filters = reactive({ supplier_name: '', status: '' })
const canCreate = computed(() => userStore.hasPermission('workorder.add_purchaseorder'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_purchaseorder'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_purchaseorder'))

const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(filters, { supplier_name: '', status: '' }); searchText.value = ''; currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (searchText.value) params.search = searchText.value
    if (filters.supplier_name) params.supplier_name = filters.supplier_name
    if (filters.status) params.status = filters.status
    const response = await purchaseOrderAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const showCreateDialog = () => { if (!canCreate.value) return; isEditMode.value = false; Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }); dialogVisible.value = true }
const showEditDialog = (row) => { if (!canEdit.value) return; isEditMode.value = true; currentPurchaseId.value = row.id; purchaseOrderAPI.getDetail(row.id).then(res => { Object.assign(form, { supplier: res.supplier, work_order_number: res.work_order_number, notes: res.notes, items: res.items || [] }); dialogVisible.value = true }).catch(e => ErrorHandler.showMessage(e, '加载详情')) }
const handleView = (row) => { currentPurchaseId.value = row.id; detailDialogVisible.value = true }

const handleFormConfirm = async (data) => { try { if (isEditMode.value) { await purchaseOrderAPI.update(currentPurchaseId.value, data); ElMessage.success('更新成功') } else { await purchaseOrderAPI.create(data); ElMessage.success('创建成功') } dialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, isEditMode.value ? '更新失败' : '创建失败') } }
const resetForm = () => { Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }) }

const hasStatusActions = (row) => ['draft', 'submitted', 'approved', 'ordered'].includes(row.status)
const handleStatusAction = async (cmd, row) => {
  try {
    switch (cmd) {
      case 'submit': await purchaseOrderAPI.submit(row.id); ElMessage.success('提交成功'); break
      case 'approve': await purchaseOrderAPI.approve(row.id); ElMessage.success('批准成功'); break
      case 'reject': await purchaseOrderAPI.reject(row.id); ElMessage.success('拒绝成功'); break
      case 'placeOrder': await purchaseOrderAPI.placeOrder(row.id); ElMessage.success('下单成功'); break
      case 'receive': currentPurchaseOrder.value = row; receiveDialogVisible.value = true; return
      case 'inspection': currentPurchaseId.value = row.id; inspectionDialogVisible.value = true; return
      case 'cancel': await ErrorHandler.confirm('确定要取消该采购单吗？'); await purchaseOrderAPI.cancel(row.id); ElMessage.success('取消成功'); break
    }
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '操作失败') }
}

const handleReceiveSuccess = () => { receiveDialogVisible.value = false; loadData() }
const handleCreateFromLowStock = (data) => { lowStockDialogVisible.value = false; showCreateDialog() }
const showLowStockDialog = () => { lowStockDialogVisible.value = true }
const getStatusType = (status) => ({ draft: 'info', submitted: 'primary', approved: 'success', ordered: 'warning', received: 'success', cancelled: 'info' })[status] || ''

onMounted(() => { loadData() })
</script>

<style scoped>
.page-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
</style>
