<template>
  <div>
    <div v-if="loading">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 rounded bg-gray-200 dark:bg-dark-700"></div>
        <div class="grid grid-cols-3 gap-4">
          <div class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700" v-for="i in 3" :key="i"></div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700" v-for="i in 3" :key="i"></div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="h-20 rounded-xl bg-gray-200 dark:bg-dark-700" v-for="i in 3" :key="i"></div>
        </div>
        <div class="h-64 rounded-xl bg-gray-200 dark:bg-dark-700"></div>
      </div>
    </div>
    <div v-else>
      <div class="card mb-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-dark-700">
          <span class="text-lg font-bold">订单信息</span>
          <div class="flex flex-wrap gap-3">
            <StatusTag :status="detailData.status" :label="detailData.status_display" category="salesOrder" size="default" />
            <StatusTag :status="detailData.payment_status" :label="detailData.payment_status_display" category="payment" size="default" />
          </div>
        </div>
        <div class="descriptions-grid" style="--col: 3">
          <div class="description-item"><div class="description-label">订单号</div><div class="description-value">{{ detailData.order_number }}</div></div>
          <div class="description-item"><div class="description-label">客户</div><div class="description-value">{{ detailData.customer_name }}</div></div>
          <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="detailData.status" :label="detailData.status_display" category="salesOrder" /></div></div>
          <div class="description-item"><div class="description-label">订单日期</div><div class="description-value">{{ formatDate(detailData.order_date) }}</div></div>
          <div class="description-item"><div class="description-label">预计交货日期</div><div class="description-value">{{ formatDate(detailData.delivery_date) }}</div></div>
          <div class="description-item"><div class="description-label">实际交货日期</div><div class="description-value">{{ formatDate(detailData.actual_delivery_date) || '-' }}</div></div>
          <div class="description-item"><div class="description-label">联系人</div><div class="description-value">{{ detailData.contact_person || '-' }}</div></div>
          <div class="description-item"><div class="description-label">联系电话</div><div class="description-value">{{ detailData.contact_phone || '-' }}</div></div>
          <div class="description-item col-span-3"><div class="description-label">送货地址</div><div class="description-value">{{ detailData.shipping_address || '-' }}</div></div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="mb-4 text-lg font-bold">金额信息</div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">小计</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">¥{{ formatAmount(detailData.subtotal) }}</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">税额 ({{ detailData.tax_rate }}%)</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">¥{{ formatAmount(detailData.tax_amount) }}</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">折扣</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-white">-¥{{ formatAmount(detailData.discount_amount) }}</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">合计</div>
            <div class="text-xl font-semibold text-primary-600">¥{{ formatAmount(detailData.total_amount) }}</div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">已付款金额</div>
            <div class="text-xl font-semibold text-success-600">¥{{ formatAmount(detailData.paid_amount) }}</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-dark-800">
            <div class="mb-2 text-sm text-gray-500 dark:text-dark-400">未付款金额</div>
            <div class="text-xl font-semibold" :class="detailData.unpaid_amount > 0 ? 'text-danger-600' : 'text-gray-900 dark:text-white'">¥{{ formatAmount(detailData.unpaid_amount) }}</div>
          </div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="mb-4 text-lg font-bold">订单明细</div>
        <div class="overflow-x-auto">
          <table class="data-table w-full">
            <thead>
              <tr>
                <th class="min-w-[200px] text-left">产品名称</th>
                <th class="w-[150px] text-left">规格</th>
                <th class="w-[100px] text-right">数量</th>
                <th class="w-[80px] text-center">单位</th>
                <th class="w-[100px] text-right">单价</th>
                <th class="w-[120px] text-right">金额</th>
                <th class="min-w-[150px] text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in (detailData.items || [])" :key="index">
                <td>{{ row.product_name }}</td>
                <td>{{ row.specification }}</td>
                <td class="text-right">{{ row.quantity }}</td>
                <td class="text-center">{{ row.unit }}</td>
                <td class="text-right">¥{{ formatAmount(row.unit_price) }}</td>
                <td class="text-right">¥{{ formatAmount(row.quantity * row.unit_price) }}</td>
                <td>{{ row.notes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="detailData.notes" class="card mb-6">
        <div class="mb-4 text-lg font-bold">备注</div>
        <div class="whitespace-pre-wrap text-gray-700 dark:text-dark-300">{{ detailData.notes }}</div>
      </div>

      <div v-if="operationHistory.length > 0" class="card mb-6">
        <div class="mb-4 text-lg font-bold">操作历史</div>
        <div class="space-y-0 border-l-2 border-gray-200 dark:border-dark-700 ml-3">
          <div v-for="(item, index) in operationHistory" :key="index" class="relative pl-6 pb-6">
            <div class="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary-500 bg-white dark:bg-dark-800"></div>
            <div class="text-xs text-gray-400 dark:text-dark-500 mb-1">{{ item.created_at }}</div>
            <p><StatusTag :status="item.new_status" :label="item.action_display" category="salesOrder" size="small" /> - {{ item.operator_name }}</p>
            <p v-if="item.notes" class="mt-1 text-xs text-gray-500 dark:text-dark-400">{{ item.notes }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:justify-center dark:bg-dark-800">
        <button class="btn btn-secondary" @click="goBack">返回列表</button>
        <button v-if="canEdit && detailData.status === 'draft'" class="btn btn-primary" @click="handleEdit">编辑订单</button>
        <button v-if="canConvert && ['approved', 'in_production'].includes(detailData.status)" class="btn btn-success" @click="handleConvert">转换为施工单</button>
        <button v-if="detailData.status === 'draft'" class="btn btn-success" @click="handleSubmit">提交审核</button>
        <template v-if="detailData.status === 'submitted'">
          <button class="btn btn-success" @click="handleApprove">审核通过</button>
          <button class="btn btn-warning" @click="handleReject">审核拒绝</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detailData = reactive<any>({})
const operationHistory = ref<any[]>([])

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

const goBack = () => { router.push('/sales') }
const handleEdit = () => { router.push(`/sales/${route.params.id}/edit`) }

const handleConvert = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将订单"${detailData.order_number}"转换为施工单？`)
    if (!confirmed) return
    const response: any = await salesOrderAPI.convertToWorkOrder(String(route.params.id))
    ElMessage.success('转换成功')
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '转换失败') }
}

const handleSubmit = async () => { try { await salesOrderAPI.submit(String(route.params.id)); ElMessage.success('提交成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '提交失败') } }
const handleApprove = async () => { try { await salesOrderAPI.approve(String(route.params.id)); ElMessage.success('审核通过'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '审核失败') } }
const handleReject = async () => { try { await salesOrderAPI.reject(String(route.params.id)); ElMessage.success('已拒绝'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') } }

const formatAmount = (amount: any) => amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '0.00'

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.descriptions-grid {
  display: grid;
  grid-template-columns: repeat(var(--col, 3), 1fr);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}
.description-item {
  display: flex;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  &:last-child { border-right: none; }
}
.description-item.col-span-2 { grid-column: span 2; }
.description-item.col-span-3 { grid-column: span 3; }
.description-label {
  width: 120px;
  min-width: 120px;
  padding: 12px 16px;
  background: #fafafa;
  color: #909399;
  font-size: 14px;
  border-right: 1px solid #ebeef5;
  flex-shrink: 0;
}
.description-value {
  padding: 12px 16px;
  color: #303133;
  font-size: 14px;
  flex: 1;
  word-break: break-word;
}
.dark {
  .descriptions-grid { border-color: #434343; }
  .description-item { border-color: #434343; }
  .description-label { background: #2d2d2d; color: #9e9e9e; border-color: #434343; }
  .description-value { color: #e0e0e0; }
}
</style>
