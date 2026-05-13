<template>
  <div class="process-list">
    <el-card>
      <div class="header-section">
        <el-input
          v-model="searchText"
          placeholder="搜索工序名称、编码"
          style="width: 300px;"
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

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
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

    <el-dialog
      v-model="dialogVisible"
      :title="formTitle"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { processAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const userStore = useUserStore()

const searchText = ref('')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref(null)
const formRef = ref(null)

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
const canCreate = computed(() => userStore.hasPermission('workorder.add_process'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_process'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_process'))

let searchTimer = null

const handleSearchDebounced = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (searchText.value) {
      params.search = searchText.value
    }
    const response = await processAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

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
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  formLoading.value = true
  try {
    if (dialogType.value === 'edit') {
      await processAPI.update(currentRow.value.id, form)
      ElMessage.success('保存成功')
    } else {
      await processAPI.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ErrorHandler.confirm(`确定要删除工序"${row.name}"吗？`)
    await processAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ErrorHandler.showMessage(error, '删除')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.process-list {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
