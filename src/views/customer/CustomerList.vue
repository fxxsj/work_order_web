<template>
  <div class="customer-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索客户名称、联系人、电话"
          clearable
          @input="handleSearchDebounced"
          @clear="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-button
          v-if="canCreate"
          type="primary"
          :icon="Plus"
          @click="showCreateDialog"
        >
          新建客户
        </el-button>
      </div>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无客户数据"
        :image-size="200"
      >
        <el-button v-if="canCreate" type="primary" @click="showCreateDialog">
          创建第一个客户
        </el-button>
      </el-empty>

      <div
        v-else
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
          class="data-table"
        >
          <el-table-column prop="name" label="客户名称" width="200" />
          <el-table-column prop="contact_person" label="联系人" width="120" />
          <el-table-column prop="phone" label="联系电话" width="150" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="salesperson_name" label="业务员" width="120">
            <template #default="scope">
              {{ scope.row.salesperson_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="地址" min-width="200" />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="canEdit"
                type="text"
                size="small"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canDelete"
                type="text"
                size="small"
                style="color: #F56C6C;"
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
    </el-card>

    <FormDialog
      ref="formDialogRef"
      v-model="dialogVisible"
      :title="formTitle"
      width="var(--ui-dialog-width-md)"
      :form-data="form"
      :rules="rules"
      label-width="100px"
      :loading="formLoading"
      @submit="handleSubmit"
      @cancel="resetForm"
    >
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input v-model="form.contact_person" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="业务员">
        <el-select
          v-model="form.salesperson"
          placeholder="请选择业务员"
          filterable
          clearable
          style="width: 100%;"
        >
          <el-option
            v-for="user in salespersonList"
            :key="user.id"
            :label="user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地址">
        <el-input
          v-model="form.address"
          type="textarea"
          :rows="2"
          placeholder="请输入地址"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import { FormDialog } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/filter'

const userStore = useUserStore()

const {
  searchText,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange
} = useCrudList(customerAPI.getList, {
  errorContext: '加载客户数据失败'
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const currentRow = ref(null)
const formLoading = ref(false)
const salespersonList = ref([])
const formDialogRef = ref(null)

const formInitialValues = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  salesperson: null,
  notes: ''
}

const form = reactive({ ...formInitialValues })

const rules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ]
}

const formTitle = computed(() => dialogType.value === 'edit' ? '编辑客户' : '新建客户')
const canCreate = computed(() => userStore.hasPermission('workorder.add_customer'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_customer'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_customer'))

const loadSalespersons = async () => {
  try {
    const response = await authAPI.getSalespersons()
    salespersonList.value = response || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载业务员列表失败')
  }
}

const showCreateDialog = () => {
  resetForm()
  dialogType.value = 'create'
  currentRow.value = null
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, formInitialValues)
  nextTick(() => {
    formDialogRef.value?.clearValidate()
  })
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentRow.value = row
  Object.assign(form, {
    name: row.name,
    contact_person: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    salesperson: row.salesperson || null,
    notes: row.notes || ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return false

  formLoading.value = true
  try {
    if (dialogType.value === 'edit') {
      await customerAPI.update(currentRow.value.id, form)
      ElMessage.success('保存成功')
    } else {
      await customerAPI.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, dialogType.value === 'edit' ? '保存失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除客户"${row.name}"吗？`)
    if (!confirmed) return
    await customerAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

onMounted(() => {
  loadData()
  loadSalespersons()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.customer-list {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.management-search-control {
  width: min(100%, 320px);
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section {
    align-items: stretch;
    flex-direction: column;
  }

  .management-search-control,
  .header-section .el-button {
    width: 100%;
  }
}
</style>
