<template>
  <div class="sales-order-detail">
    <div v-if="loading"><el-skeleton :rows="10" animated /></div>
    <div v-else>
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span class="title">订单信息</span>
            <div class="actions">
              <StatusTag :status="detailData.status" :label="detailData.status_display" category="salesOrder" size="medium" />
              <StatusTag :status="detailData.payment_status" :label="detailData.payment_status_display" category="payment" size="medium" />
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号">{{ detailData.order_number }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ detailData.customer_name }}</el-descriptions-item>
          <el-descriptions-item label="状态"><StatusTag :status="detailData.status" :label="detailData.status_display" category="salesOrder" /></el-descriptions-item>
          <el-descriptions-item label="订单日期">{{ formatDate(detailData.order_date) }}</el-descriptions-item>
          <el-descriptions-item label="预计交货日期">{{ formatDate(detailData.delivery_date) }}</el-descriptions-item>
          <el-descriptions-item label="实际交货日期">{{ formatDate(detailData.actual_delivery_date) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailData.contact_person || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.contact_phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="送货地址" :span="3">{{ detailData.shipping_address || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="mb-20">
        <template #header><span class="title">金额信息</span></template>
        <el-row :gutter="20" class="amount-row">
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label">小计</div><div class="value">¥{{ formatAmount(detailData.subtotal) }}</div></div></el-col>
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label">税额 ({{ detailData.tax_rate }}%)</div><div class="value">¥{{ formatAmount(detailData.tax_amount) }}</div></div></el-col>
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label">折扣</div><div class="value">-¥{{ formatAmount(detailData.discount_amount) }}</div></div></el-col>
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label total">合计</div><div class="value total">¥{{ formatAmount(detailData.total_amount) }}</div></div></el-col>
        </el-row>
        <el-row :gutter="20" class="amount-row amount-row-secondary">
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label">已付款金额</div><div class="value text-success">¥{{ formatAmount(detailData.paid_amount) }}</div></div></el-col>
          <el-col :xs="24" :sm="12" :lg="6"><div class="amount-item"><div class="label">未付款金额</div><div class="value" :class="detailData.unpaid_amount > 0 ? 'text-danger' : ''">¥{{ formatAmount(detailData.unpaid_amount) }}</div></div></el-col>
        </el-row>
      </el-card>

      <el-card class="mb-20">
        <template #header><span class="title">订单明细</span></template>
        <div class="table-scroll">
        <el-table :data="detailData.items || []" border class="detail-table">
          <el-table-column prop="product_name" label="产品名称" min-width="200" />
          <el-table-column prop="specification" label="规格" width="150" />
          <el-table-column prop="quantity" label="数量" width="100" align="right" />
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="unit_price" label="单价" width="100" align="right">
            <template #default="scope">¥{{ formatAmount(scope.row.unit_price) }}</template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="right">
            <template #default="scope">¥{{ formatAmount(scope.row.quantity * scope.row.unit_price) }}</template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" min-width="150" />
        </el-table>
        </div>
      </el-card>

      <el-card v-if="detailData.notes" class="mb-20">
        <template #header><span class="title">备注</span></template>
        <div class="notes-content">{{ detailData.notes }}</div>
      </el-card>

      <el-card v-if="operationHistory.length > 0" class="mb-20">
        <template #header><span class="title">操作历史</span></template>
        <el-timeline>
          <el-timeline-item v-for="(item, index) in operationHistory" :key="index" :timestamp="item.created_at" placement="top">
            <p><StatusTag :status="item.new_status" :label="item.action_display" category="salesOrder" size="small" /> - {{ item.operator_name }}</p>
            <p v-if="item.notes" class="history-notes">{{ item.notes }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <div class="action-bar">
        <el-button @click="goBack">返回列表</el-button>
        <el-button v-if="canEdit && detailData.status === 'draft'" type="primary" @click="handleEdit">编辑订单</el-button>
        <el-button v-if="canConvert && ['approved', 'in_production'].includes(detailData.status)" type="success" @click="handleConvert">转换为施工单</el-button>
        <el-button v-if="detailData.status === 'draft'" type="success" @click="handleSubmit">提交审核</el-button>
        <template v-if="detailData.status === 'submitted'">
          <el-button type="success" @click="handleApprove">审核通过</el-button>
          <el-button type="warning" @click="handleReject">审核拒绝</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { StatusTag } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detailData = reactive({})
const operationHistory = ref([])

const canEdit = computed(() => userStore.hasPermission('workorder.change_salesorder'))
const canConvert = computed(() => userStore.hasPermission('workorder.add_workorder'))

const loadData = async () => {
  loading.value = true
  try {
    const response = await salesOrderAPI.getDetail(route.params.id)
    Object.assign(detailData, response)
    operationHistory.value = response.history || []
  } catch (error) { ErrorHandler.showMessage(error, '加载详情失败') } finally { loading.value = false }
}

const goBack = () => { router.push('/sales') }
const handleEdit = () => { router.push(`/sales/${route.params.id}/edit`) }

const handleConvert = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将订单"${detailData.order_number}"转换为施工单？`)
    if (!confirmed) return
    const response = await salesOrderAPI.convertToWorkOrder(route.params.id)
    ElMessage.success('转换成功')
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '转换失败') }
}

const handleSubmit = async () => { try { await salesOrderAPI.submit(route.params.id); ElMessage.success('提交成功'); loadData() } catch (error) { ErrorHandler.showMessage(error, '提交失败') } }
const handleApprove = async () => { try { await salesOrderAPI.approve(route.params.id); ElMessage.success('审核通过'); loadData() } catch (error) { ErrorHandler.showMessage(error, '审核失败') } }
const handleReject = async () => { try { await salesOrderAPI.reject(route.params.id); ElMessage.success('已拒绝'); loadData() } catch (error) { ErrorHandler.showMessage(error, '操作失败') } }

const formatDate = (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-'
const formatAmount = (amount) => amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '0.00'

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.sales-order-detail { padding: var(--ui-page-padding); }
.mb-20 { margin-bottom: var(--ui-section-gap); }
.card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.title { font-weight: bold; }
.actions { display: flex; gap: var(--ui-control-gap); flex-wrap: wrap; }
.amount-row { row-gap: var(--ui-control-gap); }
.amount-row-secondary { margin-top: var(--ui-section-gap); }
.amount-item { text-align: center; padding: 10px; }
.amount-item .label { color: #909399; font-size: 14px; margin-bottom: 8px; }
.amount-item .value { font-size: 20px; font-weight: 600; color: #303133; }
.amount-item .value.total { color: #409EFF; }
.amount-item .value.text-success { color: #67C23A; }
.amount-item .value.text-danger { color: #F56C6C; }
.notes-content { white-space: pre-wrap; color: #606266; }
.history-notes { color: #909399; font-size: 12px; margin-top: 5px; }
.table-scroll { overflow-x: auto; }
.detail-table { width: 100%; }
.action-bar { display: flex; gap: var(--ui-control-gap); justify-content: center; flex-wrap: wrap; padding: var(--ui-section-gap); background: #fff; border-radius: 4px; }

@media (max-width: bp.$breakpoint-phone-max) {
  .card-header,
  .actions,
  .action-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .action-bar .el-button {
    width: 100%;
  }
}
</style>
