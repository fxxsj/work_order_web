<template>
  <CrudPageLayout
    title="产品管理"
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
        placeholder="搜索产品名称、编码"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button v-if="canCreate && tableData.length > 0" class="btn btn-primary" @click="showCreateDialog">
        <Icon name="plus" size="sm" />
        新建产品
      </button>
    </template>

    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :row-key="(row: any) => row.id"
      @sort="handleSort"
    >
      <template #cell-product_type="{ row }">
        <Tag :type="row.product_type === 'single' ? '' : (row.product_type === 'group_main' ? 'warning' : 'info')" size="small">
          {{ row.product_type_display || getProductTypeLabel(row.product_type) }}
        </Tag>
      </template>

      <template #cell-is_active="{ value }">
        <Tag :type="value ? 'success' : 'info'">{{ value ? '启用' : '禁用' }}</Tag>
      </template>

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
          :description="hasFilters ? '未找到匹配的产品' : '暂无产品数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个产品' : undefined"
          @action="showCreateDialog"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <product-form-dialog v-model:visible="dialogVisible" :dialog-type="dialogType" :product="currentProduct" :loading="formLoading" :materials="materialList" :processes="allProcesses" :product-groups="productGroupList" @confirm="handleFormConfirm" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { productAPI, processAPI, materialAPI, productMaterialAPI, productGroupAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, Icon } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'

const columns: Column[] = [
  { key: 'code', label: '产品编码', sortable: true, class: 'w-28' },
  { key: 'name', label: '产品名称', sortable: true, class: 'w-48' },
  { key: 'product_type', label: '产品类型', sortable: true, class: 'w-28 text-center' },
  { key: 'product_group_name', label: '所属产品组', sortable: true, class: 'w-36' },
  { key: 'specification', label: '规格', sortable: false },
  { key: 'unit', label: '单位', sortable: true, class: 'w-20 text-center' },
  { key: 'unit_price', label: '单价', sortable: true, class: 'w-28 text-right' },
  { key: 'stock_quantity', label: '库存数量', sortable: true, class: 'w-24 text-right' },
  { key: 'min_stock_quantity', label: '最小库存', sortable: true, class: 'w-24 text-right' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-36' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(productAPI, 'getList', { errorContext: '加载产品数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('product')
const crud = useCRUD(productAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentProduct = ref<any>(null)
const allProcesses = ref<any[]>([])
const materialList = ref<any[]>([])
const productGroupList = ref<any[]>([])

const loadAllProcesses = async () => {
  try {
    let allProcessesArr: any[] = []; let page = 1; let hasMore = true
    while (hasMore) {
      const response: any = await processAPI.getList({ is_active: true, page_size: 100, page: page })
      if (response.results && response.results.length > 0) { allProcessesArr = allProcessesArr.concat(response.results); hasMore = response.next !== null && response.next !== undefined; page++ } else { hasMore = false }
    }
    allProcesses.value = allProcessesArr
  } catch (error: any) { ErrorHandler.showMessage(error, '加载工序列表') }
}

const loadMaterialList = async () => {
  try { const response: any = await materialAPI.getList({ page_size: 100 }); materialList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载物料列表') }
}

const loadProductGroupList = async () => {
  try { const response: any = await productGroupAPI.getList({ page_size: 100, is_active: true }); productGroupList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品组列表') }
}

const showCreateDialog = () => { dialogType.value = 'create'; currentProduct.value = null; dialogVisible.value = true }

const handleEdit = async (row: any) => {
  try { const detail: any = await productAPI.getDetail(row.id); currentProduct.value = detail; dialogType.value = 'edit'; dialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '加载产品详情') }
}

const handleDelete = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除产品"${row.name}"吗？此操作不可撤销。`)
    if (!confirmed) return
    await crud.remove(row.id, '删除成功')
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
}

const handleFormConfirm = async (payload: any) => { const { form: formData, materialItems } = payload;
  formLoading.value = true
  try {
    let productId
    if (dialogType.value === 'edit') { await productAPI.update(currentProduct.value.id, formData); productId = currentProduct.value.id; ElMessage.success('保存成功') }
    else { const result: any = await productAPI.create(formData); productId = result.id; ElMessage.success('创建成功') }
    await saveProductMaterials(productId, materialItems)
    dialogVisible.value = false
    await loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存失败' : '创建失败') } finally { formLoading.value = false }
}

const saveProductMaterials = async (productId: any, materialItems: any) => {
  if (dialogType.value === 'edit') {
    try { const existingMaterials: any = await productMaterialAPI.getList({ product: productId }); for (const material of existingMaterials?.results || []) { await productMaterialAPI.delete(material.id) } } catch (error: any) { logger.warn('删除现有物料失败', error) }
  }
  for (let i = 0; i < materialItems.length; i++) {
    const item = materialItems[i]
    if (item.material) {
      try { await productMaterialAPI.create({ product: productId, material: item.material, material_size: item.material_size || '', material_usage: item.material_usage || '', need_cutting: item.need_cutting || false, notes: item.notes || '', sort_order: i }) } catch (error: any) { logger.warn('保存物料失败', error) }
    }
  }
}

const getProductTypeLabel = (type: any) => { const labels = { single: '单品', group_main: '套装主产品', group_item: '套装子产品' }; return (labels as any)[type] || '未知' }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadAllProcesses(); loadMaterialList(); loadProductGroupList() })
</script>
