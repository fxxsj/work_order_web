<template>
  <CrudPageLayout
    title="产品组管理"
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
        placeholder="搜索产品组编码、名称"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </template>

    <template #actions>
      <button v-if="canCreate" class="btn btn-primary" @click="handleAdd">
        <Icon name="plus" size="sm" />
        新增产品组
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
        <Tag :type="value ? 'success' : 'info'" size="small">{{ value ? '启用' : '禁用' }}</Tag>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
          <button v-if="canDelete" class="btn btn-danger btn-sm" @click="handleDelete(row)">删除</button>
        </div>
      </template>

      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的产品组' : '暂无产品组数据'"
          :action-text="canCreate && !hasFilters ? '创建第一个产品组' : undefined"
          @action="handleAdd"
        />
      </template>
    </DataTable>
  </CrudPageLayout>

  <FormDialog
    ref="formDialogRef"
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :form-data="form"
    :rules="rules"
    label-width="120px"
    :loading="formLoading"
    @submit="handleSubmit"
    @cancel="handleDialogClose"
  >
    <Input v-model="form.code" label="编码" required placeholder="请输入编码" />
    <Input v-model="form.name" label="名称" required placeholder="请输入名称" />
    <TextArea v-model="form.description" label="描述" placeholder="请输入描述" :rows="3" />
    <Toggle v-model="form.is_active" label="状态" />
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { productGroupAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { CrudPageLayout, DataTable, EmptyState, SearchInput, FormDialog, Input, TextArea, Toggle, Icon, Tag } from '@/components/common'
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
  loadData, handleSearch, handleSearchDebounced, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(productGroupAPI, 'getList', { errorContext: '加载产品组数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('productgroup')
const crud = useCRUD(productGroupAPI, { onSuccess: () => { dialogVisible.value = false; loadData() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const dialogTitle = ref('新增产品组')
const formLoading = ref(false)
const currentRow = ref(null)
const formDialogRef = ref<any>(null)
const productList = ref<any[]>([])

const getFormInitialValues = () => ({ id: null, code: '', name: '', description: '', is_active: true, items: [{ product: null, item_name: '', sort_order: 0 }] })
const form = reactive(getFormInitialValues())
const rules = { code: [{ required: true, message: '请输入编码', trigger: 'blur' }], name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

const loadProductList = async () => {
  try { const response: any = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载产品列表') }
}

const handleAdd = () => { dialogType.value = 'create'; dialogTitle.value = '新增产品组'; currentRow.value = null; Object.assign(form, getFormInitialValues()); dialogVisible.value = true }

const handleEdit = async (row: any) => {
  dialogType.value = 'edit'; dialogTitle.value = '编辑产品组'; currentRow.value = row
  try {
    const detail: any = await productGroupAPI.getDetail(row.id)
    Object.assign(form, {
      id: detail.id, code: detail.code, name: detail.name, description: detail.description || '', is_active: detail.is_active,
      items: detail.items && detail.items.length > 0 ? detail.items.map((item: any) => ({ id: item.id, product: item.product, item_name: item.item_name, sort_order: item.sort_order })) : [{ product: null, item_name: '', sort_order: 0 }]
    })
    dialogVisible.value = true
  } catch (error: any) { ErrorHandler.showMessage(error, '加载详情') }
}

const handleDelete = async (row: any) => {
  const confirmed = await ErrorHandler.confirm(`确定要删除产品组"${row.name}"吗？此操作不可撤销。`)
  if (!confirmed) return
  await crud.remove(row.id, '删除成功')
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return
  formLoading.value = true
  const data = { code: form.code, name: form.name, description: form.description, is_active: form.is_active }
  if (form.id) { await crud.update(form.id, data, '更新成功') } else { await crud.create(data, '创建成功') }
  formLoading.value = false
}

const handleDialogClose = () => { formDialogRef.value?.resetFields(); Object.assign(form, getFormInitialValues()) }

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
}

onMounted(() => { loadData(); loadProductList() })
</script>
