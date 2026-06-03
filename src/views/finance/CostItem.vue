<template>
  <TablePageLayout
    title="成本项目"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索成本项目编码、名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.type"
          :options="typeOptions"
          class="w-full sm:w-36"
          placeholder="类型"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.allocation_method"
          :options="allocationOptions"
          class="w-full sm:w-40"
          placeholder="分摊方法"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.is_active"
          :options="activeOptions"
          class="w-full sm:w-36"
          placeholder="状态"
          clearable
          @change="handleSearch"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          v-if="hasFilters"
          variant="secondary"
          @click="resetFilters"
        >
          重置筛选
        </BaseButton>
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
          @click="showCreateDialog"
        >
          新建成本项目
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
        <template #cell-type="{ row }">
          {{ row.type_display || typeLabel(row.type) }}
        </template>
        <template #cell-allocation_method="{ row }">
          {{ row.allocation_method_display || allocationLabel(row.allocation_method) }}
        </template>
        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的成本项目' : '暂无成本项目数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个成本项目' : undefined"
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

  <BaseDialog
    :show="formDialogVisible"
    :title="form.id ? '编辑成本项目' : '新建成本项目'"
    width="normal"
    @close="formDialogVisible = false"
  >
    <div class="space-y-4">
      <Input
        v-model="form.code"
        label="编码"
        placeholder="2-50 位编码"
      />
      <Input
        v-model="form.name"
        label="名称"
        placeholder="2-100 位名称"
      />
      <Select
        v-model="form.type"
        :options="typeOptions"
        label="类型"
      />
      <Select
        v-model="form.allocation_method"
        :options="allocationOptions"
        label="分摊方法"
      />
      <Select
        v-model="form.is_active"
        :options="activeOptions"
        label="状态"
      />
      <TextArea
        v-model="form.description"
        label="描述"
        :rows="3"
      />
    </div>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="formDialogVisible = false"
      >
        取消
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="submitting"
        @click="handleFormSubmit"
      >
        保存
      </BaseButton>
    </template>
  </BaseDialog>

  <BaseDialog
    :show="detailDialogVisible"
    title="成本项目详情"
    width="wide"
    @close="detailDialogVisible = false"
  >
    <DescriptionGrid
      v-if="currentRow"
      :columns="2"
    >
      <DescriptionItem label="编码">
        {{ currentRow.code || '-' }}
      </DescriptionItem>
      <DescriptionItem label="名称">
        {{ currentRow.name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="类型">
        {{ currentRow.type_display || typeLabel(currentRow.type) }}
      </DescriptionItem>
      <DescriptionItem label="分摊方法">
        {{ currentRow.allocation_method_display || allocationLabel(currentRow.allocation_method) }}
      </DescriptionItem>
      <DescriptionItem label="状态">
        {{ currentRow.is_active ? '启用' : '禁用' }}
      </DescriptionItem>
      <DescriptionItem label="创建时间">
        {{ formatDateTime(currentRow.created_at) }}
      </DescriptionItem>
      <DescriptionItem label="更新时间">
        {{ formatDateTime(currentRow.updated_at) }}
      </DescriptionItem>
      <DescriptionItem
        label="描述"
        :span="2"
      >
        {{ currentRow.description || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="detailDialogVisible = false"
      >
        关闭
      </BaseButton>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除成本项目"
    :message="`确定要删除成本项目「${currentRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleting"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { costItemAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import {
  BaseDialog,
  ConfirmDialog,
  DataTable,
  DescriptionGrid,
  DescriptionItem,
  EmptyState,
  FilterRow,
  BaseButton,
  Input,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  TablePageLayout,
  Tag,
  TextArea
} from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const typeOptions = [
  { label: '直接材料', value: 'material' },
  { label: '直接人工', value: 'labor' },
  { label: '设备折旧', value: 'equipment' },
  { label: '制造费用', value: 'overhead' }
]
const allocationOptions = [
  { label: '直接分摊', value: 'direct' },
  { label: '按工时分摊', value: 'labor_hours' },
  { label: '按机时分摊', value: 'machine_hours' },
  { label: '按产量分摊', value: 'quantity' },
  { label: '按产值分摊', value: 'value' }
]
const activeOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

const columns: Column[] = [
  { key: 'code', label: '项目编码', sortable: true, class: 'w-32' },
  { key: 'name', label: '项目名称', sortable: true, class: 'w-48' },
  { key: 'type', label: '类型', sortable: true, class: 'w-32' },
  { key: 'allocation_method', label: '分摊方法', sortable: true, class: 'w-36' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-40' }
]

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('asc')
const buildParams = (params: Record<string, unknown>) => ({
  ...params,
  ordering: sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
})

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
  handlePageChange,
  handleSizeChange,
  hasFilters,
  resetFilters
} = useCrudList(costItemAPI, 'getList', {
  initialFilters: { type: '', allocation_method: '', is_active: '' },
  buildParams,
  errorContext: '加载成本项目数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('costitem')
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const currentRow = ref<any>(null)
const form = reactive({
  id: null as number | null,
  code: '',
  name: '',
  type: 'material',
  allocation_method: 'direct',
  is_active: true,
  description: ''
})

const typeLabel = (value: string) => typeOptions.find(option => option.value === value)?.label || value || '-'
const allocationLabel = (value: string) => allocationOptions.find(option => option.value === value)?.label || value || '-'
const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const resetForm = (row?: any) => {
  Object.assign(form, {
    id: row?.id ?? null,
    code: row?.code ?? '',
    name: row?.name ?? '',
    type: row?.type ?? 'material',
    allocation_method: row?.allocation_method ?? 'direct',
    is_active: row?.is_active ?? true,
    description: row?.description ?? ''
  })
}

const showCreateDialog = () => {
  if (!canCreate.value) return
  resetForm()
  formDialogVisible.value = true
}

const showEditDialog = (row: any) => {
  if (!canEdit.value) return
  resetForm(row)
  formDialogVisible.value = true
}

const validateForm = () => {
  form.code = form.code.trim()
  form.name = form.name.trim()
  form.description = form.description.trim()
  if (form.code.length < 2 || form.code.length > 50) {
    useUIStore().showWarning('成本项目编码长度必须为 2-50')
    return false
  }
  if (form.name.length < 2 || form.name.length > 100) {
    useUIStore().showWarning('成本项目名称长度必须为 2-100')
    return false
  }
  return true
}

const handleFormSubmit = async () => {
  if (!validateForm()) return
  submitting.value = true
  try {
    const payload = {
      code: form.code,
      name: form.name,
      type: form.type,
      allocation_method: form.allocation_method,
      is_active: form.is_active,
      description: form.description
    }
    if (form.id) {
      await costItemAPI.update(form.id, payload)
      useUIStore().showSuccess('更新成功')
    } else {
      await costItemAPI.create(payload)
      useUIStore().showSuccess('创建成功')
    }
    formDialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '保存成本项目')
  } finally {
    submitting.value = false
  }
}

const getRowActions = (_row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value }
]

const handleRowAction = (action: string, row: any) => {
  currentRow.value = row
  switch (action) {
    case 'view':
      detailDialogVisible.value = true
      break
    case 'edit':
      showEditDialog(row)
      break
    case 'delete':
      showDeleteDialog.value = true
      break
  }
}

const handleDelete = async () => {
  if (!currentRow.value) return
  deleting.value = true
  try {
    await costItemAPI.delete(currentRow.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除成本项目')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
