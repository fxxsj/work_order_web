<template>
  <TablePageLayout
    title="产品组管理"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索产品组编码、名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="handleAdd">
          <Icon name="plus" size="md" class="mr-2" />
          新增产品组
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
          <Tag :type="value ? 'success' : 'info'" size="small">{{ value ? '启用' : '禁用' }}</Tag>
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
            :description="hasFilters ? '未找到匹配的产品组' : '暂无产品组数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个产品组' : undefined"
            @action="handleAdd"
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
    :show="showCreateModal || showEditModal"
    :title="showEditModal ? '编辑产品组' : '新增产品组'"
    width="normal"
    @close="closeModals"
  >
    <form id="entity-form" @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <Input v-model="form.code" label="编码" required placeholder="请输入编码" />
      </div>
      <div>
        <Input v-model="form.name" label="名称" required placeholder="请输入名称" />
      </div>
      <div>
        <TextArea v-model="form.description" label="描述" placeholder="请输入描述" :rows="3" />
      </div>
      <Toggle
        v-model="form.is_active"
        label="状态"
      />
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button @click="closeModals" type="button" class="btn btn-secondary">取消</button>
        <button form="entity-form" type="submit" :disabled="submitting" class="btn btn-primary">
          <Icon v-if="submitting" name="refresh" size="sm" class="-ml-1 mr-2 animate-spin" />
          {{ submitting ? '保存中...' : (showEditModal ? '更新' : '创建') }}
        </button>
      </div>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    :message="`确定要删除产品组「${currentRow?.name}」吗？此操作不可撤销。`"
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
import { ref, reactive, onMounted } from 'vue'
import { productGroupAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, BaseDialog, ConfirmDialog, Pagination, Input, TextArea, Toggle, Icon, Tag, RowActions, FilterRow } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'code', label: '编码', sortable: true, class: 'w-36' },
  { key: 'name', label: '名称', sortable: true },
  { key: 'description', label: '描述', sortable: false },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-44' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(productGroupAPI, 'getList', { errorContext: '加载产品组数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('productgroup')
const crud = useCRUD(productGroupAPI, { onSuccess: () => { closeModals(); loadData() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const currentRow = ref<any>(null)

const getFormInitialValues = () => ({ id: null, code: '', name: '', description: '', is_active: true })
const form = reactive(getFormInitialValues())

const handleAdd = () => { 
  currentRow.value = null; 
  Object.assign(form, getFormInitialValues()); 
  showCreateModal.value = true 
}

const handleEdit = async (row: any) => {
  currentRow.value = row
  try {
    const detail: any = await productGroupAPI.getDetail(row.id)
    Object.assign(form, {
      id: detail.id, code: detail.code, name: detail.name, description: detail.description || '', is_active: detail.is_active
    })
    showEditModal.value = true
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '加载详情') 
  }
}

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
}

const handleSubmit = async () => {
  if (!form.code || !form.name) {
    ErrorHandler.showMessage('请填写必填项', '验证失败')
    return
  }
  
  submitting.value = true
  try {
    const data = { code: form.code, name: form.name, description: form.description, is_active: form.is_active }
    if (form.id) { 
      await crud.update(form.id, data, '更新成功') 
    } else { 
      await crud.create(data, '创建成功') 
    }
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row: any) => {
  currentRow.value = row;
  showDeleteDialog.value = true;
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') confirmDelete(row)
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  currentRow.value = null
}

const handleDelete = async () => {
  if (!currentRow.value) return;
  deleting.value = true
  try {
    await crud.remove(currentRow.value.id, '删除成功')
    showDeleteDialog.value = false;
    currentRow.value = null
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除')
  } finally {
    deleting.value = false
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData() })
</script>
