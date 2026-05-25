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
              v-model="filters.inspection_number"
              placeholder="搜索检验单号"
              class="w-full sm:w-64"
              @search="handleSearchDebounced"
              @clear="handleSearch"
            />
            <Select
              v-model="filters.inspection_type"
              :options="inspectionTypeOptions"
              class="w-36"
              placeholder="检验类型"
              clearable
              @change="handleSearch"
            />
            <Select
              v-model="filters.result"
              :options="resultOptions"
              class="w-36"
              placeholder="检验结果"
              clearable
              @change="handleSearch"
            />
          </div>
        </div>
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
          <template #cell-quantity="{ row }">
            <span>{{ row.quantity }}</span>
          </template>
          <template #cell-qualified_quantity="{ row }">
            <span>{{ row.qualified_quantity || '-' }}</span>
          </template>
          <template #cell-defective_quantity="{ row }">
            <span :class="row.defective_quantity > 0 ? 'text-danger' : ''">{{ row.defective_quantity || '-' }}</span>
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

const form = reactive({ id: null, product: null, batch_no: '', quantity: 0, inspection_type: 'final', notes: '' })

const columns: Column[] = [
  { key: 'inspection_number', label: '检验单号', width: 144 },
  { key: 'inspection_type_display', label: '检验类型', width: 96 },
  { key: 'product_name', label: '产品名称', minWidth: 208 },
  { key: 'batch_no', label: '批次号', width: 144 },
  { key: 'quantity', label: '检验数量', width: 96, align: 'right' },
  { key: 'qualified_quantity', label: '合格数量', width: 96, align: 'right' },
  { key: 'defective_quantity', label: '不合格数量', width: 112, align: 'right' },
  { key: 'result', label: '检验结果', width: 96 },
  { key: 'inspector_name', label: '检验员', width: 96 },
  { key: 'inspection_date', label: '检验日期', width: 112 },
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

const buildQualityParams = (params: any) => {
  const { inspection_number, ...nextParams } = params
  if (inspection_number) nextParams.search = inspection_number
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
} = useCrudList(qualityInspectionAPI, 'getList', {
  initialFilters: { inspection_number: '', inspection_type: '', result: '' },
  buildParams: buildQualityParams
})

const handleReset = () => resetFilters()

const fetchStats = async () => { 
  statsLoading.value = true
  try { 
    const response: any = await qualityInspectionAPI.getStats()
    stats.value = response || {} 
  } catch (error: any) { 
    stats.value = {} 
  } finally { 
    statsLoading.value = false 
  } 
}

const fetchProducts = async () => { 
  try { 
    const response: any = await productAPI.getList({ page_size: 1000 })
    productList.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
  } catch (error: any) {} 
}

const handleView = (row: any) => { currentQuality.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; Object.assign(form, { id: null, product: null, batch_no: '', quantity: 0, inspection_type: 'final', notes: '' }); formDialogVisible.value = true }
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
    loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
  finally { deleting.value = false }
}

const handleConfirmInspect = async (data: any) => { 
  inspecting.value = true
  try { 
    await qualityInspectionAPI.inspect(currentQuality.value.id, data)
    useUIStore().showSuccess('检验完成')
    inspectDialogVisible.value = false
    loadData()
    fetchStats() 
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
    loadData() 
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

onMounted(() => { loadData(); fetchStats(); fetchProducts() })
</script>

