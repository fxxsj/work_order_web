<template>
  <CrudPageLayout
    title="刀模管理"
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
        placeholder="搜索刀模编码、名称、尺寸、材质"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button class="btn btn-secondary btn-sm" :disabled="loading" @click="handleRefresh">
        <Icon name="refresh" size="sm" />
        刷新
      </button>
      <button v-if="canCreate" class="btn btn-primary btn-sm" @click="handleCreate">
        <Icon name="plus" size="sm" />
        新建刀模
      </button>
    </template>

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
        <div class="flex items-center gap-2">
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
          <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的刀模' : '暂无刀模数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个刀模' : undefined"
          @action="handleCreate"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <DieFormDialog v-model="dialogVisible" :dialog-type="dialogType" :initial-data="currentRow" :loading="formLoading" :product-list="productList" @submit="handleFormSubmit" @close="handleDialogClose" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dieAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, Icon } from '@/components/common'
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
const crud = useCRUD(dieAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref<any>(null)
const productList = ref<any[]>([])

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表') }
}

const handleRefresh = () => { loadData() }
const handleCreate = () => { currentRow.value = null; dialogType.value = 'create'; dialogVisible.value = true }

const handleEdit = async (row: any) => {
  try { const detail: any = await dieAPI.getDetail(row.id); currentRow.value = detail; dialogType.value = 'edit'; dialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '加载刀模详情') }
}

const handleFormSubmit = async (data: any) => {
  formLoading.value = true
  if (dialogType.value === 'edit' && currentRow.value) { await crud.update(currentRow.value.id, data, '保存成功') } else { await crud.create(data, '创建成功') }
  formLoading.value = false
}

const handleDialogClose = () => { currentRow.value = null }

const handleDelete = async (row: any) => {
  const confirmed = await ErrorHandler.confirm(`确定要删除刀模"${row.name}"吗？此操作不可恢复。`, '删除确认')
  if (!confirmed) return
  await crud.remove(row.id, '删除成功')
}

const getDieTypeTagType = (dieType: any) => { const typeMap = { combined: 'warning', dedicated: 'primary', universal: 'success' }; return (typeMap as any)[dieType] || 'info' }
const getDieTypeLabel = (dieType: any) => { const labelMap = { combined: '拼版刀模', dedicated: '专用刀模', universal: '通用刀模' }; return (labelMap as any)[dieType] || dieType }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
