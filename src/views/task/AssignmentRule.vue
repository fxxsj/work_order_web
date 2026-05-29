<template>
  <TablePageLayout
    title="工序分派规则"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索工序/部门/备注"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.process"
          :options="processOptions"
          class="w-full sm:w-36"
          placeholder="工序"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.department"
          :options="departmentOptions"
          class="w-full sm:w-36"
          placeholder="部门"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.is_active"
          :options="activeOptions"
          class="w-full sm:w-36"
          placeholder="状态"
          clearable
          @change="handleSearch"
        />
        <button
          class="btn btn-secondary"
          @click="handleReset"
        >
          重置
        </button>
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>自动分派</span>
          <Toggle
            v-model="globalDispatchEnabled"
            label=""
            @change="handleGlobalToggle"
          />
        </div>
        <div class="flex-1" />
        <div class="flex gap-3">
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
            class="btn btn-secondary"
            :disabled="previewLoading"
            @click="showPreviewDialog"
          >
            <Icon
              name="eye"
              size="md"
              class="mr-2"
            />
            预览
          </button>
          <button
            v-if="canCreate"
            class="btn btn-primary"
            @click="showDialog(null)"
          >
            <Icon
              name="plus"
              size="md"
              class="mr-2"
            />
            新建规则
          </button>
        </div>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
      >
        <template #cell-process_name="{ row }">
          <span class="font-medium">{{ row.process_name || row.process?.name }}</span>
          <span
            v-if="row.process_code"
            class="ml-2 text-xs text-gray-400"
          >
            {{ row.process_code || row.process?.code }}
          </span>
        </template>

        <template #cell-department_name="{ row }">
          <span class="font-medium">{{ row.department_name || row.department?.name }}</span>
        </template>

        <template #cell-is_active="{ row }">
          <Tag :type="row.is_active ? 'success' : 'info'">
            {{ row.is_active ? '启用' : '禁用' }}
          </Tag>
        </template>

        <template #cell-operator_selection_strategy="{ row }">
          {{ getStrategyLabel(row.operator_selection_strategy) }}
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="[
              { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
              { key: 'toggle', label: row.is_active ? '禁用' : '启用', icon: row.is_active ? 'ban' : 'checkCircle', visible: canEdit },
              { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
            ]"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的规则' : '暂无分派规则'"
            :action-text="hasFilters ? '重置筛选' : undefined"
            @action="handleReset"
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

  <!-- 新建/编辑弹窗 -->
  <BaseDialog
    :show="dialogVisible"
    :title="dialogTitle"
    width="narrow"
    @close="dialogVisible = false"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">工序</label>
        <Select
          v-model="form.process"
          :options="processOptionsForForm"
          placeholder="请选择工序"
          filterable
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">部门</label>
        <Select
          v-model="form.department"
          :options="departmentOptionsForForm"
          placeholder="请选择部门"
          filterable
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">优先级</label>
        <InputNumber
          v-model="form.priority"
          :min="1"
          :max="100"
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">策略</label>
        <Select
          v-model="form.operator_selection_strategy"
          :options="strategyOptions"
          class="flex-1"
        />
      </div>
      <TextArea
        v-model="form.notes"
        label="备注"
        :rows="2"
        placeholder="规则说明或备注"
        class="w-full"
      />
      <Toggle
        v-model="form.is_active"
        label="启用"
      />
    </div>
    <template #footer>
      <button
        class="btn btn-secondary"
        @click="dialogVisible = false"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '确定' }}
      </button>
    </template>
  </BaseDialog>

  <!-- 预览弹窗 -->
  <BaseDialog
    :show="previewDialogVisible"
    title="分派效果预览"
    width="normal"
    @close="previewDialogVisible = false"
  >
    <DataTable
      :columns="previewColumns"
      :data="previewData"
      :loading="previewLoading"
      :row-key="(row: any) => row.process_id"
    >
      <template #cell-current_load="{ row }">
        <ProgressBar
          :percentage="row.current_load || 0"
          :status="getLoadStatus(row.current_load)"
        />
      </template>
      <template #empty>
        <EmptyState description="暂无预览数据" />
      </template>
    </DataTable>
    <template #footer>
      <button
        class="btn btn-secondary"
        @click="previewDialogVisible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>

  <!-- 删除确认弹窗 -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除确认"
    message="确定要删除此规则？删除后无法恢复。"
    confirm-text="删除"
    cancel-text="取消"
    danger
    :loading="deleting"
    loading-text="删除中..."
    @confirm="executeDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useUserStore } from '@/stores'
import { assignmentRuleAPI, processAPI, departmentAPI } from '@/api/modules'
import { useCrudPermission } from '@/composables'
import {
  Icon, SearchInput, Select, InputNumber, TextArea, Toggle,
  ConfirmDialog, DataTable, EmptyState, ProgressBar, BaseDialog,
  TablePageLayout, FilterRow, Pagination, Tag, RowActions
} from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const userStore = useUserStore()
const { canCreate, canEdit, canDelete } = useCrudPermission('taskassignmentrule')

// 表格列
const columns: Column[] = [
  { key: 'process_name', label: '工序', width: 160 },
  { key: 'department_name', label: '分派部门', width: 140 },
  { key: 'priority', label: '优先级', width: 80, align: 'center' },
  { key: 'operator_selection_strategy', label: '操作员策略', width: 140 },
  { key: 'is_active', label: '状态', width: 80, align: 'center' },
  { key: 'notes', label: '备注' },
  { key: 'actions', label: '操作', width: 160, align: 'center', fixed: 'right' }
]

// 列表数据状态
const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选条件
const searchText = ref('')
const filters = reactive({
  process: null as any,
  department: null as any,
  is_active: null as any
})

// 基础数据
const processList = ref<any[]>([])
const departmentList = ref<any[]>([])
const globalDispatchEnabled = ref(false)
const previewLoading = ref(false)
const previewData = ref<any[]>([])
const previewDialogVisible = ref(false)

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('新建分派规则')
const submitting = ref(false)
const isEdit = ref(false)
const currentRuleId = ref<any>(null)
const showDeleteDialog = ref(false)
const deleting = ref(false)
const pendingDeleteRule = ref<any>(null)

// 表单
const form = reactive({
  process: null as any,
  department: null as any,
  priority: 1,
  operator_selection_strategy: 'least_tasks',
  notes: '',
  is_active: true
})

// 是否有筛选条件
const hasFilters = computed(() => {
  return searchText.value ||
    filters.process !== null ||
    filters.department !== null ||
    filters.is_active !== null
})

// 筛选选项（包含"全部"选项）
const processOptions = computed(() => [
  { value: null, label: '全部工序' },
  ...processList.value.map((p: any) => ({ value: p.id, label: `${p.code} ${p.name}` }))
])

const departmentOptions = computed(() => [
  { value: null, label: '全部部门' },
  ...departmentList.value.map((d: any) => ({ value: d.id, label: d.name }))
])

// 表单选项（不包含"全部"）
const processOptionsForForm = computed(() =>
  processList.value.map((p: any) => ({ value: p.id, label: `${p.code} ${p.name}` }))
)

const departmentOptionsForForm = computed(() =>
  departmentList.value.map((d: any) => ({ value: d.id, label: d.name }))
)

const activeOptions = [
  { value: null, label: '全部状态' },
  { value: true, label: '仅启用' },
  { value: false, label: '仅禁用' }
]

const strategyOptions = [
  { value: 'least_tasks', label: '任务数量最少（工作量均衡）' },
  { value: 'random', label: '随机选择' },
  { value: 'round_robin', label: '轮询分配' },
  { value: 'first_available', label: '第一个可用' }
]

// 预览表格列
const previewColumns: Column[] = [
  { key: 'process_name', label: '工序', width: 120 },
  { key: 'target_department_name', label: '分派部门', width: 120 },
  { key: 'current_load', label: '当前负载', width: 120 },
  { key: 'priority', label: '优先级', width: 80, align: 'center' }
]

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (searchText.value) params.search = searchText.value
    if (filters.process) params.process = filters.process
    if (filters.department) params.department = filters.department
    if (filters.is_active !== null) params.is_active = filters.is_active

    const res: any = await assignmentRuleAPI.getList(params)
    tableData.value = res?.results || res?.data || []
    total.value = res?.count || res?.total || tableData.value.length
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载数据失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 加载基础数据
const loadProcesses = async () => {
  try {
    const res: any = await processAPI.getList({ is_active: true, page_size: 100 })
    processList.value = res?.results || res?.data || []
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载工序')
  }
}

const loadDepartments = async () => {
  try {
    const res: any = await departmentAPI.getList({ page_size: 100 })
    departmentList.value = res?.results || res?.data || []
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载部门')
  }
}

const loadGlobalState = async () => {
  try {
    const res: any = await assignmentRuleAPI.getGlobalState()
    globalDispatchEnabled.value = res?.enabled || false
  } catch (error: any) {
    // 忽略错误，使用默认值
  }
}

// 全局开关
const handleGlobalToggle = async (enabled: any) => {
  try {
    await assignmentRuleAPI.setGlobalState(enabled)
    useUIStore().showSuccess(enabled ? '自动分派已启用' : '自动分派已禁用')
  } catch (error: any) {
    globalDispatchEnabled.value = !enabled
    ErrorHandler.showMessage(error, '更新配置失败')
  }
}

// 搜索和筛选
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchText.value = ''
  filters.process = null
  filters.department = null
  filters.is_active = null
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// 预览
const showPreviewDialog = async () => {
  previewDialogVisible.value = true
  previewLoading.value = true
  try {
    const res: any = await assignmentRuleAPI.preview()
    previewData.value = res?.data?.preview || res?.preview || []
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载预览失败')
  } finally {
    previewLoading.value = false
  }
}

const getLoadStatus = (load: any) => {
  if (load == null) return 'success'
  if (load < 50) return 'success'
  if (load < 80) return 'warning'
  return 'danger'
}

const getStrategyLabel = (strategy: string) => {
  const found = strategyOptions.find(s => s.value === strategy)
  return found ? found.label.split('（')[0] : strategy
}

// 行操作
const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') showDialog(row)
  if (action === 'toggle') handleToggleActive(row)
  if (action === 'delete') confirmDelete(row)
}

// 弹窗操作
const showDialog = (rule: any = null) => {
  if (rule) {
    Object.assign(form, {
      process: rule.process?.id || rule.process,
      department: rule.department?.id || rule.department,
      priority: rule.priority || 1,
      operator_selection_strategy: rule.operator_selection_strategy || 'least_tasks',
      notes: rule.notes || '',
      is_active: rule.is_active !== false
    })
    dialogTitle.value = '编辑分派规则'
    isEdit.value = true
    currentRuleId.value = rule.id
  } else {
    Object.assign(form, {
      process: null,
      department: null,
      priority: 1,
      operator_selection_strategy: 'least_tasks',
      notes: '',
      is_active: true
    })
    dialogTitle.value = '新建分派规则'
    isEdit.value = false
    currentRuleId.value = null
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.process) {
    useUIStore().showWarning('请选择工序')
    return
  }
  if (!form.department) {
    useUIStore().showWarning('请选择部门')
    return
  }

  submitting.value = true
  try {
    const payload = {
      process: form.process,
      department: form.department,
      priority: form.priority,
      operator_selection_strategy: form.operator_selection_strategy,
      notes: form.notes,
      is_active: form.is_active
    }

    if (isEdit.value) {
      await assignmentRuleAPI.patch(currentRuleId.value, payload)
      useUIStore().showSuccess('更新成功')
    } else {
      await assignmentRuleAPI.create(payload)
      useUIStore().showSuccess('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

// 切换启用状态
const handleToggleActive = async (rule: any) => {
  try {
    await assignmentRuleAPI.patch(rule.id, { is_active: !rule.is_active })
    useUIStore().showSuccess(rule.is_active ? '已禁用' : '已启用')
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '更新失败')
  }
}

// 删除
const confirmDelete = (rule: any) => {
  pendingDeleteRule.value = rule
  showDeleteDialog.value = true
}

const executeDelete = async () => {
  if (!pendingDeleteRule.value) return
  deleting.value = true
  try {
    await assignmentRuleAPI.delete(pendingDeleteRule.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    pendingDeleteRule.value = null
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadProcesses()
  loadDepartments()
  loadGlobalState()
  loadData()
})
</script>
