<template>
  <CrudPageLayout
    title="图稿管理"
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
        placeholder="搜索图稿编码、名称、拼版尺寸"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button class="btn btn-secondary btn-sm" @click="loadData">
        <Icon name="refresh" size="sm" />
        刷新
      </button>
      <button v-if="canCreate" class="btn btn-primary btn-sm" @click="showDialog()">
        <Icon name="plus" size="sm" />
        新建图稿
      </button>
    </template>

    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :row-key="(row: any) => row.id"
      @sort="handleSort"
    >
      <template #cell-code="{ row }">
        {{ row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : '')) }}
      </template>

      <template #cell-color_display="{ value }">
        <Tag v-if="value && value !== '-'">{{ value }}</Tag>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-confirmed="{ row }">
        <Tag :type="row.confirmed ? 'success' : 'info'" size="small">{{ row.confirmed ? '已确认' : '未确认' }}</Tag>
        <div v-if="row.confirmed && row.confirmed_by_name" class="mt-1 text-xs text-gray-400">{{ row.confirmed_by_name }}</div>
        <div v-if="row.confirmed && row.confirmed_at" class="text-xs text-gray-400">{{ formatDateTime(row.confirmed_at) }}</div>
      </template>

      <template #cell-die_codes="{ row }">
        <template v-if="row.die_codes && row.die_codes.length > 0">
          <Tag v-for="(code, index) in row.die_codes" :key="index" class="mr-1 mb-1">{{ code }}<span v-if="row.die_names && row.die_names[index]"> - {{ row.die_names[index] }}</span></Tag>
        </template>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-foiling_plate_codes="{ row }">
        <template v-if="row.foiling_plate_codes && row.foiling_plate_codes.length > 0">
          <Tag v-for="(code, index) in row.foiling_plate_codes" :key="index" type="success" class="mr-1 mb-1">{{ code }}<span v-if="row.foiling_plate_names && row.foiling_plate_names[index]"> - {{ row.foiling_plate_names[index] }}</span></Tag>
        </template>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-embossing_plate_codes="{ row }">
        <template v-if="row.embossing_plate_codes && row.embossing_plate_codes.length > 0">
          <Tag v-for="(code, index) in row.embossing_plate_codes" :key="index" type="warning" class="mr-1 mb-1">{{ code }}<span v-if="row.embossing_plate_names && row.embossing_plate_names[index]"> - {{ row.embossing_plate_names[index] }}</span></Tag>
        </template>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-products="{ row }">
        <template v-if="row.products && row.products.length > 0">
          <Tag v-for="product in row.products" :key="product.id" class="mr-1 mb-1">{{ product.product_name }} ({{ product.imposition_quantity }}拼)</Tag>
        </template>
        <span v-else class="text-gray-400 dark:text-dark-400">-</span>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDateTime(value) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="showDialog(row)">编辑</button>
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="createNewVersion(row)">创建新版本</button>
          <button v-if="!row.confirmed && canConfirm" class="btn btn-ghost btn-sm text-success-600 dark:text-success-400" @click="handleConfirm(row)">确认</button>
          <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的图稿' : '暂无图稿数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个图稿' : undefined"
          @action="showDialog()"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <ArtworkFormDialog v-model="dialogVisible" :artwork="currentArtwork" :loading="formLoading" :product-list="productList" :die-list="dieList" :foiling-plate-list="foilingPlateList" :embossing-plate-list="embossingPlateList" @confirm="handleFormConfirm" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { artworkAPI, productAPI, dieAPI, foilingPlateAPI, embossingPlateAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, Icon } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import ArtworkFormDialog from './components/ArtworkFormDialog.vue'

const columns: Column[] = [
  { key: 'code', label: '图稿编码', sortable: true, class: 'w-44' },
  { key: 'name', label: '图稿名称', sortable: true, class: 'w-48' },
  { key: 'color_display', label: '色数', sortable: true, class: 'w-48 text-center' },
  { key: 'imposition_size', label: '拼版尺寸', sortable: true, class: 'w-44' },
  { key: 'confirmed', label: '确认状态', sortable: true, class: 'w-28 text-center' },
  { key: 'die_codes', label: '关联刀模', sortable: false, class: 'min-w-48' },
  { key: 'foiling_plate_codes', label: '关联烫金版', sortable: false, class: 'min-w-48' },
  { key: 'embossing_plate_codes', label: '关联压凸版', sortable: false, class: 'min-w-48' },
  { key: 'products', label: '包含产品', sortable: false, class: 'min-w-48' },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-44' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-44' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(artworkAPI, 'getList', { errorContext: '加载图稿数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('artwork')
const canConfirm = canEdit
const crud = useCRUD(artworkAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const formLoading = ref(false)
const currentArtwork = ref<any>(null)
const productList = ref<any[]>([])
const dieList = ref<any[]>([])
const foilingPlateList = ref<any[]>([])
const embossingPlateList = ref<any[]>([])

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表失败') }
}
const loadDieList = async () => {
  try { const response: any = await dieAPI.getList({ page_size: 100 }); dieList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载刀模列表失败') }
}
const loadFoilingPlateList = async () => {
  try { const response: any = await foilingPlateAPI.getList({ page_size: 100 }); foilingPlateList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载烫金版列表失败') }
}
const loadEmbossingPlateList = async () => {
  try { const response: any = await embossingPlateAPI.getList({ page_size: 100 }); embossingPlateList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载压凸版列表失败') }
}

const handleConfirm = async (row: any) => {
  try { const confirmed = await ErrorHandler.confirm('确认该图稿？', '确认操作'); if (!confirmed) return; await artworkAPI.confirm(row.id); ElMessage.success('图稿已确认'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '确认失败') }
}

const createNewVersion = async (row: any) => {
  const fullCode = row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : ''))
  try { const confirmed = await ErrorHandler.confirm(`确定要基于 "${fullCode}" 创建新版本吗？`, '创建新版本'); if (!confirmed) return; await artworkAPI.createVersion(row.id); ElMessage.success('新版本创建成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '创建新版本失败') }
}

const showDialog = async (row = null) => {
  if (row) {
    try { const detail: any = await artworkAPI.getDetail((row as any).id); currentArtwork.value = detail } catch (error: any) { ErrorHandler.showMessage(error, '加载图稿详情失败'); return }
  } else { currentArtwork.value = null }
  dialogVisible.value = true
}

const handleFormConfirm = async (formData: any) => {
  formLoading.value = true
  if (currentArtwork.value) { await crud.update(currentArtwork.value.id, formData, '保存成功') } else { await crud.create(formData, '创建成功') }
  formLoading.value = false
}

const handleDelete = async (row: any) => {
  try { const confirmed = await ErrorHandler.confirm(`确定要删除图稿"${row.name}"吗？`); if (!confirmed) return; await crud.remove(row.id, '删除成功') } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList(); loadDieList(); loadFoilingPlateList(); loadEmbossingPlateList() })
</script>
