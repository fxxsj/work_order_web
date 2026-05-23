<template>
  <div class="space-y-6">
    <CostStats :stats="stats" :loading="statsLoading" />

    <CrudPageLayout
      title="成本管理"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search />
      <template #actions>
        <button class="btn" :disabled="loading" @click="loadData">刷新</button>
        <button class="btn btn-primary" @click="handleStats">成本统计</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
        <template #cell-work_order_number="{ row }"><span>{{ row.work_order_number }}</span></template>
        <template #cell-product_name="{ row }"><span class="truncate max-w-xs">{{ row.product_name }}</span></template>
        <template #cell-material_cost="{ row }"><span>¥{{ row.material_cost ? row.material_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-labor_cost="{ row }"><span>¥{{ row.labor_cost ? row.labor_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-equipment_cost="{ row }"><span>¥{{ row.equipment_cost ? row.equipment_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-overhead_cost="{ row }"><span>¥{{ row.overhead_cost ? row.overhead_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-actual_cost="{ row }"><span class="text-strong">¥{{ row.actual_cost ? row.actual_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-standard_cost="{ row }"><span>¥{{ row.standard_cost ? row.standard_cost.toLocaleString() : '-' }}</span></template>
        <template #cell-variance="{ row }"><span :class="getVarianceClass(row)">¥{{ row.variance !== null ? row.variance.toLocaleString() : '-' }}</span></template>
        <template #cell-variance_rate="{ row }"><span :class="getVarianceClass(row)">{{ row.variance_rate !== null ? row.variance_rate.toFixed(1) + '%' : '-' }}</span></template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
            <button class="btn btn-ghost btn-sm text-primary" v-if="canEdit" @click="handleCalculate(row)">计算</button>
            <button class="btn btn-ghost btn-sm text-warning" v-if="canEdit" @click="handleEdit(row)">调整</button>
          </div>
        </template>
        <template #empty>
          <EmptyState description="暂无成本数据" />
        </template>
      </DataTable>
    </CrudPageLayout>

    <BaseDialog :show="detailDialogVisible" title="成本详情" width="extra-wide">
      <div v-if="currentCost">
        <div class="descriptions-grid mb-4" style="--col: 2">
          <div class="description-item"><div class="description-label">施工单号</div><div class="description-value">{{ (currentCost as any).work_order_number }}</div></div>
          <div class="description-item"><div class="description-label">产品名称</div><div class="description-value">{{ (currentCost as any).product_name }}</div></div>
          <div class="description-item"><div class="description-label">成本中心</div><div class="description-value">{{ (currentCost as any).cost_center_name || '-' }}</div></div>
          <div class="description-item"><div class="description-label">计算时间</div><div class="description-value">{{ (currentCost as any).calculated_at || '-' }}</div></div>
        </div>
        <div class="cost-breakdown">
          <h4>成本构成</h4>
          <div class="table-scroll table-scroll-compact">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-3 py-2 w-36">成本项目</th>
                <th class="px-3 py-2 w-36 text-right">金额</th>
                <th class="px-3 py-2 w-24 text-right">占比</th>
                <th class="px-3 py-2">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="item in getCostBreakdown(currentCost)" :key="item.item">
                <td class="px-3 py-2">{{ item.item }}</td>
                <td class="px-3 py-2 text-right">¥{{ item.amount ? item.amount.toLocaleString() : '-' }}</td>
                <td class="px-3 py-2 text-right">{{ item.proportion ? item.proportion.toFixed(1) + '%' : '-' }}</td>
                <td class="px-3 py-2">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div v-if="(currentCost as any).standard_cost" class="cost-comparison">
          <h4>成本对比</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="card"><div class="comparison-item"><div class="comparison-label">标准成本</div><div class="comparison-value">¥{{ (currentCost as any).standard_cost ? (currentCost as any).standard_cost.toLocaleString() : '-' }}</div></div></div>
            <div class="card"><div class="comparison-item"><div class="comparison-label">实际成本</div><div class="comparison-value">¥{{ (currentCost as any).actual_cost ? (currentCost as any).actual_cost.toLocaleString() : '-' }}</div></div></div>
          </div>
        </div>
      </div>
      <template #footer><button class="btn" @click="detailDialogVisible = false">关闭</button></template>
    </BaseDialog>

    <BaseDialog :show="adjustDialogVisible" title="成本调整" width="normal">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">材料成本</label>
          <InputNumber v-model="form.material_cost" :min="0" :precision="2" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">人工成本</label>
          <InputNumber v-model="form.labor_cost" :min="0" :precision="2" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">设备成本</label>
          <InputNumber v-model="form.equipment_cost" :min="0" :precision="2" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">制造费用</label>
          <InputNumber v-model="form.overhead_cost" :min="0" :precision="2" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">调整原因</label>
          <TextArea v-model="form.adjust_reason" :rows="3" placeholder="请输入调整原因" class="flex-1" />
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="adjustDialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleSaveAdjust">保存</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { productionCostAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import CostStats from './components/CostStats.vue'
import { InputNumber, TextArea, CrudPageLayout, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common/types'

const userStore = useUserStore()

const statsLoading = ref(false)
const submitting = ref(false)
const currentCost = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const adjustDialogVisible = ref(false)

const FORM_INITIAL: Record<string, any> = { id: undefined, material_cost: undefined, labor_cost: undefined, equipment_cost: undefined, overhead_cost: undefined, adjust_reason: '' }
const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'work_order_number', label: '施工单号', width: 144 },
  { key: 'product_name', label: '产品名称', minWidth: 192 },
  { key: 'material_cost', label: '材料成本', width: 96, align: 'right' },
  { key: 'labor_cost', label: '人工成本', width: 96, align: 'right' },
  { key: 'equipment_cost', label: '设备成本', width: 96, align: 'right' },
  { key: 'overhead_cost', label: '制造费用', width: 96, align: 'right' },
  { key: 'actual_cost', label: '实际成本', width: 112, align: 'right' },
  { key: 'standard_cost', label: '标准成本', width: 112, align: 'right' },
  { key: 'variance', label: '成本差异', width: 96, align: 'right' },
  { key: 'variance_rate', label: '差异率', width: 80, align: 'right' },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handlePageChange,
  handleSizeChange
} = useCrudList(productionCostAPI, 'getList', {
  errorContext: '加载成本数据失败'
})

const canEdit = computed(() => userStore.hasPermission('workorder.change_productioncost'))

const fetchStats = async () => {
  statsLoading.value = true
  try { const response: any = await productionCostAPI.getStats({}); stats.value = response || {} } catch (error: any) { stats.value = {} } finally { statsLoading.value = false }
}

const handleStats = () => { /* TODO: 跳转到统计页面 */ }

const handleView = async (row: any) => {
  try { const response: any = await productionCostAPI.getDetail(row.id); currentCost.value = response; detailDialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '获取成本详情失败') }
}

const handleCalculate = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm('确认重新计算该订单成本？')
    if (!confirmed) return
    await productionCostAPI.calculateTotal(row.id)
    ElMessage.success('计算成功')
    loadData()
    fetchStats()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '计算失败') }
}

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, material_cost: row.material_cost, labor_cost: row.labor_cost, equipment_cost: row.equipment_cost, overhead_cost: row.overhead_cost, adjust_reason: '' })
  adjustDialogVisible.value = true
}

const handleSaveAdjust = async () => {
  if (!form.adjust_reason) { ElMessage.warning('请输入调整原因'); return }
  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id; delete (data as any).id
    await productionCostAPI.update(id!, data)
    ElMessage.success('调整成功')
    adjustDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, '调整失败') } finally { submitting.value = false }
}

const getVarianceClass = (row: any) => {
  if (row.variance === null) return ''
  return row.variance > 0 ? 'text-danger' : row.variance < 0 ? 'text-success' : ''
}

const getCostBreakdown = (cost: any) => {
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

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.cost-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.action-group { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.table-scroll-compact { margin-top: var(--ui-control-gap); }
.data-table { width: 100%; }
.cost-breakdown, .cost-comparison { margin-top: var(--ui-section-gap); }
.cost-breakdown h4, .cost-comparison h4 { margin-bottom: var(--ui-control-gap); }
.comparison-row { margin-top: var(--ui-control-gap); }
.comparison-item { text-align: center; }
.comparison-label { font-size: var(--ui-font-size-sm); color: var(--ui-color-text-secondary); margin-bottom: var(--ui-control-gap); }
.comparison-value { font-size: var(--ui-font-size-lg); font-weight: 700; color: var(--ui-color-text-primary); }
.card { border-radius: var(--ui-radius-card); box-shadow: var(--ui-shadow-card); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .action-group .btn {
    width: 100%;
  }
}
</style>
