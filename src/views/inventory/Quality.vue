<template>
  <div class="space-y-6">
    <QualityStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <SearchInput
              v-model="searchText"
              placeholder="搜索检验单/施工单/客户/产品"
              class="w-full sm:w-64"
              @search="searchAndRefreshStats"
              @clear="searchAndRefreshStats"
            />
            <Select
              v-model="filters.type"
              :options="inspectionTypeOptions"
              class="w-full sm:w-36"
              placeholder="检验类型"
              clearable
              @change="searchAndRefreshStats"
            />
            <Select
              v-model="filters.result"
              :options="resultOptions"
              class="w-full sm:w-36"
              placeholder="检验结果"
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
          </div>
        </div>
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
            新建质检
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
          default-sort-key="inspection_date"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-inspection_number="{ row }">
            <span>{{ row.inspection_number }}</span>
          </template>
          <template #cell-inspection_type_display="{ row }">
            <span>{{ row.inspection_type_display }}</span>
          </template>
          <template #cell-product_name="{ row }">
            <span class="truncate max-w-xs block">{{ row.product_name }}</span>
          </template>
          <template #cell-batch_no="{ row }">
            <span>{{ row.batch_no }}</span>
          </template>
          <template #cell-inspection_quantity="{ row }">
            <span>{{ row.inspection_quantity }}</span>
          </template>
          <template #cell-passed_quantity="{ row }">
            <span>{{ row.passed_quantity || '-' }}</span>
          </template>
          <template #cell-failed_quantity="{ row }">
            <span :class="row.failed_quantity > 0 ? 'text-danger' : ''">{{ row.failed_quantity || '-' }}</span>
          </template>
          <template #cell-defective_rate="{ row }">
            <span :class="Number(row.defective_rate || 0) > 0 ? 'text-danger' : ''">{{ row.defective_rate_formatted || `${Number(row.defective_rate || 0).toFixed(2)}%` }}</span>
          </template>
          <template #cell-result="{ row }">
            <StatusTag
              :status="row.result"
              category="inspection"
              :label="row.result_display"
            />
          </template>
          <template #cell-inspector_name="{ row }">
            <span>{{ row.inspector_name }}</span>
          </template>
          <template #cell-inspection_date="{ row }">
            <span>{{ row.inspection_date }}</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无质检数据">
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
                  创建第一个质检
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

    <QualityDetailDialog
      v-model:visible="detailDialogVisible"
      :data="currentQuality"
    />
    <QualityInspectDialog
      v-model:visible="inspectDialogVisible"
      :quality="currentQuality"
      :loading="inspecting"
      @confirm="handleConfirmInspect"
    />
    <QualityFormDialog
      v-model:visible="formDialogVisible"
      :is-edit="false"
      :submitting="submitting"
      :form="form"
      :product-list="productList"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除确认"
      :message="`确定要删除检验单「${selectedRowAction?.inspection_number}」吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      :danger="true"
      :loading="deleting"
      loading-text="删除中..."
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { qualityInspectionAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, Icon, TablePageLayout, DataTable, EmptyState, SearchInput, Pagination, ConfirmDialog, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import QualityStats from './components/QualityStats.vue'
import QualityDetailDialog from './components/QualityDetailDialog.vue'
import QualityInspectDialog from './components/QualityInspectDialog.vue'
import QualityFormDialog from './components/QualityFormDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('qualityinspection')

const statsLoading = ref(false)
const submitting = ref(false)
const inspecting = ref(false)
const deleting = ref(false)
const productList = ref<any[]>([])
const currentQuality = ref<any>(null)
const stats = ref({})

const detailDialogVisible = ref(false)
const inspectDialogVisible = ref(false)
const formDialogVisible = ref(false)
const showDeleteDialog = ref(false)
const selectedRowAction = ref<any>(null)

const form = reactive({
  id: null,
  product: null,
  batch_no: '',
  inspection_type: 'final',
  inspection_date: '',
  inspection_quantity: 0,
  passed_quantity: 0,
  failed_quantity: 0,
  inspection_standard: '',
  notes: ''
})

const columns: Column[] = [
  { key: 'inspection_number', label: '检验单号', width: 144, sortable: true },
  { key: 'inspection_type_display', label: '检验类型', width: 96, sortable: true },
  { key: 'customer_name', label: '客户', width: 128, sortable: true },
  { key: 'work_order_number', label: '施工单', width: 128, sortable: true },
  { key: 'product_name', label: '产品名称', minWidth: 208, sortable: true },
  { key: 'batch_no', label: '批次号', width: 144, sortable: true },
  { key: 'inspection_quantity', label: '检验数量', width: 96, align: 'right', sortable: true },
  { key: 'passed_quantity', label: '合格数量', width: 96, align: 'right', sortable: true },
  { key: 'failed_quantity', label: '不合格数量', width: 112, align: 'right', sortable: true },
  { key: 'defective_rate', label: '不良率', width: 96, align: 'right', sortable: true },
  { key: 'result', label: '检验结果', width: 96, sortable: true },
  { key: 'inspector_name', label: '检验员', width: 96, sortable: true },
  { key: 'inspection_date', label: '检验日期', width: 112, sortable: true },
  { key: 'actions', label: '操作', width: 192, fixed: 'right' }
]

const inspectionTypeOptions = [
  { value: 'incoming', label: '来料检验' },
  { value: 'process', label: '过程检验' },
  { value: 'final', label: '成品检验' },
  { value: 'customer', label: '客诉检验' }
]
const resultOptions = [
  { value: 'pending', label: '待检验' },
  { value: 'passed', label: '合格' },
  { value: 'failed', label: '不合格' },
  { value: 'conditional', label: '条件接收' }
]
const todoOptions = [
  { value: 'exception_followup', label: '异常待处理' }
]

const sortKey = ref('inspection_date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  inspection_type_display: 'inspection_type',
  customer_name: 'work_order__customer__name',
  work_order_number: 'work_order__order_number',
  product_name: 'product__name',
  inspector_name: 'inspector__username'
}

const buildQualityParams = (params: Record<string, unknown>) => {
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
} = useCrudList(qualityInspectionAPI, 'getList', {
  initialFilters: { type: '', result: '', todo: '', start_date: '', end_date: '' },
  buildParams: buildQualityParams
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

const fetchStats = async () => { 
  statsLoading.value = true
  try { 
    const response: any = await qualityInspectionAPI.getSummary(buildQualityParams({
      search: searchText.value,
      type: filters.value.type,
      result: filters.value.result,
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

const fetchProducts = async () => { 
  try { 
    const response: any = await productAPI.getList({ page_size: 100 })
    productList.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
  } catch (error: any) {} 
}

const handleView = (row: any) => { currentQuality.value = row; detailDialogVisible.value = true }
const handleCreate = () => {
  if (!canCreate.value) return
  Object.assign(form, {
    id: null,
    product: null,
    batch_no: '',
    inspection_type: 'final',
    inspection_date: new Date().toISOString().slice(0, 10),
    inspection_quantity: 0,
    passed_quantity: 0,
    failed_quantity: 0,
    inspection_standard: '',
    notes: ''
  })
  formDialogVisible.value = true
}
const handleInspect = (row: any) => { currentQuality.value = row; inspectDialogVisible.value = true }

const confirmDelete = (row: any) => {
  if (!canDelete.value) return
  selectedRowAction.value = row
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    deleting.value = true
    const row = selectedRowAction.value
    if (!row) return
    await qualityInspectionAPI.delete(row.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    reloadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
  finally { deleting.value = false }
}

const handleConfirmInspect = async (data: any) => { 
  inspecting.value = true
  try { 
    const failedQuantity = Number(data.failed_quantity || 0)
    await qualityInspectionAPI.complete(currentQuality.value.id, {
      ...data,
      result: failedQuantity > 0 ? 'failed' : 'passed'
    })
    useUIStore().showSuccess('检验完成')
    inspectDialogVisible.value = false
    reloadData()
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '检验失败') 
  } finally { 
    inspecting.value = false 
  } 
}

const handleSubmit = async (data: any) => { 
  submitting.value = true
  try { 
    await qualityInspectionAPI.create(data)
    useUIStore().showSuccess('创建成功')
    formDialogVisible.value = false
    reloadData()
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '创建失败') 
  } finally { 
    submitting.value = false 
  } 
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'inspect', label: '检验', icon: 'clipboard', tone: 'primary', visible: canEdit.value && row.result === 'pending' },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value && row.result === 'pending' }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'inspect': handleInspect(row); break
    case 'delete': confirmDelete(row); break
  }
}

onMounted(() => { reloadData(); fetchProducts() })
</script>
