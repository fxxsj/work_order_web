<template>
  <TablePageLayout
    title="成本中心"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索成本中心编码、名称"
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
        <button
          v-if="hasFilters"
          class="btn btn-secondary"
          @click="resetFilters"
        >
          重置筛选
        </button>
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
          新建成本中心
        </button>
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
            :description="hasFilters ? '未找到匹配的成本中心' : '暂无成本中心数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个成本中心' : undefined"
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
    :title="form.id ? '编辑成本中心' : '新建成本中心'"
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
        v-model="form.parent"
        :options="parentOptions"
        label="上级成本中心"
        placeholder="无上级"
        clearable
      />
      <Select
        v-model="form.manager"
        :options="managerOptions"
        label="负责人"
        placeholder="未指定"
        clearable
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
      <button
        class="btn"
        :disabled="submitting"
        @click="formDialogVisible = false"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleFormSubmit"
      >
        {{ submitting ? '保存中...' : '保存' }}
      </button>
    </template>
  </BaseDialog>

  <BaseDialog
    :show="detailDialogVisible"
    title="成本中心详情"
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
      <DescriptionItem label="负责人">
        {{ currentRow.manager_name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="上级">
        {{ currentRow.parent_name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="子级数量">
        {{ currentRow.children_count ?? 0 }}
      </DescriptionItem>
      <DescriptionItem label="状态">
        {{ currentRow.is_active ? '启用' : '禁用' }}
      </DescriptionItem>
      <DescriptionItem label="创建时间">
        {{ formatDateTime(currentRow.created_at) }}
      </DescriptionItem>
      <DescriptionItem
        label="描述"
        :span="2"
      >
        {{ currentRow.description || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="detailDialogVisible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除成本中心"
    :message="`确定要删除成本中心「${currentRow?.name}」吗？此操作不可撤销。`"
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
import { authAPI, costCenterAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import {
  BaseDialog,
  ConfirmDialog,
  DataTable,
  DescriptionGrid,
  DescriptionItem,
  EmptyState,
  FilterRow,
  Icon,
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
  { label: '生产部门', value: 'production' },
  { label: '辅助部门', value: 'auxiliary' },
  { label: '管理部门', value: 'management' },
  { label: '销售部门', value: 'sales' }
]
const activeOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]
const columns: Column[] = [
  { key: 'code', label: '中心编码', sortable: true, class: 'w-32' },
  { key: 'name', label: '中心名称', sortable: true, class: 'w-48' },
  { key: 'type', label: '类型', sortable: true, class: 'w-28' },
  { key: 'parent_name', label: '上级', sortable: true, class: 'w-40' },
  { key: 'manager_name', label: '负责人', sortable: true, class: 'w-32' },
  { key: 'children_count', label: '子级', sortable: false, class: 'w-20 text-right' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-40' }
]

const sortKey = ref('code')
const sortOrder = ref<'asc' | 'desc'>('asc')
const sortFieldMap: Record<string, string> = {
  parent_name: 'parent__name',
  manager_name: 'manager__username'
}
const buildParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  return {
    ...params,
    ordering: sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  }
}

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
} = useCrudList(costCenterAPI, 'getList', {
  initialFilters: { type: '', is_active: '' },
  buildParams,
  errorContext: '加载成本中心数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('costcenter')
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const currentRow = ref<any>(null)
const parentOptions = ref<Array<{ label: string, value: number }>>([])
const managerOptions = ref<Array<{ label: string, value: number }>>([])
const form = reactive({
  id: null as number | null,
  code: '',
  name: '',
  type: 'production',
  parent: null as number | null,
  manager: null as number | null,
  is_active: true,
  description: ''
})

const typeLabel = (value: string) => typeOptions.find(option => option.value === value)?.label || value || '-'
const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const loadOptions = async () => {
  try {
    const [centersRes, usersRes] = await Promise.all([
      costCenterAPI.getList({ page_size: 200, ordering: 'code' }),
      authAPI.getUsersByDepartment()
    ])
    parentOptions.value = ((centersRes as any)?.results || []).map((item: any) => ({
      value: item.id,
      label: `${item.code} · ${item.name}`
    }))
    managerOptions.value = ((usersRes as any)?.results || (usersRes as any)?.data || usersRes || []).map((user: any) => ({
      value: user.id,
      label: user.username || user.name || `用户 #${user.id}`
    }))
  } catch {
    parentOptions.value = []
    managerOptions.value = []
  }
}

const resetForm = (row?: any) => {
  Object.assign(form, {
    id: row?.id ?? null,
    code: row?.code ?? '',
    name: row?.name ?? '',
    type: row?.type ?? 'production',
    parent: row?.parent ?? null,
    manager: row?.manager ?? null,
    is_active: row?.is_active ?? true,
    description: row?.description ?? ''
  })
}

const showCreateDialog = async () => {
  if (!canCreate.value) return
  resetForm()
  await loadOptions()
  formDialogVisible.value = true
}

const showEditDialog = async (row: any) => {
  if (!canEdit.value) return
  resetForm(row)
  await loadOptions()
  parentOptions.value = parentOptions.value.filter(option => option.value !== row.id)
  formDialogVisible.value = true
}

const validateForm = () => {
  form.code = form.code.trim()
  form.name = form.name.trim()
  form.description = form.description.trim()
  if (form.code.length < 2 || form.code.length > 50) {
    useUIStore().showWarning('成本中心编码长度必须为 2-50')
    return false
  }
  if (form.name.length < 2 || form.name.length > 100) {
    useUIStore().showWarning('成本中心名称长度必须为 2-100')
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
      parent: form.parent,
      manager: form.manager,
      is_active: form.is_active,
      description: form.description
    }
    if (form.id) {
      await costCenterAPI.update(form.id, payload)
      useUIStore().showSuccess('更新成功')
    } else {
      await costCenterAPI.create(payload)
      useUIStore().showSuccess('创建成功')
    }
    formDialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '保存成本中心')
  } finally {
    submitting.value = false
  }
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value && (row.children_count || 0) === 0 }
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
    await costCenterAPI.delete(currentRow.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除成本中心')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
