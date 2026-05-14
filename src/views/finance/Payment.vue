<template>
  <div class="payment-container">
    <payment-stats :stats="stats" :loading="statsLoading" />

    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-select
            v-model="filters.customer"
            placeholder="选择客户"
            clearable
            filterable
            class="finance-filter-control"
            @change="handleSearch"
          >
            <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
          <el-select
            v-model="filters.payment_method"
            placeholder="付款方式"
            clearable
            class="finance-filter-control"
            @change="handleSearch"
          >
            <el-option label="现金" value="cash" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="支票" value="check" />
            <el-option label="其他" value="other" />
          </el-select>
          <el-date-picker
            v-model="filters.date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            class="finance-date-control"
            @change="handleSearch"
          />
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">刷新</el-button>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleCreate">新增收款</el-button>
        </div>
      </div>

      <div class="table-scroll">
      <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" border class="finance-table">
        <el-table-column prop="payment_number" label="收款单号" width="150" />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="payment_date" label="收款日期" width="120" />
        <el-table-column prop="payment_method_display" label="付款方式" width="100" />
        <el-table-column prop="amount" label="收款金额" width="120" align="right">
          <template #default="scope">¥{{ scope.row.amount ? scope.row.amount.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column prop="applied_amount" label="已核销金额" width="120" align="right">
          <template #default="scope">¥{{ scope.row.applied_amount ? scope.row.applied_amount.toLocaleString() : '0' }}</template>
        </el-table-column>
        <el-table-column prop="remaining_amount" label="未核销金额" width="120" align="right">
          <template #default="scope">
            <span :class="getRemainingClass(scope.row)">¥{{ scope.row.remaining_amount ? scope.row.remaining_amount.toLocaleString() : scope.row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bank_account" label="银行账户" width="150" show-overflow-tooltip />
        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit" type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="canDelete" type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handlePageChange" />

      <el-empty v-if="!loading && tableData.length === 0" description="暂无收款数据" :image-size="200" style="margin-top: 50px;">
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
        <el-button v-else-if="canCreate" type="primary" @click="handleCreate">创建第一笔收款</el-button>
      </el-empty>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="收款详情" width="var(--ui-dialog-width-md)" :close-on-click-modal="false">
      <el-descriptions v-if="currentPayment" :column="2" border>
        <el-descriptions-item label="收款单号">{{ currentPayment.payment_number }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentPayment.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="收款日期">{{ currentPayment.payment_date }}</el-descriptions-item>
        <el-descriptions-item label="付款方式">{{ currentPayment.payment_method_display }}</el-descriptions-item>
        <el-descriptions-item label="收款金额">¥{{ currentPayment.amount ? currentPayment.amount.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="已核销金额">¥{{ currentPayment.applied_amount ? currentPayment.applied_amount.toLocaleString() : '0' }}</el-descriptions-item>
        <el-descriptions-item label="未核销金额">¥{{ currentPayment.remaining_amount ? currentPayment.remaining_amount.toLocaleString() : currentPayment.amount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="银行账户">{{ currentPayment.bank_account || '-' }}</el-descriptions-item>
        <el-descriptions-item label="交易流水号" :span="2">{{ currentPayment.transaction_number || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联发票">{{ currentPayment.invoice_number || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联销售订单">{{ currentPayment.sales_order_number || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPayment.notes || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentPayment.created_at }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentPayment.recorded_by_name || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑收款' : '新增收款'" width="var(--ui-dialog-width-md)" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customer">
          <el-select v-model="form.customer" placeholder="请选择客户" filterable style="width: 100%;">
            <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款日期" prop="payment_date">
          <el-date-picker v-model="form.payment_date" type="date" placeholder="请选择日期" value-format="yyyy-MM-dd" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="付款方式" prop="payment_method">
          <el-select v-model="form.payment_method" placeholder="请选择付款方式" style="width: 100%;">
            <el-option label="现金" value="cash" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="支票" value="check" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="银行账户"><el-input v-model="form.bank_account" placeholder="请输入银行账户" /></el-form-item>
        <el-form-item label="交易流水号"><el-input v-model="form.transaction_number" placeholder="请输入交易流水号" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { paymentAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import PaymentStats from './components/PaymentStats.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref([])
const currentPayment = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const FORM_INITIAL = { id: null, customer: null, payment_date: '', payment_method: '', amount: null, bank_account: '', transaction_number: '', notes: '' }
const form = reactive({ ...FORM_INITIAL })

const rules = {
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  payment_date: [{ required: true, message: '请选择收款日期', trigger: 'change' }],
  payment_method: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  amount: [{ required: true, message: '请输入收款金额', trigger: 'blur' }]
}

const filters = reactive({ customer: '', payment_method: '', date_range: null })

const hasFilters = computed(() => filters.customer || filters.payment_method || filters.date_range)
const canCreate = computed(() => userStore.hasPermission('workorder.add_payment'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_payment'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_payment'))

const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => { Object.assign(filters, { customer: '', payment_method: '', date_range: null }); currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, page_size: pageSize.value }
    if (filters.customer) params.customer = filters.customer
    if (filters.payment_method) params.payment_method = filters.payment_method
    if (filters.date_range && filters.date_range.length === 2) {
      params.start_date = filters.date_range[0]
      params.end_date = filters.date_range[1]
    }
    const response = await paymentAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) { ElMessage.error('加载数据失败') } finally { loading.value = false }
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response = await paymentAPI.getSummary()
    const payload = response?.data || response
    const summary = payload?.summary || {}
    stats.value = { total_amount: summary.total_amount || 0, applied_amount: summary.applied_amount || 0, unapplied_amount: summary.remaining_amount || 0, total_count: summary.total_count || 0 }
  } catch (error) { stats.value = {} } finally { statsLoading.value = false }
}

const fetchCustomers = async () => {
  try {
    const response = await customerAPI.getList({ page_size: 1000 })
    customerList.value = response?.results || []
  } catch (error) {}
}

const handleView = async (row) => {
  try { currentPayment.value = row; detailDialogVisible.value = true } catch (error) { ErrorHandler.showMessage(error, '获取收款详情失败') }
}

const handleCreate = () => { if (!canCreate.value) return; isEdit.value = false; Object.assign(form, FORM_INITIAL); formDialogVisible.value = true }

const handleEdit = (row) => {
  if (!canEdit.value) return
  isEdit.value = true
  Object.assign(form, { id: row.id, customer: row.customer, payment_date: row.payment_date, payment_method: row.payment_method, amount: row.amount, bank_account: row.bank_account || '', transaction_number: row.transaction_number || '', notes: row.notes || '' })
  formDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ErrorHandler.confirm(`确定要删除收款记录"${row.payment_number}"吗？`)
    await paymentAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
    fetchStats()
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) { delete data.id; await paymentAPI.update(form.id, data); ElMessage.success('更新成功') }
    else { await paymentAPI.create(data); ElMessage.success('创建成功') }
    formDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false }
}

const getRemainingClass = (row) => {
  const remaining = row.remaining_amount || row.amount
  if (remaining > 0) return 'text-warning'
  return 'text-success'
}

onMounted(() => { loadData(); fetchStats(); fetchCustomers() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.payment-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.finance-filter-control { width: min(100%, 180px); }
.finance-date-control { width: min(100%, 280px); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.finance-table { width: 100%; }
.text-warning { color: #E6A23C; }
.text-success { color: #67C23A; }
.el-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .finance-filter-control,
  .finance-date-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
