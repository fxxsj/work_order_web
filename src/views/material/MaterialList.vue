<template>
  <TablePageLayout
    title="物料管理"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索物料名称、编码"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.is_active"
          :options="statusFilterOptions"
          class="w-full sm:w-36"
          placeholder="全部状态"
          clearable
          @change="handleSearch"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          variant="secondary"
          icon="download"
          :loading="exporting"
          @click="handleExport"
        >
          {{ exporting ? '导出中...' : '导出' }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="upload"
          @click="handleImportClick"
        >
          导入
        </BaseButton>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          class="hidden"
          @change="handleImportFile"
        >
        <BaseButton
          v-if="canCreate"
          variant="primary"
          icon="plus"
          @click="showCreateDialog"
        >
          新建物料
        </BaseButton>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :server-side-sort="true"
        default-sort-key="code"
        default-sort-order="asc"
        @sort="handleSort"
      >
        <template #cell-unit_price="{ value }">
          <span class="text-right">¥{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="[
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的物料' : '暂无物料数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个物料' : undefined"
            @action="showCreateDialog"
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        :total="total"
        :page="currentPage"
        :page-size="pageSize"
        @update:page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </template>
  </TablePageLayout>

  <MaterialFormDialog
    :visible="showCreateModal || showEditModal"
    :dialog-type="showEditModal ? 'edit' : 'create'"
    :material="selectedRow"
    :loading="submitting"
    :supplier-options="supplierOptions"
    @update:visible="(val: boolean) => { if (!val) closeModals() }"
    @confirm="handleSubmit"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除物料「${selectedRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleting"
    loading-text="删除中..."
    @confirm="handleDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { materialAPI, supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD, useExport } from '@/composables'
import { BaseButton, TablePageLayout, DataTable, EmptyState, SearchInput, ConfirmDialog, Pagination, RowActions, FilterRow } from '@/components/common'
import MaterialFormDialog from './components/MaterialFormDialog.vue'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'code', label: '物料编码', sortable: true },
  { key: 'name', label: '物料名称', sortable: true },
  { key: 'specification', label: '规格', sortable: false },
  { key: 'unit', label: '单位', sortable: true, class: 'w-20 text-center' },
  { key: 'unit_price', label: '单价', sortable: true, class: 'w-28 text-right' },
  { key: 'stock_quantity', label: '库存数量', sortable: true, class: 'w-28 text-right' },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('asc')

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(materialAPI, 'getList', {
  errorContext: '加载物料数据失败',
  initialFilters: { is_active: '' },
  buildParams: (params) => {
    const ordering = sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
    return { ...params, ordering }
  }
})

const statusFilterOptions = [
  { value: 'true', label: '启用' },
  { value: 'false', label: '停用' },
]

const { canCreate, canEdit, canDelete } = useCrudPermission('material')
const crud = useCRUD(materialAPI, { onSuccess: () => { closeModals(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const selectedRow = ref<any>(null)
const supplierList = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// Export
const { exporting, exportData } = useExport(
  (params) => materialAPI.exportMaterials(params),
  { fileNamePrefix: 'materials', fileExtension: 'xlsx' }
)

const handleExport = async () => {
  try { await exportData({}) } catch (error: any) { ErrorHandler.showMessage(error, '导出失败') }
}

// Import
const handleImportClick = () => { fileInput.value?.click() }

const handleImportFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const result: any = await materialAPI.importMaterials(file)
    const created = result.created_count || 0
    const updated = result.updated_count || 0
    const errors = result.error_count || 0
    if (errors === 0) {
      useUIStore().showSuccess(`导入成功: 新增 ${created} 条, 更新 ${updated} 条`)
    } else {
      useUIStore().showWarning(`导入完成: 新增 ${created} 条, 更新 ${updated} 条, 失败 ${errors} 条`)
    }
    await loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '导入失败')
  } finally {
    target.value = ''
  }
}

const supplierOptions = computed(() =>
  supplierList.value.map((s: any) => ({ value: s.id, label: `${s.code} - ${s.name}` }))
)

const loadSuppliers = async () => {
  try { 
    const response: any = await supplierAPI.getList({ page_size: 100, status: 'active' })
    const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
    supplierList.value = list
  } catch (error: any) { 
    ErrorHandler.handle(error, 'MaterialList.loadSuppliers') 
  }
}

const showCreateDialog = () => { 
  showCreateModal.value = true; 
  selectedRow.value = null 
}

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedRow.value = null
}

const handleEdit = (row: any) => {
  showEditModal.value = true; 
  selectedRow.value = row
}

const handleSubmit = async (payload: any) => {
  submitting.value = true
  try {
    if (showEditModal.value) {
      await crud.update(selectedRow.value.id, payload, '保存成功')
    } else {
      await crud.create(payload, '创建成功')
    }
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row: any) => {
  selectedRow.value = row;
  showDeleteDialog.value = true;
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') confirmDelete(row)
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  selectedRow.value = null
}

const handleDelete = async () => {
  if (!selectedRow.value) return;
  deleting.value = true
  try {
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false;
    selectedRow.value = null
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '删除') 
  } finally {
    deleting.value = false
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

onMounted(() => { loadData(); loadSuppliers() })
</script>
