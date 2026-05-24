<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索刀模编码、名称、尺寸、材质"
          @search="handleSearch"
          @clear="handleSearch"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button class="btn btn-secondary" :disabled="loading" @click="handleRefresh" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
          刷新
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="handleCreate">
          <Icon name="plus" size="md" class="mr-2" />
          新建刀模
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
        <template #cell-die_type="{ row }">
          <Tag :type="getDieTypeTagType(row.die_type)" size="small">{{ row.die_type_display || getDieTypeLabel(row.die_type) }}</Tag>
        </template>

        <template #cell-confirmed="{ value }">
          <Tag v-if="value" type="success" size="small">已确认</Tag>
          <Tag v-else type="info" size="small">待确认</Tag>
        </template>

        <template #cell-products="{ row }">
          <template v-if="row.products && row.products.length > 0">
            <Tag v-for="product in row.products" :key="product.id" :type="product.relation_type === 'imposition' ? 'warning' : ''" class="mr-1 mb-1">
              {{ product.product_name }} ({{ product.quantity }}拼)<span v-if="product.relation_type === 'imposition'" class="text-[10px]">拼</span>
            </Tag>
          </template>
          <span v-else class="text-gray-400 dark:text-dark-400">-</span>
        </template>

        <template #cell-created_at="{ value }">
          {{ formatDateTime(value) }}
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
            :description="hasFilters ? '未找到匹配的刀模' : '暂无刀模数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个刀模' : undefined"
            @action="handleCreate"
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @update:page-size="handleSizeChange"
        @update:page="handlePageChange"
      />
    </template>
  </TablePageLayout>

  <DieFormDialog
    v-model:visible="formDialogVisible"
    :dialog-type="dialogType"
    :initial-data="currentRow"
    :loading="submitting"
    :product-list="productList"
    @submit="handleFormSubmit"
    @close="handleDialogClose"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除刀模「${targetDieForDelete?.name}」吗？此操作不可恢复。`"
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
import { dieAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, Tag, ConfirmDialog, RowActions, FilterRow } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import DieFormDialog from './components/DieFormDialog.vue'

const columns: Column[] = [
  { key: 'code', label: '刀模编码', sortable: true, class: 'w-36' },
  { key: 'name', label: '刀模名称', sortable: true, class: 'w-48' },
  { key: 'die_type', label: '刀模类型', sortable: true, class: 'w-28' },
  { key: 'size', label: '尺寸', sortable: true, class: 'w-36' },
  { key: 'material', label: '材质', sortable: true, class: 'w-24' },
  { key: 'thickness', label: '厚度', sortable: true, class: 'w-20' },
  { key: 'confirmed', label: '确认状态', sortable: true, class: 'w-24' },
  { key: 'products', label: '包含产品', sortable: false, class: 'min-w-60' },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-44' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(dieAPI, 'getList', { errorContext: '加载刀模数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('die')
const crud = useCRUD(dieAPI, { onSuccess: () => { closeFormDialog(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const currentRow = ref<any>(null)
const productList = ref<any[]>([])

const targetDieForDelete = ref<any>(null)

const formDialogVisible = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (visible: boolean) => {
    if (!visible) closeFormDialog()
  }
})

const dialogType = computed(() => showEditModal.value ? 'edit' : 'create')

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表') }
}

const handleRefresh = () => { loadData() }
const handleCreate = () => {
  currentRow.value = null
  showEditModal.value = false
  showCreateModal.value = true
}

const handleEdit = async (row: any) => {
  try {
    const detail: any = await dieAPI.getDetail(row.id)
    currentRow.value = detail
    showCreateModal.value = false
    showEditModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载刀模详情')
  }
}

const handleFormSubmit = async (data: any) => {
  submitting.value = true
  try {
    if (showEditModal.value && currentRow.value) {
      await crud.update(currentRow.value.id, data, '保存成功')
    } else {
      await crud.create(data, '创建成功')
    }
  } finally {
    submitting.value = false
  }
}

const closeFormDialog = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentRow.value = null
}

const handleDialogClose = () => { closeFormDialog() }

const openDeleteDialog = (row: any) => {
  targetDieForDelete.value = row
  showDeleteDialog.value = true
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') openDeleteDialog(row)
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  targetDieForDelete.value = null
}

const handleDelete = async () => {
  const row = targetDieForDelete.value
  if (!row) return
  deleting.value = true
  try {
    await crud.remove(row.id, '删除成功')
    showDeleteDialog.value = false
    targetDieForDelete.value = null
  } finally {
    deleting.value = false
  }
}

const getDieTypeTagType = (dieType: any) => { const typeMap = { combined: 'warning', dedicated: 'primary', universal: 'success' }; return (typeMap as any)[dieType] || 'info' }
const getDieTypeLabel = (dieType: any) => { const labelMap = { combined: '拼版刀模', dedicated: '专用刀模', universal: '通用刀模' }; return (labelMap as any)[dieType] || dieType }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
