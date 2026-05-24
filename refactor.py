import os

files_to_write = {}

files_to_write['/home/chenjiaxing/文档/work_order/web/src/views/artwork/ArtworkList.vue'] = """<template>
  <TablePageLayout>
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-72"
            placeholder="搜索图稿编码、名称、拼版尺寸"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button class="btn btn-secondary" @click="loadData" :disabled="loading" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
          刷新
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="showDialog()">
          <Icon name="plus" size="md" class="mr-2" />
          新建图稿
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
          <div class="flex items-center gap-1">
            <button v-if="canEdit" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="showDialog(row)">
              <Icon name="edit" size="sm" />
              <span class="text-xs">编辑</span>
            </button>
            <button v-if="canEdit" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="openCreateVersionDialog(row)">
              <Icon name="document-copy" size="sm" />
              <span class="text-xs">新版本</span>
            </button>
            <button v-if="!row.confirmed && canConfirm" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400" @click="openConfirmDialog(row)">
              <Icon name="check" size="sm" />
              <span class="text-xs">确认</span>
            </button>
            <button v-if="canDelete" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" @click="openDeleteDialog(row)">
              <Icon name="trash" size="sm" />
              <span class="text-xs">删除</span>
            </button>
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

  <ArtworkFormDialog v-model="dialogVisible" :artwork="currentArtwork" :loading="formLoading" :product-list="productList" :die-list="dieList" :foiling-plate-list="foilingPlateList" :embossing-plate-list="embossingPlateList" @confirm="handleFormConfirm" />

  <ConfirmDialog
    :show="showConfirmDialogFlag"
    title="确认操作"
    message="确认该图稿？"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleConfirm"
    @cancel="showConfirmDialogFlag = false"
  />

  <ConfirmDialog
    :show="showCreateVersionDialogFlag"
    title="创建新版本"
    :message="`确定要基于 \x22${targetCodeForVersion}\x22 创建新版本吗？`"
    confirm-text="创建"
    cancel-text="取消"
    @confirm="createNewVersion"
    @cancel="showCreateVersionDialogFlag = false"
  />

  <ConfirmDialog
    :show="showDeleteDialogFlag"
    title="删除确认"
    :message="`确定要删除图稿\x22${targetArtworkForDelete?.name}\x22吗？`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialogFlag = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { artworkAPI, productAPI, dieAPI, foilingPlateAPI, embossingPlateAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, ConfirmDialog, Tag } from '@/components/common'
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

const showConfirmDialogFlag = ref(false)
const targetArtworkForConfirm = ref<any>(null)
const showCreateVersionDialogFlag = ref(false)
const targetArtworkForVersion = ref<any>(null)
const targetCodeForVersion = ref('')
const showDeleteDialogFlag = ref(false)
const targetArtworkForDelete = ref<any>(null)

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表失败') }
}
const loadDieList = async () => {
  try { const response: any = await dieAPI.getList({ page_size: 100 }); dieList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载刀模列表失败') }
}
const loadFoilingPlateList = async () => {
  try { const response: any = await foilingPlateAPI.getList({ page_size: 100 }); foilingPlateList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载烫金版列表失败') }
}
const loadEmbossingPlateList = async () => {
  try { const response: any = await embossingPlateAPI.getList({ page_size: 100 }); embossingPlateList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载压凸版列表失败') }
}

const openConfirmDialog = (row: any) => {
  targetArtworkForConfirm.value = row
  showConfirmDialogFlag.value = true
}

const handleConfirm = async () => {
  const row = targetArtworkForConfirm.value
  showConfirmDialogFlag.value = false
  if (!row) return
  try { await artworkAPI.confirm(row.id); ElMessage.success('图稿已确认'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '确认失败') }
}

const openCreateVersionDialog = (row: any) => {
  targetArtworkForVersion.value = row
  targetCodeForVersion.value = row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : ''))
  showCreateVersionDialogFlag.value = true
}

const createNewVersion = async () => {
  const row = targetArtworkForVersion.value
  showCreateVersionDialogFlag.value = false
  if (!row) return
  try { await artworkAPI.createVersion(row.id); ElMessage.success('新版本创建成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '创建新版本失败') }
}

const showDialog = async (row: any = null) => {
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

const openDeleteDialog = (row: any) => {
  targetArtworkForDelete.value = row
  showDeleteDialogFlag.value = true
}

const handleDelete = async () => {
  const row = targetArtworkForDelete.value
  showDeleteDialogFlag.value = false
  if (!row) return
  try { await crud.remove(row.id, '删除成功') } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList(); loadDieList(); loadFoilingPlateList(); loadEmbossingPlateList() })
</script>
"""

files_to_write['/home/chenjiaxing/文档/work_order/web/src/views/audit/AuditLogList.vue'] = """<template>
  <div class="audit-log-list space-y-6">
    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #409EFF;">
            <Icon name="document" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).total_count || 0 }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #67C23A;">
            <Icon name="plus" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.create || 0 }}</div>
            <div class="stat-label">创建</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #E6A23C;">
            <Icon name="edit" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.update || 0 }}</div>
            <div class="stat-label">更新</div>
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: #F56C6C;">
            <Icon name="trash" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any).action_type_stats?.delete || 0 }}</div>
            <div class="stat-label">删除</div>
          </div>
        </div>
      </div>
    </div>

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select v-model="filters.action_type" :options="actionTypeOptions" class="audit-filter-control" placeholder="操作类型" clearable @change="handleSearch" />
            <Select v-model="filters.model" :options="modelOptions" class="audit-filter-control" placeholder="对象类型" clearable @change="handleSearch" />
            <input v-model="filters.user" class="input audit-filter-control" placeholder="用户ID" @keyup.enter="handleSearch" />
            <input v-model="filters.object_id" class="input audit-filter-control" placeholder="对象ID" @keyup.enter="handleSearch" />
            <input v-model="filters.ip_address" class="input audit-filter-control" placeholder="IP地址" @keyup.enter="handleSearch" />
            <input type="date" v-model="filters.start_date" class="input audit-filter-control" placeholder="开始日期" @change="handleSearch" />
            <input type="date" v-model="filters.end_date" class="input audit-filter-control" placeholder="结束日期" @change="handleSearch" />
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3 items-center">
          <SearchInput v-model="searchText" class="audit-search-control" placeholder="搜索对象/用户名/IP" @search="handleSearch" @clear="handleSearch" />
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
          <button class="btn btn-primary" v-if="canExportAuditLog" @click="exportDialogVisible = true">导出</button>
          <button class="btn btn-secondary" v-if="canViewAuditExport" @click="openExportList">导出记录</button>
        </div>
      </template>

      <template #table>
        <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
          <template #cell-created_at="{ row }"><span>{{ formatDateTime(row.created_at) }}</span></template>
          <template #cell-action_type="{ row }"><Tag :type="actionTagType(row.action_type)" size="small">{{ actionTypeLabel(row.action_type) }}</Tag></template>
          <template #cell-username="{ row }"><span>{{ row.username }}</span></template>
          <template #cell-content_type_name="{ row }"><span>{{ row.content_type_name }}</span></template>
          <template #cell-object_repr="{ row }"><span>{{ row.object_repr }}</span></template>
          <template #cell-object_id="{ row }"><span>{{ row.object_id }}</span></template>
          <template #cell-ip_address="{ row }"><span>{{ row.ip_address || '-' }}</span></template>
          <template #cell-changed_fields="{ row }">
            <span class="changed-fields">
              <Tag v-for="field in row.changed_fields || []" :key="field" size="small">{{ field }}</Tag>
            </span>
            <span v-if="!row.changed_fields || row.changed_fields.length === 0">-</span>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex items-center gap-1">
              <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="openDiff(row)">
                <Icon name="document" size="sm" />
                <span class="text-xs">查看变更</span>
              </button>
            </div>
          </template>
          <template #empty>
            <EmptyState description="暂无审计日志数据" />
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

    <BaseDialog :show="diffVisible" title="变更详情" width="normal" @close="diffVisible = false">
      <div v-if="diffLoading" class="space-y-4">
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div v-else>
        <div class="descriptions-grid" style="--col: 2; font-size: 14px;">
          <div class="description-item"><div class="description-label">操作类型</div><div class="description-value">{{ actionTypeLabel(diffData?.action_type) }}</div></div>
          <div class="description-item"><div class="description-label">用户</div><div class="description-value">{{ diffData?.user || diffData?.username || '-' }}</div></div>
          <div class="description-item"><div class="description-label">对象</div><div class="description-value">{{ diffData?.object_repr || '-' }}</div></div>
          <div class="description-item"><div class="description-label">时间</div><div class="description-value">{{ formatDateTime(diffData?.created_at) }}</div></div>
        </div>
        <div class="diff-section">
          <div class="diff-title">变更内容</div>
          <pre class="diff-content">{{ formattedDiff }}</pre>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="diffVisible = false">关闭</button>
      </template>
    </BaseDialog>

    <BaseDialog :show="exportDialogVisible" title="导出审计日志" width="narrow" @close="exportDialogVisible = false">
      <form class="space-y-5" @submit.prevent="handleExport" id="export-form">
        <div>
          <label class="input-label mb-1.5 block">日期范围</label>
          <div class="flex gap-2 items-center">
            <input type="date" v-model="exportStartDate" class="input flex-1" />
            <span class="text-gray-400">至</span>
            <input type="date" v-model="exportEndDate" class="input flex-1" />
          </div>
        </div>
        <div>
          <label class="input-label mb-1.5 block">操作类型</label>
          <Select v-model="exportFilters.action_type" :options="actionTypeOptions" clearable />
        </div>
        <div>
          <label class="input-label mb-1.5 block">对象类型</label>
          <Select v-model="exportFilters.model" :options="modelOptions" clearable />
        </div>
        <div>
          <label class="input-label mb-1.5 block">用户ID</label>
          <input v-model="exportFilters.user_id" class="input w-full" placeholder="可选" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" @click="exportDialogVisible = false" type="button">取消</button>
          <button form="export-form" type="submit" class="btn btn-primary" :disabled="exportLoading">确认导出</button>
        </div>
      </template>
    </BaseDialog>

    <BaseDialog :show="exportListVisible" title="导出记录" width="wide" @close="exportListVisible = false">
      <div class="export-filter mb-4 flex gap-3 flex-wrap">
        <div>
          <label class="input-label mb-1.5 block">状态</label>
          <Select v-model="exportListFilters.status" :options="exportStatusOptions" class="w-40" placeholder="状态" clearable @change="loadExportList" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">用户ID</label>
          <input v-model="exportListFilters.user_id" class="input w-40" placeholder="用户ID" @keyup.enter="loadExportList" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">开始日期</label>
          <input type="date" v-model="exportListFilters.start_date" class="input w-40" placeholder="开始日期" @change="loadExportList" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">结束日期</label>
          <input type="date" v-model="exportListFilters.end_date" class="input w-40" placeholder="结束日期" @change="loadExportList" />
        </div>
      </div>
      <div class="table-scroll">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
              <th class="px-3 py-3 w-44">创建时间</th>
              <th class="px-3 py-3 w-28">用户</th>
              <th class="px-3 py-3 w-28">状态</th>
              <th class="px-3 py-3 w-24">记录数</th>
              <th class="px-3 py-3 w-24">文件大小</th>
              <th class="px-3 py-3 min-w-44">错误信息</th>
              <th class="px-3 py-3 w-28">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
            <tr v-for="row in exportList" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-dark-800">
              <td class="px-3 py-2">{{ formatDateTime(row.created_at) }}</td>
              <td class="px-3 py-2">{{ row.username }}</td>
              <td class="px-3 py-2">{{ row.status_display }}</td>
              <td class="px-3 py-2">{{ row.record_count }}</td>
              <td class="px-3 py-2">{{ formatFileSize(row.file_size) }}</td>
              <td class="px-3 py-2">{{ row.error_message || '-' }}</td>
              <td class="px-3 py-2">
                <button class="btn btn-ghost btn-sm" :disabled="row.status !== 'completed'" @click="downloadExport(row)">下载</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-if="exportListTotal > 0" v-model:page="exportListPage" v-model:page-size="exportListPageSize" :total="exportListTotal" layout="total, sizes, prev, pager, next" @update:page-size="handleExportPageSizeChange" @update:page="handleExportPageChange" />
      <template #footer>
        <button class="btn btn-secondary" @click="exportListVisible = false">关闭</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { auditLogAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import { Icon, Select, SearchInput, Tag, Pagination, TablePageLayout, DataTable, EmptyState, BaseDialog } from '@/components/common'
import type { Column } from '@/components/common/types'

const userStore = useUserStore()

const buildAuditParams = (params: any) => ({ ordering: '-created_at', ...params })

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(auditLogAPI, 'getList', {
  initialFilters: {
    action_type: '',
    model: '',
    user: '',
    object_id: '',
    ip_address: '',
    start_date: '',
    end_date: ''
  },
  buildParams: buildAuditParams,
  errorContext: '加载审计日志失败'
})

const columns: Column[] = [
  { key: 'created_at', label: '时间', width: 176 },
  { key: 'action_type', label: '操作类型', width: 112 },
  { key: 'username', label: '用户', width: 112 },
  { key: 'content_type_name', label: '对象类型', width: 128 },
  { key: 'object_repr', label: '对象', minWidth: 208 },
  { key: 'object_id', label: '对象ID', width: 112 },
  { key: 'ip_address', label: 'IP', width: 128 },
  { key: 'changed_fields', label: '变更字段', minWidth: 176 },
  { key: 'actions', label: '操作', width: 112, fixed: 'right' }
]

const actionTypeOptions = [
  { value: 'create', label: '创建' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'view', label: '查看' },
  { value: 'export', label: '导出' },
  { value: 'import', label: '导入' },
  { value: 'approve', label: '审核通过' },
  { value: 'reject', label: '审核拒绝' },
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' }
]

const modelOptions = [
  { value: 'workorder', label: '施工单' },
  { value: 'workorderprocess', label: '施工单工序' },
  { value: 'workordertask', label: '施工单任务' },
  { value: 'customer', label: '客户' },
  { value: 'product', label: '产品' },
  { value: 'material', label: '物料' }
]

const diffVisible = ref(false)
const diffLoading = ref(false)
const diffData = ref<any>(null)
const stats = ref(null)

const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportStartDate = ref('')
const exportEndDate = ref('')
const exportFilters = reactive({
  action_type: '',
  model: '',
  user_id: ''
})

const exportStatusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' }
]

const exportListVisible = ref(false)
const exportListLoading = ref(false)
const exportList = ref<any[]>([])
const exportListPage = ref(1)
const exportListPageSize = ref(20)
const exportListTotal = ref(0)
const exportListFilters = reactive({
  status: '',
  user_id: '',
  start_date: '',
  end_date: ''
})

const canExportAuditLog = computed(() => userStore.hasPermission('workorder.add_auditlogexport'))
const canViewAuditExport = computed(() => userStore.hasPermission('workorder.view_auditlogexport'))

const formattedDiff = computed(() => {
  if (!diffData.value || !diffData.value.changes) return '-'
  try {
    const masked = maskSensitiveFields(diffData.value.changes)
    return JSON.stringify(masked, null, 2)
  } catch (e: any) {
    return String(diffData.value.changes)
  }
})

const loadStats = async () => {
  try {
    const response: any = await auditLogAPI.getStatistics()
    stats.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.loadStats')
  }
}

const actionTypeLabel = (action: any) => {
  const option = actionTypeOptions.find((item: any) => item.value === action)
  return option ? option.label : action || '-'
}

const actionTagType = (action: any) => {
  const map = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    view: 'info',
    export: 'info',
    import: 'info',
    approve: 'success',
    reject: 'danger',
    login: 'success',
    logout: 'info'
  }
  return (map as any)[action] || 'info'
}

const openDiff = async (row: any) => {
  diffVisible.value = true
  diffLoading.value = true
  diffData.value = null
  try {
    const response: any = await auditLogAPI.getDiff(row.id)
    diffData.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.openDiff')
    ElMessage.error('获取变更详情失败')
  } finally {
    diffLoading.value = false
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const expFilters = {}
    if ((exportFilters as any).action_type) (expFilters as any).action_type = exportFilters.action_type
    if ((exportFilters as any).model) (expFilters as any).model = exportFilters.model
    if ((exportFilters as any).user_id) (expFilters as any).user_id = exportFilters.user_id

    const payload = { start_date: exportStartDate.value, end_date: exportEndDate.value, filters: expFilters }
    const response: any = await auditLogAPI.exportLogs(payload)
    const exportInfo = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
    ElMessage.success(`导出任务已创建: ${exportInfo?.export_id || '-'}`)
    exportDialogVisible.value = false
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.handleExport')
    ElMessage.error('创建导出任务失败')
  } finally {
    exportLoading.value = false
  }
}

const openExportList = async () => {
  exportListVisible.value = true
  exportListPage.value = 1
  await loadExportList()
}

const loadExportList = async () => {
  exportListLoading.value = true
  try {
    const params: Record<string, any> = {
      page: exportListPage.value,
      page_size: exportListPageSize.value
    }
    if (exportListFilters.status) params.status = exportListFilters.status
    if (exportListFilters.user_id) params.user_id = exportListFilters.user_id
    if (exportListFilters.start_date) params.start_date = exportListFilters.start_date
    if (exportListFilters.end_date) params.end_date = exportListFilters.end_date

    const response: any = await auditLogAPI.getExportList(params)
    const payload = response || {}
    exportList.value = Array.isArray(payload) ? payload : (payload?.results || payload?.data || payload?.items || [])
    exportListTotal.value = payload?.count || payload?.pagination?.total_items || 0
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.loadExportList')
    ElMessage.error('加载导出记录失败')
  } finally {
    exportListLoading.value = false
  }
}

const handleExportPageChange = (page: any) => {
  exportListPage.value = page
  loadExportList()
}

const handleExportPageSizeChange = (size: any) => {
  exportListPageSize.value = size
  exportListPage.value = 1
  loadExportList()
}

const downloadExport = async (row: any) => {
  try {
    const blob: any = await auditLogAPI.downloadExport(row.id)
    const filename = getExportFilename(row)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    ErrorHandler.handle(error, 'AuditLogList.downloadExport')
    ElMessage.error('下载导出文件失败')
  }
}

const getExportFilename = (row: any) => {
  if (row.file_path) {
    const parts = String(row.file_path).split('/')
    return parts[parts.length - 1]
  }
  return `audit_log_${row.id}.csv`
}

const formatFileSize = (size: any) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const maskSensitiveFields = (input: any) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'csrf', 'api_key', 'access', 'refresh']
  const isSensitive = (key: unknown) => {
    if (!key) return false
    const normalized = String(key).toLowerCase()
    return sensitiveKeys.some((item: any) => normalized.includes(item))
  }
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map((item: any) => walk(item))
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      Object.keys(value).forEach((key: any) => {
        (result as any)[key] = isSensitive(key) ? '***' : walk((value as any)[key])
      })
      return result
    }
    return value
  }
  return walk(input)
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.header-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
  justify-content: space-between;
}

.filter-group,
.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
}

.audit-filter-control {
  width: min(100%, 170px);
}

.audit-search-control {
  width: min(100%, 280px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.audit-table {
  width: 100%;
}

.changed-fields {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.diff-section {
  margin-top: 16px;
}

.diff-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.diff-content {
  background: #f7f9fb;
  border: 1px solid #e6ebf5;
  padding: 12px;
  border-radius: 4px;
  max-height: 360px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.stats-section {
  row-gap: var(--ui-section-gap);
  margin-bottom: var(--ui-section-gap);
}

.stat-card {
  border-radius: 10px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.export-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
  align-items: center;
  margin-bottom: 12px;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .export-filter,
  .audit-filter-control,
  .audit-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group,
  .export-filter {
    flex-direction: column;
  }
}
</style>
"""

files_to_write['/home/chenjiaxing/文档/work_order/web/src/views/die/DieList.vue'] = """<template>
  <TablePageLayout>
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-72"
            placeholder="搜索刀模编码、名称、尺寸、材质"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </div>
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
          <div class="flex items-center gap-1">
            <button v-if="canEdit" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="handleEdit(row)">
              <Icon name="edit" size="sm" />
              <span class="text-xs">编辑</span>
            </button>
            <button v-if="canDelete" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" @click="openDeleteDialog(row)">
              <Icon name="trash" size="sm" />
              <span class="text-xs">删除</span>
            </button>
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

  <DieFormDialog v-model="dialogVisible" :dialog-type="dialogType" :initial-data="currentRow" :loading="formLoading" :product-list="productList" @submit="handleFormSubmit" @close="handleDialogClose" />

  <ConfirmDialog
    :show="showDeleteDialogFlag"
    title="删除确认"
    :message="`确定要删除刀模\x22${targetDieForDelete?.name}\x22吗？此操作不可恢复。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialogFlag = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dieAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, Tag, ConfirmDialog } from '@/components/common'
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

const showDeleteDialogFlag = ref(false)
const targetDieForDelete = ref<any>(null)

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ is_active: true, page_size: 100 }); productList.value = Array.isArray(response) ? response : (response?.results || response?.data || []) } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表') }
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

const openDeleteDialog = (row: any) => {
  targetDieForDelete.value = row
  showDeleteDialogFlag.value = true
}

const handleDelete = async () => {
  const row = targetDieForDelete.value
  showDeleteDialogFlag.value = false
  if (!row) return
  await crud.remove(row.id, '删除成功')
}

const getDieTypeTagType = (dieType: any) => { const typeMap = { combined: 'warning', dedicated: 'primary', universal: 'success' }; return (typeMap as any)[dieType] || 'info' }
const getDieTypeLabel = (dieType: any) => { const labelMap = { combined: '拼版刀模', dedicated: '专用刀模', universal: '通用刀模' }; return (labelMap as any)[dieType] || dieType }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
"""

files_to_write['/home/chenjiaxing/文档/work_order/web/src/views/finance/Cost.vue'] = """<template>
  <div class="space-y-6">
    <CostStats :stats="stats" :loading="statsLoading" />

    <TablePageLayout>
      <template #filters>
        <!-- No search fields in original Cost.vue but empty template -->
      </template>

      <template #actions>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" :disabled="loading" @click="loadData">
            <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
            刷新
          </button>
          <button class="btn btn-primary" @click="handleStats">
            <Icon name="data-analysis" size="md" class="mr-2" />
            成本统计
          </button>
        </div>
      </template>

      <template #table>
        <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
          <template #cell-work_order_number="{ row }"><span>{{ row.work_order_number }}</span></template>
          <template #cell-product_name="{ row }"><span class="truncate max-w-xs">{{ row.product_name }}</span></template>
          <template #cell-material_cost="{ row }"><span>¥{{ row.material_cost ? row.material_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-labor_cost="{ row }"><span>¥{{ row.labor_cost ? row.labor_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-equipment_cost="{ row }"><span>¥{{ row.equipment_cost ? row.equipment_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-overhead_cost="{ row }"><span>¥{{ row.overhead_cost ? row.overhead_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-actual_cost="{ row }"><span class="text-strong">¥{{ row.actual_cost ? row.actual_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-standard_cost="{ row }"><span>¥{{ row.standard_cost ? row.standard_cost.toLocaleString() : '-' }}</span></template>
          <template #cell-variance="{ row }"><span :class="getVarianceClass(row)">¥{{ row.variance !== null ? row.variance.toLocaleString() : '-' }}</span></template>
          <template #cell-variance_rate="{ row }"><span :class="getVarianceClass(row)">{{ row.variance_rate !== null ? row.variance_rate.toFixed(1) + '%' : '-' }}</span></template>
          <template #cell-actions="{ row }">
            <div class="flex items-center gap-1">
              <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="handleView(row)">
                <Icon name="view" size="sm" />
                <span class="text-xs">查看</span>
              </button>
              <button v-if="canEdit" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="openCalculateDialog(row)">
                <Icon name="calculator" size="sm" />
                <span class="text-xs">计算</span>
              </button>
              <button v-if="canEdit" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400" @click="handleEdit(row)">
                <Icon name="edit" size="sm" />
                <span class="text-xs">调整</span>
              </button>
            </div>
          </template>
          <template #empty>
            <EmptyState description="暂无成本数据" />
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

    <BaseDialog :show="detailDialogVisible" title="成本详情" width="extra-wide" @close="detailDialogVisible = false">
      <div v-if="currentCost">
        <div class="descriptions-grid mb-4" style="--col: 2">
          <div class="description-item"><div class="description-label">施工单号</div><div class="description-value">{{ (currentCost as any).work_order_number }}</div></div>
          <div class="description-item"><div class="description-label">产品名称</div><div class="description-value">{{ (currentCost as any).product_name }}</div></div>
          <div class="description-item"><div class="description-label">成本中心</div><div class="description-value">{{ (currentCost as any).cost_center_name || '-' }}</div></div>
          <div class="description-item"><div class="description-label">计算时间</div><div class="description-value">{{ (currentCost as any).calculated_at || '-' }}</div></div>
        </div>
        <div class="cost-breakdown">
          <h4>成本构成</h4>
          <div class="table-scroll table-scroll-compact">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-3 py-2 w-36">成本项目</th>
                <th class="px-3 py-2 w-36 text-right">金额</th>
                <th class="px-3 py-2 w-24 text-right">占比</th>
                <th class="px-3 py-2">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="item in getCostBreakdown(currentCost)" :key="item.item">
                <td class="px-3 py-2">{{ item.item }}</td>
                <td class="px-3 py-2 text-right">¥{{ item.amount ? item.amount.toLocaleString() : '-' }}</td>
                <td class="px-3 py-2 text-right">{{ item.proportion ? item.proportion.toFixed(1) + '%' : '-' }}</td>
                <td class="px-3 py-2">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div v-if="(currentCost as any).standard_cost" class="cost-comparison">
          <h4>成本对比</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="card"><div class="comparison-item"><div class="comparison-label">标准成本</div><div class="comparison-value">¥{{ (currentCost as any).standard_cost ? (currentCost as any).standard_cost.toLocaleString() : '-' }}</div></div></div>
            <div class="card"><div class="comparison-item"><div class="comparison-label">实际成本</div><div class="comparison-value">¥{{ (currentCost as any).actual_cost ? (currentCost as any).actual_cost.toLocaleString() : '-' }}</div></div></div>
          </div>
        </div>
      </div>
      <template #footer><button class="btn btn-secondary" @click="detailDialogVisible = false">关闭</button></template>
    </BaseDialog>

    <BaseDialog :show="adjustDialogVisible" title="成本调整" width="normal" @close="adjustDialogVisible = false">
      <form class="space-y-5" id="adjust-form" @submit.prevent="handleSaveAdjust">
        <div>
          <label class="input-label mb-1.5 block">材料成本</label>
          <InputNumber v-model="form.material_cost" :min="0" :precision="2" class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">人工成本</label>
          <InputNumber v-model="form.labor_cost" :min="0" :precision="2" class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">设备成本</label>
          <InputNumber v-model="form.equipment_cost" :min="0" :precision="2" class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">制造费用</label>
          <InputNumber v-model="form.overhead_cost" :min="0" :precision="2" class="w-full" />
        </div>
        <div>
          <TextArea v-model="form.adjust_reason" label="调整原因" :rows="3" placeholder="请输入调整原因" class="w-full" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" @click="adjustDialogVisible = false" type="button">取消</button>
          <button class="btn btn-primary" form="adjust-form" type="submit" :disabled="submitting">保存</button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="showCalculateDialogFlag"
      title="确认计算"
      message="确认重新计算该订单成本？"
      confirm-text="确认"
      cancel-text="取消"
      @confirm="handleCalculate"
      @cancel="showCalculateDialogFlag = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { productionCostAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import CostStats from './components/CostStats.vue'
import { InputNumber, TextArea, TablePageLayout, DataTable, EmptyState, Icon, Pagination, BaseDialog, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'

const userStore = useUserStore()

const statsLoading = ref(false)
const submitting = ref(false)
const currentCost = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const adjustDialogVisible = ref(false)

const showCalculateDialogFlag = ref(false)
const targetCostForCalculate = ref<any>(null)

const FORM_INITIAL: Record<string, any> = { id: undefined, material_cost: undefined, labor_cost: undefined, equipment_cost: undefined, overhead_cost: undefined, adjust_reason: '' }
const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'work_order_number', label: '施工单号', width: 144 },
  { key: 'product_name', label: '产品名称', minWidth: 192 },
  { key: 'material_cost', label: '材料成本', width: 96, align: 'right' },
  { key: 'labor_cost', label: '人工成本', width: 96, align: 'right' },
  { key: 'equipment_cost', label: '设备成本', width: 96, align: 'right' },
  { key: 'overhead_cost', label: '制造费用', width: 96, align: 'right' },
  { key: 'actual_cost', label: '实际成本', width: 112, align: 'right' },
  { key: 'standard_cost', label: '标准成本', width: 112, align: 'right' },
  { key: 'variance', label: '成本差异', width: 96, align: 'right' },
  { key: 'variance_rate', label: '差异率', width: 80, align: 'right' },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handlePageChange,
  handleSizeChange
} = useCrudList(productionCostAPI, 'getList', {
  errorContext: '加载成本数据失败'
})

const canEdit = computed(() => userStore.hasPermission('workorder.change_productioncost'))

const fetchStats = async () => {
  statsLoading.value = true
  try { const response: any = await productionCostAPI.getStats({}); stats.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {}) } catch (error: any) { stats.value = {} } finally { statsLoading.value = false }
}

const handleStats = () => { /* TODO: 跳转到统计页面 */ }

const handleView = async (row: any) => {
  try { const response: any = await productionCostAPI.getDetail(row.id); currentCost.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {}); detailDialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '获取成本详情失败') }
}

const openCalculateDialog = (row: any) => {
  targetCostForCalculate.value = row
  showCalculateDialogFlag.value = true
}

const handleCalculate = async () => {
  const row = targetCostForCalculate.value
  showCalculateDialogFlag.value = false
  if (!row) return
  try {
    await productionCostAPI.calculateTotal(row.id)
    ElMessage.success('计算成功')
    loadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, '计算失败') }
}

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, material_cost: row.material_cost, labor_cost: row.labor_cost, equipment_cost: row.equipment_cost, overhead_cost: row.overhead_cost, adjust_reason: '' })
  adjustDialogVisible.value = true
}

const handleSaveAdjust = async () => {
  if (!form.adjust_reason) { ElMessage.warning('请输入调整原因'); return }
  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id; delete (data as any).id
    await productionCostAPI.update(id!, data)
    ElMessage.success('调整成功')
    adjustDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, '调整失败') } finally { submitting.value = false }
}

const getVarianceClass = (row: any) => {
  if (row.variance === null) return ''
  return row.variance > 0 ? 'text-danger' : row.variance < 0 ? 'text-success' : ''
}

const getCostBreakdown = (cost: any) => {
  const total = cost.actual_cost || 0
  if (!total) return []
  return [
    { item: '材料成本', amount: cost.material_cost, proportion: total ? (cost.material_cost / total * 100) : 0, description: '原材料消耗' },
    { item: '人工成本', amount: cost.labor_cost, proportion: total ? (cost.labor_cost / total * 100) : 0, description: '人工工时费用' },
    { item: '设备成本', amount: cost.equipment_cost, proportion: total ? (cost.equipment_cost / total * 100) : 0, description: '设备折旧分摊' },
    { item: '制造费用', amount: cost.overhead_cost, proportion: total ? (cost.overhead_cost / total * 100) : 0, description: '其他制造费用' }
  ]
}

onMounted(() => { loadData(); fetchStats() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.cost-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.action-group { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.table-scroll-compact { margin-top: var(--ui-control-gap); }
.data-table { width: 100%; }
.cost-breakdown, .cost-comparison { margin-top: var(--ui-section-gap); }
.cost-breakdown h4, .cost-comparison h4 { margin-bottom: var(--ui-control-gap); }
.comparison-row { margin-top: var(--ui-control-gap); }
.comparison-item { text-align: center; }
.comparison-label { font-size: var(--ui-font-size-sm); color: var(--ui-color-text-secondary); margin-bottom: var(--ui-control-gap); }
.comparison-value { font-size: var(--ui-font-size-lg); font-weight: 700; color: var(--ui-color-text-primary); }
.card { border-radius: var(--ui-radius-card); box-shadow: var(--ui-shadow-card); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .action-group .btn {
    width: 100%;
  }
}
</style>
"""

files_to_write['/home/chenjiaxing/文档/work_order/web/src/views/finance/Invoice.vue'] = """<template>
  <div class="space-y-6">
    <InvoiceStats :stats="stats" :loading="statsLoading" />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select v-model="filters.customer" :options="customerOptions" class="w-40" placeholder="选择客户" clearable filterable @change="handleSearch" />
            <Select v-model="filters.status" :options="statusOptions" class="w-36" placeholder="发票状态" clearable @change="handleSearch" />
            <SearchInput v-model="filters.invoice_number" placeholder="搜索发票号码" @search="handleSearch" @clear="handleSearch" />
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" :disabled="loading" @click="loadData">
            <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
            刷新
          </button>
          <button class="btn btn-primary" v-if="canCreate" @click="handleCreate">
            <Icon name="plus" size="md" class="mr-2" />
            新建发票
          </button>
        </div>
      </template>

      <template #table>
        <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
          <template #cell-invoice_number="{ row }"><span>{{ row.invoice_number }}</span></template>
          <template #cell-invoice_type_display="{ row }"><span>{{ row.invoice_type_display }}</span></template>
          <template #cell-customer_name="{ row }"><span>{{ row.customer_name }}</span></template>
          <template #cell-amount="{ row }"><span>¥{{ row.amount ? row.amount.toLocaleString() : '-' }}</span></template>
          <template #cell-tax_amount="{ row }"><span>¥{{ row.tax_amount ? row.tax_amount.toLocaleString() : '-' }}</span></template>
          <template #cell-total_amount="{ row }"><span>¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span></template>
          <template #cell-issue_date="{ row }"><span>{{ row.issue_date }}</span></template>
          <template #cell-status="{ row }"><StatusTag :status="row.status" category="invoice" :label="row.status_display" /></template>
          <template #cell-actions="{ row }">
            <div class="flex items-center gap-1">
              <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="handleView(row)">
                <Icon name="view" size="sm" />
                <span class="text-xs">查看</span>
              </button>
              <button v-if="canEdit && row.status === 'draft'" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="handleEdit(row)">
                <Icon name="edit" size="sm" />
                <span class="text-xs">编辑</span>
              </button>
              <button v-if="canEdit && row.status === 'draft'" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400" @click="openSubmitDialog(row)">
                <Icon name="upload" size="sm" />
                <span class="text-xs">提交</span>
              </button>
            </div>
          </template>
          <template #empty>
            <EmptyState description="暂无发票数据">
              <template #action>
                <button class="btn btn-primary" v-if="hasFilters" @click="handleReset">重置筛选</button>
                <button class="btn btn-primary" v-else-if="canCreate" @click="handleCreate">创建第一个发票</button>
              </template>
            </EmptyState>
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

    <BaseDialog :show="detailDialogVisible" title="发票详情" width="wide" @close="detailDialogVisible = false">
      <div v-if="currentInvoice" class="descriptions-grid" style="--col: 2">
        <div class="description-item"><div class="description-label">发票号码</div><div class="description-value">{{ (currentInvoice as any).invoice_number }}</div></div>
        <div class="description-item"><div class="description-label">发票类型</div><div class="description-value">{{ (currentInvoice as any).invoice_type_display }}</div></div>
        <div class="description-item"><div class="description-label">客户名称</div><div class="description-value">{{ (currentInvoice as any).customer_name }}</div></div>
        <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="(currentInvoice as any).status" category="invoice" :label="(currentInvoice as any).status_display" /></div></div>
        <div class="description-item"><div class="description-label">金额(不含税)</div><div class="description-value">¥{{ (currentInvoice as any).amount ? (currentInvoice as any).amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">税率</div><div class="description-value">{{ (currentInvoice as any).tax_rate }}%</div></div>
        <div class="description-item"><div class="description-label">税额</div><div class="description-value">¥{{ (currentInvoice as any).tax_amount ? (currentInvoice as any).tax_amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">价税合计</div><div class="description-value">¥{{ (currentInvoice as any).total_amount ? (currentInvoice as any).total_amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">开票日期</div><div class="description-value">{{ (currentInvoice as any).issue_date || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">关联单号</div><div class="description-value">{{ (currentInvoice as any).sales_order_number || (currentInvoice as any).work_order_number || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">备注</div><div class="description-value">{{ (currentInvoice as any).notes || '-' }}</div></div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="detailDialogVisible = false">关闭</button>
      </template>
    </BaseDialog>

    <BaseDialog :show="formDialogVisible" :title="isEdit ? '编辑发票' : '新建发票'" width="normal" @close="formDialogVisible = false">
      <form class="space-y-5" id="invoice-form" @submit.prevent="handleSave">
        <div>
          <label class="input-label mb-1.5 block">客户</label>
          <Select v-model="form.customer" :options="customerOptions" placeholder="请选择客户" filterable class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">发票类型</label>
          <Select v-model="form.invoice_type" :options="invoiceTypeOptions" placeholder="请选择发票类型" class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">开票日期</label>
          <input type="date" v-model="form.issue_date" class="input w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">金额(不含税)</label>
          <InputNumber v-model="form.amount" :min="0" :precision="2" class="w-full" />
        </div>
        <div>
          <label class="input-label mb-1.5 block">税率</label>
          <InputNumber v-model="form.tax_rate" :min="0" :max="100" class="w-full" />
        </div>
        <div>
          <TextArea v-model="form.notes" label="备注" :rows="3" placeholder="请输入备注" class="w-full" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" @click="formDialogVisible = false" type="button">取消</button>
          <button class="btn btn-primary" form="invoice-form" type="submit" :disabled="submitting">保存</button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="showSubmitDialogFlag"
      title="确认提交"
      message="确认提交该发票？"
      confirm-text="确认"
      cancel-text="取消"
      @confirm="handleSubmit"
      @cancel="showSubmitDialogFlag = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { invoiceAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, SearchInput, Icon, Input, TextArea, InputNumber, TablePageLayout, DataTable, EmptyState, Pagination, BaseDialog, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'
import InvoiceStats from './components/InvoiceStats.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref<any[]>([])
const currentInvoice = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)

const showSubmitDialogFlag = ref(false)
const targetInvoiceForSubmit = ref<any>(null)

const FORM_INITIAL: Record<string, any> = {
  id: undefined,
  customer: undefined,
  invoice_type: 'vat_special',
  issue_date: '',
  amount: undefined,
  tax_rate: 13,
  notes: ''
}

const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'invoice_number', label: '发票号码', width: 144 },
  { key: 'invoice_type_display', label: '发票类型', width: 112 },
  { key: 'customer_name', label: '客户名称', width: 144 },
  { key: 'amount', label: '金额(不含税)', width: 112, align: 'right' },
  { key: 'tax_amount', label: '税额', width: 96, align: 'right' },
  { key: 'total_amount', label: '价税合计', width: 112, align: 'right' },
  { key: 'issue_date', label: '开票日期', width: 112 },
  { key: 'status', label: '状态', width: 96 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const invoiceTypeOptions = [
  { value: 'vat_special', label: '增值税专用发票' },
  { value: 'vat_common', label: '增值税普通发票' },
  { value: 'electronic', label: '电子发票' }
]
const statusOptions = [
  { value: 'draft', label: '待开具' },
  { value: 'issued', label: '已开具' },
  { value: 'sent', label: '已发送' },
  { value: 'received', label: '已收到' },
  { value: 'cancelled', label: '已作废' },
  { value: 'refunded', label: '已红冲' }
]

const buildInvoiceParams = (params: any) => {
  const { invoice_number, ...nextParams } = params
  if (invoice_number) nextParams.search = invoice_number
  return nextParams
}

const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(invoiceAPI, 'getList', {
  initialFilters: { status: '', customer: '', invoice_number: '' },
  buildParams: buildInvoiceParams
})

const hasFilters = computed(() => filters.value.status || filters.value.customer || filters.value.invoice_number)
const { canCreate, canEdit } = useCrudPermission('invoice')

const handleReset = () => resetFilters()

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await invoiceAPI.getSummary()
    const payload = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
    const summary = payload?.summary || {}
    const byStatus = payload?.by_status || []

    let pendingAmount = 0
    let receivedAmount = 0
    try {
      const listResponse: any = await invoiceAPI.getList({ page_size: 1000 })
      const list = Array.isArray(listResponse) ? listResponse : (listResponse?.results || listResponse?.data || listResponse || [])
      pendingAmount = list.filter((i: any) => i.status === 'issued' || i.status === 'sent').reduce((sum: any, i: any) => sum + (i.total_amount || 0), 0)
      receivedAmount = list.filter((i: any) => i.status === 'received').reduce((sum: any, i: any) => sum + (i.total_amount || 0), 0)
    } catch (e: any) {}

    stats.value = {
      total_count: summary.total_count || 0,
      draft_count: byStatus.find((row: any) => row.status === 'draft')?.count || 0,
      pending_amount: pendingAmount,
      received_amount: receivedAmount
    }
  } catch (error: any) {
    stats.value = {}
  } finally {
    statsLoading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const response: any = await customerAPI.getList({ page_size: 1000 })
    customerList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {}
}

const handleView = async (row: any) => {
  try {
    const response: any = await invoiceAPI.getDetail(row.id)
    currentInvoice.value = Array.isArray(response) ? response : (response?.results || response?.data || response || {})
    detailDialogVisible.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '获取发票详情失败')
  }
}

const handleCreate = () => {
  if (!canCreate.value) return
  isEdit.value = false
  Object.assign(form, FORM_INITIAL)
  formDialogVisible.value = true
}

const handleEdit = (row: any) => {
  if (!canEdit.value) return
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    customer: row.customer,
    invoice_type: row.invoice_type,
    issue_date: row.issue_date,
    amount: row.amount,
    tax_rate: row.tax_rate,
    notes: row.notes || ''
  })
  formDialogVisible.value = true
}

const openSubmitDialog = (row: any) => {
  targetInvoiceForSubmit.value = row
  showSubmitDialogFlag.value = true
}

const handleSubmit = async () => {
  const row = targetInvoiceForSubmit.value
  showSubmitDialogFlag.value = false
  if (!row) return
  try {
    await invoiceAPI.submit(row.id)
    ElMessage.success('提交成功')
    loadData()
    fetchStats()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '提交失败')
  }
}

const handleSave = async () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.invoice_type) { ElMessage.warning('请选择发票类型'); return }
  if (!form.issue_date) { ElMessage.warning('请选择开票日期'); return }
  if (!form.amount) { ElMessage.warning('请输入金额'); return }

  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) {
      delete (data as any).id
      await invoiceAPI.update(form.id!, data)
      ElMessage.success('发票更新成功')
    } else {
      await invoiceAPI.create(data)
      ElMessage.success('发票创建成功')
    }
    formDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error: any) {
    ErrorHandler.showMessage(error, isEdit.value ? '更新发票失败' : '创建发票失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
  fetchStats()
  fetchCustomers()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.invoice-container {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.filter-group,
.action-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.finance-filter-control {
  width: min(100%, var(--ui-filter-control-width));
}

.finance-search-control {
  width: min(100%, var(--ui-search-control-width));
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.finance-table {
  width: 100%;
}

.card {
  border-radius: var(--ui-radius-card);
  box-shadow: var(--ui-shadow-card);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .finance-filter-control,
  .finance-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
"""

for path, content in files_to_write.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
print("done")
