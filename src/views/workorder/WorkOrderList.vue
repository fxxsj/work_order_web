<template>
  <div class="workorder-list">
    <el-card>
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="7" :lg="5">
            <el-input
              v-model="filters.search"
              placeholder="搜索施工单号、产品名称、客户"
              clearable
              @input="handleSearchDebounced"
              @clear="handleSearchDebounced"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="5" :lg="3">
            <el-select
              v-model="filters.status"
              placeholder="状态"
              clearable
              style="width: 100%;"
              @change="handleSearchDebounced"
            >
              <el-option
                v-for="item in WorkOrderStatusChoices"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="5" :lg="3">
            <el-select
              v-model="filters.priority"
              placeholder="优先级"
              clearable
              style="width: 100%;"
              @change="handleSearchDebounced"
            >
              <el-option
                v-for="item in PriorityChoices"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span :style="{ color: item.color }">{{ item.label }}</span>
              </el-option>
            </el-select>
          </el-col>
          <el-col v-if="isSalesperson" :xs="24" :sm="12" :md="5" :lg="3">
            <el-select
              v-model="filters.approval_status"
              placeholder="审核状态"
              clearable
              style="width: 100%;"
              @change="handleSearchDebounced"
            >
              <el-option
                v-for="item in ApprovalStatusChoices"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span :style="{ color: item.color }">{{ item.label }}</span>
              </el-option>
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="isSalesperson ? 24 : 7" :lg="10" class="filter-actions">
            <el-button
              :icon="RefreshRight"
              circle
              title="重置筛选"
              @click="handleReset"
            />
            <el-button
              v-if="canExport"
              type="success"
              :icon="Download"
              :loading="exporting"
              @click="handleExport"
            >
              导出Excel
            </el-button>
            <el-button
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              新建施工单
            </el-button>
          </el-col>
        </el-row>
      </div>

      <SkeletonLoader
        v-if="loading && tableData.length === 0"
        type="table"
        :rows="5"
        :columns="11"
        :column-widths="['18%', '20%', '12%', '12%', '20%', '12%', '12%', '10%', '10%', '10%', '30%']"
        class="workorder-skeleton"
      />

      <div v-else class="table-scroll">
        <el-table
          v-loading="loading && tableData.length > 0"
          :data="tableData"
          class="workorder-table"
          @row-click="handleRowClick"
        >
          <el-table-column prop="order_number" label="施工单号" width="150" fixed />
          <el-table-column prop="customer_name" label="客户" width="150" />
          <el-table-column prop="salesperson_name" label="业务员" width="100">
            <template #default="scope">{{ scope.row.salesperson_name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="product_name" label="产品名称" min-width="200" />
          <el-table-column prop="quantity" label="生产数量" width="120" align="right">
            <template #default="scope">
              {{ (scope.row.production_quantity || 0) + (scope.row.defective_quantity || 0) }} 车
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <span :class="'status-badge status-' + scope.row.status">{{ scope.row.status_display }}</span>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="100">
            <template #default="scope">
              <span :class="'status-badge priority-' + scope.row.priority">{{ scope.row.priority_display }}</span>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="150">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.progress_percentage"
                :color="scope.row.progress_percentage === 100 ? '#67C23A' : '#409EFF'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="order_date" label="下单日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.order_date) }}</template>
          </el-table-column>
          <el-table-column prop="delivery_date" label="交货日期" width="120">
            <template #default="scope">
              <span :style="getDeliveryDateStyle(scope.row.delivery_date, scope.row.status)">
                {{ formatDate(scope.row.delivery_date) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="manager_name" label="制表人" width="100" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button type="text" size="small" @click.stop="handleView(scope.row)">查看</el-button>
              <el-button v-if="canEdit" type="text" size="small" @click.stop="handleEdit(scope.row)">编辑</el-button>
              <el-button v-if="canDelete" type="text" size="small" style="color: #F56C6C;" @click.stop="handleDelete(scope.row)">删除</el-button>
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Search, RefreshRight, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { workOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { WorkOrderStatusChoices, PriorityChoices, ApprovalStatusChoices } from '@/constants'
import { formatDate } from '@/utils/filter'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchText = ref('')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const exporting = ref(false)

const filters = reactive({
  search: '',
  status: '',
  priority: '',
  approval_status: ''
})
const ordering = ref('-created_at')

const isSalesperson = computed(() => {
  const userInfo = userStore.currentUser
  return userInfo && userInfo.is_salesperson
})

const canExport = computed(() => userStore.hasPermission('workorder.view_workorder'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_workorder'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_workorder'))

let searchTimer = null

const handleSearchDebounced = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
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
      page_size: pageSize.value,
      ordering: ordering.value
    }
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.approval_status) params.approval_status = filters.approval_status

    const response = await workOrderAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(filters, {
    search: '',
    status: '',
    priority: '',
    approval_status: ''
  })
  ordering.value = '-created_at'
  currentPage.value = 1
  if (Object.keys(route.query).length > 0) {
    router.replace({ query: {} }).catch(err => {
      if (err.name !== 'NavigationDuplicated') logger.warn('导航错误', err)
    })
  }
  loadData()
}

const handleCreate = () => {
  router.push('/workorders/create')
}

const handleView = (row) => {
  router.push(`/workorders/${row.id}`)
}

const handleEdit = (row) => {
  if (row.approval_status === 'approved') {
    ElMessageBox.confirm('该施工单已审核通过。核心字段（产品、工序、版选择等）不能修改，非核心字段（备注、交货日期等）可以修改。确定要继续编辑吗？', '编辑已审核的施工单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push(`/workorders/${row.id}/edit`)
    }).catch(() => {})
  } else {
    router.push(`/workorders/${row.id}/edit`)
  }
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除施工单 ${row.order_number} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await workOrderAPI.delete(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ErrorHandler.showMessage(error, '删除施工单')
    }
  }).catch(() => {})
}

const getDeliveryDateStyle = (date, status) => {
  if (status === 'completed' || status === 'cancelled') return {}
  const diffDays = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { color: '#F56C6C', fontWeight: 'bold' }
  if (diffDays <= 3) return { color: '#E6A23C', fontWeight: 'bold' }
  return {}
}

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.approval_status) params.approval_status = filters.approval_status
    const now = new Date()
    const filename = `施工单列表_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`
    params.filename = filename
    const response = await workOrderAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    if (error.response && error.response.data) {
      const reader = new FileReader()
      reader.onload = () => { ErrorHandler.showMessage({ message: reader.result }, '导出') }
      reader.readAsText(error.response.data)
    } else {
      ErrorHandler.showMessage(error, '导出')
    }
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  if (route.query.approval_status) {
    filters.approval_status = route.query.approval_status
  }
  if (route.query.status) {
    filters.status = route.query.status
  }
  if (route.query.priority) {
    filters.priority = route.query.priority
  }
  if (route.query.ordering) {
    const allowedOrdering = new Set([
      'created_at', '-created_at',
      'order_date', '-order_date',
      'delivery_date', '-delivery_date',
      'order_number', '-order_number'
    ])
    if (allowedOrdering.has(route.query.ordering)) {
      ordering.value = route.query.ordering
    }
  }
  loadData()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.filter-section {
  margin-bottom: var(--ui-section-gap);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-control-gap);
}

.workorder-skeleton,
.table-scroll {
  margin-top: var(--ui-section-gap);
}

.table-scroll {
  overflow-x: auto;
}

.workorder-table {
  width: 100%;
}

.el-table {
  cursor: pointer;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
