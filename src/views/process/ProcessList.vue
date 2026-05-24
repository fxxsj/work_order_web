<template>
  <TablePageLayout>
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-64"
            placeholder="搜索工序名称、编码"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          @click="loadData"
          :disabled="loading"
          class="btn btn-secondary"
          title="刷新"
        >
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button
          v-if="canCreate"
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <Icon name="plus" size="md" class="mr-2" />
          新建工序
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
        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">{{ value ? '启用' : '禁用' }}</Tag>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <button
              v-if="canEdit"
              @click="editRow(row)"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400"
            >
              <Icon name="edit" size="sm" />
              <span class="text-xs">编辑</span>
            </button>
            <button
              v-if="canDelete"
              @click="confirmDelete(row)"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <Icon name="trash" size="sm" />
              <span class="text-xs">删除</span>
            </button>
          </div>
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的工序' : '暂无工序数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个工序' : undefined"
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
    :title="showEditModal ? '编辑工序' : '新建工序'"
    width="normal"
    @close="closeModals"
  >
    <form id="process-form" @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <Input v-model="formData.code" label="工序编码" required placeholder="请输入工序编码" :disabled="showEditModal" />
      </div>
      <div>
        <Input v-model="formData.name" label="工序名称" required placeholder="请输入工序名称" />
      </div>
      <div>
        <TextArea v-model="formData.description" label="工序描述" placeholder="请输入工序描述" :rows="3" />
      </div>
      <div>
        <Input v-model="formData.standard_duration" label="标准工时(小时)" type="number" placeholder="0" />
      </div>
      <div>
        <Input v-model="formData.sort_order" label="排序" type="number" placeholder="0" />
      </div>
      <div>
        <Toggle v-model="formData.is_active" label="是否启用" />
      </div>
    </form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button @click="closeModals" type="button" class="btn btn-secondary">
          取消
        </button>
        <button
          form="process-form"
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
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    :message="`确定要删除工序「${selectedRow?.name}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Input, TextArea, Toggle, Icon, Tag, BaseDialog, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'code', label: '工序编码', sortable: true, class: 'w-28' },
  { key: 'name', label: '工序名称', sortable: true, class: 'w-44' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'standard_duration', label: '标准工时(小时)', sortable: true, class: 'w-32 text-right' },
  { key: 'sort_order', label: '排序', sortable: true, class: 'w-20 text-center' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(processAPI, 'getList', { errorContext: '加载工序数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('process')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)

const formInitialValues: Record<string, any> = {
  id: undefined as number | undefined,
  code: '',
  name: '',
  description: '',
  standard_duration: 0,
  sort_order: 0,
  is_active: true
}
const formData = reactive({ ...formInitialValues })

const crud = useCRUD(processAPI, {
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
    description: row.description || '',
    standard_duration: row.standard_duration || 0,
    sort_order: row.sort_order || 0,
    is_active: row.is_active !== false
  })
  showEditModal.value = true
}

const handleSubmit = async () => {
  if (!formData.name) {
    ErrorHandler.showMessage('请输入工序名称', '校验失败')
    return
  }
  if (!formData.code) {
    ErrorHandler.showMessage('请输入工序编码', '校验失败')
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
}

onMounted(() => {
  loadData()
})
</script>
