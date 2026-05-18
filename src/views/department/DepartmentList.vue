<template>
  <div class="department-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索部门名称、编码"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-button
          v-if="canCreate"
          type="primary"
          :icon="Plus"
          @click="showCreateDialog"
        >
          新建部门
        </el-button>
      </div>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无部门数据"
        style="margin-top: 40px;"
      >
        <el-button
          v-if="canCreate"
          type="primary"
          :icon="Plus"
          @click="showCreateDialog"
        >
          新建部门
        </el-button>
      </el-empty>

      <div
        v-else
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
        class="data-table"
        :row-class-name="getRowClassName"
        >
          <el-table-column prop="code" label="部门编码" width="150" />
          <el-table-column prop="name" label="部门名称" width="180">
            <template #default="scope">
              <span v-if="scope.row.parent" style="color: #4087FA;">{{ scope.row.name }}</span>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="parent_name" label="上级部门" width="120">
            <template #default="scope">
              <span v-if="scope.row.parent_name" style="color: #409EFF;">{{ scope.row.parent_name }}</span>
              <span v-else style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="子部门" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.children_count > 0" type="info" size="small">
                {{ scope.row.children_count }}个
              </el-tag>
              <span v-else style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="工序" min-width="200">
            <template #default="scope">
              <template v-if="!scope.row.process_names || scope.row.process_names.length === 0">
                <span style="color: #909399;">-</span>
              </template>
              <template v-else>
                <el-tag
                  v-for="processName in getDisplayedProcesses(scope.row)"
                  :key="processName"
                  size="small"
                  style="margin-right: 5px; margin-bottom: 5px;"
                >
                  {{ processName }}
                </el-tag>
                <el-tag
                  v-if="shouldShowMoreButton(scope.row)"
                  size="small"
                  style="margin-right: 5px; margin-bottom: 5px; cursor: pointer;"
                  @click="toggleProcessExpansion(scope.row)"
                >
                  {{ getMoreButtonText(scope.row) }}
                </el-tag>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="sort_order" label="排序" width="100" align="center" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.is_active ? 'success' : 'info'">
                {{ scope.row.is_active ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="canEdit"
                type="text"
                size="small"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canDelete"
                type="text"
                size="small"
                style="color: #F56C6C;"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <FormDialog
      ref="formDialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="var(--ui-dialog-width-sm)"
      :form-data="form"
      :rules="rules"
      label-width="120px"
      :loading="dialogLoading"
      @submit="handleSubmit"
      @cancel="customResetForm"
    >
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入部门编码（英文，如：prepress）" :disabled="isEditMode" />
        <div class="form-hint">建议使用英文小写，如：prepress、printing、surface等</div>
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入部门名称（中文）" />
      </el-form-item>
      <el-form-item label="上级部门">
        <el-select v-model="form.parent" placeholder="请选择上级部门（可选）" clearable filterable style="width: 100%;" :disabled="isEditMode && form.children_count > 0">
          <el-option v-for="dept in availableParents" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <div class="form-hint">选择上级部门可建立部门层级关系（如：生产部 > 裁切车间）</div>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sort_order" :min="0" style="width: 100%;" />
        <div class="form-hint">数字越小越靠前显示</div>
      </el-form-item>
      <el-form-item label="工序">
        <el-checkbox-group v-model="form.processes" style="width: 100%;">
          <el-checkbox v-for="process in allProcesses" :key="process.id" :label="process.id" :disabled="!process.is_active">
            {{ process.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="form.is_active" />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { departmentAPI, processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { FormDialog } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const {
  searchText,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange
} = useCrudList(departmentAPI, 'getList', {
  errorContext: '加载部门数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('department')

const crud = useCRUD(departmentAPI, {
  onSuccess: () => { dialogVisible.value = false; loadData(); loadAllDepartments() },
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const dialogTitle = ref('新建部门')
const dialogLoading = ref(false)
const currentRow = ref(null)
const formDialogRef = ref(null)

const allProcesses = ref([])
const allDepartments = ref([])
const expandedProcesses = ref({})

const formInitialValues = {
  code: '',
  name: '',
  parent: null,
  sort_order: 0,
  is_active: true,
  processes: [],
  children_count: 0
}

const form = reactive({ ...formInitialValues })

const rules = {
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '部门编码只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ]
}

const isEditMode = computed(() => dialogType.value === 'edit')

const availableParents = computed(() => {
  if (isEditMode.value && currentRow.value) {
    return allDepartments.value.filter(dept => {
      if (dept.id === currentRow.value.id) return false
      if (dept.level >= 2) return false
      return true
    })
  }
  return allDepartments.value.filter(dept => dept.level < 2)
})

const loadAllProcesses = async () => {
  try {
    let allProcesses = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await processAPI.getList({
        is_active: true,
        page_size: 100,
        page: page
      })
      if (response.results && response.results.length > 0) {
        allProcesses = allProcesses.concat(response.results)
        hasMore = response.next !== null && response.next !== undefined
        page++
      } else {
        hasMore = false
      }
    }
    allProcesses.value = allProcesses
  } catch (error) {
    ErrorHandler.showMessage(error, '加载工序列表')
    allProcesses.value = []
  }
}

const loadAllDepartments = async () => {
  try {
    const response = await departmentAPI.getAll()
    allDepartments.value = response?.data || response || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载部门列表')
    allDepartments.value = []
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  dialogTitle.value = '新建部门'
  currentRow.value = null
  customResetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑部门'
  currentRow.value = row
  Object.assign(form, {
    code: row.code,
    name: row.name,
    parent: row.parent || null,
    sort_order: row.sort_order,
    is_active: row.is_active,
    processes: row.processes || [],
    children_count: row.children_count || 0
  })
  dialogVisible.value = true
  nextTick(() => {
    formDialogRef.value?.clearValidate()
  })
}

const customResetForm = () => {
  Object.assign(form, formInitialValues)
  currentRow.value = null
  nextTick(() => {
    formDialogRef.value?.clearValidate()
  })
}

const handleDelete = async (row) => {
  const confirmed = await ErrorHandler.confirm(
    `确定要删除部门「${row.name}」吗？`,
    '确认删除'
  )
  if (!confirmed) return

  await crud.remove(row.id, '删除成功')
  loadAllDepartments()
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return

  dialogLoading.value = true
  if (isEditMode.value) {
    await crud.update(currentRow.value.id, form, '保存成功')
  } else {
    await crud.create(form, '创建成功')
  }
  dialogLoading.value = false
}

const getRowClassName = ({ row }) => {
  return row.parent ? 'child-department-row' : ''
}

const getDisplayedProcesses = (row) => {
  if (!row.process_names || row.process_names.length === 0) {
    return []
  }
  const isExpanded = expandedProcesses.value[row.id]
  if (isExpanded || row.process_names.length <= 1) {
    return row.process_names
  }
  return [row.process_names[0]]
}

const shouldShowMoreButton = (row) => {
  if (!row.process_names || row.process_names.length <= 1) {
    return false
  }
  return true
}

const getMoreButtonText = (row) => {
  if (!row.process_names || row.process_names.length <= 1) {
    return ''
  }
  const isExpanded = expandedProcesses.value[row.id]
  if (isExpanded) {
    return '收起'
  }
  const remainingCount = row.process_names.length - 1
  return `+${remainingCount}`
}

const toggleProcessExpansion = (row) => {
  const rowId = row.id
  expandedProcesses.value[rowId] = !expandedProcesses.value[rowId]
}

onMounted(() => {
  loadAllProcesses()
  loadAllDepartments()
  loadData()
})
</script>

<style lang="scss" scoped>
.department-list {
  padding: var(--ui-page-padding);
}

:deep(.child-department-row) {
  background-color: #f5f7fa;
}

:deep(.child-department-row:hover) {
  background-color: #ecf5ff;
}

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
