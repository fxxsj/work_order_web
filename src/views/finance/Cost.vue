<template>
  <div class="cost-container">
    <cost-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button icon="el-icon-data-analysis" type="primary" @click="handleStats">成本统计</el-button>
        </div>
      </div>

      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="work_order_number" label="施工单号" width="150" />
        <el-table-column prop="product_name" label="产品名称" width="200" show-overflow-tooltip />
        <el-table-column prop="material_cost" label="材料成本" width="100" align="right">
          <template #default="scope">¥{{ scope.row.material_cost ? scope.row.material_cost.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="labor_cost" label="人工成本" width="100" align="right">
          <template #default="scope">¥{{ scope.row.labor_cost ? scope.row.labor_cost.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="equipment_cost" label="设备成本" width="100" align="right">
          <template #default="scope">¥{{ scope.row.equipment_cost ? scope.row.equipment_cost.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="overhead_cost" label="制造费用" width="100" align="right">
          <template #default="scope">¥{{ scope.row.overhead_cost ? scope.row.overhead_cost.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="actual_cost" label="实际成本" width="120" align="right">
          <template #default="scope"><span style="font-weight: bold;">¥{{ scope.row.actual_cost ? scope.row.actual_cost.toLocaleString() : '-' }}</span></template>
        </el-table-column>
        <el-table-column prop="standard_cost" label="标准成本" width="120" align="right">
          <template #default="scope">¥{{ scope.row.standard_cost ? scope.row.standard_cost.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="variance" label="成本差异" width="120" align="right">
          <template #default="scope"><span :class="getVarianceClass(scope.row)">¥{{ scope.row.variance !== null ? scope.row.variance.toLocaleString() : '-' }}</span></template>
        </el-table-column>
        <el-table-column prop="variance_rate" label="差异率" width="100" align="right">
          <template #default="scope"><span :class="getVarianceClass(scope.row)">{{ scope.row.variance_rate !== null ? scope.row.variance_rate.toFixed(1) + '%' : '-' }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit" type="text" size="small" style="color: #409EFF;" @click="handleCalculate(scope.row)">计算</el-button>
            <el-button v-if="canEdit" type="text" size="small" style="color: #E6A23C;" @click="handleEdit(scope.row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无成本数据" :image-size="200" style="margin-top: 50px;" />
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="成本详情" width="900px" :close-on-click-modal="false">
      <div v-if="currentCost">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="施工单号">{{ currentCost.work_order_number }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentCost.product_name }}</el-descriptions-item>
          <el-descriptions-item label="成本中心">{{ currentCost.cost_center_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计算时间">{{ currentCost.calculated_at || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="cost-breakdown">
          <h4>成本构成</h4>
          <el-table :data="getCostBreakdown(currentCost)" border style="width: 100%; margin-top: 10px;">
            <el-table-column prop="item" label="成本项目" width="150" />
            <el-table-column prop="amount" label="金额" width="150" align="right">
              <template #default="scope">¥{{ scope.row.amount ? scope.row.amount.toLocaleString() : '-' }}</template>
            </el-table-column>
            <el-table-column prop="proportion" label="占比" width="100" align="right">
              <template #default="scope">{{ scope.row.proportion ? scope.row.proportion.toFixed(1) + '%' : '-' }}</template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </div>
        <div v-if="currentCost.standard_cost" class="cost-comparison">
          <h4>成本对比</h4>
          <el-row :gutter="20" style="margin-top: 10px;">
            <el-col :span="12"><el-card><div class="comparison-item"><div class="comparison-label">标准成本</div><div class="comparison-value">¥{{ currentCost.standard_cost ? currentCost.standard_cost.toLocaleString() : '-' }}</div></div></el-card></el-col>
            <el-col :span="12"><el-card><div class="comparison-item"><div class="comparison-label">实际成本</div><div class="comparison-value">¥{{ currentCost.actual_cost ? currentCost.actual_cost.toLocaleString() : '-' }}</div></div></el-card></el-col>
          </el-row>
        </div>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="adjustDialogVisible" title="成本调整" width="600px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="材料成本" prop="material_cost"><el-input-number v-model="form.material_cost" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
        <el-form-item label="人工成本" prop="labor_cost"><el-input-number v-model="form.labor_cost" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
        <el-form-item label="设备成本" prop="equipment_cost"><el-input-number v-model="form.equipment_cost" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
        <el-form-item label="制造费用" prop="overhead_cost"><el-input-number v-model="form.overhead_cost" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
        <el-form-item label="调整原因" prop="adjust_reason"><el-input v-model="form.adjust_reason" type="textarea" :rows="3" placeholder="请输入调整原因" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveAdjust">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { productionCostAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import CostStats from './components/CostStats.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const statsLoading = ref(false)
const submitting = ref(false)
const currentCost = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const formRef = ref(null)

const FORM_INITIAL = { id: null, material_cost: null, labor_cost: null, equipment_cost: null, overhead_cost: null, adjust_reason: '' }
const form = reactive({ ...FORM_INITIAL })

const rules = { adjust_reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }] }

const canEdit = computed(() => userStore.hasPermission('workorder.change_productioncost'))

const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    const response = await productionCostAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const fetchStats = async () => {
  statsLoading.value = true
  try { const response = await productionCostAPI.getStats(); stats.value = response || {} } catch (error) { stats.value = {} } finally { statsLoading.value = false }
}

const handleStats = () => { /* TODO: 跳转到统计页面 */ }

const handleView = async (row) => {
  try { const response = await productionCostAPI.getDetail(row.id); currentCost.value = response; detailDialogVisible.value = true } catch (error) { ErrorHandler.showMessage(error, '获取成本详情失败') }
}

const handleCalculate = async (row) => {
  try { await ErrorHandler.confirm('确认重新计算该订单成本？'); await productionCostAPI.calculateTotal(row.id); ElMessage.success('计算成功'); loadData(); fetchStats() } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '计算失败') }
}

const handleEdit = (row) => {
  Object.assign(form, { id: row.id, material_cost: row.material_cost, labor_cost: row.labor_cost, equipment_cost: row.equipment_cost, overhead_cost: row.overhead_cost, adjust_reason: '' })
  adjustDialogVisible.value = true
}

const handleSaveAdjust = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id; delete data.id
    await productionCostAPI.update(id, data)
    ElMessage.success('调整成功')
    adjustDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error) { ErrorHandler.showMessage(error, '调整失败') } finally { submitting.value = false }
}

const getVarianceClass = (row) => {
  if (row.variance === null) return ''
  return row.variance > 0 ? 'text-danger' : row.variance < 0 ? 'text-success' : ''
}

const getCostBreakdown = (cost) => {
  const total = cost.actual_cost || 0
  if (!total) return []
  return [
    { item: '材料成本', amount: cost.material_cost, proportion: total ? (cost.material_cost / total * 100) : 0, description: '原材料消耗' },
    { item: '人工成本', amount: cost.labor_cost, proportion: total ? (cost.labor_cost / total * 100) : 0, description: '人工工时费用' },
    { item: '设备成本', amount: cost.equipment_cost, proportion: total ? (cost.equipment_cost / total * 100) : 0, description: '设备折旧分摊' },
    { item: '制造费用', amount: cost.overhead_cost, proportion: total ? (cost.overhead_cost / total * 100) : 0, description: '其他制造费用' }
  ]
}

onMounted(() => { loadData(); fetchStats() })
</script>

<style scoped>
.cost-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; }
.action-group { display: flex; align-items: center; gap: 10px; }
.text-danger { color: #F56C6C; }
.text-success { color: #67C23A; }
.cost-breakdown, .cost-comparison { margin-top: 20px; }
.cost-breakdown h4, .cost-comparison h4 { margin-bottom: 10px; }
.comparison-item { text-align: center; }
.comparison-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.comparison-value { font-size: 24px; font-weight: bold; color: #303133; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
</style>
