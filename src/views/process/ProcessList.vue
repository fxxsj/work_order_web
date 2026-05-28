<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-64"
          placeholder="搜索工序名称、编码"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.is_active"
          class="w-full sm:w-36"
          placeholder="状态"
          :options="activeFilterOptions"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.task_generation_rule"
          class="w-full sm:w-48"
          placeholder="任务生成规则"
          :options="taskRuleOptions"
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
        :server-side-sort="true"
        default-sort-key="sort_order"
        default-sort-order="asc"
        @sort="handleSort"
      >
        <template #cell-task_generation_rule="{ value }">
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ getTaskRuleLabel(value) }}
          </span>
        </template>

        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '启用' : '禁用' }}
          </Tag>
        </template>

        <template #cell-is_builtin="{ value }">
          <Tag :type="value ? 'warning' : 'info'">
            {{ value ? '内置' : '自定义' }}
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
    <form
      id="process-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <Input
          v-model="formData.code"
          label="工序编码"
          required
          placeholder="请输入工序编码"
          :disabled="showEditModal && formData.is_builtin"
        />
      </div>
      <div>
        <Input
          v-model="formData.name"
          label="工序名称"
          required
          placeholder="请输入工序名称"
        />
      </div>
      <div>
        <TextArea
          v-model="formData.description"
          label="工序描述"
          placeholder="请输入工序描述"
          :rows="3"
        />
      </div>
      <div>
        <Input
          v-model="formData.standard_duration"
          label="标准工时(小时)"
          type="number"
          placeholder="0"
        />
      </div>
      <div>
        <Input
          v-model="formData.sort_order"
          label="排序"
          type="number"
          placeholder="0"
        />
      </div>
      <div>
        <Select
          v-model="formData.task_generation_rule"
          label="任务生成规则"
          :options="taskRuleOptions"
          placeholder="请选择任务生成规则"
          @change="syncTaskRuleRequirements"
        />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <Toggle
          v-model="formData.requires_artwork"
          label="需要图稿"
          @change="handleRequiresArtworkChange"
        />
        <Toggle
          v-model="formData.artwork_required"
          label="图稿必选"
          :disabled="!formData.requires_artwork"
        />
        <Toggle
          v-model="formData.requires_die"
          label="需要刀模"
          @change="handleRequiresDieChange"
        />
        <Toggle
          v-model="formData.die_required"
          label="刀模必选"
          :disabled="!formData.requires_die"
        />
        <Toggle
          v-model="formData.requires_foiling_plate"
          label="需要烫金版"
          @change="handleRequiresFoilingPlateChange"
        />
        <Toggle
          v-model="formData.foiling_plate_required"
          label="烫金版必选"
          :disabled="!formData.requires_foiling_plate"
        />
        <Toggle
          v-model="formData.requires_embossing_plate"
          label="需要压凸版"
          @change="handleRequiresEmbossingPlateChange"
        />
        <Toggle
          v-model="formData.embossing_plate_required"
          label="压凸版必选"
          :disabled="!formData.requires_embossing_plate"
        />
      </div>
      <div>
        <Toggle
          v-model="formData.is_parallel"
          label="可并行执行"
        />
      </div>
      <div>
        <Toggle
          v-model="formData.is_active"
          label="是否启用"
          :disabled="formData.is_builtin && formData.is_active"
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

  <BaseDialog
    :show="showDetailModal"
    title="工序详情"
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
          <DescriptionItem label="工序编码">
            {{ currentDetail.code || '-' }}
          </DescriptionItem>
          <DescriptionItem label="工序名称">
            {{ currentDetail.name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="标准工时">
            {{ currentDetail.standard_duration ?? 0 }} 小时
          </DescriptionItem>
          <DescriptionItem label="排序">
            {{ currentDetail.sort_order ?? 0 }}
          </DescriptionItem>
          <DescriptionItem label="状态">
            {{ currentDetail.is_active ? '启用' : '禁用' }}
          </DescriptionItem>
          <DescriptionItem label="类型">
            {{ currentDetail.is_builtin ? '内置' : '自定义' }}
          </DescriptionItem>
          <DescriptionItem
            label="描述"
            :span="2"
          >
            {{ currentDetail.description || '-' }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
      <section>
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
          任务与版配置
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="任务生成规则">
            {{ getTaskRuleLabel(currentDetail.task_generation_rule) }}
          </DescriptionItem>
          <DescriptionItem label="可并行执行">
            {{ currentDetail.is_parallel ? '是' : '否' }}
          </DescriptionItem>
          <DescriptionItem label="图稿">
            {{ formatPlateRule(currentDetail.requires_artwork, currentDetail.artwork_required) }}
          </DescriptionItem>
          <DescriptionItem label="刀模">
            {{ formatPlateRule(currentDetail.requires_die, currentDetail.die_required) }}
          </DescriptionItem>
          <DescriptionItem label="烫金版">
            {{ formatPlateRule(currentDetail.requires_foiling_plate, currentDetail.foiling_plate_required) }}
          </DescriptionItem>
          <DescriptionItem label="压凸版">
            {{ formatPlateRule(currentDetail.requires_embossing_plate, currentDetail.embossing_plate_required) }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
      <section>
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
          系统信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="工序ID">
            {{ currentDetail.id }}
          </DescriptionItem>
          <DescriptionItem label="创建时间">
            {{ formatDateTime(currentDetail.created_at) }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
    </div>
  </BaseDialog>

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
import { TablePageLayout, DataTable, EmptyState, Pagination, SearchInput, Input, Select, TextArea, Toggle, Icon, Tag, BaseDialog, ConfirmDialog, RowActions, FilterRow, DescriptionGrid, DescriptionItem } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const columns: Column[] = [
  { key: 'code', label: '工序编码', sortable: true, class: 'w-28' },
  { key: 'name', label: '工序名称', sortable: true, class: 'w-44' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'standard_duration', label: '标准工时(小时)', sortable: true, class: 'w-32 text-right' },
  { key: 'task_generation_rule', label: '任务生成规则', sortable: true, class: 'w-40' },
  { key: 'sort_order', label: '排序', sortable: true, class: 'w-20 text-center' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24' },
  { key: 'is_builtin', label: '类型', sortable: true, class: 'w-24' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const sortKey = ref('sort_order')
const sortOrder = ref<'asc' | 'desc'>('asc')

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(processAPI, 'getList', {
  initialFilters: { is_active: '', task_generation_rule: '' },
  errorContext: '加载工序数据失败',
  buildParams: (params) => {
    const ordering = sortOrder.value === 'desc' ? `-${sortKey.value}` : sortKey.value
    return { ...params, ordering }
  }
})

const { canCreate, canEdit, canDelete } = useCrudPermission('process')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)
const currentDetail = ref<any>(null)

const activeFilterOptions = [
  { value: 'true', label: '启用' },
  { value: 'false', label: '禁用' }
]

const taskRuleOptions = [
  { value: 'artwork', label: '按图稿生成任务' },
  { value: 'die', label: '按刀模生成任务' },
  { value: 'product', label: '按产品生成任务' },
  { value: 'material', label: '按物料生成任务' },
  { value: 'general', label: '生成通用任务' }
]

const formInitialValues: Record<string, any> = {
  id: undefined as number | undefined,
  code: '',
  name: '',
  description: '',
  standard_duration: 0,
  sort_order: 0,
  is_active: true,
  is_builtin: false,
  task_generation_rule: 'general',
  requires_artwork: false,
  requires_die: false,
  requires_foiling_plate: false,
  requires_embossing_plate: false,
  artwork_required: true,
  die_required: true,
  foiling_plate_required: true,
  embossing_plate_required: true,
  is_parallel: false
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
    is_active: row.is_active !== false,
    is_builtin: row.is_builtin === true,
    task_generation_rule: row.task_generation_rule || 'general',
    requires_artwork: row.requires_artwork === true,
    requires_die: row.requires_die === true,
    requires_foiling_plate: row.requires_foiling_plate === true,
    requires_embossing_plate: row.requires_embossing_plate === true,
    artwork_required: row.artwork_required !== false,
    die_required: row.die_required !== false,
    foiling_plate_required: row.foiling_plate_required !== false,
    embossing_plate_required: row.embossing_plate_required !== false,
    is_parallel: row.is_parallel === true
  })
  showEditModal.value = true
}

const getTaskRuleLabel = (value: string) =>
  taskRuleOptions.find(option => option.value === value)?.label || value || '-'

const formatPlateRule = (required: boolean, strict: boolean) => {
  if (!required) return '不需要'
  return strict ? '需要且必选' : '需要但可选'
}

const syncTaskRuleRequirements = () => {
  if (formData.task_generation_rule === 'artwork') {
    formData.requires_artwork = true
    formData.artwork_required = true
  }
  if (formData.task_generation_rule === 'die') {
    formData.requires_die = true
    formData.die_required = true
  }
}

const handleRequiresArtworkChange = (value: boolean) => {
  if (value) formData.artwork_required = true
}

const handleRequiresDieChange = (value: boolean) => {
  if (value) formData.die_required = true
}

const handleRequiresFoilingPlateChange = (value: boolean) => {
  if (value) formData.foiling_plate_required = true
}

const handleRequiresEmbossingPlateChange = (value: boolean) => {
  if (value) formData.embossing_plate_required = true
}

const openDetail = async (row: any) => {
  selectedRow.value = row
  try {
    currentDetail.value = await processAPI.getDetail(row.id)
    showDetailModal.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载工序详情失败')
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  currentDetail.value = null
}

const handleSubmit = async () => {
  const code = (formData.code || '').trim()
  const name = (formData.name || '').trim()
  const duration = Number(formData.standard_duration ?? 0)
  const sortOrderValue = Number(formData.sort_order ?? 0)

  if (!name) {
    ErrorHandler.showMessage('请输入工序名称', '校验失败')
    return
  }
  if (!code) {
    ErrorHandler.showMessage('请输入工序编码', '校验失败')
    return
  }
  if (code.length < 2 || code.length > 50) {
    ErrorHandler.showMessage('工序编码长度必须在2-50个字符之间', '校验失败')
    return
  }
  if (!/^[A-Za-z0-9_-]+$/.test(code)) {
    ErrorHandler.showMessage('工序编码只能包含字母、数字、连字符和下划线', '校验失败')
    return
  }
  if (duration < 0 || duration > 9999) {
    ErrorHandler.showMessage('标准工时必须在0-9999之间', '校验失败')
    return
  }
  if (sortOrderValue < 0 || sortOrderValue > 99999) {
    ErrorHandler.showMessage('排序值必须在0-99999之间', '校验失败')
    return
  }

  syncTaskRuleRequirements()

  if (formData.requires_artwork && !formData.artwork_required) {
    ErrorHandler.showMessage('工序需要图稿时，图稿必选必须开启', '校验失败')
    return
  }
  if (formData.requires_die && !formData.die_required) {
    ErrorHandler.showMessage('工序需要刀模时，刀模必选必须开启', '校验失败')
    return
  }
  if (formData.requires_foiling_plate && !formData.foiling_plate_required) {
    ErrorHandler.showMessage('工序需要烫金版时，烫金版必选必须开启', '校验失败')
    return
  }
  if (formData.requires_embossing_plate && !formData.embossing_plate_required) {
    ErrorHandler.showMessage('工序需要压凸版时，压凸版必选必须开启', '校验失败')
    return
  }
  if (formData.task_generation_rule === 'artwork' && !formData.requires_artwork) {
    ErrorHandler.showMessage('按图稿生成任务时，必须启用需要图稿', '校验失败')
    return
  }
  if (formData.task_generation_rule === 'die' && !formData.requires_die) {
    ErrorHandler.showMessage('按刀模生成任务时，必须启用需要刀模', '校验失败')
    return
  }

  const payload = {
    id: showEditModal.value ? selectedRow.value?.id : undefined,
    ...formData,
    code,
    name,
    description: (formData.description || '').trim(),
    standard_duration: duration,
    sort_order: sortOrderValue
  }

  submitting.value = true
  try {
    if (showEditModal.value) {
      const { id, ...updateData } = payload
      await crud.update(id, updateData, '保存成功')
    } else {
      const { id, ...createData } = payload
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
