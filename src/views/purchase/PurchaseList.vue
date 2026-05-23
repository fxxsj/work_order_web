<template>
  <CrudPageLayout
    title="采购订单"
    :loading="loading"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #search>
      <SearchInput v-model="searchText" placeholder="搜索采购单号" @search="handleSearch" />
      <SearchInput v-model="filters.supplier_name" placeholder="供应商名称" @search="handleSearch" />
      <Select v-model="filters.status" :options="statusOptions" class="w-40" placeholder="状态" clearable @change="handleSearch" />
      <button class="btn" @click="resetFilters">重置</button>
    </template>
    <template #actions>
      <button class="btn btn-primary" v-if="canCreate" @click="showCreateDialog">新增采购单</button>
      <button class="btn" @click="showLowStockDialog">库存预警</button>
    </template>

    <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
      <template #cell-order_number="{ row }">
        <span>{{ row.order_number }}</span>
      </template>
      <template #cell-supplier_name="{ row }">
        <span>{{ row.supplier_name }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" category="purchaseOrder" :label="row.status_display" />
      </template>
      <template #cell-work_order_number="{ row }">
        <span v-if="row.work_order_number" class="work-order-link" @click="navigateToWorkOrder(row.work_order_number)">
          {{ row.work_order_number }}<Icon name="arrowRight" class="link-icon" />
        </span>
        <span v-else>-</span>
      </template>
      <template #cell-items_count="{ row }">
        <span>{{ row.items_count }}</span>
      </template>
      <template #cell-total_amount="{ row }">
        <span>¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span>
      </template>
      <template #cell-order_date="{ row }">
        <span>{{ row.order_date }}</span>
      </template>
      <template #cell-expected_date="{ row }">
        <span>{{ row.expected_date }}</span>
      </template>
      <template #cell-received_date="{ row }">
        <span>{{ row.received_date || '-' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
          <button class="btn btn-ghost btn-sm" v-if="row.status === 'draft' && canEdit" @click="showEditDialog(row)">编辑</button>
          <select v-if="hasStatusActions(row)" class="select btn btn-ghost btn-sm" @change="(e) => handleStatusAction((e.target as HTMLSelectElement)?.value || '', row)">
            <option value="">更多</option>
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
        <EmptyState description="暂无采购单数据">
          <template #action>
            <button class="btn btn-primary" v-if="canCreate" @click="showCreateDialog">创建第一个采购单</button>
          </template>
        </EmptyState>
      </template>
    </DataTable>

    <PurchaseFormDialog v-model:visible="dialogVisible" :form-data="form" :is-edit="isEditMode" @confirm="handleFormConfirm" @close="resetForm" />
    <PurchaseDetailDialog v-model:visible="detailDialogVisible" :purchase-id="currentPurchaseId" :detail-data="currentDetailData" @view-work-order="navigateToWorkOrder" />
    <LowStockAlertDialog v-model:visible="lowStockDialogVisible" @create-purchase="handleCreateFromLowStock" />
    <ReceiveDialog v-model:visible="receiveDialogVisible" :purchase-order="currentPurchaseOrder" @success="handleReceiveSuccess" />
    <InspectionDialog v-model:visible="inspectionDialogVisible" :purchase-order-id="currentPurchaseId" @updated="loadData" />
  </CrudPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { purchaseOrderAPI, workOrderAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, Icon, CrudPageLayout, DataTable, EmptyState, SearchInput } from '@/components/common'
import type { Column } from '@/components/common/types'
import { PurchaseFormDialog, PurchaseDetailDialog, LowStockAlertDialog, ReceiveDialog, InspectionDialog } from './components'

const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const router = useRouter()
const lowStockDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const isEditMode = ref(false)
const currentPurchaseId = ref<any>(null)
const currentPurchaseOrder = ref<any>(null)
const currentDetailData = ref<any>(null)
const form = reactive({ supplier: null as any, work_order_number: '', notes: '', items: [] as any[] })

const columns: Column[] = [
  { key: 'order_number', label: '采购单号', width: 144 },
  { key: 'supplier_name', label: '供应商', width: 176 },
  { key: 'status', label: '状态', width: 96 },
  { key: 'work_order_number', label: '关联施工单', width: 144 },
  { key: 'items_count', label: '明细数量', width: 96, align: 'center' },
  { key: 'total_amount', label: '总金额', width: 112, align: 'right' },
  { key: 'order_date', label: '下单日期', width: 112 },
  { key: 'expected_date', label: '预计到货', width: 112 },
  { key: 'received_date', label: '实际到货', width: 112 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
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
  resetFilters
} = useCrudList(purchaseOrderAPI, 'getList', {
  initialFilters: { supplier_name: '', status: '' }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('purchaseorder')

const showCreateDialog = () => { if (!canCreate.value) return; isEditMode.value = false; Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }); dialogVisible.value = true }
const showEditDialog = (row: any) => { if (!canEdit.value) return; isEditMode.value = true; currentPurchaseId.value = row.id; purchaseOrderAPI.getDetail(row.id).then((res: any) => { Object.assign(form, { supplier: (res as any).supplier, work_order_number: (res as any).work_order_number, notes: (res as any).notes, items: res.items || [] }); dialogVisible.value = true }).catch(e => ErrorHandler.showMessage(e, '加载详情')) }
const handleView = (row: any) => { currentPurchaseId.value = row.id; detailDialogVisible.value = true; purchaseOrderAPI.getDetail(row.id).then((res: any) => { currentDetailData.value = res }).catch(() => { currentDetailData.value = null }) }

const handleFormConfirm = async (data: any) => { try { if (isEditMode.value) { await purchaseOrderAPI.update(currentPurchaseId.value, data); ElMessage.success('更新成功') } else { await purchaseOrderAPI.create(data); ElMessage.success('创建成功') } dialogVisible.value = false; loadData() } catch (error: any) { ErrorHandler.showMessage(error, isEditMode.value ? '更新失败' : '创建失败') } }
const resetForm = () => { Object.assign(form, { supplier: null, work_order_number: '', notes: '', items: [] }) }

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
      case 'cancel': {
        const confirmed = await ErrorHandler.confirm('确定要取消该采购单吗？')
        if (!confirmed) return
        await purchaseOrderAPI.cancel(row.id)
        ElMessage.success('取消成功')
        break
      }
    }
    loadData()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '操作失败') }
}

const handleReceiveSuccess = () => { receiveDialogVisible.value = false; loadData() }
const handleCreateFromLowStock = (data: any) => { lowStockDialogVisible.value = false; showCreateDialog() }
const showLowStockDialog = () => { lowStockDialogVisible.value = true }

const navigateToWorkOrder = (workOrderNumber: any) => {
  workOrderAPI.getList({ search: workOrderNumber, approval_status: '' }).then(res => {
    const matched = (res as any).find((wo: any) => wo.order_number === workOrderNumber)
    if (matched) {
      router.push(`/workorders/${matched.id}`)
    } else {
      ElMessage.error('未找到施工单 ' + workOrderNumber)
    }
  }).catch(() => ElMessage.error('跳转失败'))
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); margin-bottom: var(--ui-section-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.purchase-filter-control { width: min(100%, 220px); }
.table-scroll { overflow-x: auto; }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .purchase-filter-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }

  .work-order-link {
    color: var(--el-color-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    &:hover { text-decoration: underline; }
    .link-icon { font-size: 12px; }
  }
}
</style>
