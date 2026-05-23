<template>
  <CrudPageLayout
    title="工序管理"
    :loading="loading"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #search>
      <SearchInput
        v-model="searchText"
        class="w-full sm:w-72"
        placeholder="搜索工序名称、编码"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
        <Icon name="plus" size="sm" />
        新建工序
      </button>
    </template>

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
        <div class="flex items-center gap-2">
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
          <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的工序' : '暂无工序数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个工序' : undefined"
          @action="showCreateDialog"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <FormDialog
    ref="formDialogRef"
    v-model="dialogVisible"
    :title="formTitle"
    width="600px"
    :form-data="form"
    :rules="rules"
    label-width="120px"
    :loading="formLoading"
    @submit="handleSubmit"
    @cancel="resetForm"
  >
    <Input v-model="form.code" label="工序编码" required placeholder="请输入工序编码" :disabled="dialogType === 'edit'" />
    <Input v-model="form.name" label="工序名称" required placeholder="请输入工序名称" />
    <TextArea v-model="form.description" label="工序描述" placeholder="请输入工序描述" :rows="3" />
    <Input v-model="form.standard_duration" label="标准工时(小时)" type="number" placeholder="0" />
    <Input v-model="form.sort_order" label="排序" type="number" placeholder="0" />
    <Toggle v-model="form.is_active" label="是否启用" />
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, FormDialog, Input, TextArea, Toggle, Icon, Tag } from '@/components/common'
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
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(processAPI, 'getList', { errorContext: '加载工序数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('process')
const crud = useCRUD(processAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref<any>(null)
const formDialogRef = ref<any>(null)

const formInitialValues = { code: '', name: '', description: '', standard_duration: 0, sort_order: 0, is_active: true }
const form = reactive({ ...formInitialValues })
const rules = { code: [{ required: true, message: '请输入工序编码', trigger: 'blur' }], name: [{ required: true, message: '请输入工序名称', trigger: 'blur' }] }
const formTitle = computed(() => dialogType.value === 'edit' ? '编辑工序' : '新建工序')

const showCreateDialog = () => { resetForm(); dialogType.value = 'create'; currentRow.value = null; dialogVisible.value = true }
const resetForm = () => { Object.assign(form, formInitialValues) }

const handleEdit = (row: any) => {
  dialogType.value = 'edit'; currentRow.value = row
  Object.assign(form, { code: row.code, name: row.name, description: row.description || '', standard_duration: row.standard_duration, sort_order: row.sort_order, is_active: row.is_active })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return
  formLoading.value = true
  if (dialogType.value === 'edit') { await crud.update(currentRow.value.id, form, '保存成功') } else { await crud.create(form, '创建成功') }
  formLoading.value = false
}

const handleDelete = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除工序"${row.name}"吗？`)
    if (!confirmed) return
    await crud.remove(row.id, '删除成功')
  } catch (error: any) { ErrorHandler.showMessage(error, '删除') }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData() })
</script>
