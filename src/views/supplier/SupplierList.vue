<template>
  <div class="supplier-list">
    <el-card>
      <div class="header-section">
        <div class="filter-group">
          <el-input
            class="management-search-control"
            v-model="searchText"
            placeholder="搜索供应商名称/编码"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-select
            class="status-filter-control"
            v-model="filters.status"
            placeholder="状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </div>
        <div class="action-group">
          <el-button
            v-if="canCreate"
            type="primary"
            :icon="Plus"
            @click="showCreateDialog"
          >
            新增供应商
          </el-button>
        </div>
      </div>

      <div
        v-if="tableData.length > 0"
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
          class="data-table"
        >
          <el-table-column prop="code" label="供应商编码" width="150" />
          <el-table-column prop="name" label="供应商名称" width="200" />
          <el-table-column prop="contact_person" label="联系人" width="120" />
          <el-table-column prop="phone" label="联系电话" width="150" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status_display }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="material_count" label="供应物料数" width="120" />
          <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="canEdit"
                type="text"
                size="small"
                @click="showEditDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canDelete"
                type="text"
                size="small"
                class="danger-text"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
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
        description="暂无供应商数据"
        :image-size="200"
        style="margin-top: 50px;"
      >
        <el-button v-if="canCreate" type="primary" @click="showCreateDialog">
          创建第一个供应商
        </el-button>
      </el-empty>
    </el-card>

    <supplier-form-dialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :supplier="currentRow"
      :loading="dialogLoading"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { supplierAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import SupplierFormDialog from './components/SupplierFormDialog.vue'

const userStore = useUserStore()

const {
  searchText,
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
} = useCrudList(supplierAPI.getList, {
  initialFilters: { status: '' },
  errorContext: '加载供应商数据失败'
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const dialogLoading = ref(false)
const currentRow = ref(null)

const canCreate = computed(() => userStore.hasPermission('workorder.add_supplier'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_supplier'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_supplier'))

const showCreateDialog = () => {
  dialogType.value = 'create'
  currentRow.value = null
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  dialogType.value = 'edit'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleFormConfirm = async (formData) => {
  dialogLoading.value = true
  try {
    if (dialogType.value === 'create') {
      await supplierAPI.create(formData)
      ElMessage.success('创建成功')
    } else {
      await supplierAPI.update(formData.id, formData)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'create' ? '创建' : '更新')
  } finally {
    dialogLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除供应商"${row.name}"吗？`)
    if (!confirmed) return
    await supplierAPI.delete(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.supplier-list {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  align-items: center;
}

.danger-text {
  color: #F56C6C;
}

.management-search-control {
  width: min(100%, 320px);
}

.status-filter-control {
  width: min(100%, 140px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .management-search-control,
  .status-filter-control,
  .action-group .el-button {
    width: 100%;
  }
}
</style>
