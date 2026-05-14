<template>
  <div class="stock-container">
    <stock-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="filters.status" placeholder="库存状态" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch">
            <el-option label="在库" value="in_stock" />
            <el-option label="已预留" value="reserved" />
            <el-option label="质检中" value="quality_check" />
            <el-option label="次品" value="defective" />
          </el-select>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button :icon="Warning" type="warning" @click="handleLowStock">库存预警</el-button>
          <el-button :icon="Timer" type="danger" @click="handleExpired">过期库存</el-button>
        </div>
      </div>

      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="product_name" label="产品名称" width="200" />
        <el-table-column prop="batch_no" label="批次号" width="150" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="right">
          <template #default="scope"><span :class="getQuantityClass(scope.row)">{{ scope.row.quantity }}</span></template>
        </el-table-column>
        <el-table-column prop="reserved_quantity" label="预留数量" width="100" align="right" />
        <el-table-column prop="available_quantity" label="可用数量" width="100" align="right" />
        <el-table-column prop="min_stock_level" label="最小库存" width="100" align="right" />
        <el-table-column prop="location" label="库位" width="120" />
        <el-table-column prop="production_date" label="生产日期" width="120" />
        <el-table-column label="过期日期" width="120">
          <template #default="scope"><span :class="getExpiryClass(scope.row)">{{ scope.row.expiry_date || '-' }}</span></template>
        </el-table-column>
        <el-table-column label="过期天数" width="100" align="right">
          <template #default="scope">
            <el-tag v-if="scope.row.days_until_expiry !== null" :type="getExpiryTagType(scope.row.days_until_expiry)">{{ scope.row.days_until_expiry > 0 ? `${scope.row.days_until_expiry}天` : `已过期${Math.abs(scope.row.days_until_expiry)}天` }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status_display }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit" type="text" size="small" @click="handleAdjust(scope.row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无库存数据" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
      </el-empty>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="库存详情" width="800px" :close-on-click-modal="false">
      <el-descriptions v-if="currentStock" :column="2" border>
        <el-descriptions-item label="产品名称">{{ currentStock.product_name }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ currentStock.batch_no }}</el-descriptions-item>
        <el-descriptions-item label="库存数量">{{ currentStock.quantity }}</el-descriptions-item>
        <el-descriptions-item label="预留数量">{{ currentStock.reserved_quantity }}</el-descriptions-item>
        <el-descriptions-item label="可用数量">{{ currentStock.available_quantity }}</el-descriptions-item>
        <el-descriptions-item label="最小库存">{{ currentStock.min_stock_level }}</el-descriptions-item>
        <el-descriptions-item label="库位">{{ currentStock.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ currentStock.production_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过期日期">{{ currentStock.expiry_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentStock.status_display }}</el-descriptions-item>
        <el-descriptions-item label="单位成本">¥{{ currentStock.unit_cost ? currentStock.unit_cost.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="总价值">¥{{ currentStock.total_value ? currentStock.total_value.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentStock.created_at }}</el-descriptions-item>
        <el-descriptions-item v-if="currentStock.notes" label="备注" :span="2"><pre style="margin: 0; white-space: pre-wrap;">{{ currentStock.notes }}</pre></el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="lowStockDialogVisible" title="库存预警" width="900px">
      <el-empty v-if="!loadingLowStock && lowStockList.length === 0" description="暂无低库存预警" />
      <el-table v-else v-loading="loadingLowStock" :data="lowStockList" border max-height="400">
        <el-table-column prop="product_name" label="产品名称" width="200" />
        <el-table-column prop="batch_no" label="批次号" width="150" />
        <el-table-column prop="quantity" label="当前库存" width="100" align="right" />
        <el-table-column prop="min_stock_level" label="最小库存" width="100" align="right" />
        <el-table-column label="可用数量" width="100" align="right">
          <template #default="scope"><span style="color: #f56c6c; font-weight: bold;">{{ scope.row.available_quantity }}</span></template>
        </el-table-column>
        <el-table-column prop="location" label="库位" width="120" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="expiredDialogVisible" title="过期库存" width="900px">
      <el-empty v-if="!loadingExpired && expiredList.length === 0" description="暂无过期库存" />
      <el-table v-else v-loading="loadingExpired" :data="expiredList" border max-height="400">
        <el-table-column prop="product_name" label="产品名称" width="200" />
        <el-table-column prop="batch_no" label="批次号" width="150" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="right" />
        <el-table-column prop="expiry_date" label="过期日期" width="120" />
        <el-table-column label="过期天数" width="100" align="right">
          <template #default="scope"><span style="color: #f56c6c;">{{ Math.abs(scope.row.days_until_expiry) }}天</span></template>
        </el-table-column>
        <el-table-column prop="location" label="库位" width="120" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="adjustDialogVisible" title="库存调整" width="500px">
      <el-form ref="formRef" :model="adjustForm" label-width="100px">
        <el-form-item label="调整数量"><el-input-number v-model="adjustForm.adjustment" :step="1" style="width: 100%;" /></el-form-item>
        <el-form-item label="调整原因"><el-input v-model="adjustForm.reason" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAdjust">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RefreshRight, Warning, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { productStockAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import StockStats from './components/StockStats.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const statsLoading = ref(false)
const stats = ref({})
const currentStock = ref(null)
const detailDialogVisible = ref(false)
const lowStockDialogVisible = ref(false)
const expiredDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const loadingLowStock = ref(false)
const loadingExpired = ref(false)
const lowStockList = ref([])
const expiredList = ref([])
const formRef = ref(null)
const currentAdjustId = ref(null)
const adjustForm = reactive({ adjustment: 0, reason: '' })

const filters = reactive({ status: '' })
const hasFilters = computed(() => !!filters.status)
const canEdit = computed(() => userStore.hasPermission('workorder.change_stock'))

const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(filters, { status: '' }); currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (filters.status) params.status = filters.status
    const response = await productStockAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const fetchStats = async () => {
  statsLoading.value = true
  try { const response = await productStockAPI.getSummary(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false }
}

const handleView = async (row) => { currentStock.value = row; detailDialogVisible.value = true }

const handleAdjust = (row) => { currentAdjustId.value = row.id; adjustForm.adjustment = 0; adjustForm.reason = ''; adjustDialogVisible.value = true }

const handleSaveAdjust = async () => {
  try { await productStockAPI.adjust(currentAdjustId.value, adjustForm); ElMessage.success('调整成功'); adjustDialogVisible.value = false; loadData() } catch (error) { ErrorHandler.showMessage(error, '调整失败') }
}

const handleLowStock = async () => {
  lowStockDialogVisible.value = true; loadingLowStock.value = true
  try { const response = await productStockAPI.getLowStock(); lowStockList.value = response?.results || [] } catch (error) { lowStockList.value = [] } finally { loadingLowStock.value = false }
}

const handleExpired = async () => {
  expiredDialogVisible.value = true; loadingExpired.value = true
  try { const response = await productStockAPI.getExpired(); expiredList.value = response?.results || [] } catch (error) { expiredList.value = [] } finally { loadingExpired.value = false }
}

const getQuantityClass = (row) => row.quantity <= row.min_stock_level ? 'text-danger' : ''
const getExpiryClass = (row) => row.days_until_expiry !== null && row.days_until_expiry <= 0 ? 'text-danger' : row.days_until_expiry !== null && row.days_until_expiry <= 7 ? 'text-warning' : ''
const getExpiryTagType = (days) => days <= 0 ? 'danger' : days <= 7 ? 'warning' : 'success'
const getStatusType = (status) => ({ in_stock: '', reserved: 'warning', quality_check: 'info', defective: 'danger' })[status] || ''

onMounted(() => { loadData(); fetchStats() })
</script>

<style scoped>
.stock-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; }
.filter-group, .action-group { display: flex; align-items: center; gap: 10px; }
.text-danger { color: #F56C6C; font-weight: bold; }
.text-warning { color: #E6A23C; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
</style>
