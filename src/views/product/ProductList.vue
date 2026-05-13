<template>
  <div class="product-list">
    <el-card>
      <div class="header-section">
        <el-input
          v-model="searchText"
          placeholder="搜索产品名称、编码"
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
          新建产品
        </el-button>
      </div>

      <el-table
        v-if="tableData.length > 0"
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="code" label="产品编码" width="120" />
        <el-table-column prop="name" label="产品名称" width="200" />
        <el-table-column label="产品类型" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.product_type === 'single' ? '' : (scope.row.product_type === 'group_main' ? 'warning' : 'info')"
              size="small"
            >
              {{ scope.row.product_type_display || getProductTypeLabel(scope.row.product_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属产品组" width="150" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.product_group_name">{{ scope.row.product_group_name }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格" min-width="150" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="unit_price" label="单价" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.unit_price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock_quantity" label="库存数量" width="100" align="right" />
        <el-table-column prop="min_stock_quantity" label="最小库存" width="100" align="right" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'info'">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
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

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无产品数据"
        :image-size="200"
        style="margin-top: 50px;"
      >
        <el-button v-if="canCreate" type="primary" @click="showCreateDialog">
          创建第一个产品
        </el-button>
      </el-empty>
    </el-card>

    <product-form-dialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :product="currentProduct"
      :loading="formLoading"
      :materials="materialList"
      :processes="allProcesses"
      :product-groups="productGroupList"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { productAPI, processAPI, materialAPI, productMaterialAPI, productGroupAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'

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
const currentProduct = ref(null)
const allProcesses = ref([])
const materialList = ref([])
const productGroupList = ref([])

const canCreate = computed(() => userStore.hasPermission('workorder.add_product'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_product'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_product'))

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
    const response = await productAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

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
  }
}

const loadMaterialList = async () => {
  try {
    const response = await materialAPI.getList({ page_size: 100 })
    materialList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载物料列表')
  }
}

const loadProductGroupList = async () => {
  try {
    const response = await productGroupAPI.getList({ page_size: 100, is_active: true })
    productGroupList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载产品组列表')
  }
}

const showCreateDialog = () => {
  dialogType.value = 'create'
  currentProduct.value = null
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    const detail = await productAPI.getDetail(row.id)
    currentProduct.value = detail
    dialogType.value = 'edit'
    dialogVisible.value = true
  } catch (error) {
    ErrorHandler.showMessage(error, '加载产品详情')
  }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(
      `确定要删除产品"${row.name}"吗？此操作不可撤销。`
    )
    if (!confirmed) return

    await productAPI.delete(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ErrorHandler.showMessage(error, '删除失败')
    }
  }
}

const handleFormConfirm = async ({ form, materialItems }) => {
  formLoading.value = true
  try {
    let productId

    if (dialogType.value === 'edit') {
      await productAPI.update(currentProduct.value.id, form)
      productId = currentProduct.value.id
      ElMessage.success('保存成功')
    } else {
      const result = await productAPI.create(form)
      productId = result.id
      ElMessage.success('创建成功')
    }

    await saveProductMaterials(productId, materialItems)

    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const saveProductMaterials = async (productId, materialItems) => {
  if (dialogType.value === 'edit') {
    try {
      const existingMaterials = await productMaterialAPI.getList({ product: productId })
      for (const material of existingMaterials?.results || []) {
        await productMaterialAPI.delete(material.id)
      }
    } catch (error) {
      logger.warn('删除现有物料失败', error)
    }
  }

  for (let i = 0; i < materialItems.length; i++) {
    const item = materialItems[i]
    if (item.material) {
      try {
        await productMaterialAPI.create({
          product: productId,
          material: item.material,
          material_size: item.material_size || '',
          material_usage: item.material_usage || '',
          need_cutting: item.need_cutting || false,
          notes: item.notes || '',
          sort_order: i
        })
      } catch (error) {
        logger.warn('保存物料失败', error)
      }
    }
  }
}

const getProductTypeLabel = (type) => {
  const labels = {
    single: '单品',
    group_main: '套装主产品',
    group_item: '套装子产品'
  }
  return labels[type] || '未知'
}

onMounted(() => {
  loadData()
  loadAllProcesses()
  loadMaterialList()
  loadProductGroupList()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
