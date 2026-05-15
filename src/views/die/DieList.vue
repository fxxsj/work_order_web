<template>
  <div class="die-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索刀模编码、名称、尺寸、材质"
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

      <div
        v-else
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
        class="data-table"
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
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'
import DieFormDialog from './components/DieFormDialog.vue'

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
} = useCrudList(dieAPI.getList, {
  errorContext: '加载刀模数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('die')

const crud = useCRUD(dieAPI, {
  onSuccess: () => { dialogVisible.value = false; loadData() },
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref(null)
const productList = ref([])

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
  if (dialogType.value === 'edit' && currentRow.value) {
    await crud.update(currentRow.value.id, data, '保存成功')
  } else {
    await crud.create(data, '创建成功')
  }
  formLoading.value = false
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

  await crud.remove(row.id, '删除成功')
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

<style lang="scss" scoped>
.die-list {
  padding: var(--ui-page-padding);
}
</style>
