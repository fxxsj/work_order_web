<template>
  <div class="embossing-plate-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索压凸版编码、名称、尺寸、材质"
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
          新建压凸版
        </el-button>
      </div>

      <div
        v-if="tableData.length > 0"
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
        class="data-table"
        >
        <el-table-column prop="code" label="压凸版编码" width="150" />
        <el-table-column prop="name" label="压凸版名称" width="200" />
        <el-table-column prop="size" label="尺寸" width="150" />
        <el-table-column prop="material" label="材质" width="120" />
        <el-table-column prop="thickness" label="厚度" width="100" />
        <el-table-column label="确认状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.confirmed ? 'success' : 'info'">
              {{ scope.row.confirmed ? '已确认' : '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="包含产品" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="product in scope.row.products"
              :key="product.id"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ product.product_name }} ({{ product.quantity }}个)
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              v-if="!scope.row.confirmed && canEdit"
              type="text"
              size="small"
              @click="handleConfirmPlate(scope.row)"
            >
              确认
            </el-button>
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

      <el-empty
        v-if="!loading && tableData.length === 0"
        :description="hasFilters ? '未找到匹配的压凸版' : '暂无压凸版数据'"
        :image-size="200"
        style="margin-top: 50px;"
      >
        <el-button v-if="hasFilters" type="primary" @click="handleReset">
          重置筛选
        </el-button>
        <el-button v-else-if="canCreate" type="primary" @click="showCreateDialog">
          创建第一个压凸版
        </el-button>
      </el-empty>
    </el-card>

    <embossing-plate-form-dialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :embossing-plate="currentEmbossingPlate"
      :loading="formLoading"
      :product-list="productList"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { embossingPlateAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import EmbossingPlateFormDialog from './components/EmbossingPlateFormDialog.vue'

const userStore = useUserStore()

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
  handleSizeChange,
  resetFilters
} = useCrudList(embossingPlateAPI.getList, {
  errorContext: '加载压凸版数据失败'
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentEmbossingPlate = ref(null)
const productList = ref([])

const canCreate = computed(() => userStore.hasPermission('workorder.add_embossingplate'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_embossingplate'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_embossingplate'))
const hasFilters = computed(() => !!searchText.value)

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
    ErrorHandler.showMessage(error, '加载产品列表失败')
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  currentEmbossingPlate.value = null
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    const detail = await embossingPlateAPI.getDetail(row.id)
    currentEmbossingPlate.value = detail
    dialogType.value = 'edit'
    dialogVisible.value = true
  } catch (error) {
    ErrorHandler.showMessage(error, '加载压凸版详情失败')
  }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除压凸版"${row.name}"吗？此操作不可撤销。`)
    if (!confirmed) return
    await embossingPlateAPI.delete(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

const handleConfirmPlate = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要确认压凸版"${row.name}"吗？确认后关键字段将不可修改。`)
    if (!confirmed) return
    await embossingPlateAPI.confirm(row.id)
    ElMessage.success('确认成功')
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '确认失败')
  }
}

const handleFormConfirm = async ({ form, productItems }) => {
  formLoading.value = true
  try {
    const data = { ...form }

    if (dialogType.value === 'create' && !data.code) {
      delete data.code
    }

    data.products_data = productItems
      .filter(item => item.product)
      .map(item => ({
        product: item.product,
        quantity: item.quantity || 1
      }))

    if (dialogType.value === 'edit') {
      await embossingPlateAPI.update(currentEmbossingPlate.value.id, data)
      ElMessage.success('保存成功')
    } else {
      await embossingPlateAPI.create(data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const handleReset = () => {
  resetFilters()
}

onMounted(() => {
  loadData()
  loadProductList()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.embossing-plate-list {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.management-search-control {
  width: min(100%, 360px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section {
    align-items: stretch;
    flex-direction: column;
  }

  .management-search-control,
  .header-section .el-button {
    width: 100%;
  }
}
</style>
