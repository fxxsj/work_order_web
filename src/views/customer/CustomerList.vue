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
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".xlsx,.xls"
          @change="handleImportFile"
        >
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          variant="secondary"
          icon="download"
          :loading="exporting"
          @click="handleExport"
        >
          导出
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="upload"
          @click="handleImportClick"
        >
          导入
        </BaseButton>
        <BaseButton
          v-if="canCreate"
          variant="primary"
          icon="plus"
          @click="showCreateModal = true"
        >
          新建客户
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
        default-sort-key="name"
        default-sort-order="asc"
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
              { key: 'detail', label: '详情', icon: 'eye' },
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

  <CustomerFormDialog
    ref="customerFormDialogRef"
    :visible="showCreateModal || showEditModal"
    :dialog-type="showEditModal ? 'edit' : 'create'"
    :customer="selectedRow"
    :loading="submitting"
    :salesperson-options="salespersonOptions"
    @update:visible="(val: boolean) => { if (!val) closeModals() }"
    @confirm="handleSubmit"
  />

  <BaseDialog
    :show="showDetailModal"
    title="客户详情"
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
          <DescriptionItem label="客户名称">
            {{ currentDetail.name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="业务员">
            {{ currentDetail.salesperson_name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系人">
            {{ currentDetail.contact_person || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系电话">
            {{ currentDetail.phone || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系电话">
            {{ currentDetail.phone || '-' }}
          </DescriptionItem>
          <DescriptionItem label="邮箱">
            {{ currentDetail.email || '-' }}
          </DescriptionItem>
          <DescriptionItem label="默认税率">
            {{ currentDetail.default_tax_rate != null ? currentDetail.default_tax_rate + '%' : '-' }}
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
          <DescriptionItem label="客户ID">
            {{ currentDetail.id }}
          </DescriptionItem>
          <DescriptionItem label="更新时间">
            {{ formatDateTime(currentDetail.updated_at) }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
    </div>
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
import { ref, computed, onMounted } from 'vue'
import { authAPI, customerAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD, useExport } from '@/composables'
import { BaseButton, TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, BaseDialog, ConfirmDialog, RowActions, FilterRow, DescriptionGrid, DescriptionItem } from '@/components/common'
import CustomerFormDialog from './components/CustomerFormDialog.vue'
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

const sortKey = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(customerAPI, 'getList', {
  errorContext: '加载客户数据失败',
  buildParams: (params) => {
    const orderingKey = sortKey.value === 'salesperson_name' ? 'salesperson__username' : sortKey.value
    const ordering = sortOrder.value === 'desc' ? `-${orderingKey}` : orderingKey
    return { ...params, ordering }
  }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('customer')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)
const currentDetail = ref<any>(null)
const salespersonList = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const customerFormDialogRef = ref<InstanceType<typeof CustomerFormDialog> | null>(null)

const { exporting, exportData } = useExport(
  (params) => customerAPI.exportCustomers(params),
  { fileNamePrefix: 'customers', fileExtension: 'xlsx' }
)

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
    currentDetail.value = await customerAPI.getDetail(row.id)
    showDetailModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载客户详情失败')
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
      // 直接调用 API 以便正确处理验证错误
      await customerAPI.create(payload)
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
        customerFormDialogRef.value?.setNameError(nameErrors[0])
        return
      }
    }

    // 其他错误使用 ErrorHandler 统一处理
    ErrorHandler.showMessage(error, '操作失败')
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

const handleExport = async () => {
  try {
    await exportData({})
  } catch (error: any) {
    ErrorHandler.showMessage(error, '导出失败')
  }
}

const handleImportClick = () => {
  fileInput.value?.click()
}

const handleImportFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const result: any = await customerAPI.importCustomers(file)
    const created = result?.created_count || 0
    const updated = result?.updated_count || 0
    const errors = result?.error_count || 0
    if (errors === 0) {
      useUIStore().showSuccess(`导入成功: 新增 ${created} 条, 更新 ${updated} 条`)
    } else {
      useUIStore().showWarning(`导入完成: 新增 ${created} 条, 更新 ${updated} 条, 失败 ${errors} 条`)
    }
    await loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '导入失败')
  } finally {
    target.value = ''
  }
}

onMounted(() => {
  loadData()
  loadSalespersons()
})
</script>
