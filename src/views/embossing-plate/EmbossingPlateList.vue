<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索压凸版编码、名称、尺寸、材质"
          @search="handleSearch"
          @clear="handleSearch"
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
          v-if="canCreate"
          class="btn btn-primary"
          @click="showCreateDialog"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
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
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '已确认' : '待确认' }}
          </Tag>
        </template>

        <template #cell-products="{ row }">
          <template v-if="row.products && row.products.length > 0">
            <Tag
              v-for="product in row.products"
              :key="product.id"
              class="mr-1 mb-1"
            >
              {{ product.product_name }} ({{ product.quantity }}个)
            </Tag>
          </template>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>

        <template #cell-created_at="{ value }">
          {{ formatDateTime(value) }}
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="[
              { key: 'confirm', label: '确认', icon: 'check', tone: 'success', visible: !row.confirmed && canEdit },
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的压凸版' : '暂无压凸版数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个压凸版' : undefined"
            @action="showCreateDialog"
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
    :loading="deleting"
    loading-text="删除中..."
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
    :loading="confirming"
    loading-text="确认中..."
    @confirm="handleConfirmPlate"
    @cancel="showConfirmDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { embossingPlateAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Icon, Tag, ConfirmDialog, RowActions, FilterRow } from '@/components/common'
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
  loadData, handleSearch, handlePageChange, handleSizeChange
} = useCrudList(embossingPlateAPI, 'getList', { errorContext: '加载压凸版数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('embossingplate')
const crud = useCRUD(embossingPlateAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const deleting = ref(false)
const confirming = ref(false)
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

const handleRowAction = (action: string, row: any) => {
  if (action === 'confirm') confirmPlate(row)
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') confirmDelete(row)
}

const handleDelete = async () => {
  try {
    deleting.value = true
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
  finally { deleting.value = false }
}

const handleConfirmPlate = async () => {
  try {
    confirming.value = true
    await embossingPlateAPI.confirm(selectedRow.value.id)
    useUIStore().showSuccess('确认成功')
    showConfirmDialog.value = false
    await loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '确认失败') }
  finally { confirming.value = false }
}

const handleFormConfirm = async (data: any) => {
  formLoading.value = true
  try {
    if (dialogType.value === 'edit') {
      await crud.update(currentEmbossingPlate.value.id, data, '保存成功')
    } else {
      await crud.create(data, '创建成功')
    }
  } finally {
    formLoading.value = false
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
