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
          编码只能包含中文、字母、数字和连字符
        </div>
      </div>
      <Input
        v-model="formData.name"
        label="供应商名称"
        required
        placeholder="请输入供应商名称"
      />
      <Input
        v-model="formData.contact_person"
        label="联系人"
        placeholder="请输入联系人"
      />
      <Input
        v-model="formData.phone"
        label="联系电话"
        placeholder="请输入联系电话"
      />
      <Input
        v-model="formData.email"
        label="邮箱"
        placeholder="请输入邮箱"
        type="email"
      />
      <TextArea
        v-model="formData.address"
        label="地址"
        :rows="2"
        placeholder="请输入地址"
      />
      <RadioGroup
        v-model="formData.status"
        :options="statusOptions"
      />
      <TextArea
        v-model="formData.notes"
        label="备注"
        :rows="3"
        placeholder="请输入备注"
      />
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
          {{ submitting ? '保存中...' : showEditModal ? '更新' : '创建' }}
        </button>
      </div>
    </template>
  </BaseDialog>

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
import { ref, reactive, onMounted } from 'vue'
import { supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Select, Icon, Tag, Input, TextArea, RadioGroup, BaseDialog, ConfirmDialog, RowActions, FilterRow, DescriptionGrid, DescriptionItem } from '@/components/common'
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

const validateForm = () => {
  const code = (formData.code || '').trim()
  const name = (formData.name || '').trim()
  const phone = (formData.phone || '').trim()
  const email = (formData.email || '').trim()

  if (!code) return '请输入供应商编码'
  if (code.length < 2 || code.length > 50) return '供应商编码长度必须在2-50个字符之间'
  if (!/^[\u4e00-\u9fa5A-Za-z0-9-]+$/.test(code)) return '编码只能包含中文、字母、数字和连字符'
  if (!name) return '请输入供应商名称'
  if (name.length > 200) return '供应商名称不能超过200个字符'
  if (phone && !/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(phone)) return '请输入正确的联系电话（手机号或座机号）'
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return '请输入正确的邮箱地址'
  return ''
}

const buildPayload = () => ({
  code: (formData.code || '').trim(),
  name: (formData.name || '').trim(),
  contact_person: (formData.contact_person || '').trim(),
  phone: (formData.phone || '').trim(),
  email: (formData.email || '').trim(),
  address: (formData.address || '').trim(),
  status: formData.status,
  notes: (formData.notes || '').trim()
})

const handleSubmit = async () => {
  const validationError = validateForm()
  if (validationError) {
    ErrorHandler.showMessage(validationError, '校验失败')
    return
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    if (showEditModal.value) {
      await crud.update(formData.id, payload, '保存成功')
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
