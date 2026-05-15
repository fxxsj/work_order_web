<template>
  <div class="artwork-list">
    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-input
            class="management-search-control"
            v-model="searchText"
            placeholder="搜索图稿编码、名称、拼版尺寸"
            clearable
            @input="handleSearchDebounced"
            @clear="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="action-group">
          <el-button :icon="RefreshRight" @click="loadData">
            刷新
          </el-button>
          <el-button
            v-if="canCreate"
            type="primary"
            :icon="Plus"
            @click="showDialog()"
          >
            新建图稿
          </el-button>
        </div>
      </div>

      <div class="table-scroll">
        <el-table
          v-loading="loading"
          :data="tableData"
          class="data-table"
        >
          <el-table-column label="图稿编码" width="180">
            <template #default="scope">
              {{ scope.row.code || (scope.row.base_code + (scope.row.version > 1 ? '-v' + scope.row.version : '')) }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="图稿名称" width="200" />
          <el-table-column prop="color_display" label="色数" width="200" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.color_display && scope.row.color_display !== '-'">
                {{ scope.row.color_display }}
              </el-tag>
              <span v-else style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="imposition_size" label="拼版尺寸" width="180" />
          <el-table-column label="确认状态" width="120" align="center">
            <template #default="scope">
              <el-tag
                :type="scope.row.confirmed ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.confirmed ? '已确认' : '未确认' }}
              </el-tag>
              <div v-if="scope.row.confirmed && scope.row.confirmed_by_name" style="font-size: 12px; color: #909399; margin-top: 5px;">
                {{ scope.row.confirmed_by_name }}
              </div>
              <div v-if="scope.row.confirmed && scope.row.confirmed_at" style="font-size: 12px; color: #909399;">
                {{ formatDate(scope.row.confirmed_at) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="关联刀模" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="(code, index) in scope.row.die_codes"
                :key="index"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ code }}<span v-if="scope.row.die_names && scope.row.die_names[index]"> - {{ scope.row.die_names[index] }}</span>
              </el-tag>
              <span v-if="!scope.row.die_codes || scope.row.die_codes.length === 0" style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="关联烫金版" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="(code, index) in scope.row.foiling_plate_codes"
                :key="index"
                type="success"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ code }}<span v-if="scope.row.foiling_plate_names && scope.row.foiling_plate_names[index]"> - {{ scope.row.foiling_plate_names[index] }}</span>
              </el-tag>
              <span v-if="!scope.row.foiling_plate_codes || scope.row.foiling_plate_codes.length === 0" style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="关联压凸版" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="(code, index) in scope.row.embossing_plate_codes"
                :key="index"
                type="warning"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ code }}<span v-if="scope.row.embossing_plate_names && scope.row.embossing_plate_names[index]"> - {{ scope.row.embossing_plate_names[index] }}</span>
              </el-tag>
              <span v-if="!scope.row.embossing_plate_codes || scope.row.embossing_plate_codes.length === 0" style="color: #909399;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="包含产品" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="product in scope.row.products"
                :key="product.id"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ product.product_name }} ({{ product.imposition_quantity }}拼)
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
                v-if="canEdit"
                type="text"
                size="small"
                @click="showDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canEdit"
                type="text"
                size="small"
                @click="createNewVersion(scope.row)"
              >
                创建新版本
              </el-button>
              <el-button
                v-if="!scope.row.confirmed && canConfirm"
                type="text"
                size="small"
                style="color: #67C23A;"
                @click="handleConfirm(scope.row)"
              >
                确认
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
        description="暂无图稿数据"
        :image-size="200"
      >
        <el-button v-if="canCreate" type="primary" @click="showDialog()">
          创建第一个图稿
        </el-button>
      </el-empty>
    </el-card>

    <ArtworkFormDialog
      v-model="dialogVisible"
      :artwork="currentArtwork"
      :loading="formLoading"
      :product-list="productList"
      :die-list="dieList"
      :foiling-plate-list="foilingPlateList"
      :embossing-plate-list="embossingPlateList"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { artworkAPI, productAPI, dieAPI, foilingPlateAPI, embossingPlateAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import ArtworkFormDialog from './components/ArtworkFormDialog.vue'

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
  handleSizeChange
} = useCrudList(artworkAPI.getList, {
  errorContext: '加载图稿数据失败'
})

const dialogVisible = ref(false)
const formLoading = ref(false)
const currentArtwork = ref(null)

const productList = ref([])
const dieList = ref([])
const foilingPlateList = ref([])
const embossingPlateList = ref([])

const canCreate = computed(() => userStore.hasPermission('workorder.add_artwork'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_artwork'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_artwork'))
const canConfirm = computed(() => userStore.hasPermission('workorder.change_artwork'))

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

const loadDieList = async () => {
  try {
    const response = await dieAPI.getList({ page_size: 100 })
    dieList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载刀模列表失败')
  }
}

const loadFoilingPlateList = async () => {
  try {
    const response = await foilingPlateAPI.getList({ page_size: 100 })
    foilingPlateList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载烫金版列表失败')
  }
}

const loadEmbossingPlateList = async () => {
  try {
    const response = await embossingPlateAPI.getList({ page_size: 100 })
    embossingPlateList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载压凸版列表失败')
  }
}

const handleConfirm = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm('确认该图稿？', '确认操作')
    if (!confirmed) return
    await artworkAPI.confirm(row.id)
    ElMessage.success('图稿已确认')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '确认失败')
  }
}

const createNewVersion = async (row) => {
  const fullCode = row.code || (row.base_code + (row.version > 1 ? '-v' + row.version : ''))
  try {
    const confirmed = await ErrorHandler.confirm(`确定要基于 "${fullCode}" 创建新版本吗？`, '创建新版本')
    if (!confirmed) return
    await artworkAPI.createVersion(row.id)
    ElMessage.success('新版本创建成功')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '创建新版本失败')
  }
}

const showDialog = async (row = null) => {
  if (row) {
    try {
      const detail = await artworkAPI.getDetail(row.id)
      currentArtwork.value = detail
    } catch (error) {
      ErrorHandler.showMessage(error, '加载图稿详情失败')
      return
    }
  } else {
    currentArtwork.value = null
  }
  dialogVisible.value = true
}

const handleFormConfirm = async (formData) => {
  formLoading.value = true
  try {
    if (currentArtwork.value) {
      await artworkAPI.update(currentArtwork.value.id, formData)
      ElMessage.success('保存成功')
    } else {
      await artworkAPI.create(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, currentArtwork.value ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除图稿"${row.name}"吗？`)
    if (!confirmed) return
    await artworkAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

onMounted(() => {
  loadData()
  loadProductList()
  loadDieList()
  loadFoilingPlateList()
  loadEmbossingPlateList()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.artwork-list {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.filter-group,
.action-group {
  display: flex;
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
  .header-section,
  .filter-group,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .management-search-control,
  .action-group .el-button {
    width: 100%;
  }
}
</style>
