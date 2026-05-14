<template>
  <div class="invoice-container">
    <invoice-stats :stats="stats" :loading="statsLoading" />

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
            <el-option
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
          <el-select
            v-model="filters.status"
            placeholder="发票状态"
            clearable
            class="finance-filter-control"
            @change="handleSearch"
          >
            <el-option label="待开具" value="draft" />
            <el-option label="已开具" value="issued" />
            <el-option label="已发送" value="sent" />
            <el-option label="已收到" value="received" />
            <el-option label="已作废" value="cancelled" />
            <el-option label="已红冲" value="refunded" />
          </el-select>
          <el-input
            v-model="filters.invoice_number"
            placeholder="搜索发票号码"
            class="finance-search-control"
            clearable
            @input="handleSearchDebounced"
            @clear="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="action-group">
          <el-button :loading="loading" :icon="RefreshRight" @click="loadData">
            刷新
          </el-button>
          <el-button
            v-if="canCreate"
            type="primary"
            :icon="Plus"
            @click="handleCreate"
          >
            新建发票
          </el-button>
        </div>
      </div>

      <div class="table-scroll">
      <el-table
        v-if="tableData.length > 0"
        v-loading="loading"
        :data="tableData"
        border
        class="finance-table"
      >
        <el-table-column prop="invoice_number" label="发票号码" width="150" />
        <el-table-column prop="invoice_type_display" label="发票类型" width="120" />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="amount" label="金额(不含税)" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.amount ? scope.row.amount.toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="tax_amount" label="税额" width="100" align="right">
          <template #default="scope">
            ¥{{ scope.row.tax_amount ? scope.row.tax_amount.toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="价税合计" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.total_amount ? scope.row.total_amount.toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="issue_date" label="开票日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status_display }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="canEdit && scope.row.status === 'draft'" type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="canEdit && scope.row.status === 'draft'" type="text" size="small" style="color: #E6A23C;" @click="handleSubmit(scope.row)">提交</el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无发票数据"
        :image-size="200"
        style="margin-top: 50px;"
      >
        <el-button v-if="hasFilters" type="primary" @click="handleReset">重置筛选</el-button>
        <el-button v-else-if="canCreate" type="primary" @click="handleCreate">创建第一个发票</el-button>
      </el-empty>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="发票详情" width="var(--ui-dialog-width-lg)" :close-on-click-modal="false">
      <el-descriptions v-if="currentInvoice" :column="2" border>
        <el-descriptions-item label="发票号码">{{ currentInvoice.invoice_number }}</el-descriptions-item>
        <el-descriptions-item label="发票类型">{{ currentInvoice.invoice_type_display }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentInvoice.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentInvoice.status_display }}</el-descriptions-item>
        <el-descriptions-item label="金额(不含税)">¥{{ currentInvoice.amount ? currentInvoice.amount.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="税率">{{ currentInvoice.tax_rate }}%</el-descriptions-item>
        <el-descriptions-item label="税额">¥{{ currentInvoice.tax_amount ? currentInvoice.tax_amount.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="价税合计">¥{{ currentInvoice.total_amount ? currentInvoice.total_amount.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ currentInvoice.issue_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联单号" :span="2">{{ currentInvoice.sales_order_number || currentInvoice.work_order_number || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInvoice.notes || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑发票' : '新建发票'" width="var(--ui-dialog-width-md)" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customer">
          <el-select v-model="form.customer" placeholder="请选择客户" filterable style="width: 100%;">
            <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型" prop="invoice_type">
          <el-select v-model="form.invoice_type" placeholder="请选择发票类型" style="width: 100%;">
            <el-option label="增值税专用发票" value="vat_special" />
            <el-option label="增值税普通发票" value="vat_common" />
            <el-option label="电子发票" value="electronic" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票日期" prop="issue_date">
          <el-date-picker v-model="form.issue_date" type="date" placeholder="请选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="金额(不含税)" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="税率" prop="tax_rate">
          <el-input-number v-model="form.tax_rate" :min="0" :max="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
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
import { Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { invoiceAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import InvoiceStats from './components/InvoiceStats.vue'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref([])
const currentInvoice = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const FORM_INITIAL = {
  id: null,
  customer: null,
  invoice_type: 'vat_special',
  issue_date: '',
  amount: null,
  tax_rate: 13,
  notes: ''
}

const form = reactive({ ...FORM_INITIAL })

const rules = {
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  invoice_type: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  issue_date: [{ required: true, message: '请选择开票日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const filters = reactive({
  status: '',
  customer: '',
  invoice_number: ''
})

const hasFilters = computed(() => filters.status || filters.customer || filters.invoice_number)
const canCreate = computed(() => userStore.hasPermission('workorder.add_invoice'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_invoice'))

let searchTimer = null

const handleSearchDebounced = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { handleSearch() }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  Object.assign(filters, { status: '', customer: '', invoice_number: '' })
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (filters.status) params.status = filters.status
    if (filters.customer) params.customer = filters.customer
    if (filters.invoice_number) params.search = filters.invoice_number

    const response = await invoiceAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response = await invoiceAPI.getSummary()
    const payload = response?.data || response
    const summary = payload?.summary || {}
    const byStatus = payload?.by_status || []

    let pendingAmount = 0
    let receivedAmount = 0
    try {
      const listResponse = await invoiceAPI.getList({ page_size: 1000 })
      const list = listResponse?.results || []
      pendingAmount = list.filter(i => i.status === 'issued' || i.status === 'sent').reduce((sum, i) => sum + (i.total_amount || 0), 0)
      receivedAmount = list.filter(i => i.status === 'received').reduce((sum, i) => sum + (i.total_amount || 0), 0)
    } catch (e) {}

    stats.value = {
      total_count: summary.total_count || 0,
      draft_count: byStatus.find(row => row.status === 'draft')?.count || 0,
      pending_amount: pendingAmount,
      received_amount: receivedAmount
    }
  } catch (error) {
    stats.value = {}
  } finally {
    statsLoading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const response = await customerAPI.getList({ page_size: 1000 })
    customerList.value = response?.results || []
  } catch (error) {}
}

const handleView = async (row) => {
  try {
    const response = await invoiceAPI.getDetail(row.id)
    currentInvoice.value = response
    detailDialogVisible.value = true
  } catch (error) {
    ErrorHandler.showMessage(error, '获取发票详情失败')
  }
}

const handleCreate = () => {
  if (!canCreate.value) return
  isEdit.value = false
  Object.assign(form, FORM_INITIAL)
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  if (!canEdit.value) return
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    customer: row.customer,
    invoice_type: row.invoice_type,
    issue_date: row.issue_date,
    amount: row.amount,
    tax_rate: row.tax_rate,
    notes: row.notes || ''
  })
  formDialogVisible.value = true
}

const handleSubmit = async (row) => {
  try {
    await ErrorHandler.confirm('确认提交该发票？')
    await invoiceAPI.submit(row.id)
    ElMessage.success('提交成功')
    loadData()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ErrorHandler.showMessage(error, '提交失败')
    }
  }
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) {
      delete data.id
      await invoiceAPI.update(form.id, data)
      ElMessage.success('发票更新成功')
    } else {
      await invoiceAPI.create(data)
      ElMessage.success('发票创建成功')
    }
    formDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error) {
    ErrorHandler.showMessage(error, isEdit.value ? '更新发票失败' : '创建发票失败')
  } finally {
    submitting.value = false
  }
}

const getStatusType = (status) => {
  const typeMap = { draft: 'info', issued: 'warning', sent: 'primary', received: 'success', cancelled: 'danger', refunded: 'danger' }
  return typeMap[status] || ''
}

onMounted(() => {
  loadData()
  fetchStats()
  fetchCustomers()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.invoice-container {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.filter-group,
.action-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.finance-filter-control {
  width: min(100%, 180px);
}

.finance-search-control {
  width: min(100%, 240px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.finance-table {
  width: 100%;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .finance-filter-control,
  .finance-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
