<template>
  <div class="process-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索工序名称、编码"
          clearable
          @input="handleSearchDebounced"
          @clear="handleSearch"
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
          新建工序
        </el-button>
      </div>

      <div class="table-scroll">
        <el-table
          v-loading="loading"
          :data="tableData"
          class="data-table"
        >
          <el-table-column prop="code" label="工序编码" width="120" />
          <el-table-column prop="name" label="工序名称" width="180" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="standard_duration" label="标准工时(小时)" width="140" align="right" />
          <el-table-column prop="sort_order" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.is_active ? 'success' : 'info'">
                {{ scope.row.is_active ? '启用' : '禁用' }}
              </el-tag>
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
      :title="formTitle"
      width="var(--ui-dialog-width-md)"
      :form-data="form"
      :rules="rules"
      label-width="120px"
      :loading="formLoading"
      @submit="handleSubmit"
      @cancel="resetForm"
    >
      <el-form-item label="工序编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入工序编码" :disabled="dialogType === 'edit'" />
      </el-form-item>
      <el-form-item label="工序名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入工序名称" />
      </el-form-item>
      <el-form-item label="工序描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入工序描述"
        />
      </el-form-item>
      <el-form-item label="标准工时(小时)">
        <el-input-number
          v-model="form.standard_duration"
          :min="0"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number
          v-model="form.sort_order"
          :min="0"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="form.is_active" />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { processAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { FormDialog } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const {
  searchText,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange
} = useCrudList(processAPI.getList, {
  errorContext: '加载工序数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('process')

const crud = useCRUD(processAPI, {
  onSuccess: () => { dialogVisible.value = false; loadData() },
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref(null)
const formDialogRef = ref(null)

const formInitialValues = {
  code: '',
  name: '',
  description: '',
  standard_duration: 0,
  sort_order: 0,
  is_active: true
}

const form = reactive({ ...formInitialValues })

const rules = {
  code: [
    { required: true, message: '请输入工序编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入工序名称', trigger: 'blur' }
  ]
}

const formTitle = computed(() => dialogType.value === 'edit' ? '编辑工序' : '新建工序')

const showCreateDialog = () => {
  resetForm()
  dialogType.value = 'create'
  currentRow.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentRow.value = row
  Object.assign(form, {
    code: row.code,
    name: row.name,
    description: row.description || '',
    standard_duration: row.standard_duration,
    sort_order: row.sort_order,
    is_active: row.is_active
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, formInitialValues)
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return

  formLoading.value = true
  if (dialogType.value === 'edit') {
    await crud.update(currentRow.value.id, form, '保存成功')
  } else {
    await crud.create(form, '创建成功')
  }
  formLoading.value = false
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除工序"${row.name}"吗？`)
    if (!confirmed) return
    await crud.remove(row.id, '删除成功')
  } catch (error) {
    ErrorHandler.showMessage(error, '删除')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.process-list {
  padding: var(--ui-page-padding);
}
</style>
