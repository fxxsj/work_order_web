<template>
  <CrudPageLayout
    title="烫金版管理"
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
        placeholder="搜索烫金版编码、名称、尺寸、材质"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
        <Icon name="plus" size="sm" />
        新建烫金版
      </button>
    </template>

    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :row-key="(row: any) => row.id"
      @sort="handleSort"
    >
      <template #cell-foiling_type="{ value }">
        <Tag :type="value === 'gold' ? 'warning' : 'info'">{{ value === 'gold' ? '烫金' : '烫银' }}</Tag>
      </template>

      <template #cell-confirmed="{ value }">
        <Tag :type="value ? 'success' : 'info'">{{ value ? '已确认' : '待确认' }}</Tag>
      </template>

      <template #cell-products="{ row }">
        <template v-if="row.products && row.products.length > 0">
          <Tag v-for="product in row.products" :key="product.id" class="mr-1 mb-1">{{ product.product_name }} ({{ product.quantity }}个)</Tag>
        </template>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDateTime(value) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button v-if="!row.confirmed && canEdit" class="btn btn-ghost btn-sm text-success-600 dark:text-success-400" @click="handleConfirmPlate(row)">确认</button>
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
          <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的烫金版' : '暂无烫金版数据'"
          :action-text="hasFilters ? '重置筛选' : (canCreate && !hasFilters ? '创建第一个烫金版' : undefined)"
          @action="hasFilters ? handleReset() : showCreateDialog()"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <foiling-plate-form-dialog v-model="dialogVisible" :dialog-type="dialogType" :foiling-plate="currentFoilingPlate" :loading="formLoading" :product-list="productList" @confirm="handleFormConfirm" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { foilingPlateAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, Icon } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import FoilingPlateFormDialog from './components/FoilingPlateFormDialog.vue'

const columns: Column[] = [
  { key: 'code', label: '烫金版编码', sortable: true, class: 'w-36' },
  { key: 'name', label: '烫金版名称', sortable: true, class: 'w-48' },
  { key: 'foiling_type', label: '类型', sortable: true, class: 'w-24' },
  { key: 'size', label: '尺寸', sortable: true, class: 'w-36' },
  { key: 'material', label: '材质', sortable: true, class: 'w-28' },
  { key: 'thickness', label: '厚度', sortable: true, class: 'w-24' },
  { key: 'confirmed', label: '确认状态', sortable: true, class: 'w-24 text-center' },
  { key: 'products', label: '包含产品', sortable: false, class: 'min-w-48' },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-44' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-36' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize, hasFilters,
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, resetFilters
} = useCrudList(foilingPlateAPI, 'getList', { errorContext: '加载烫金版数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('foilingplate')
const crud = useCRUD(foilingPlateAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentFoilingPlate = ref<any>(null)
const productList = ref<any[]>([])

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表失败') }
}

const showCreateDialog = () => { dialogType.value = 'create'; currentFoilingPlate.value = null; dialogVisible.value = true }

const handleEdit = async (row: any) => {
  try { const detail: any = await foilingPlateAPI.getDetail(row.id); currentFoilingPlate.value = detail; dialogType.value = 'edit'; dialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '加载烫金版详情失败') }
}

const handleDelete = async (row: any) => {
  try { const confirmed = await ErrorHandler.confirm(`确定要删除烫金版"${row.name}"吗？此操作不可撤销。`); if (!confirmed) return; await crud.remove(row.id, '删除成功') } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
}

const handleConfirmPlate = async (row: any) => {
  try { const confirmed = await ErrorHandler.confirm(`确定要确认烫金版"${row.name}"吗？确认后关键字段将不可修改。`); if (!confirmed) return; await foilingPlateAPI.confirm(row.id); ElMessage.success('确认成功'); await loadData() } catch (error: any) { ErrorHandler.showMessage(error, '确认失败') }
}

const handleFormConfirm = async (payload: any) => {
  const { form: formData, productItems } = payload
  formLoading.value = true
  const data = { ...formData }
  if (dialogType.value === 'create' && !data.code) delete data.code
  data.products_data = productItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, quantity: item.quantity || 1 }))
  if (dialogType.value === 'edit') { await crud.update(currentFoilingPlate.value.id, data, '保存成功') } else { await crud.create(data, '创建成功') }
  formLoading.value = false
}

const handleReset = () => { resetFilters() }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
