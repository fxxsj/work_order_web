<template>
  <div class="space-y-6">
    <StockStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select
              v-model="filters.status"
              :options="statusOptions"
              class="w-full sm:w-36"
              placeholder="库存状态"
              clearable
              @change="handleSearch"
            />
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            :disabled="loading"
            title="刷新"
            @click="loadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
          </button>
          <button
            class="btn btn-warning"
            @click="handleLowStock"
          >
            <Icon
              name="exclamationTriangle"
              size="md"
              class="mr-2"
            />
            库存预警
          </button>
          <button
            class="btn btn-danger"
            @click="handleExpired"
          >
            <Icon
              name="clock"
              size="md"
              class="mr-2"
            />
            过期库存
          </button>
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :row-key="(row: any) => row.id"
        >
          <template #cell-product_name="{ row }">
            <span class="truncate max-w-xs block">{{ row.product_name }}</span>
          </template>
          <template #cell-batch_no="{ row }">
            <span>{{ row.batch_no }}</span>
          </template>
          <template #cell-quantity="{ row }">
            <span :class="getQuantityClass(row)">{{ row.quantity }}</span>
          </template>
          <template #cell-reserved_quantity="{ row }">
            <span>{{ row.reserved_quantity }}</span>
          </template>
          <template #cell-available_quantity="{ row }">
            <span>{{ row.available_quantity }}</span>
          </template>
          <template #cell-min_stock_level="{ row }">
            <span>{{ row.min_stock_level }}</span>
          </template>
          <template #cell-location="{ row }">
            <span>{{ row.location }}</span>
          </template>
          <template #cell-production_date="{ row }">
            <span>{{ row.production_date }}</span>
          </template>
          <template #cell-expiry_date="{ row }">
            <span :class="getExpiryClass(row)">{{ row.expiry_date || '-' }}</span>
          </template>
          <template #cell-days_until_expiry="{ row }">
            <Tag
              v-if="row.days_until_expiry !== null"
              :type="getExpiryTagType(row.days_until_expiry)"
            >
              {{ row.days_until_expiry > 0 ? `${row.days_until_expiry}天` : `已过期${Math.abs(row.days_until_expiry)}天` }}
            </Tag>
            <span v-else>-</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="stock"
              :label="row.status_display"
            />
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState
              :description="hasFilters ? '未找到匹配的库存' : '暂无库存数据'"
              :action-text="hasFilters ? '重置筛选' : undefined"
              @action="handleReset"
            />
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

    <BaseDialog
      :show="detailDialogVisible"
      title="库存详情"
      width="wide"
      @close="detailDialogVisible = false"
    >
      <DescriptionGrid
        v-if="currentStock"
        :columns="2"
      >
        <DescriptionItem label="产品名称">
          {{ (currentStock as any).product_name }}
        </DescriptionItem>
        <DescriptionItem label="批次号">
          {{ (currentStock as any).batch_no }}
        </DescriptionItem>
        <DescriptionItem label="库存数量">
          {{ (currentStock as any).quantity }}
        </DescriptionItem>
        <DescriptionItem label="预留数量">
          {{ (currentStock as any).reserved_quantity }}
        </DescriptionItem>
        <DescriptionItem label="可用数量">
          {{ (currentStock as any).available_quantity }}
        </DescriptionItem>
        <DescriptionItem label="最小库存">
          {{ (currentStock as any).min_stock_level }}
        </DescriptionItem>
        <DescriptionItem label="库位">
          {{ (currentStock as any).location || '-' }}
        </DescriptionItem>
        <DescriptionItem label="生产日期">
          {{ (currentStock as any).production_date || '-' }}
        </DescriptionItem>
        <DescriptionItem label="过期日期">
          {{ (currentStock as any).expiry_date || '-' }}
        </DescriptionItem>
        <DescriptionItem label="状态">
          <StatusTag
            :status="(currentStock as any).status"
            category="stock"
            :label="(currentStock as any).status_display"
          />
        </DescriptionItem>
        <DescriptionItem label="单位成本">
          ¥{{ (currentStock as any).unit_cost ? (currentStock as any).unit_cost.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem label="总价值">
          ¥{{ (currentStock as any).total_value ? (currentStock as any).total_value.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="创建时间"
          :span="2"
        >
          {{ (currentStock as any).created_at }}
        </DescriptionItem>
        <DescriptionItem
          v-if="(currentStock as any).notes"
          label="备注"
          :span="2"
        >
          <pre class="m-0 whitespace-pre-wrap">{{ (currentStock as any).notes }}</pre>
        </DescriptionItem>
      </DescriptionGrid>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            @click="detailDialogVisible = false"
          >
            关闭
          </button>
        </div>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="lowStockDialogVisible"
      title="库存预警"
      width="extra-wide"
      @close="lowStockDialogVisible = false"
    >
      <EmptyState
        v-if="!loadingLowStock && lowStockList.length === 0"
        description="暂无低库存预警"
      />
      <SummaryTable
        v-else
        :columns="lowStockColumns"
        :data="lowStockList"
        :loading="loadingLowStock"
        row-key="id"
      >
        <template #cell-available_quantity="{ row }">
          <span class="font-bold text-danger-600 dark:text-danger-400">{{ row.available_quantity }}</span>
        </template>
      </SummaryTable>
    </BaseDialog>

    <BaseDialog
      :show="expiredDialogVisible"
      title="过期库存"
      width="extra-wide"
      @close="expiredDialogVisible = false"
    >
      <EmptyState
        v-if="!loadingExpired && expiredList.length === 0"
        description="暂无过期库存"
      />
      <SummaryTable
        v-else
        :columns="expiredColumns"
        :data="expiredList"
        :loading="loadingExpired"
        row-key="id"
      >
        <template #cell-days_until_expiry="{ row }">
          <span class="text-danger-600 dark:text-danger-400">{{ Math.abs(row.days_until_expiry) }}天</span>
        </template>
      </SummaryTable>
    </BaseDialog>

    <BaseDialog
      :show="adjustDialogVisible"
      title="库存调整"
      width="normal"
      @close="adjustDialogVisible = false"
    >
      <form
        id="adjust-form"
        class="space-y-5"
        @submit.prevent="handleSaveAdjust"
      >
        <div>
          <label class="input-label mb-1.5 block">调整数量</label>
          <InputNumber
            v-model="adjustForm.adjustment"
            :step="1"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">调整原因</label>
          <TextArea
            v-model="adjustForm.reason"
            :rows="3"
            class="w-full"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn btn-secondary"
            @click="adjustDialogVisible = false"
          >
            取消
          </button>
          <button
            form="adjust-form"
            type="submit"
            class="btn btn-primary"
          >
            保存
          </button>
        </div>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon } from '@/components/common'
import { useUIStore } from '@/stores/ui'
import { productStockAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, EmptyState, Pagination, InputNumber, TextArea, Select, TablePageLayout, DataTable, Tag, BaseDialog, DescriptionGrid, DescriptionItem, SummaryTable, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import StockStats from './components/StockStats.vue'

const userStore = useUserStore()

const statsLoading = ref(false)
const stats = ref({})
const currentStock = ref(null)
const detailDialogVisible = ref(false)
const lowStockDialogVisible = ref(false)
const expiredDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const loadingLowStock = ref(false)
const loadingExpired = ref(false)
const lowStockList = ref<any[]>([])
const expiredList = ref<any[]>([])
const currentAdjustId = ref<string | number | null>(null)
const adjustForm = reactive({ adjustment: 0, reason: '' })

const columns: Column[] = [
  { key: 'product_name', label: '产品名称', width: 208 },
  { key: 'batch_no', label: '批次号', width: 144 },
  { key: 'quantity', label: '库存数量', width: 96, align: 'right' },
  { key: 'reserved_quantity', label: '预留数量', width: 96, align: 'right' },
  { key: 'available_quantity', label: '可用数量', width: 96, align: 'right' },
  { key: 'min_stock_level', label: '最小库存', width: 96, align: 'right' },
  { key: 'location', label: '库位', width: 112 },
  { key: 'production_date', label: '生产日期', width: 112 },
  { key: 'expiry_date', label: '过期日期', width: 112 },
  { key: 'days_until_expiry', label: '过期天数', width: 96, align: 'right' },
  { key: 'status', label: '状态', width: 96 },
  { key: 'actions', label: '操作', width: 144, fixed: 'right' }
]

const statusOptions = [
  { value: 'in_stock', label: '在库' },
  { value: 'reserved', label: '已预留' },
  { value: 'quality_check', label: '质检中' },
  { value: 'defective', label: '次品' }
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
  handleSizeChange,
  resetFilters
} = useCrudList(productStockAPI, 'getList', {
  initialFilters: { status: '' }
})

const hasFilters = computed(() => !!filters.value.status)
const canEdit = computed(() => userStore.hasPermission('workorder.change_stock'))

const handleReset = () => resetFilters()

const fetchStats = async () => {
  statsLoading.value = true
  try { 
    const response: any = await productStockAPI.getSummary()
    stats.value = response || {} 
  } catch (error: any) { 
    stats.value = {} 
  } finally { 
    statsLoading.value = false 
  }
}

const handleView = async (row: any) => { currentStock.value = row; detailDialogVisible.value = true }

const handleAdjust = (row: any) => { currentAdjustId.value = row.id; adjustForm.adjustment = 0; adjustForm.reason = ''; adjustDialogVisible.value = true }

const handleSaveAdjust = async () => {
  try { 
    await productStockAPI.adjust(currentAdjustId.value as string | number, adjustForm)
    useUIStore().showSuccess('调整成功')
    adjustDialogVisible.value = false
    loadData() 
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '调整失败') 
  }
}

const handleLowStock = async () => {
  lowStockDialogVisible.value = true
  loadingLowStock.value = true
  try { 
    const response: any = await productStockAPI.getLowStock()
    lowStockList.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
  } catch (error: any) { 
    lowStockList.value = [] 
  } finally { 
    loadingLowStock.value = false 
  }
}

const handleExpired = async () => {
  expiredDialogVisible.value = true
  loadingExpired.value = true
  try { 
    const response: any = await productStockAPI.getExpired()
    expiredList.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
  } catch (error: any) { 
    expiredList.value = [] 
  } finally { 
    loadingExpired.value = false 
  }
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'adjust', label: '调整', icon: 'edit', tone: 'primary', visible: canEdit.value }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'adjust': handleAdjust(row); break
  }
}

const getQuantityClass = (row: any) => row.quantity <= row.min_stock_level ? 'font-bold text-danger-600 dark:text-danger-400' : ''
const getExpiryClass = (row: any) => row.days_until_expiry !== null && row.days_until_expiry <= 0 ? 'font-bold text-danger-600 dark:text-danger-400' : row.days_until_expiry !== null && row.days_until_expiry <= 7 ? 'text-warning-600 dark:text-warning-400' : ''
const getExpiryTagType = (days: any) => days <= 0 ? 'danger' : days <= 7 ? 'warning' : 'success'

const lowStockColumns: Column[] = [
  { key: 'product_name', label: '产品名称', width: 208 },
  { key: 'batch_no', label: '批次号', width: 144 },
  { key: 'quantity', label: '当前库存', width: 96, align: 'right' },
  { key: 'min_stock_level', label: '最小库存', width: 96, align: 'right' },
  { key: 'available_quantity', label: '可用数量', width: 96, align: 'right' },
  { key: 'location', label: '库位', width: 112 }
]

const expiredColumns: Column[] = [
  { key: 'product_name', label: '产品名称', width: 208 },
  { key: 'batch_no', label: '批次号', width: 144 },
  { key: 'quantity', label: '库存数量', width: 96, align: 'right' },
  { key: 'expiry_date', label: '过期日期', width: 112 },
  { key: 'days_until_expiry', label: '过期天数', width: 96, align: 'right' },
  { key: 'location', label: '库位', width: 112 }
]

onMounted(() => { loadData(); fetchStats() })
</script>
