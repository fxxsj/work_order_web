<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索图稿编码、名称、拼版尺寸"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.confirmed"
          :options="confirmedOptions"
          placeholder="确认状态"
          clearable
          class="w-full sm:w-36"
          @change="handleSearchDebounced"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          v-if="canCreate"
          variant="primary"
          icon="plus"
          @click="openCreateModal"
        >
          新建图稿
        </BaseButton>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :server-side-sort="true"
        default-sort-key="code"
        default-sort-order="desc"
        @sort="handleSort"
      >
        <template #cell-code="{ row }">
          {{ row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : '')) }}
        </template>
        <template #cell-color_display="{ value }">
          <Tag v-if="value && value !== '-'">
            {{ value }}
          </Tag>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>
        <template #cell-confirmed="{ row }">
          <Tag
            :type="row.confirmed ? 'success' : 'info'"
            size="small"
          >
            {{ row.confirmed ? '已确认' : '未确认' }}
          </Tag>
          <div
            v-if="row.confirmed && row.confirmed_by_name"
            class="mt-1 text-xs text-gray-400"
          >
            {{ row.confirmed_by_name }}
          </div>
          <div
            v-if="row.confirmed && row.confirmed_at"
            class="text-xs text-gray-400"
          >
            {{ formatDateTime(row.confirmed_at) }}
          </div>
        </template>
        <template #cell-die_codes="{ row }">
          <template v-if="row.die_codes && row.die_codes.length > 0">
            <Tag
              v-for="(code, index) in row.die_codes"
              :key="index"
              class="mr-1 mb-1"
            >
              {{ code }}<span v-if="row.die_names && row.die_names[index]"> - {{ row.die_names[index] }}</span>
            </Tag>
          </template>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>
        <template #cell-foiling_plate_codes="{ row }">
          <template v-if="row.foiling_plate_codes && row.foiling_plate_codes.length > 0">
            <Tag
              v-for="(code, index) in row.foiling_plate_codes"
              :key="index"
              type="success"
              class="mr-1 mb-1"
            >
              {{ code }}<span v-if="row.foiling_plate_names && row.foiling_plate_names[index]"> - {{ row.foiling_plate_names[index] }}</span>
            </Tag>
          </template>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>
        <template #cell-embossing_plate_codes="{ row }">
          <template v-if="row.embossing_plate_codes && row.embossing_plate_codes.length > 0">
            <Tag
              v-for="(code, index) in row.embossing_plate_codes"
              :key="index"
              type="warning"
              class="mr-1 mb-1"
            >
              {{ code }}<span v-if="row.embossing_plate_names && row.embossing_plate_names[index]"> - {{ row.embossing_plate_names[index] }}</span>
            </Tag>
          </template>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>
        <template #cell-products="{ row }">
          <template v-if="row.products && row.products.length > 0">
            <Tag
              v-for="product in row.products"
              :key="product.id"
              class="mr-1 mb-1"
            >
              {{ product.product_name }} ({{ product.imposition_quantity }}拼)
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
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'version', label: '新版本', icon: 'document', visible: canEdit },
              { key: 'confirm', label: '确认', icon: 'check', tone: 'success', visible: !row.confirmed && canConfirm },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的图稿' : '暂无图稿数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个图稿' : undefined"
            @action="openCreateModal"
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

  <ArtworkFormDialog
    v-model:visible="formDialogVisible"
    :artwork="currentArtwork"
    :loading="submitting"
    :product-list="productList"
    :die-list="dieList"
    :foiling-plate-list="foilingPlateList"
    :embossing-plate-list="embossingPlateList"
    @confirm="handleFormConfirm"
  />

  <ConfirmDialog
    :show="showConfirmDialog"
    title="确认操作"
    message="确认该图稿？"
    confirm-text="确认"
    cancel-text="取消"
    :loading="confirming"
    loading-text="确认中..."
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
  />

  <ConfirmDialog
    :show="showCreateVersionDialog"
    title="创建新版本"
    :message="`确定要基于「${targetCodeForVersion}」创建新版本吗？`"
    confirm-text="创建"
    cancel-text="取消"
    :loading="creatingVersion"
    loading-text="创建中..."
    @confirm="createNewVersion"
    @cancel="cancelCreateVersion"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除图稿「${targetArtworkForDelete?.name}」吗？`"
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
import { useUIStore } from '@/stores/ui'
import { artworkAPI, productAPI, dieAPI, foilingPlateAPI, embossingPlateAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, BaseButton, Pagination, ConfirmDialog, Tag, RowActions, FilterRow, Select } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import ArtworkFormDialog from './components/ArtworkFormDialog.vue'
import { uploadPendingImages } from '@/utils/pendingImageUpload'

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortFieldMap: Record<string, string> = {
  code: 'base_code',
  color_display: 'base_code'
}

const buildArtworkParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  if (backendSortKey === 'base_code') {
    const ordering = sortOrder.value === 'desc' ? '-base_code,-version' : 'base_code,version'
    return { ...params, ordering }
  }
  const ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  return { ...params, ordering }
}

const columns: Column[] = [
  { key: 'code', label: '图稿编码', sortable: true, class: 'w-44' },
  { key: 'name', label: '图稿名称', sortable: true, class: 'w-48' },
  { key: 'color_display', label: '色数', sortable: false, class: 'w-48 text-center' },
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
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(artworkAPI, 'getList', {
  initialFilters: { confirmed: '' },
  buildParams: buildArtworkParams,
  errorContext: '加载图稿数据失败'
})

const confirmedOptions = [
  { value: true, label: '已确认' },
  { value: false, label: '未确认' }
]

const { canCreate, canEdit, canDelete } = useCrudPermission('artwork')
const canConfirm = canEdit
const crud = useCRUD(artworkAPI, { onSuccess: () => { closeFormDialog(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const currentArtwork = ref<any>(null)
const productList = ref<any[]>([])
const dieList = ref<any[]>([])
const foilingPlateList = ref<any[]>([])
const embossingPlateList = ref<any[]>([])

const showConfirmDialog = ref(false)
const confirming = ref(false)
const targetArtworkForConfirm = ref<any>(null)
const showCreateVersionDialog = ref(false)
const creatingVersion = ref(false)
const targetArtworkForVersion = ref<any>(null)
const targetCodeForVersion = ref('')
const showDeleteDialog = ref(false)
const deleting = ref(false)
const targetArtworkForDelete = ref<any>(null)

const formDialogVisible = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (visible: boolean) => {
    if (!visible) closeFormDialog()
  }
})

let referenceDataPromise: Promise<void> | null = null

const getResults = (response: unknown): any[] => {
  if (Array.isArray(response)) return response
  const payload = response as { results?: any[]; data?: any[] }
  return payload?.results || payload?.data || []
}

const loadReferenceData = async () => {
  const [products, dies, foilingPlates, embossingPlates] = await Promise.allSettled([
    productAPI.getList({ is_active: true, page_size: 100 }),
    dieAPI.getList({ page_size: 100 }),
    foilingPlateAPI.getList({ page_size: 100 }),
    embossingPlateAPI.getList({ page_size: 100 })
  ])

  if (products.status === 'fulfilled') productList.value = getResults(products.value)
  else ErrorHandler.showMessage(products.reason, '加载产品列表失败')

  if (dies.status === 'fulfilled') dieList.value = getResults(dies.value)
  else ErrorHandler.showMessage(dies.reason, '加载刀模列表失败')

  if (foilingPlates.status === 'fulfilled') foilingPlateList.value = getResults(foilingPlates.value)
  else ErrorHandler.showMessage(foilingPlates.reason, '加载烫金版列表失败')

  if (embossingPlates.status === 'fulfilled') embossingPlateList.value = getResults(embossingPlates.value)
  else ErrorHandler.showMessage(embossingPlates.reason, '加载压凸版列表失败')
}

const ensureReferenceData = () => {
  if (!referenceDataPromise) {
    referenceDataPromise = loadReferenceData().catch(error => {
      referenceDataPromise = null
      throw error
    })
  }
  return referenceDataPromise
}

const openConfirmDialog = (row: any) => {
  targetArtworkForConfirm.value = row
  showConfirmDialog.value = true
}

const cancelConfirm = () => {
  if (confirming.value) return
  showConfirmDialog.value = false
  targetArtworkForConfirm.value = null
}

const handleConfirm = async () => {
  const row = targetArtworkForConfirm.value
  if (!row) return
  confirming.value = true
  try {
    await artworkAPI.confirm(row.id)
    useUIStore().showSuccess('图稿已确认')
    showConfirmDialog.value = false
    targetArtworkForConfirm.value = null
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '确认失败')
  } finally {
    confirming.value = false
  }
}

const openCreateVersionDialog = (row: any) => {
  targetArtworkForVersion.value = row
  targetCodeForVersion.value = row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : ''))
  showCreateVersionDialog.value = true
}

const cancelCreateVersion = () => {
  if (creatingVersion.value) return
  showCreateVersionDialog.value = false
  targetArtworkForVersion.value = null
  targetCodeForVersion.value = ''
}

const createNewVersion = async () => {
  const row = targetArtworkForVersion.value
  if (!row) return
  creatingVersion.value = true
  try {
    await artworkAPI.createVersion(row.id)
    useUIStore().showSuccess('新版本创建成功')
    showCreateVersionDialog.value = false
    targetArtworkForVersion.value = null
    targetCodeForVersion.value = ''
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建新版本失败')
  } finally {
    creatingVersion.value = false
  }
}

const openCreateModal = async () => {
  try {
    await ensureReferenceData()
  } catch {
    return
  }
  currentArtwork.value = null
  showEditModal.value = false
  showCreateModal.value = true
}

const openEditModal = async (row: any) => {
  try {
    const [detail] = await Promise.all([
      artworkAPI.getDetail(row.id),
      ensureReferenceData()
    ])
    currentArtwork.value = detail
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载图稿编辑数据失败')
    return
  }
  showCreateModal.value = false
  showEditModal.value = true
}

const handleFormConfirm = async (formData: any) => {
  const { pendingImages = [], ...payload } = formData
  submitting.value = true
  try {
    if (showEditModal.value && currentArtwork.value) {
      await crud.update(currentArtwork.value.id, payload, '保存成功')
    } else {
      const created: any = await crud.create(payload, '创建成功')
      if (created?.id && pendingImages.length > 0) {
        try {
          await uploadPendingImages(artworkAPI, created.id, pendingImages)
        } catch (error: any) {
          ErrorHandler.showMessage(error, '图稿已创建，部分图片上传失败，请进入编辑页重试')
        }
      }
    }
  } finally {
    submitting.value = false
  }
}

const closeFormDialog = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentArtwork.value = null
}

const openDeleteDialog = (row: any) => {
  targetArtworkForDelete.value = row
  showDeleteDialog.value = true
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') openEditModal(row)
  if (action === 'version') openCreateVersionDialog(row)
  if (action === 'confirm') openConfirmDialog(row)
  if (action === 'delete') openDeleteDialog(row)
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  targetArtworkForDelete.value = null
}

const handleDelete = async () => {
  const row = targetArtworkForDelete.value
  if (!row) return
  deleting.value = true
  try {
    await crud.remove(row.id, '删除成功')
    showDeleteDialog.value = false
    targetArtworkForDelete.value = null
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleting.value = false
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

onMounted(loadData)
</script>
