<template>
  <div class="die-list">
    <el-card>
      <div class="header-section">
        <el-input
          v-model="searchText"
          placeholder="搜索刀模编码、名称、尺寸、材质"
          style="width: 300px;"
          clearable
          @input="handleSearchDebounced"
          @clear="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <div class="header-actions">
          <el-button
            :loading="loading"
            :icon="RefreshRight"
            @click="handleRefresh"
          >
            刷新
          </el-button>
          <el-button
            v-if="canCreate"
            type="primary"
            :icon="Plus"
            @click="handleCreate"
          >
            新建刀模
          </el-button>
        </div>
      </div>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无刀模数据"
        style="margin-top: 40px;"
      >
        <el-button
          v-if="canCreate"
          type="primary"
          :icon="Plus"
          @click="handleCreate"
        >
          创建第一个刀模
        </el-button>
      </el-empty>

      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="code" label="刀模编码" width="150" />
        <el-table-column prop="name" label="刀模名称" width="200" />
        <el-table-column label="刀模类型" width="120">
          <template #default="scope">
            <el-tag
              :type="getDieTypeTagType(scope.row.die_type)"
              size="small"
            >
              {{ scope.row.die_type_display || getDieTypeLabel(scope.row.die_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="尺寸" width="150" />
        <el-table-column prop="material" label="材质" width="100" />
        <el-table-column prop="thickness" label="厚度" width="100" />
        <el-table-column label="确认状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.confirmed" type="success" size="small">
              已确认
            </el-tag>
            <el-tag v-else type="info" size="small">
              待确认
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="包含产品" min-width="250">
          <template #default="scope">
            <el-tag
              v-for="product in scope.row.products"
              :key="product.id"
              :type="product.relation_type === 'imposition' ? 'warning' : ''"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ product.product_name }} ({{ product.quantity }}拼)
              <span v-if="product.relation_type === 'imposition'" style="font-size: 10px;">拼</span>
            </el-tag>
            <span v-if="!scope.row.products || scope.row.products.length === 0" style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
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

    <DieFormDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :initial-data="currentRow"
      :loading="formLoading"
      :product-list="productList"
      @submit="handleFormSubmit"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dieAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import DieFormDialog from './components/DieFormDialog.vue'

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
const productList = ref([])

const canCreate = computed(() => userStore.hasPermission('workorder.add_die'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_die'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_die'))

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
    const response = await dieAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadProductList = async () => {
  try {
    const response = await productAPI.getList({ is_active: true, page_size: 100 })
    productList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载产品列表')
  }
}

const handleRefresh = () => {
  loadData()
}

const handleCreate = () => {
  currentRow.value = null
  dialogType.value = 'create'
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    const detail = await dieAPI.getDetail(row.id)
    currentRow.value = detail
    dialogType.value = 'edit'
    dialogVisible.value = true
  } catch (error) {
    ErrorHandler.showMessage(error, '加载刀模详情')
  }
}

const handleFormSubmit = async (data) => {
  formLoading.value = true
  try {
    if (dialogType.value === 'edit' && currentRow.value) {
      await dieAPI.update(currentRow.value.id, data)
      ElMessage.success('保存成功')
    } else {
      await dieAPI.create(data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存刀模' : '创建刀模')
  } finally {
    formLoading.value = false
  }
}

const handleDialogClose = () => {
  currentRow.value = null
}

const handleDelete = async (row) => {
  const confirmed = await ErrorHandler.confirm(
    `确定要删除刀模"${row.name}"吗？此操作不可恢复。`,
    '删除确认'
  )

  if (!confirmed) return

  try {
    await dieAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除刀模')
  }
}

const getDieTypeTagType = (dieType) => {
  const typeMap = {
    combined: 'warning',
    dedicated: 'primary',
    universal: 'success'
  }
  return typeMap[dieType] || 'info'
}

const getDieTypeLabel = (dieType) => {
  const labelMap = {
    combined: '拼版刀模',
    dedicated: '专用刀模',
    universal: '通用刀模'
  }
  return labelMap[dieType] || dieType
}

onMounted(() => {
  loadData()
  loadProductList()
})
</script>

<style scoped>
.die-list {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
