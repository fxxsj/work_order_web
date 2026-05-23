<template>
  <div class="card">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <SearchInput
        v-model="searchText"
        class="w-full sm:w-72"
        placeholder="搜索部门名称、编码"
        @search="handleSearch"
        @clear="handleSearch"
      />
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
        <Icon name="plus" size="sm" />
        新建部门
      </button>
    </div>

    <EmptyState
      v-if="!loading && tableData.length === 0"
      :description="hasFilters ? '未找到匹配的部门' : '暂无部门数据'"
      :action-text="canCreate && !hasFilters ? '新建部门' : undefined"
      @action="showCreateDialog"
    />

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
            <th class="px-4 py-3 w-36">部门编码</th>
            <th class="px-4 py-3 w-44">部门名称</th>
            <th class="px-4 py-3 w-28">上级部门</th>
            <th class="px-4 py-3 w-24 text-center">子部门</th>
            <th class="px-4 py-3 min-w-48">工序</th>
            <th class="px-4 py-3 w-20 text-center">排序</th>
            <th class="px-4 py-3 w-24">状态</th>
            <th class="px-4 py-3 w-44">创建时间</th>
            <th class="px-4 py-3 w-32">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
          <tr v-for="row in tableData" :key="row.id" :class="getRowClassName({ row })">
            <td class="px-4 py-3">{{ row.code }}</td>
            <td class="px-4 py-3"><span :class="row.parent ? 'text-primary-600' : ''">{{ row.name }}</span></td>
            <td class="px-4 py-3"><span :class="row.parent_name ? 'text-primary-600' : 'text-gray-400 dark:text-dark-400'">{{ row.parent_name || '-' }}</span></td>
            <td class="px-4 py-3 text-center"><Tag v-if="row.children_count > 0" type="info" size="small">{{ row.children_count }}个</Tag><span v-else class="text-gray-400 dark:text-dark-400">-</span></td>
            <td class="px-4 py-3">
              <template v-if="!row.process_names || row.process_names.length === 0"><span class="text-gray-400 dark:text-dark-400">-</span></template>
              <template v-else>
                <Tag v-for="processName in getDisplayedProcesses(row)" :key="processName" size="small" class="mr-1 mb-1">{{ processName }}</Tag>
                <Tag v-if="shouldShowMoreButton(row)" size="small" class="mr-1 mb-1 cursor-pointer" @click="toggleProcessExpansion(row)">{{ getMoreButtonText(row) }}</Tag>
              </template>
            </td>
            <td class="px-4 py-3 text-center">{{ row.sort_order }}</td>
            <td class="px-4 py-3"><Tag :type="row.is_active ? 'success' : 'info'">{{ row.is_active ? '启用' : '禁用' }}</Tag></td>
            <td class="px-4 py-3">{{ formatDateTime(row.created_at) }}</td>
            <td class="px-4 py-3">
              <button v-if="canEdit" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="handleEdit(row)">编辑</button>
              <button v-if="canDelete" class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400" @click="handleDelete(row)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > 0" class="mt-6 flex justify-end">
      <Pagination
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @update:page-size="handleSizeChange"
        @update:page="handlePageChange"
      />
    </div>
  </div>

  <FormDialog ref="formDialogRef" v-model="dialogVisible" :title="dialogTitle" width="500px" :form-data="form" :rules="rules" :loading="dialogLoading" @submit="handleSubmit" @cancel="customResetForm"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">部门编码</label>
        <div class="flex-1">
          <Input v-model="form.code" placeholder="请输入部门编码（英文，如：prepress）" :disabled="isEditMode" class="w-full" />
          <div class="text-xs text-gray-400 mt-1">建议使用英文小写，如：prepress、printing、surface等</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">部门名称</label>
        <div class="flex-1">
          <Input v-model="form.name" placeholder="请输入部门名称（中文）" class="w-full" />
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">上级部门</label>
        <div class="flex-1">
          <Select v-model="form.parent" :options="availableParentOptions" placeholder="请选择上级部门（可选）" clearable filterable class="w-full" :disabled="isEditMode && form.children_count > 0" />
          <div class="text-xs text-gray-400 mt-1">选择上级部门可建立部门层级关系（如：生产部 > 裁切车间）</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">排序</label>
        <div class="flex-1">
          <InputNumber v-model="form.sort_order" :min="0" class="w-full" />
          <div class="text-xs text-gray-400 mt-1">数字越小越靠前显示</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">工序</label>
        <div class="flex-1">
          <CheckboxGroup v-model="form.processes" :options="processOptions" class="w-full" />
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">是否启用</label>
        <div class="flex-1 pt-1">
          <Toggle v-model="form.is_active" />
        </div>
      </div>
    </div>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { departmentAPI, processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { FormDialog, EmptyState, Pagination, SearchInput, Icon, Input, Select, InputNumber, CheckboxGroup, Toggle } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(departmentAPI, 'getList', { errorContext: '加载部门数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('department')
const crud = useCRUD(departmentAPI, { onSuccess: () => { dialogVisible.value = false; loadData(); loadAllDepartments() } })

const dialogVisible = ref(false)
const dialogType = ref('create')
const dialogTitle = ref('新建部门')
const dialogLoading = ref(false)
const currentRow = ref<any>(null)
const formDialogRef = ref<any>(null)

const allProcesses = ref<any[]>([])
const allDepartments = ref<any[]>([])
const expandedProcesses = ref({})

const formInitialValues = { code: '', name: '', parent: null, sort_order: 0, is_active: true, processes: [], children_count: 0 }
const form = reactive({ ...formInitialValues })
const rules = {
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }, { pattern: /^[a-z0-9_]+$/, message: '部门编码只能包含小写字母、数字和下划线', trigger: 'blur' }],
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}
const isEditMode = computed(() => dialogType.value === 'edit')
const availableParents = computed(() => {
  if (isEditMode.value && currentRow.value) { return allDepartments.value.filter((dept: any) => { if (dept.id === currentRow.value.id) return false; if (dept.level >= 2) return false; return true }) }
  return allDepartments.value.filter((dept: any) => dept.level < 2)
})

const availableParentOptions = computed(() =>
  availableParents.value.map((dept: any) => ({ value: dept.id, label: dept.name }))
)

const processOptions = computed(() =>
  allProcesses.value.map((p: any) => ({ value: p.id, label: p.name, disabled: !p.is_active }))
)

const loadAllProcesses = async () => {
  try {
    let allProcessesArr: any[] = []; let page = 1; let hasMore = true
    while (hasMore) {
      const response: any = await processAPI.getList({ is_active: true, page_size: 100, page: page })
      if (response.results && response.results.length > 0) { allProcessesArr = allProcessesArr.concat(response.results); hasMore = response.next !== null && response.next !== undefined; page++ } else { hasMore = false }
    }
    allProcesses.value = allProcessesArr
  } catch (error: any) { ErrorHandler.showMessage(error, '加载工序列表'); allProcesses.value = [] }
}

const loadAllDepartments = async () => {
  try { const response: any = await departmentAPI.getAll(); allDepartments.value = response?.data || response || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载部门列表'); allDepartments.value = [] }
}

const showCreateDialog = () => { dialogType.value = 'create'; dialogTitle.value = '新建部门'; currentRow.value = null; customResetForm(); dialogVisible.value = true }

const handleEdit = (row: any) => {
  dialogType.value = 'edit'; dialogTitle.value = '编辑部门'; currentRow.value = row
  Object.assign(form, { code: row.code, name: row.name, parent: row.parent || null, sort_order: row.sort_order, is_active: row.is_active, processes: row.processes || [], children_count: row.children_count || 0 })
  dialogVisible.value = true
  nextTick(() => { formDialogRef.value?.clearValidate() })
}

const customResetForm = () => { Object.assign(form, formInitialValues); currentRow.value = null; nextTick(() => { formDialogRef.value?.clearValidate() }) }

const handleDelete = async (row: any) => {
  const confirmed = await ErrorHandler.confirm(`确定要删除部门「${row.name}」吗？`, '确认删除')
  if (!confirmed) return
  await crud.remove(row.id, '删除成功')
  loadAllDepartments()
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return
  dialogLoading.value = true
  if (isEditMode.value) { await crud.update(currentRow.value.id, form, '保存成功') } else { await crud.create(form, '创建成功') }
  dialogLoading.value = false
}

const getRowClassName = (payload: any) => { const { row } = payload; return row.parent ? 'child-department-row' : '' }
const getDisplayedProcesses = (row: any) => {
  if (!row.process_names || row.process_names.length === 0) return []
  const isExpanded = (expandedProcesses.value as any)[row.id]
  if (isExpanded || row.process_names.length <= 1) return row.process_names
  return [row.process_names[0]]
}
const shouldShowMoreButton = (row: any) => row.process_names && row.process_names.length > 1
const getMoreButtonText = (row: any) => {
  if (!row.process_names || row.process_names.length <= 1) return ''
  const isExpanded = (expandedProcesses.value as any)[row.id]
  if (isExpanded) return '收起'
  return `+${row.process_names.length - 1}`
}
const toggleProcessExpansion = (row: any) => { (expandedProcesses.value as any)[row.id] = !(expandedProcesses.value as any)[row.id] }

onMounted(() => { loadAllProcesses(); loadAllDepartments(); loadData() })
</script>

<style scoped>
:deep(.child-department-row) {
  background-color: rgb(249 250 251);
}
:deep(.child-department-row:hover) {
  background-color: rgb(240 253 250);
}
.dark :deep(.child-department-row) {
  background-color: rgb(30 41 59);
}
.dark :deep(.child-department-row:hover) {
  background-color: rgb(51 65 85);
}
</style>