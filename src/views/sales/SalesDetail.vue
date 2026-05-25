<template>
  <div>
    <div v-if="loading">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 rounded bg-gray-200 dark:bg-dark-700" />
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700"
          />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700"
          />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700"
          />
        </div>
        <div class="h-64 rounded-xl bg-gray-200 dark:bg-dark-700" />
      </div>
    </div>
    <div v-else>
      <div class="card mb-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-dark-700">
          <span class="text-lg font-bold">订单信息</span>
          <div class="flex flex-wrap gap-3">
            <StatusTag
              :status="detailData.status"
              :label="detailData.status_display"
              category="salesOrder"
              size="default"
            />
            <StatusTag
              :status="detailData.payment_status"
              :label="detailData.payment_status_display"
              category="payment"
              size="default"
            />
          </div>
        </div>
        <DescriptionGrid :columns="3">
          <DescriptionItem label="订单号">
            {{ detailData.order_number }}
          </DescriptionItem>
          <DescriptionItem label="客户">
            {{ detailData.customer_name }}
          </DescriptionItem>
          <DescriptionItem label="状态">
            <StatusTag
              :status="detailData.status"
              :label="detailData.status_display"
              category="salesOrder"
            />
          </DescriptionItem>
          <DescriptionItem label="订单日期">
            {{ formatDate(detailData.order_date) }}
          </DescriptionItem>
          <DescriptionItem label="预计交货日期">
            {{ formatDate(detailData.delivery_date) }}
          </DescriptionItem>
          <DescriptionItem label="实际交货日期">
            {{ formatDate(detailData.actual_delivery_date) || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系人">
            {{ detailData.contact_person || '-' }}
          </DescriptionItem>
          <DescriptionItem label="联系电话">
            {{ detailData.contact_phone || '-' }}
          </DescriptionItem>
          <DescriptionItem
            label="送货地址"
            :span="3"
          >
            {{ detailData.shipping_address || '-' }}
          </DescriptionItem>
        </DescriptionGrid>
      </div>

      <div class="card mb-6">
        <div class="mb-4 text-lg font-bold">
          金额信息
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              小计
            </div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">
              ¥{{ formatAmount(detailData.subtotal) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              税额 ({{ detailData.tax_rate }}%)
            </div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">
              ¥{{ formatAmount(detailData.tax_amount) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              折扣
            </div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">
              -¥{{ formatAmount(detailData.discount_amount) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              合计
            </div>
            <div class="text-xl font-semibold text-primary-600">
              ¥{{ formatAmount(detailData.total_amount) }}
            </div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              已付款金额
            </div>
            <div class="text-xl font-semibold text-success-600">
              ¥{{ formatAmount(detailData.paid_amount) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">
              未付款金额
            </div>
            <div
              class="text-xl font-semibold"
              :class="detailData.unpaid_amount > 0 ? 'text-danger-600' : 'text-gray-900 dark:text-white'"
            >
              ¥{{ formatAmount(detailData.unpaid_amount) }}
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="mb-4 text-lg font-bold">
          订单明细
        </div>
        <SummaryTable
          :columns="columns"
          :data="detailData.items || []"
          row-key="id"
        >
          <template #cell-unit_price="{ row }">
            ¥{{ formatAmount(row.unit_price) }}
          </template>
          <template #cell-amount="{ row }">
            ¥{{ formatAmount(row.quantity * row.unit_price) }}
          </template>
        </SummaryTable>
      </div>

      <div
        v-if="detailData.notes"
        class="card mb-6"
      >
        <div class="mb-4 text-lg font-bold">
          备注
        </div>
        <div class="whitespace-pre-wrap text-gray-700 dark:text-dark-300">
          {{ detailData.notes }}
        </div>
      </div>

      <div
        v-if="operationHistory.length > 0"
        class="card mb-6"
      >
        <div class="mb-4 text-lg font-bold">
          操作历史
        </div>
        <div class="space-y-0 border-l-2 border-gray-200 dark:border-dark-700 ml-3">
          <div
            v-for="(item, index) in operationHistory"
            :key="index"
            class="relative pl-6 pb-6"
          >
            <div class="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary-500 bg-white dark:bg-dark-800" />
            <div class="text-xs text-gray-400 dark:text-dark-500 mb-1">
              {{ item.created_at }}
            </div>
            <p>
              <StatusTag
                :status="item.new_status"
                :label="item.action_display"
                category="salesOrder"
                size="small"
              /> - {{ item.operator_name }}
            </p>
            <p
              v-if="item.notes"
              class="mt-1 text-xs text-gray-500 dark:text-dark-400"
            >
              {{ item.notes }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:justify-center dark:bg-dark-800">
        <button
          class="btn btn-secondary"
          @click="goBack"
        >
          返回列表
        </button>
        <button
          v-if="canEdit && detailData.status === 'draft'"
          class="btn btn-primary"
          @click="handleEdit"
        >
          编辑订单
        </button>
        <button
          v-if="canConvert && ['approved', 'in_production'].includes(detailData.status)"
          class="btn btn-success"
          @click="handleConvert"
        >
          转换为施工单
        </button>
        <button
          v-if="detailData.status === 'draft'"
          class="btn btn-success"
          @click="handleSubmit"
        >
          提交审核
        </button>
        <template v-if="detailData.status === 'submitted'">
          <button
            class="btn btn-success"
            @click="handleApprove"
          >
            审核通过
          </button>
          <button
            class="btn btn-warning"
            @click="handleReject"
          >
            审核拒绝
          </button>
        </template>
      </div>
    </div>
    <ConfirmDialog
      :show="showConvertDialog"
      title="转换施工单"
      :message="`确定要将订单「${detailData.order_number}」转换为施工单？`"
      confirm-text="转换"
      cancel-text="取消"
      :loading="converting"
      loading-text="转换中..."
      @confirm="confirmConvert"
      @cancel="cancelConvert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { ConfirmDialog, StatusTag, DescriptionGrid, DescriptionItem, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detailData = reactive<any>({})
const operationHistory = ref<any[]>([])
const showConvertDialog = ref(false)
const converting = ref(false)

const canEdit = computed(() => userStore.hasPermission('workorder.change_salesorder'))
const canConvert = computed(() => userStore.hasPermission('workorder.add_workorder'))

const loadData = async () => {
  loading.value = true
  try {
    const response: any = await salesOrderAPI.getDetail(String(route.params.id))
    Object.assign(detailData, response)
    operationHistory.value = response.history || []
  } catch (error: any) { ErrorHandler.showMessage(error, '加载详情失败') } finally { loading.value = false }
}

const goBack = () => { router.push('/sales-orders') }
const handleEdit = () => { router.push(`/sales-orders/${route.params.id}/edit`) }

const handleConvert = () => {
  showConvertDialog.value = true
}

const cancelConvert = () => {
  showConvertDialog.value = false
}

const confirmConvert = async () => {
  converting.value = true
  try {
    const response: any = await salesOrderAPI.convertToWorkOrder(String(route.params.id))
    useUIStore().showSuccess('转换成功')
    cancelConvert()
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error: any) {
    ErrorHandler.showMessage(error, '转换失败')
  } finally {
    converting.value = false
  }
}

const handleSubmit = async () => { try { await salesOrderAPI.submit(String(route.params.id)); useUIStore().showSuccess('提交成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '提交失败') } }
const handleApprove = async () => { try { await salesOrderAPI.approve(String(route.params.id)); useUIStore().showSuccess('审核通过'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '审核失败') } }
const handleReject = async () => { try { await salesOrderAPI.reject(String(route.params.id)); useUIStore().showSuccess('已拒绝'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') } }

const formatAmount = (amount: any) => amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '0.00'

const columns: Column[] = [
  { key: 'product_name', label: '产品名称', minWidth: 200 },
  { key: 'specification', label: '规格', width: 150 },
  { key: 'quantity', label: '数量', width: 100, align: 'right' },
  { key: 'unit', label: '单位', width: 80, align: 'center' },
  { key: 'unit_price', label: '单价', width: 100, align: 'right' },
  { key: 'amount', label: '金额', width: 120, align: 'right' },
  { key: 'notes', label: '备注', minWidth: 150 }
]

onMounted(() => { loadData() })
</script>
