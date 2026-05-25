<template>
  <div class="space-y-6">
    <StatementStats :stats="stats" :loading="statsLoading" />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select v-model="filters.statement_type" :options="statementTypeOptions" class="w-36" placeholder="对账类型" clearable @change="handleSearch" />
            <Select v-model="filters.status" :options="statementStatusOptions" class="w-36" placeholder="状态" clearable @change="handleSearch" />
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" :disabled="loading" @click="loadData" title="刷新">
            <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
          </button>
          <button class="btn btn-secondary" @click="handlePrint">打印</button>
          <button class="btn btn-primary" @click="handleCreate">
            <Icon name="plus" size="md" class="mr-2" />
            生成
          </button>
        </div>
      </template>

      <template #table>
        <DataTable :columns="columns" :data="tableData" :loading="loading" :row-key="(row: any) => row.id">
          <template #cell-period_start="{ row }"><span>{{ row.period_start }}</span></template>
          <template #cell-period_end="{ row }"><span>{{ row.period_end }}</span></template>
          <template #cell-opening_balance="{ row }"><span>¥{{ row.opening_balance?.toLocaleString() || '-' }}</span></template>
          <template #cell-closing_balance="{ row }"><span class="text-strong">¥{{ row.closing_balance?.toLocaleString() || '-' }}</span></template>
          <template #cell-status="{ row }"><StatusTag :status="row.status" category="statement" :label="row.status_display" /></template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无对账单数据" />
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          :page="currentPage"
          :page-size="pageSize"
          :total="total"
          @update:page="handlePageChange"
          @update:page-size="handleSizeChange"
        />
      </template>
    </TablePageLayout>

    <BaseDialog :show="showCreateModal" title="生成对账单" width="narrow" @close="showCreateModal = false">
      <form id="statement-form" @submit.prevent="handleGenerate" class="space-y-5">
        <div>
          <label class="input-label mb-1.5 block">对账类型</label>
          <Select v-model="form.statement_type" :options="statementTypeOptions" class="w-full" required />
        </div>
        <div>
          <label class="input-label mb-1.5 block">对账日期</label>
          <input type="date" v-model="form.statement_date" class="input w-full" required />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
          <button form="statement-form" type="submit" class="btn btn-primary" :disabled="submitting">
            <Icon v-if="submitting" name="refresh" size="sm" class="-ml-1 mr-2 animate-spin" />
            {{ submitting ? '生成中...' : '生成' }}
          </button>
        </div>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { statementAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { StatusTag, Select, Input, TablePageLayout, DataTable, EmptyState, Pagination, Icon, BaseDialog, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import StatementStats from './components/StatementStats.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const stats = ref({})
const showCreateModal = ref(false)

const form = reactive({ statement_type: 'customer', statement_date: '' })

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
  try { 
    const res: any = await statementAPI.getList({ page_size: 1000 })
    const list = Array.isArray(res) ? res : (res?.results || res?.data || [])
    stats.value = { 
      total_count: list.length, 
      draft_count: list.filter((s: any) => s.status === 'draft').length, 
      confirmed_count: list.filter((s: any) => s.status === 'confirmed').length 
    } 
  } catch (e: any) {}
  statsLoading.value = false
}

onMounted(() => { loadData(); fetchStats() })

const handleView = (row: any) => console.log('View', row)
const handleConfirm = (row: any) => console.log('Confirm', row)

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'confirm', label: '确认', icon: 'check', tone: 'primary', visible: row.status === 'draft' }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'confirm': handleConfirm(row); break
  }
}

const handleCreate = () => { 
  form.statement_date = new Date().toISOString().split('T')[0]
  showCreateModal.value = true 
}
const handleGenerate = () => {
  if (form.statement_type && form.statement_date) {
    console.log('Generate', form)
  }
}
const handlePrint = () => window.print()
</script>

