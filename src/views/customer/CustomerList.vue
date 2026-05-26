<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索客户名称、联系人、电话"
          @search="handleSearch"
          @clear="handleSearch"
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
          新建客户
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
        <template #cell-name="{ value }">
          <span class="font-medium text-gray-900 dark:text-white">{{ value }}</span>
        </template>

        <template #cell-contact_person="{ value }">
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ value || '-' }}</span>
        </template>

        <template #cell-phone="{ value }">
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ value || '-' }}</span>
        </template>

        <template #cell-email="{ value }">
          <span class="text-sm text-gray-500 dark:text-dark-400">{{ value || '-' }}</span>
        </template>

        <template #cell-salesperson_name="{ value }">
          <span
            v-if="value"
            class="text-sm text-gray-700 dark:text-gray-300"
          >{{ value }}</span>
          <span
            v-else
            class="text-sm text-gray-400 dark:text-dark-500"
          >-</span>
        </template>

        <template #cell-created_at="{ value }">
          <span class="text-sm text-gray-500 dark:text-dark-400">{{ formatDateTime(value) }}</span>
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
            :description="hasFilters ? '未找到匹配的客户' : '暂无客户数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个客户' : undefined"
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
    :title="showEditModal ? '编辑客户' : '新建客户'"
    width="normal"
    @close="closeModals"
  >
    <form
      id="customer-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <Input
          v-model="(formData as any).name"
          label="客户名称"
          required
          placeholder="请输入客户名称"
          :error="nameError"
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
        <label class="input-label mb-1.5 block">业务员</label>
        <Select
          v-model="formData.salesperson"
          placeholder="请选择业务员"
          :options="salespersonOptions"
          filterable
          clearable
        />
      </div>
      <div>
        <TextArea
          v-model="formData.address"
          label="地址"
          placeholder="请输入地址"
          :rows="2"
        />
      </div>
      <div>
        <TextArea
          v-model="formData.notes"
          label="备注"
          placeholder="请输入备注"
          :rows="3"
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
          form="customer-form"
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
    title="删除客户"
    :message="`确定要删除客户「${selectedRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { authAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Input, Select, TextArea, Icon, BaseDialog, ConfirmDialog, RowActions, FilterRow } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import { useUIStore } from '@/stores/ui'

const columns: Column[] = [
  { key: 'name', label: '客户名称', sortable: true },
  { key: 'contact_person', label: '联系人', sortable: true },
  { key: 'phone', label: '联系电话', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'salesperson_name', label: '业务员', sortable: true },
  { key: 'address', label: '地址', sortable: false },
  { key: 'created_at', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(customerAPI, 'getList', { errorContext: '加载客户数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('customer')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const nameError = ref('')
const selectedRow = ref<any>(null)
const salespersonList = ref<any[]>([])

const formInitialValues = { name: '', contact_person: '', phone: '', email: '', address: '', salesperson: null as any, notes: '' }
const formData = reactive({ ...formInitialValues })

// 监听名称变化，清除错误提示
watch(() => formData.name, () => {
  if (nameError.value) {
    nameError.value = ''
  }
})

const crud = useCRUD(customerAPI, {
  onSuccess: () => {
    closeModals()
    loadData()
  }
})

const salespersonOptions = computed(() =>
  salespersonList.value.map((u: any) => ({ value: u.id, label: u.username }))
)

const loadSalespersons = async () => {
  try {
    const response: any = await authAPI.getSalespersons()
    const list = Array.isArray(response) ? response : (response?.results || response?.data || [])
    salespersonList.value = list
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载业务员列表失败')
  }
}

const resetForm = () => {
  Object.assign(formData, formInitialValues)
  nameError.value = ''
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const editRow = (row: any) => {
  selectedRow.value = row
  nameError.value = ''
  Object.assign(formData, {
    name: row.name,
    contact_person: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    salesperson: row.salesperson || null,
    notes: row.notes || ''
  })
  showEditModal.value = true
}

const handleSubmit = async () => {
  if (!formData.name) return

  // 检查重复名称
  if (formData.name && formData.name.trim().length >= 2) {
    const excludeId = showEditModal.value ? selectedRow.value?.id : undefined
    const exists = await customerAPI.checkName(formData.name.trim(), excludeId)
    if (exists) {
      nameError.value = '该客户名称已存在'
      return
    }
  }

  submitting.value = true
  try {
    if (showEditModal.value) {
      await crud.update(selectedRow.value.id, formData, '保存成功')
    } else {
      // 直接调用 API 以便正确处理验证错误
      await customerAPI.create(formData)
      useUIStore().showSuccess('创建成功')
      closeModals()
      loadData()
    }
  } catch (error: any) {
    // 使用 ErrorHandler 解析字段级验证错误
    // 后端错误格式: { success: false, message: "...", errors: { name: ["错误"] } }
    const responseData = error?.response?.data
    const errors = responseData?.errors

    // 检查 name 字段错误并设置到 nameError
    if (errors && typeof errors === 'object' && errors.name) {
      const nameErrors = Array.isArray(errors.name) ? errors.name : [errors.name]
      if (nameErrors.length > 0) {
        nameError.value = nameErrors[0]
        return
      }
    }

    // 其他错误使用 ErrorHandler 统一处理
    ErrorHandler.showError(error, '操作失败')
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

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
  // TODO: 实现服务端排序
}

onMounted(() => {
  loadData()
  loadSalespersons()
})
</script>
