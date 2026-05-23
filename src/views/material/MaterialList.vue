<template>
  <CrudPageLayout
    title="物料管理"
    :loading="loading"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #search>
      <SearchInput
        v-model="searchText"
        class="w-full sm:w-72"
        placeholder="搜索物料名称、编码"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
        <Icon name="plus" size="sm" />
        新建物料
      </button>
    </template>

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
        <div class="flex items-center gap-2">
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
          <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的物料' : '暂无物料数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个物料' : undefined"
          @action="showCreateDialog"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <FormDialog
    ref="formDialogRef"
    v-model="dialogVisible"
    :title="formTitle"
    width="600px"
    :form-data="form"
    :rules="rules"
    label-width="110px"
    :loading="formLoading"
    @submit="handleSubmit"
    @cancel="resetForm"
  >
    <Input v-model="form.code" label="物料编码" required placeholder="请输入物料编码" :disabled="dialogType === 'edit'" />
    <Input v-model="form.name" label="物料名称" required placeholder="请输入物料名称" />
    <Input v-model="form.specification" label="规格" placeholder="请输入规格" />
    <Input v-model="form.unit" label="单位" required placeholder="如：个、张、本" />
    <Input v-model="form.unit_price" label="单价" type="number" placeholder="0.00" />
    <Input v-model="form.stock_quantity" label="库存数量" type="number" placeholder="0" />
    <Input v-model="form.min_stock_quantity" label="最小库存" type="number" placeholder="0" />
    <Input v-model="form.lead_time_days" label="采购周期（天）" type="number" placeholder="7" />
    <Toggle v-model="form.need_cutting" label="需要开料" />
    <Select
      v-model="form.default_supplier"
      label="默认供应商"
      placeholder="请选择供应商"
      :options="supplierOptions"
      filterable
      clearable
    />
    <TextArea v-model="form.notes" label="备注" placeholder="请输入备注" :rows="3" />
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { materialAPI, supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, FormDialog, Input, Select, TextArea, Toggle, Icon } from '@/components/common'
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
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(materialAPI, 'getList', { errorContext: '加载物料数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('material')
const crud = useCRUD(materialAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref<any>(null)
const supplierList = ref<any[]>([])
const formDialogRef = ref<any>(null)

const formInitialValues = { code: '', name: '', specification: '', unit: '个', unit_price: 0, stock_quantity: 0, min_stock_quantity: 0, lead_time_days: 7, need_cutting: false, default_supplier: null, notes: '' }
const form = reactive({ ...formInitialValues })
const rules = {
  code: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}
const formTitle = computed(() => dialogType.value === 'edit' ? '编辑物料' : '新建物料')

const supplierOptions = computed(() =>
  supplierList.value.map((s: any) => ({ value: s.id, label: `${s.code} - ${s.name}` }))
)

const loadSuppliers = async () => {
  try { const response: any = await supplierAPI.getList({ page_size: 1000, status: 'active' }); supplierList.value = response?.results || [] } catch (error: any) { ErrorHandler.handle(error, 'MaterialList.loadSuppliers') }
}

const showCreateDialog = () => { resetForm(); dialogVisible.value = true; dialogType.value = 'create'; currentRow.value = null }
const resetForm = () => { Object.assign(form, formInitialValues) }

const handleEdit = (row: any) => {
  dialogType.value = 'edit'; currentRow.value = row
  Object.assign(form, { code: row.code || '', name: row.name || '', specification: row.specification || '', unit: row.unit || '个', unit_price: Number(row.unit_price || 0), stock_quantity: Number(row.stock_quantity || 0), min_stock_quantity: Number(row.min_stock_quantity || 0), lead_time_days: Number(row.lead_time_days ?? 7), need_cutting: !!row.need_cutting, default_supplier: row.default_supplier || null, notes: row.notes || '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return
  formLoading.value = true
  if (dialogType.value === 'edit') { await crud.update(currentRow.value.id, form, '保存成功') } else { await crud.create(form, '创建成功') }
  formLoading.value = false
}

const handleDelete = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除物料"${row.name}"吗？此操作不可撤销。`)
    if (!confirmed) return
    await crud.remove(row.id, '删除成功')
  } catch (error: any) { ErrorHandler.showMessage(error, '删除') }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadSuppliers() })
</script>
