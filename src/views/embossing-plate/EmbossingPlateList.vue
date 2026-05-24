<template>
  <TablePageLayout>
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-64"
            placeholder="搜索压凸版编码、名称、尺寸、材质"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          @click="loadData"
          :disabled="loading"
          class="btn btn-secondary"
          title="刷新"
        >
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button
          v-if="canCreate"
          @click="showCreateDialog"
          class="btn btn-primary"
        >
          <Icon name="plus" size="md" class="mr-2" />
          新建压凸版
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
          <div class="flex items-center gap-1">
            <button
              v-if="!row.confirmed && canEdit"
              @click="confirmPlate(row)"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            >
              <Icon name="check" size="sm" />
              <span class="text-xs">确认</span>
            </button>
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
            :description="hasFilters ? '未找到匹配的压凸版' : '暂无压凸版数据'"
            :action-text="hasFilters ? '重置筛选' : (canCreate && !hasFilters ? '创建第一个压凸版' : undefined)"
            @action="hasFilters ? handleReset() : showCreateDialog()"
          />
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

  <EmbossingPlateFormDialog
    v-model:visible="dialogVisible"
    :dialog-type="dialogType"
    :embossing-plate="currentEmbossingPlate"
    :loading="formLoading"
    :product-list="productList"
    @confirm="handleFormConfirm"
  />

  <!-- Delete Confirmation -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除压凸版「${selectedRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />

  <!-- Confirm Plate -->
  <ConfirmDialog
    :show="showConfirmDialog"
    title="确认压凸版"
    :message="`确定要确认压凸版「${selectedRow?.name}」吗？确认后关键字段将不可修改。`"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleConfirmPlate"
    @cancel="showConfirmDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { embossingPlateAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Icon, Tag, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import EmbossingPlateFormDialog from './components/EmbossingPlateFormDialog.vue'

const columns: Column[] = [
  { key: 'code', label: '压凸版编码', sortable: true, class: 'w-36' },
  { key: 'name', label: '压凸版名称', sortable: true, class: 'w-48' },
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
  loadData, handleSearch, handlePageChange, handleSizeChange, resetFilters
} = useCrudList(embossingPlateAPI, 'getList', { errorContext: '加载压凸版数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('embossingplate')
const crud = useCRUD(embossingPlateAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentEmbossingPlate = ref<any>(null)
const productList = ref<any[]>([])
const selectedRow = ref<any>(null)
const showDeleteDialog = ref(false)
const showConfirmDialog = ref(false)

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表失败') }
}

const showCreateDialog = () => { dialogType.value = 'create'; currentEmbossingPlate.value = null; dialogVisible.value = true }

const handleEdit = async (row: any) => {
  try { const detail: any = await embossingPlateAPI.getDetail(row.id); currentEmbossingPlate.value = detail; dialogType.value = 'edit'; dialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '加载压凸版详情失败') }
}

const confirmDelete = (row: any) => { selectedRow.value = row; showDeleteDialog.value = true }
const confirmPlate = (row: any) => { selectedRow.value = row; showConfirmDialog.value = true }

const handleDelete = async () => {
  try {
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
}

const handleConfirmPlate = async () => {
  try {
    await embossingPlateAPI.confirm(selectedRow.value.id)
    ElMessage.success('确认成功')
    showConfirmDialog.value = false
    await loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '确认失败') }
}

const handleFormConfirm = async (payload: any) => {
  const { form: formData, productItems } = payload
  formLoading.value = true
  const data = { ...formData }
  if (dialogType.value === 'create' && !data.code) delete data.code
  data.products_data = productItems.filter((item: any) => item.product).map((item: any) => ({ product: item.product, quantity: item.quantity || 1 }))
  if (dialogType.value === 'edit') { await crud.update(currentEmbossingPlate.value.id, data, '保存成功') } else { await crud.create(data, '创建成功') }
  formLoading.value = false
}

const handleReset = () => { resetFilters() }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
