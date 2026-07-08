<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索供应商名称/编码"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          class="w-full sm:w-36"
          placeholder="状态"
          :options="statusOptions"
          clearable
          @change="handleSearch"
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
          @click="showCreateModal = true"
        >
          新增供应商
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
        default-sort-order="asc"
        @sort="handleSort"
      >
        <template #cell-status="{ row }">
          <Tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status_display || row.status }}
          </Tag>
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="[
              { key: 'detail', label: '详情', icon: 'eye' },
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的供应商' : '暂无供应商数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个供应商' : undefined"
            @action="showCreateModal = true"
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

  <SupplierFormDialog
    :visible="showCreateModal || showEditModal"
    :dialog-type="showEditModal ? 'edit' : 'create'"
    :supplier="selectedRow"
    :loading="submitting"
    @update:visible="(val: boolean) => { if (!val) closeModals() }"
    @confirm="handleSubmit"
  />

  <BaseDialog
    :show="showDetailModal"
    title="供应商详情"
    width="wide"
    @close="closeDetail"
  >
    <div
      v-if="currentDetail"
      class="space-y-5"
    >
      <section>
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
          基本信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="供应商编码">
            {{ currentDetail.code || '-' }}
          </DescriptionItem>
          <DescriptionItem label="供应商名称">
            {{ currentDetail.name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="状态">
            {{ currentDetail.status_display || currentDetail.status || '-' }}
          </DescriptionItem>
          <DescriptionItem label="供应物料数">
            {{ currentDetail.material_count ?? 0 }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
      <section>
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
          联系信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="联系人">
            {{ currentDetail.contact_person || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系电话">
            {{ currentDetail.phone || '-' }}
          </DescriptionItem>
          <DescriptionItem label="邮箱">
            {{ currentDetail.email || '-' }}
          </DescriptionItem>
          <DescriptionItem label="创建时间">
            {{ formatDateTime(currentDetail.created_at) }}
          </DescriptionItem>
          <DescriptionItem
            label="地址"
            :span="2"
          >
            {{ currentDetail.address || '-' }}
          </DescriptionItem>
          <DescriptionItem
            label="备注"
            :span="2"
          >
            {{ currentDetail.notes || '-' }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
      <section>
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
          系统信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="供应商ID">
            {{ currentDetail.id }}
          </DescriptionItem>
          <DescriptionItem label="更新时间">
            {{ formatDateTime(currentDetail.updated_at) }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
    </div>
  </BaseDialog>

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除供应商「${selectedRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { BaseButton, TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Select, Tag, BaseDialog, ConfirmDialog, RowActions, FilterRow, DescriptionGrid, DescriptionItem } from '@/components/common'
import SupplierFormDialog from './components/SupplierFormDialog.vue'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const columns: Column[] = [
  { key: 'code', label: '供应商编码', sortable: true },
  { key: 'name', label: '供应商名称', sortable: true },
  { key: 'contact_person', label: '联系人', sortable: true },
  { key: 'phone', label: '联系电话', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'material_count', label: '供应物料数', sortable: false },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('asc')

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(supplierAPI, 'getList', {
  initialFilters: { status: '' },
  errorContext: '加载供应商数据失败',
  buildParams: (params) => {
    const ordering = sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
    return { ...params, ordering }
  }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('supplier')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)
const currentDetail = ref<any>(null)

const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' }
]

const crud = useCRUD(supplierAPI, {
  onSuccess: () => {
    closeModals()
    loadData()
  }
})

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedRow.value = null
}

const editRow = (row: any) => {
  selectedRow.value = row
  showEditModal.value = true
}

const openDetail = async (row: any) => {
  selectedRow.value = row
  try {
    currentDetail.value = await supplierAPI.getDetail(row.id)
    showDetailModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载供应商详情失败')
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  currentDetail.value = null
}

const handleSubmit = async (payload: any) => {
  submitting.value = true
  try {
    if (showEditModal.value) {
      await crud.update(selectedRow.value.id, payload, '保存成功')
    } else {
      await crud.create(payload, '创建成功')
    }
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row: any) => {
  selectedRow.value = row
  showDeleteDialog.value = true
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'detail') openDetail(row)
  if (action === 'edit') editRow(row)
  if (action === 'delete') confirmDelete(row)
}

const handleDelete = async () => {
  try {
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
