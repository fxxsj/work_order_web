<template>
  <TablePageLayout
    title="产品管理"
    :loading="loading"
  >
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-72"
            placeholder="搜索产品名称、编码"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button v-if="canCreate && tableData.length > 0" class="btn btn-primary" @click="showCreateDialog">
          <Icon name="plus" size="md" class="mr-2" />
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
          <div class="flex items-center gap-1">
            <button
              v-if="canEdit"
              @click="handleEdit(row)"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400"
            >
              <Icon name="edit" size="sm" />
              <span class="text-xs">编辑</span>
            </button>
            <button
              v-if="canDelete"
              @click="confirmDelete(row)"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <Icon name="trash" size="sm" />
              <span class="text-xs">删除</span>
            </button>
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
    @update:visible="(val: boolean) => { if(!val) closeModals() }"
    :dialog-type="showEditModal ? 'edit' : 'create'" 
    :product="currentProduct" 
    :loading="formLoading" 
    :materials="materialList" 
    :processes="allProcesses" 
    :product-groups="productGroupList" 
    @confirm="handleFormConfirm" 
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
import { ElMessage } from '@/utils/message'
import { productAPI, processAPI, materialAPI, productMaterialAPI, productGroupAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Tag, ConfirmDialog, Pagination } from '@/components/common'
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
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(productAPI, 'getList', { errorContext: '加载产品数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('product')
const crud = useCRUD(productAPI, { onSuccess: () => { closeModals(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
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
  const { form: formData, materialItems } = payload;
  formLoading.value = true
  try {
    let productId
    if (showEditModal.value) { 
      await productAPI.update(currentProduct.value.id, formData); 
      productId = currentProduct.value.id; 
      ElMessage.success('保存成功') 
    }
    else { 
      const result: any = await productAPI.create(formData); 
      productId = result.id; 
      ElMessage.success('创建成功') 
    }
    await saveProductMaterials(productId, materialItems)
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
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadAllProcesses(); loadMaterialList(); loadProductGroupList() })
</script>
