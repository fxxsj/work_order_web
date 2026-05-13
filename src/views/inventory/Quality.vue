<template>
  <div class="quality-container">
    <quality-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-input v-model="filters.inspection_number" placeholder="搜索检验单号" style="width: 160px; margin-right: 10px;" clearable @input="handleSearchDebounced" @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
          <el-select v-model="filters.inspection_type" placeholder="检验类型" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch">
            <el-option label="来料检验" value="incoming" />
            <el-option label="过程检验" value="process" />
            <el-option label="成品检验" value="final" />
            <el-option label="客诉检验" value="customer" />
          </el-select>
          <el-select v-model="filters.result" placeholder="检验结果" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch">
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

      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 20px;">
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
          <template #default="scope"><el-tag :type="getResultType(scope.row.result)">{{ scope.row.result_display }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="inspector_name" label="检验员" width="100" />
        <el-table-column prop="inspection_date" label="检验日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit && scope.row.result === 'pending'" type="text" size="small" @click="handleInspect(scope.row)">检验</el-button>
            <el-button v-if="canEdit && scope.row.result === 'pending'" type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无质检数据" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
        <el-button v-else-if="canCreate" type="primary" @click="handleCreate">创建第一个质检</el-button>
      </el-empty>
    </el-card>

    <QualityDetailDialog :visible.sync="detailDialogVisible" :data="currentQuality" />
    <QualityInspectDialog :visible.sync="inspectDialogVisible" :quality="currentQuality" :loading="inspecting" @confirm="handleConfirmInspect" />
    <QualityFormDialog :visible.sync="formDialogVisible" :is-edit="false" :submitting="submitting" :form="form" :product-list="productList" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { qualityInspectionAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import QualityStats from './components/QualityStats.vue'
import QualityDetailDialog from './components/QualityDetailDialog.vue'
import QualityInspectDialog from './components/QualityInspectDialog.vue'
import QualityFormDialog from './components/QualityFormDialog.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
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
const filters = reactive({ inspection_number: '', inspection_type: '', result: '' })

const hasFilters = computed(() => filters.inspection_number || filters.inspection_type || filters.result)
const canCreate = computed(() => userStore.hasPermission('workorder.add_qualityinspection'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_qualityinspection'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_qualityinspection'))

let searchTimer = null
const handleSearchDebounced = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { handleSearch() }, 300) }
const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(filters, { inspection_number: '', inspection_type: '', result: '' }); currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (filters.inspection_number) params.search = filters.inspection_number
    if (filters.inspection_type) params.inspection_type = filters.inspection_type
    if (filters.result) params.result = filters.result
    const response = await qualityInspectionAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const fetchStats = async () => { statsLoading.value = true; try { const response = await qualityInspectionAPI.getStats(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false } }
const fetchProducts = async () => { try { const response = await productAPI.getList({ page_size: 1000 }); productList.value = response?.results || [] } catch (error) {} }

const handleView = (row) => { currentQuality.value = row; detailDialogVisible.value = true }
const handleCreate = () => { if (!canCreate.value) return; Object.assign(form, { id: null, product: null, batch_no: '', quantity: 0, inspection_type: 'final', notes: '' }); formDialogVisible.value = true }
const handleInspect = (row) => { currentQuality.value = row; inspectDialogVisible.value = true }
const handleDelete = async (row) => {
  try { await ErrorHandler.confirm(`确定要删除检验单"${row.inspection_number}"吗？`); await qualityInspectionAPI.delete(row.id); ElMessage.success('删除成功'); loadData() } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}
const handleConfirmInspect = async (data) => { inspecting.value = true; try { await qualityInspectionAPI.inspect(currentQuality.value.id, data); ElMessage.success('检验完成'); inspectDialogVisible.value = false; loadData(); fetchStats() } catch (error) { ErrorHandler.showMessage(error, '检验失败') } finally { inspecting.value = false } }
const handleSubmit = async (data) => { submitting.value = true; try { await qualityInspectionAPI.create(data); ElMessage.success('创建成功'); formDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '创建失败') } finally { submitting.value = false } }

const getResultType = (result) => ({ pending: 'info', passed: 'success', failed: 'danger', conditional: 'warning' })[result] || ''

onMounted(() => { loadData(); fetchStats(); fetchProducts() })
</script>

<style scoped>
.quality-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.text-danger { color: #F56C6C; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
</style>
