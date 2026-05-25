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
          @click="showCreateModal = true"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          新增供应商
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
        <template #cell-status="{ row }">
          <Tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status_display }}
          </Tag>
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

  <!-- Create/Edit Modal -->
  <BaseDialog
    :show="showCreateModal || showEditModal"
    :title="showEditModal ? '编辑供应商' : '新增供应商'"
    width="normal"
    @close="closeModals"
  >
    <form
      id="supplier-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <Input
          v-model="formData.code"
          label="供应商编码"
          placeholder="请输入供应商编码"
          :disabled="showEditModal"
        />
        <div
          v-if="!showEditModal"
          class="text-xs text-gray-400 mt-1"
        >
          编码只能包含字母、数字和连字符
        </div>
      </div>
      <div>
        <Input
          v-model="formData.name"
          label="供应商名称"
          required
          placeholder="请输入供应商名称"
        />
      </div>
      <div>
        <Input
          v-model="formData.contact_person"
          label="联系人"
          placeholder="请输入联系人"
        />
      </div>
      <div>
        <Input
          v-model="formData.phone"
          label="联系电话"
          placeholder="请输入联系电话"
        />
      </div>
      <div>
        <Input
          v-model="formData.email"
          label="邮箱"
          placeholder="请输入邮箱"
          type="email"
        />
      </div>
      <div>
        <TextArea
          v-model="formData.address"
          label="地址"
          :rows="2"
          placeholder="请输入地址"
        />
      </div>
      <div>
        <RadioGroup
          v-model="formData.status"
          :options="statusOptions"
        />
      </div>
      <div>
        <TextArea
          v-model="formData.notes"
          label="备注"
          :rows="3"
          placeholder="请输入备注"
        />
      </div>
    </form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeModals"
        >
          取消
        </button>
        <button
          form="supplier-form"
          type="submit"
          :disabled="submitting"
          class="btn btn-primary"
        >
          <svg
            v-if="submitting"
            class="-ml-1 mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ submitting ? '保存中...' : showEditModal ? '更新' : '创建' }}
        </button>
      </div>
    </template>
  </BaseDialog>

  <!-- Delete Confirmation Dialog -->
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
import { ref, reactive, onMounted } from 'vue'
import { supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Select, Icon, Tag, Input, TextArea, RadioGroup, BaseDialog, ConfirmDialog, RowActions, FilterRow } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'code', label: '供应商编码', sortable: true },
  { key: 'name', label: '供应商名称', sortable: true },
  { key: 'contact_person', label: '联系人', sortable: true },
  { key: 'phone', label: '联系电话', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'material_count', label: '供应物料数', sortable: true },
  { key: 'notes', label: '备注', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(supplierAPI, 'getList', { initialFilters: { status: '' }, errorContext: '加载供应商数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('supplier')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)

const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' }
]

const formInitialValues: Record<string, any> = {
  id: undefined as number | undefined,
  code: '',
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  notes: ''
}
const formData = reactive({ ...formInitialValues })

const crud = useCRUD(supplierAPI, {
  onSuccess: () => {
    closeModals()
    loadData()
  }
})

const resetForm = () => {
  Object.assign(formData, formInitialValues)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const editRow = (row: any) => {
  selectedRow.value = row
  Object.assign(formData, {
    id: row.id,
    code: row.code || '',
    name: row.name || '',
    contact_person: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    status: row.status === 'inactive' ? 'inactive' : 'active',
    notes: row.notes || ''
  })
  showEditModal.value = true
}

const handleSubmit = async () => {
  if (!formData.name) {
    ErrorHandler.showMessage('请输入供应商名称', '校验失败')
    return
  }
  if (!formData.code) {
    ErrorHandler.showMessage('请输入供应商编码', '校验失败')
    return
  }
  if (formData.code.length < 2) {
    ErrorHandler.showMessage('供应商编码至少2个字符', '校验失败')
    return
  }
  if (!/^[A-Za-z0-9-]+$/.test(formData.code)) {
    ErrorHandler.showMessage('编码只能包含字母、数字和连字符', '校验失败')
    return
  }
  submitting.value = true
  try {
    if (showEditModal.value) {
      const { id, ...updateData } = formData
      await crud.update(id, updateData, '保存成功')
    } else {
      const { id, ...createData } = formData
      await crud.create(createData, '创建成功')
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

const handleSort = () => {}

onMounted(() => {
  loadData()
})
</script>
