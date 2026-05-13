<template>
  <div class="statement-container">
    <StatementStats :stats="stats" :loading="statsLoading" />
    <el-card style="margin-top: 20px;">
      <div class="header-section">
        <div class="filter-group">
          <el-select v-model="filters.statement_type" placeholder="对账类型" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch"><el-option label="客户对账" value="customer" /><el-option label="供应商对账" value="supplier" /></el-select>
          <el-select v-model="filters.status" placeholder="状态" clearable style="width: 100px;" @change="handleSearch"><el-option label="草稿" value="draft" /><el-option label="已发送" value="sent" /><el-option label="已确认" value="confirmed" /><el-option label="有异议" value="disputed" /></el-select>
        </div>
        <div class="action-group"><el-button type="primary" :icon="Plus" @click="handleCreate">生成</el-button><el-button :icon="Printer" @click="handlePrint">打印</el-button></div>
      </div>
      <el-table v-loading="loading" :data="tableData" border style="margin-top: 15px;">
        <el-table-column prop="period_start" label="期间开始" width="120" /><el-table-column prop="period_end" label="期间结束" width="120" />
        <el-table-column label="期初余额" width="120" align="right"><template #default="scope">¥{{ scope.row.opening_balance?.toLocaleString() || '-' }}</template></el-table-column>
        <el-table-column label="期末余额" width="120" align="right"><template #default="scope"><span style="font-weight: bold;">¥{{ scope.row.closing_balance?.toLocaleString() || '-' }}</span></template></el-table-column>
        <el-table-column label="状态" width="100"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status_display }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150"><template #default="scope"><el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button><el-button v-if="scope.row.status === 'draft'" type="text" size="small" @click="handleConfirm(scope.row)">确认</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-if="total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 15px; text-align: right;" @current-change="handlePageChange" />
    </el-card>
    <el-dialog v-model="formDialogVisible" title="生成对账单" width="500px"><el-form ref="formRef" :model="form" :rules="rules" label-width="120px"><el-form-item label="对账类型" prop="statement_type"><el-select v-model="form.statement_type" style="width: 100%;"><el-option label="客户对账" value="customer" /><el-option label="供应商对账" value="supplier" /></el-select></el-form-item><el-form-item label="对账日期" prop="statement_date"><el-date-picker v-model="form.statement_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" /></el-form-item></el-form><template #footer><el-button @click="formDialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleGenerate">生成</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Printer } from '@element-plus/icons-vue'
import { statementAPI } from '@/api/modules'
import StatementStats from './components/StatementStats.vue'

const loading = ref(false)
const statsLoading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const stats = ref({})
const formRef = ref(null)
const formDialogVisible = ref(false)

const form = reactive({ statement_type: 'customer', statement_date: '' })
const rules = { statement_type: [{ required: true, message: '请选择对账类型', trigger: 'change' }], statement_date: [{ required: true, message: '请选择对账日期', trigger: 'change' }] }
const filters = reactive({ statement_type: '', status: '' })

const loadData = async () => {
  loading.value = true
  try { const res = await statementAPI.getList({ page: currentPage.value, page_size: pageSize.value, ...filters }); tableData.value = res?.results || []; total.value = res?.count || 0 } catch (e) {}
  loading.value = false
}

const fetchStats = async () => {
  statsLoading.value = true
  try { const res = await statementAPI.getList({ page_size: 1000 }); const list = res?.results || []; stats.value = { total_count: list.length, draft_count: list.filter(s => s.status === 'draft').length, confirmed_count: list.filter(s => s.status === 'confirmed').length } } catch (e) {}
  statsLoading.value = false
}

onMounted(() => { loadData(); fetchStats() })

const handleSearch = () => { currentPage.value = 1; loadData() }
const handlePageChange = (page) => { currentPage.value = page; loadData() }
const handleView = (row) => console.log('View', row)
const handleConfirm = (row) => console.log('Confirm', row)
const handleCreate = () => { form.statement_date = new Date().toISOString().split('T')[0]; formDialogVisible.value = true }
const handleGenerate = () => formRef.value?.validate((valid) => { if (valid) console.log('Generate', form) })
const handlePrint = () => window.print()
const getStatusType = (s) => ({ draft: 'info', sent: 'warning', confirmed: 'success', disputed: 'danger' })[s] || 'info')
</script>

<style scoped>
.statement-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.filter-group { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.action-group { display: flex; align-items: center; gap: 10px; }
</style>
