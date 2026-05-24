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
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
          <Icon name="plus" size="md" class="mr-2" />
          新建物料
        </button>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
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

  <BaseDialog
    :show="showCreateModal || showEditModal"
    :title="showEditModal ? '编辑物料' : '新建物料'"
    width="normal"
    @close="closeModals"
  >
    <form id="entity-form" @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <Input v-model="form.code" label="物料编码" required placeholder="请输入物料编码" :disabled="showEditModal" />
      </div>
      <div>
        <Input v-model="form.name" label="物料名称" required placeholder="请输入物料名称" />
      </div>
      <div>
        <Input v-model="form.specification" label="规格" placeholder="请输入规格" />
      </div>
      <div>
        <Input v-model="form.unit" label="单位" required placeholder="如：个、张、本" />
      </div>
      <InputNumber
        v-model="form.unit_price"
        label="单价"
        :min="0"
        :step="0.01"
        :precision="2"
      />
      <InputNumber
        v-model="form.stock_quantity"
        label="库存数量"
        :min="0"
      />
      <InputNumber
        v-model="form.min_stock_quantity"
        label="最小库存"
        :min="0"
      />
      <InputNumber
        v-model="form.lead_time_days"
        label="采购周期（天）"
        :min="0"
      />
      <Toggle
        v-model="form.need_cutting"
        label="需要开料"
      />
      <Select
        v-model="form.default_supplier"
        label="默认供应商"
        placeholder="请选择供应商"
        :options="supplierOptions"
        filterable
        clearable
      />
      
      <div>
        <TextArea v-model="form.notes" label="备注" placeholder="请输入备注" :rows="3" />
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button @click="closeModals" type="button" class="btn btn-secondary">取消</button>
        <button form="entity-form" type="submit" :disabled="submitting" class="btn btn-primary">
          <Icon v-if="submitting" name="refresh" size="sm" class="-ml-1 mr-2 animate-spin" />
          {{ submitting ? '保存中...' : (showEditModal ? '更新' : '创建') }}
        </button>
      </div>
    </template>
  </BaseDialog>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { materialAPI, supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, BaseDialog, ConfirmDialog, Pagination, Input, InputNumber, Select, TextArea, Toggle, Icon, RowActions, FilterRow } from '@/components/common'
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

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(materialAPI, 'getList', { errorContext: '加载物料数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('material')
const crud = useCRUD(materialAPI, { onSuccess: () => { closeModals(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const selectedRow = ref<any>(null)
const supplierList = ref<any[]>([])

const formInitialValues = { code: '', name: '', specification: '', unit: '个', unit_price: 0, stock_quantity: 0, min_stock_quantity: 0, lead_time_days: 7, need_cutting: false, default_supplier: null, notes: '' }
const form = reactive({ ...formInitialValues })

const supplierOptions = computed(() =>
  supplierList.value.map((s: any) => ({ value: s.id, label: `${s.code} - ${s.name}` }))
)

const loadSuppliers = async () => {
  try { 
    const response: any = await supplierAPI.getList({ page_size: 1000, status: 'active' })
    const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
    supplierList.value = list
  } catch (error: any) { 
    ErrorHandler.handle(error, 'MaterialList.loadSuppliers') 
  }
}

const showCreateDialog = () => { 
  resetForm(); 
  showCreateModal.value = true; 
  selectedRow.value = null 
}

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
}

const resetForm = () => { Object.assign(form, formInitialValues) }

const handleEdit = (row: any) => {
  showEditModal.value = true; 
  selectedRow.value = row
  Object.assign(form, { code: row.code || '', name: row.name || '', specification: row.specification || '', unit: row.unit || '个', unit_price: Number(row.unit_price || 0), stock_quantity: Number(row.stock_quantity || 0), min_stock_quantity: Number(row.min_stock_quantity || 0), lead_time_days: Number(row.lead_time_days ?? 7), need_cutting: !!row.need_cutting, default_supplier: row.default_supplier || null, notes: row.notes || '' })
}

const handleSubmit = async () => {
  if (!form.code || !form.name || !form.unit) {
    ErrorHandler.showMessage('请填写必填项', '验证失败')
    return
  }

  submitting.value = true
  try {
    if (showEditModal.value) { 
      await crud.update(selectedRow.value.id, form, '保存成功') 
    } else { 
      await crud.create(form, '创建成功') 
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
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadSuppliers() })
</script>
