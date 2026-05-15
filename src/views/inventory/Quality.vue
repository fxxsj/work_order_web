<template>
  <div class="quality-container">
    <quality-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-input v-model="filters.inspection_number" class="filter-search-control" placeholder="搜索检验单号" clearable @input="handleSearchDebounced" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
          <el-select v-model="filters.inspection_type" class="filter-select-control" placeholder="检验类型" clearable @change="handleSearch">
            <el-option label="来料检验" value="incoming" />
            <el-option label="过程检验" value="process" />
            <el-option label="成品检验" value="final" />
            <el-option label="客诉检验" value="customer" />
          </el-select>
          <el-select v-model="filters.result" class="filter-select-control" placeholder="检验结果" clearable @change="handleSearch">
            <el-option label="待检验" value="pending" />
            <el-option label="合格" value="passed" />
            <el-option label="不合格" value="failed" />
            <el-option label="条件接收" value="conditional" />
          </el-select>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleCreate">新建质检</el-button>
        </div>
      </div>

      <div v-if="tableData.length > 0" class="table-scroll">
      <el-table v-loading="loading" :data="tableData" border class="data-table">
        <el-table-column prop="inspection_number" label="检验单号" width="150" />
        <el-table-column prop="inspection_type_display" label="检验类型" width="100" />
        <el-table-column prop="product_name" label="产品名称" width="200" show-overflow-tooltip />
        <el-table-column prop="batch_no" label="批次号" width="150" />
        <el-table-column prop="quantity" label="检验数量" width="100" align="right" />
        <el-table-column prop="qualified_quantity" label="合格数量" width="100" align="right">
          <template #default="scope">{{ scope.row.qualified_quantity || '-' }}</template>
        </el-table-column>
        <el-table-column prop="defective_quantity" label="不合格数量" width="100" align="right">
          <template #default="scope"><span :class="scope.row.defective_quantity > 0 ? 'text-danger' : ''">{{ scope.row.defective_quantity || '-' }}</span></template>
        </el-table-column>
        <el-table-column label="检验结果" width="100">
          <template #default="scope"><StatusTag :status="scope.row.result" category="inspection" :label="scope.row.result_display" /></template>
        </el-table-column>
        <el-table-column prop="inspector_name" label="检验员" width="100" />
        <el-table-column prop="inspection_date" label="检验日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit && scope.row.result === 'pending'" type="text" size="small" @click="handleInspect(scope.row)">检验</el-button>
            <el-button v-if="canDelete && scope.row.result === 'pending'" type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无质检数据" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
        <el-button v-else-if="canCreate" type="primary" @click="handleCreate">创建第一个质检</el-button>
      </el-empty>
    </el-card>

    <QualityDetailDialog v-model:visible="detailDialogVisible" :data="currentQuality" />
    <QualityInspectDialog v-model:visible="inspectDialogVisible" :quality="currentQuality" :loading="inspecting" @confirm="handleConfirmInspect" />
    <QualityFormDialog v-model:visible="formDialogVisible" :is-edit="false" :submitting="submitting" :form="form" :product-list="productList" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { qualityInspectionAPI, productAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag } from '@/components/common'
import QualityStats from './components/QualityStats.vue'
import QualityDetailDialog from './components/QualityDetailDialog.vue'
import QualityInspectDialog from './components/QualityInspectDialog.vue'
import QualityFormDialog from './components/QualityFormDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('qualityinspection')

const statsLoading = ref(false)
const submitting = ref(false)
const inspecting = ref(false)
const productList = ref([])
const currentQuality = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const inspectDialogVisible = ref(false)
const formDialogVisible = ref(false)
const form = reactive({ id: null, product: null, batch_no: '', quantity: 0, inspection_type: 'final', notes: '' })

const buildQualityParams = (params) => {
  const { inspection_number, ...nextParams } = params
  if (inspection_number) nextParams.search = inspection_number
  return nextParams
}

const {
  filters,
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
} = useCrudList(qualityInspectionAPI.getList, {
  initialFilters: { inspection_number: '', inspection_type: '', result: '' },
  buildParams: buildQualityParams
})

const handleReset = () => resetFilters()

const fetchStats = async () => { statsLoading.value = true; try { const response = await qualityInspectionAPI.getStats(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false } }
const fetchProducts = async () => { try { const response = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error) {} }

const handleView = (row) => { currentQuality.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; Object.assign(form, { id: null, product: null, batch_no: '', quantity: 0, inspection_type: 'final', notes: '' }); formDialogVisible.value = true }
const handleInspect = (row) => { currentQuality.value = row; inspectDialogVisible.value = true }
const handleDelete = async (row) => {
  try {
    if (!canDelete.value) return
    const confirmed = await ErrorHandler.confirm(`确定要删除检验单"${row.inspection_number}"吗？`)
    if (!confirmed) return
    await qualityInspectionAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}
const handleConfirmInspect = async (data) => { inspecting.value = true; try { await qualityInspectionAPI.inspect(currentQuality.value.id, data); ElMessage.success('检验完成'); inspectDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, '检验失败') } finally { inspecting.value = false } }
const handleSubmit = async (data) => { submitting.value = true; try { await qualityInspectionAPI.create(data); ElMessage.success('创建成功'); formDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '创建失败') } finally { submitting.value = false } }

onMounted(() => { loadData(); fetchStats(); fetchProducts() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.quality-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-search-control { width: min(100%, 220px); }
.filter-select-control { width: min(100%, 150px); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.data-table { width: 100%; }
.text-danger { color: #F56C6C; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-search-control,
  .filter-select-control,
  .action-group .el-button {
    width: 100%;
  }
}
</style>
