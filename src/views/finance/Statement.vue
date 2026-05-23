<template>
  <div class="space-y-6">
    <StatementStats :stats="stats" :loading="statsLoading" />

    <CrudPageLayout
      title="对账管理"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search>
        <Select v-model="filters.statement_type" :options="statementTypeOptions" class="w-36" placeholder="对账类型" clearable @change="handleSearch" />
        <Select v-model="filters.status" :options="statementStatusOptions" class="w-36" placeholder="状态" clearable @change="handleSearch" />
      </template>
      <template #actions>
        <button class="btn btn-primary" @click="handleCreate">生成</button>
        <button class="btn" @click="handlePrint">打印</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
        <template #cell-period_start="{ row }"><span>{{ row.period_start }}</span></template>
        <template #cell-period_end="{ row }"><span>{{ row.period_end }}</span></template>
        <template #cell-opening_balance="{ row }"><span>¥{{ row.opening_balance?.toLocaleString() || '-' }}</span></template>
        <template #cell-closing_balance="{ row }"><span class="text-strong">¥{{ row.closing_balance?.toLocaleString() || '-' }}</span></template>
        <template #cell-status="{ row }"><StatusTag :status="row.status" category="statement" :label="row.status_display" /></template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
            <button class="btn btn-ghost btn-sm" v-if="row.status === 'draft'" @click="handleConfirm(row)">确认</button>
          </div>
        </template>
        <template #empty>
          <EmptyState description="暂无对账单数据" />
        </template>
      </DataTable>
    </CrudPageLayout>

    <BaseDialog :show="formDialogVisible" title="生成对账单" width="narrow">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <label class="w-28 text-sm text-gray-600 dark:text-gray-400">对账类型</label>
          <Select v-model="form.statement_type" :options="statementTypeOptions" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-28 text-sm text-gray-600 dark:text-gray-400">对账日期</label>
          <input type="date" v-model="form.statement_date" class="input flex-1" />
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="formDialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleGenerate">生成</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { statementAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { StatusTag, Select, Input, CrudPageLayout, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common/types'
import StatementStats from './components/StatementStats.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const stats = ref({})
const formRef = ref<any>(null)
const formDialogVisible = ref(false)

const form = reactive({ statement_type: 'customer', statement_date: '' })
const rules = { statement_type: [{ required: true, message: '请选择对账类型', trigger: 'change' }], statement_date: [{ required: true, message: '请选择对账日期', trigger: 'change' }] }

const columns: Column[] = [
  { key: 'period_start', label: '期间开始', width: 112 },
  { key: 'period_end', label: '期间结束', width: 112 },
  { key: 'opening_balance', label: '期初余额', width: 112, align: 'right' },
  { key: 'closing_balance', label: '期末余额', width: 112, align: 'right' },
  { key: 'status', label: '状态', width: 96 },
  { key: 'actions', label: '操作', width: 128, fixed: 'right' }
]

// Select options
const statementTypeOptions = [
  { value: 'customer', label: '客户对账' },
  { value: 'supplier', label: '供应商对账' }
]
const statementStatusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'sent', label: '已发送' },
  { value: 'confirmed', label: '已确认' },
  { value: 'disputed', label: '有异议' }
]
const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange
} = useCrudList(statementAPI, 'getList', {
  initialFilters: { statement_type: '', status: '' },
  errorContext: '加载对账单失败'
})

const fetchStats = async () => {
  statsLoading.value = true
  try { const res: any = await statementAPI.getList({ page_size: 1000 }); const list = res?.results || []; stats.value = { total_count: list.length, draft_count: list.filter((s: any) => s.status === 'draft').length, confirmed_count: list.filter((s: any) => s.status === 'confirmed').length } } catch (e: any) {}
  statsLoading.value = false
}

onMounted(() => { loadData(); fetchStats() })

const handleView = (row: any) => console.log('View', row);
const handleConfirm = (row: any) => console.log('Confirm', row);
const handleCreate = () => { form.statement_date = new Date().toISOString().split('T')[0]; formDialogVisible.value = true };
const handleGenerate = () => formRef.value?.validate((valid: any) => { if (valid) console.log('Generate', form) });
const handlePrint = () => window.print();
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.statement-container { padding: var(--ui-page-padding); }
.statement-card { margin-top: var(--ui-section-gap); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.statement-filter-control { width: min(100%, var(--ui-filter-control-width-sm)); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.statement-table { width: 100%; }
.pagination-row { margin-top: var(--ui-section-gap); text-align: right; }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .statement-filter-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
