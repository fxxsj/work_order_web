<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索部门名称、编码"
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
          @click="openCreateModal"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          新建部门
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
        <template #cell-code="{ value }">
          <span class="text-sm font-medium">{{ value }}</span>
        </template>
        
        <template #cell-name="{ value, row }">
          <span :class="row.parent ? 'text-primary-600' : 'text-gray-900 dark:text-gray-100'">{{ value }}</span>
        </template>
        
        <template #cell-parent_name="{ value }">
          <span :class="value ? 'text-primary-600' : 'text-gray-400 dark:text-dark-400'">{{ value || '-' }}</span>
        </template>
        
        <template #cell-children_count="{ value }">
          <Tag
            v-if="value > 0"
            type="info"
            size="small"
          >
            {{ value }}个
          </Tag>
          <span
            v-else
            class="text-gray-400 dark:text-dark-400"
          >-</span>
        </template>
        
        <template #cell-process_names="{ row }">
          <template v-if="!row.process_names || row.process_names.length === 0">
            <span class="text-gray-400 dark:text-dark-400">-</span>
          </template>
          <template v-else>
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="processName in getDisplayedProcesses(row)"
                :key="processName"
                size="small"
              >
                {{ processName }}
              </Tag>
              <Tag
                v-if="shouldShowMoreButton(row)"
                size="small"
                class="cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-600"
                @click="toggleProcessExpansion(row)"
              >
                {{ getMoreButtonText(row) }}
              </Tag>
            </div>
          </template>
        </template>
        
        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '启用' : '禁用' }}
          </Tag>
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
            :description="hasFilters ? '未找到匹配的部门' : '暂无部门数据'"
            :action-text="canCreate && !hasFilters ? '新建部门' : undefined"
            @action="openCreateModal"
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <Pagination
        v-if="total > 0"
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @update:page-size="handleSizeChange"
        @update:page="handlePageChange"
      />
    </template>
  </TablePageLayout>

  <BaseDialog
    :show="showCreateModal || showEditModal"
    :title="showEditModal ? '编辑部门' : '新建部门'"
    width="normal"
    @close="closeModals"
  >
    <form
      id="department-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <Input 
          v-model="formData.code" 
          label="部门编码" 
          placeholder="请输入部门编码（英文，如：prepress）" 
          :disabled="showEditModal" 
          required 
          hint="建议使用英文小写，如：prepress、printing、surface等"
        />
      </div>
      <div>
        <Input 
          v-model="formData.name" 
          label="部门名称" 
          placeholder="请输入部门名称（中文）" 
          required 
        />
      </div>
      <Select
        v-model="formData.parent"
        label="上级部门"
        hint="选择上级部门可建立部门层级关系（如：生产部 > 裁切车间）"
        :options="availableParentOptions"
        placeholder="请选择上级部门（可选）"
        clearable
        filterable
        :disabled="showEditModal && formData.children_count > 0"
      />
      <InputNumber
        v-model="formData.sort_order"
        label="排序"
        hint="数字越小越靠前显示"
        :min="0"
      />
      <CheckboxGroup
        v-model="formData.processes"
        label="工序"
        :options="processOptions"
        class="w-full"
      />
      <Toggle
        v-model="formData.is_active"
        label="是否启用"
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
          form="department-form"
          type="submit"
          :disabled="submitting"
          class="btn btn-primary"
        >
          <Icon
            v-if="submitting"
            name="refresh"
            size="sm"
            class="-ml-1 mr-2 animate-spin"
          />
          {{ submitting ? '保存中...' : showEditModal ? '更新' : '创建' }}
        </button>
      </div>
    </template>
  </BaseDialog>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除部门"
    :message="`确定要删除部门「${selectedRow?.name}」吗？此操作不可撤销。`"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { departmentAPI, processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { TablePageLayout, DataTable, BaseDialog, ConfirmDialog, EmptyState, Pagination, SearchInput, Icon, Input, Select, InputNumber, CheckboxGroup, Toggle, Tag, RowActions, FilterRow } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const columns: Column[] = [
  { key: 'code', label: '部门编码', sortable: true },
  { key: 'name', label: '部门名称', sortable: true },
  { key: 'parent_name', label: '上级部门', sortable: true },
  { key: 'children_count', label: '子部门', sortable: false },
  { key: 'process_names', label: '工序', sortable: false },
  { key: 'sort_order', label: '排序', sortable: true },
  { key: 'is_active', label: '状态', sortable: true },
  { key: 'created_at', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(departmentAPI, 'getList', { errorContext: '加载部门数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('department')
const crud = useCRUD(departmentAPI, { onSuccess: () => { closeModals(); loadData(); loadAllDepartments() } })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const selectedRow = ref<any>(null)

const allProcesses = ref<any[]>([])
const allDepartments = ref<any[]>([])
const expandedProcesses = ref({})

const formInitialValues = { code: '', name: '', parent: null as any, sort_order: 0, is_active: true, processes: [], children_count: 0 }
const formData = reactive({ ...formInitialValues })

const availableParents = computed(() => {
  if (showEditModal.value && selectedRow.value) { 
    return allDepartments.value.filter((dept: any) => { 
      if (dept.id === selectedRow.value.id) return false; 
      if (dept.level >= 2) return false; 
      return true 
    }) 
  }
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
      // Defensive unpacking
      const results = Array.isArray(response) ? response : (response?.results || response?.data || [])
      
      if (results && results.length > 0) { 
        allProcessesArr = allProcessesArr.concat(results); 
        hasMore = response.next !== null && response.next !== undefined; 
        page++ 
      } else { 
        hasMore = false 
      }
    }
    allProcesses.value = allProcessesArr
  } catch (error: any) { ErrorHandler.showMessage(error, '加载工序列表'); allProcesses.value = [] }
}

const loadAllDepartments = async () => {
  try { 
    const response: any = await departmentAPI.getAll(); 
    allDepartments.value = Array.isArray(response) ? response : (response?.data || response?.results || []) 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '加载部门列表'); 
    allDepartments.value = [] 
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  Object.assign(formData, formInitialValues)
}

const openCreateModal = () => {
  selectedRow.value = null
  Object.assign(formData, formInitialValues)
  showCreateModal.value = true
}

const handleEdit = (row: any) => {
  selectedRow.value = row
  Object.assign(formData, { 
    code: row.code, 
    name: row.name, 
    parent: row.parent || null, 
    sort_order: row.sort_order, 
    is_active: row.is_active, 
    processes: row.processes || [], 
    children_count: row.children_count || 0 
  })
  showEditModal.value = true
}

const confirmDelete = (row: any) => {
  selectedRow.value = row
  showDeleteDialog.value = true
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') confirmDelete(row)
}

const cancelDelete = () => {
  if (deleting.value) return
  showDeleteDialog.value = false
  selectedRow.value = null
}

const handleDelete = async () => {
  if (!selectedRow.value) return
  deleting.value = true
  try {
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false
    selectedRow.value = null
    loadAllDepartments()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleting.value = false
  }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  console.log('sort', key, order)
  // TODO: 实现服务端排序
}

const handleSubmit = async () => {
  // 简易验证
  if (!formData.code || !formData.name) return
  if (!/^[a-z0-9_]+$/.test(formData.code)) {
    ErrorHandler.showMessage('部门编码只能包含小写字母、数字和下划线', '验证失败')
    return
  }

  submitting.value = true
  try {
    if (showEditModal.value) { 
      await crud.update(selectedRow.value.id, formData, '保存成功') 
    } else { 
      await crud.create(formData, '创建成功') 
    }
  } finally {
    submitting.value = false
  }
}

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
