<template>
  <TablePageLayout
    title="产品管理"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索产品名称、编码"
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
        <button
          :disabled="loading"
          class="btn btn-secondary"
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
          class="btn btn-secondary"
          :disabled="exporting"
          @click="handleExport"
        >
          <Icon
            name="download"
            size="md"
            class="mr-2"
          />
          {{ exporting ? '导出中...' : '导出' }}
        </button>
        <button
          class="btn btn-secondary"
          @click="handleImportClick"
        >
          <Icon
            name="upload"
            size="md"
            class="mr-2"
          />
          导入
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          class="hidden"
          @change="handleImportFile"
        >
        <button
          v-if="canCreate && tableData.length > 0"
          class="btn btn-primary"
          @click="showCreateDialog"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          新建产品
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
        @sort="handleSort"
      >
        <template #cell-product_type="{ row }">
          <Tag
            :type="row.product_type === 'single' ? '' : (row.product_type === 'group_main' ? 'warning' : 'info')"
            size="small"
          >
            {{ row.product_type_display || getProductTypeLabel(row.product_type) }}
          </Tag>
        </template>

        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '启用' : '禁用' }}
          </Tag>
        </template>

        <template #cell-unit_price="{ value }">
          <span class="text-right">¥{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="[
              { key: 'view', label: '查看', icon: 'eye', visible: true },
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的产品' : '暂无产品数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个产品' : undefined"
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

  <product-form-dialog
    :visible="showCreateModal || showEditModal"
    :dialog-type="showEditModal ? 'edit' : 'create'"
    :product="currentProduct"
    :loading="formLoading"
    :materials="materialList"
    :processes="allProcesses"
    :product-groups="productGroupList"
    @update:visible="(val: boolean) => { if(!val) closeModals() }"
    @confirm="handleFormConfirm"
  />

  <product-detail-dialog
    :visible="showDetailModal"
    :product="currentProduct"
    :processes="allProcesses"
    @update:visible="(val: boolean) => { if(!val) showDetailModal = false }"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除产品「${currentProduct?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { productAPI, processAPI, materialAPI, productMaterialAPI, productGroupAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD, useExport } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Select, Icon, Tag, ConfirmDialog, Pagination, RowActions, FilterRow } from '@/components/common'
import ProductFormDialog from './components/ProductFormDialog.vue'
import ProductDetailDialog from './components/ProductDetailDialog.vue'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import { uploadPendingImages } from '@/utils/pendingImageUpload'

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

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('asc')

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(productAPI, 'getList', {
  errorContext: '加载产品数据失败',
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

const { canCreate, canEdit, canDelete } = useCrudPermission('product')
const crud = useCRUD(productAPI, { onSuccess: () => { closeModals(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const formLoading = ref(false)
const currentProduct = ref<any>(null)

const allProcesses = ref<any[]>([])
const materialList = ref<any[]>([])
const productGroupList = ref([])
const fileInput = ref<HTMLInputElement | null>(null)

// Export
const { exporting, exportData } = useExport(
  (params) => productAPI.exportProducts(params),
  { fileNamePrefix: 'products', fileExtension: 'xlsx' }
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
    const result: any = await productAPI.importProducts(file)
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

const loadAllProcesses = async () => {
  try {
    let allProcessesArr: any[] = []; let page = 1; let hasMore = true
    while (hasMore) {
      const response: any = await processAPI.getList({ is_active: true, page_size: 100, page: page })
      const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
      if (list.length > 0) {
        allProcessesArr = allProcessesArr.concat(list);
        hasMore = response.next !== null && response.next !== undefined;
        page++
      } else {
        hasMore = false
      }
    }
    allProcesses.value = allProcessesArr
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载工序列表')
  }
}

const loadMaterialList = async () => {
  try {
    const response: any = await materialAPI.getList({ page_size: 100 });
    const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
    materialList.value = list
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载物料列表')
  }
}

const loadProductGroupList = async () => {
  try {
    const response: any = await productGroupAPI.getList({ page_size: 100, is_active: true });
    const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
    productGroupList.value = list
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载产品组列表')
  }
}

const showCreateDialog = () => {
  currentProduct.value = null;
  showCreateModal.value = true
}

const handleView = async (row: any) => {
  try {
    const detail: any = await productAPI.getDetail(row.id);
    currentProduct.value = detail;
    showDetailModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载产品详情')
  }
}

const handleEdit = async (row: any) => {
  try {
    const detail: any = await productAPI.getDetail(row.id);
    currentProduct.value = detail;
    showEditModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载产品详情')
  }
}

const confirmDelete = (row: any) => {
  currentProduct.value = row;
  showDeleteDialog.value = true;
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'view') handleView(row)
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') confirmDelete(row)
}

const handleDelete = async () => {
  if (!currentProduct.value) return;
  try {
    await crud.remove(currentProduct.value.id, '删除成功')
    showDeleteDialog.value = false;
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
}

const handleFormConfirm = async (payload: any) => {
  const { form: formData, materialItems, pendingImages = [] } = payload;
  formLoading.value = true
  try {
    let productId
    if (showEditModal.value) {
      await productAPI.update(currentProduct.value.id, formData);
      productId = currentProduct.value.id;
      useUIStore().showSuccess('保存成功')
    }
    else {
      const result: any = await productAPI.create(formData);
      productId = result.id;
      useUIStore().showSuccess('创建成功')
    }
    await saveProductMaterials(productId, materialItems)
    if (!showEditModal.value && pendingImages.length > 0) {
      try {
        await uploadPendingImages(productAPI, productId, pendingImages)
      } catch (error: any) {
        ErrorHandler.showMessage(error, '产品已创建，部分图片上传失败，请进入编辑页重试')
      }
    }
    closeModals()
    await loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, showEditModal.value ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const saveProductMaterials = async (productId: any, materialItems: any) => {
  if (showEditModal.value) {
    try {
      const existingMaterials: any = await productMaterialAPI.getList({ product: productId });
      const list = Array.isArray(existingMaterials) ? existingMaterials : (existingMaterials?.results || existingMaterials?.data || [])
      for (const material of list) {
        await productMaterialAPI.delete(material.id)
      }
    } catch (error: any) {
      logger.warn('删除现有物料失败', error)
    }
  }
  for (let i = 0; i < materialItems.length; i++) {
    const item = materialItems[i]
    if (item.material) {
      try {
        await productMaterialAPI.create({ product: productId, material: item.material, material_size: item.material_size || '', material_usage: item.material_usage || '', need_cutting: item.need_cutting || false, notes: item.notes || '', sort_order: i })
      } catch (error: any) {
        logger.warn('保存物料失败', error)
      }
    }
  }
}

const getProductTypeLabel = (type: any) => {
  const labels = { single: '单品', group_main: '套装主产品', group_item: '套装子产品' };
  return (labels as any)[type] || '未知'
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  loadData()
}

onMounted(() => { loadData(); loadAllProcesses(); loadMaterialList(); loadProductGroupList() })
</script>
