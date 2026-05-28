<template>
  <div class="space-y-6">
    <CostStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-72"
            placeholder="搜索施工单号/客户/周期"
            @search="searchAndRefreshStats"
            @clear="searchAndRefreshStats"
          />
          <MonthRangePicker
            v-model="periodRange"
            class="w-full sm:w-64"
            placeholder="选择成本期间"
            @change="handlePeriodRangeChange"
          />
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            v-if="hasFilters"
            class="btn btn-secondary"
            @click="handleReset"
          >
            重置筛选
          </button>
          <button
            class="btn btn-secondary"
            :disabled="loading"
            @click="reloadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
            刷新
          </button>
          <button
            class="btn btn-primary"
            @click="fetchStats"
          >
            <Icon
              name="chart"
              size="md"
              class="mr-2"
            />
            成本统计
          </button>
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          row-key="id"
          :server-side-sort="true"
          default-sort-key="period"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-work_order_number="{ row }">
            <span>{{ row.work_order_number }}</span>
          </template>
          <template #cell-product_name="{ row }">
            <span class="truncate max-w-xs">{{ row.product_name }}</span>
          </template>
          <template #cell-period="{ row }">
            <span>{{ row.period || '-' }}</span>
          </template>
          <template #cell-customer_name="{ row }">
            <span>{{ row.customer_name || '-' }}</span>
          </template>
          <template #cell-material_cost="{ row }">
            <span>¥{{ row.material_cost ? row.material_cost.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-labor_cost="{ row }">
            <span>¥{{ row.labor_cost ? row.labor_cost.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-equipment_cost="{ row }">
            <span>¥{{ row.equipment_cost ? row.equipment_cost.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-overhead_cost="{ row }">
            <span>¥{{ row.overhead_cost ? row.overhead_cost.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-actual_cost="{ row }">
            <span class="text-strong">¥{{ formatAmount(row.total_cost ?? row.actual_cost) }}</span>
          </template>
          <template #cell-standard_cost="{ row }">
            <span>¥{{ row.standard_cost ? row.standard_cost.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-variance="{ row }">
            <span :class="getVarianceClass(row)">¥{{ row.variance !== null ? row.variance.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-variance_rate="{ row }">
            <span :class="getVarianceClass(row)">{{ row.variance_rate !== null ? row.variance_rate.toFixed(1) + '%' : '-' }}</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState :description="hasFilters ? '未找到匹配的成本数据' : '暂无成本数据'" />
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @update:page-size="handleSizeChange"
          @update:page="handlePageChange"
        />
      </template>
    </TablePageLayout>

    <BaseDialog
      :show="detailDialogVisible"
      title="成本详情"
      width="extra-wide"
      @close="detailDialogVisible = false"
    >
      <div v-if="currentCost">
        <DescriptionGrid
          :columns="2"
          class="mb-4"
        >
          <DescriptionItem label="施工单号">
            {{ (currentCost as any).work_order_number }}
          </DescriptionItem>
          <DescriptionItem label="产品名称">
            {{ (currentCost as any).product_name }}
          </DescriptionItem>
          <DescriptionItem label="客户">
            {{ (currentCost as any).customer_name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="成本期间">
            {{ (currentCost as any).period || '-' }}
          </DescriptionItem>
          <DescriptionItem label="计算时间">
            {{ (currentCost as any).calculated_at || '-' }}
          </DescriptionItem>
        </DescriptionGrid>
        <div class="cost-breakdown">
          <h4 class="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
            成本构成
          </h4>
          <SummaryTable
            :columns="costBreakdownColumns"
            :data="getCostBreakdown(currentCost)"
            row-key="item"
          />
        </div>
        <div
          v-if="(currentCost as any).standard_cost"
          class="cost-comparison"
        >
          <h4>成本对比</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="card">
              <div class="comparison-item">
                <div class="comparison-label">
                  标准成本
                </div><div class="comparison-value">
                  ¥{{ (currentCost as any).standard_cost ? (currentCost as any).standard_cost.toLocaleString() : '-' }}
                </div>
              </div>
            </div>
            <div class="card">
              <div class="comparison-item">
                <div class="comparison-label">
                  实际成本
                </div><div class="comparison-value">
                  ¥{{ formatAmount((currentCost as any).total_cost ?? (currentCost as any).actual_cost) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          class="btn btn-secondary"
          @click="detailDialogVisible = false"
        >
          关闭
        </button>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="adjustDialogVisible"
      title="成本调整"
      width="normal"
      @close="adjustDialogVisible = false"
    >
      <form
        id="adjust-form"
        class="space-y-5"
        @submit.prevent="handleSaveAdjust"
      >
        <div>
          <label class="input-label mb-1.5 block">材料成本</label>
          <InputNumber
            v-model="form.material_cost"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">人工成本</label>
          <InputNumber
            v-model="form.labor_cost"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">设备成本</label>
          <InputNumber
            v-model="form.equipment_cost"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">制造费用</label>
          <InputNumber
            v-model="form.overhead_cost"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">标准成本</label>
          <InputNumber
            v-model="form.standard_cost"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <TextArea
            v-model="form.notes"
            label="备注"
            :rows="3"
            placeholder="请输入调整说明"
            class="w-full"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            type="button"
            @click="adjustDialogVisible = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            form="adjust-form"
            type="submit"
            :disabled="submitting"
          >
            保存
          </button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="showCalculateDialogFlag"
      title="确认计算"
      message="确认重新计算该订单成本？"
      confirm-text="确认"
      cancel-text="取消"
      :loading="calculating"
      loading-text="计算中..."
      @confirm="handleCalculate"
      @cancel="showCalculateDialogFlag = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { productionCostAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import CostStats from './components/CostStats.vue'
import { InputNumber, TextArea, TablePageLayout, DataTable, EmptyState, Icon, Pagination, BaseDialog, ConfirmDialog, DescriptionGrid, DescriptionItem, SummaryTable, RowActions, SearchInput, MonthRangePicker } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

const userStore = useUserStore()

const statsLoading = ref(false)
const submitting = ref(false)
const calculating = ref(false)
const currentCost = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const adjustDialogVisible = ref(false)

const showCalculateDialogFlag = ref(false)
const targetCostForCalculate = ref<any>(null)

const FORM_INITIAL: Record<string, any> = { id: undefined, material_cost: undefined, labor_cost: undefined, equipment_cost: undefined, overhead_cost: undefined, standard_cost: undefined, notes: '' }
const form = reactive({ ...FORM_INITIAL })
const sortKey = ref('period')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortFieldMap: Record<string, string> = {
  work_order_number: 'work_order__order_number',
  customer_name: 'work_order__customer__name',
  actual_cost: 'total_cost'
}

const columns: Column[] = [
  { key: 'work_order_number', label: '施工单号', width: 144, sortable: true },
  { key: 'period', label: '成本期间', width: 104, sortable: true },
  { key: 'customer_name', label: '客户', width: 144, sortable: true },
  { key: 'product_name', label: '产品名称', minWidth: 192 },
  { key: 'material_cost', label: '材料成本', width: 96, align: 'right', sortable: true },
  { key: 'labor_cost', label: '人工成本', width: 96, align: 'right', sortable: true },
  { key: 'equipment_cost', label: '设备成本', width: 96, align: 'right', sortable: true },
  { key: 'overhead_cost', label: '制造费用', width: 96, align: 'right', sortable: true },
  { key: 'actual_cost', label: '实际成本', width: 112, align: 'right', sortable: true },
  { key: 'standard_cost', label: '标准成本', width: 112, align: 'right', sortable: true },
  { key: 'variance', label: '成本差异', width: 96, align: 'right', sortable: true },
  { key: 'variance_rate', label: '差异率', width: 80, align: 'right', sortable: true },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const costBreakdownColumns: Column[] = [
  { key: 'item', label: '成本项目', width: 144 },
  { key: 'amount', label: '金额', width: 144, align: 'right', formatter: value => value ? `¥${Number(value).toLocaleString()}` : '-' },
  { key: 'proportion', label: '占比', width: 96, align: 'right', formatter: value => value ? `${Number(value).toFixed(1)}%` : '-' },
  { key: 'description', label: '说明', minWidth: 160 },
]

const buildCostParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  return {
    ...params,
    ordering: sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  }
}

const {
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handlePageChange,
  handleSizeChange,
  handleSearch,
  resetFilters,
  hasFilters,
  searchText,
  filters
} = useCrudList(productionCostAPI, 'getList', {
  initialFilters: { period_start: '', period_end: '' },
  buildParams: buildCostParams,
  errorContext: '加载成本数据失败'
})

const canEdit = computed(() => userStore.hasPermission('workorder.change_productioncost'))
const periodRange = computed<[string, string]>({
  get: () => [filters.value.period_start || '', filters.value.period_end || ''],
  set: ([start, end]) => {
    filters.value.period_start = start
    filters.value.period_end = end
  }
})

const handlePeriodRangeChange = async ([start, end]: [string, string]) => {
  filters.value.period_start = start
  filters.value.period_end = end
  await searchAndRefreshStats()
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await productionCostAPI.getStats(buildCostParams({
      search: searchText.value,
      period_start: filters.value.period_start,
      period_end: filters.value.period_end
    }))
    stats.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || response || {})
  } catch (error: any) { stats.value = {} } finally { statsLoading.value = false }
}

const reloadData = async () => {
  await loadData()
  fetchStats()
}

const searchAndRefreshStats = async () => {
  await handleSearch()
  fetchStats()
}

const handleReset = async () => {
  await resetFilters()
  fetchStats()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  reloadData()
}

const handleView = async (row: any) => {
  try { const response: any = await productionCostAPI.getDetail(row.id); currentCost.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || response || {}); detailDialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '获取成本详情失败') }
}

const openCalculateDialog = (row: any) => {
  targetCostForCalculate.value = row
  showCalculateDialogFlag.value = true
}

const handleCalculate = async () => {
  const row = targetCostForCalculate.value
  showCalculateDialogFlag.value = false
  if (!row) return
  try {
    calculating.value = true
    await productionCostAPI.calculateTotal(row.id)
    useUIStore().showSuccess('计算成功')
    loadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, '计算失败') }
  finally { calculating.value = false }
}

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, material_cost: row.material_cost, labor_cost: row.labor_cost, equipment_cost: row.equipment_cost, overhead_cost: row.overhead_cost, standard_cost: row.standard_cost, notes: row.notes || '' })
  adjustDialogVisible.value = true
}

const handleSaveAdjust = async () => {
  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id; delete (data as any).id
    await productionCostAPI.update(id!, data)
    useUIStore().showSuccess('调整成功')
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
  const total = Number(cost.total_cost ?? cost.actual_cost ?? 0)
  if (!total) return []
  return [
    { item: '材料成本', amount: cost.material_cost, proportion: total ? (cost.material_cost / total * 100) : 0, description: '原材料消耗' },
    { item: '人工成本', amount: cost.labor_cost, proportion: total ? (cost.labor_cost / total * 100) : 0, description: '人工工时费用' },
    { item: '设备成本', amount: cost.equipment_cost, proportion: total ? (cost.equipment_cost / total * 100) : 0, description: '设备折旧分摊' },
    { item: '制造费用', amount: cost.overhead_cost, proportion: total ? (cost.overhead_cost / total * 100) : 0, description: '其他制造费用' }
  ]
}

const formatAmount = (value: unknown) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'calculate', label: '计算', icon: 'calculator', tone: 'primary', visible: canEdit.value },
  { key: 'edit', label: '调整', icon: 'edit', tone: 'warning', visible: canEdit.value }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'calculate': openCalculateDialog(row); break
    case 'edit': handleEdit(row); break
  }
}

onMounted(() => { reloadData() })
</script>
