<template>
  <div class="material-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索物料名称、编码"
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
          新建物料
        </el-button>
      </div>

      <div class="table-scroll">
        <el-table
          v-loading="loading"
          :data="tableData"
          class="data-table"
        >
          <el-table-column prop="code" label="物料编码" width="120" />
          <el-table-column prop="name" label="物料名称" width="200" />
          <el-table-column prop="specification" label="规格" min-width="150" />
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="unit_price" label="单价" width="120" align="right">
            <template #default="scope">
              ¥{{ scope.row.unit_price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock_quantity" label="库存数量" width="120" align="right" />
          <el-table-column prop="notes" label="备注" min-width="150" />
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

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无物料数据"
        :image-size="200"
      >
        <el-button v-if="canCreate" type="primary" @click="showCreateDialog">
          创建第一个物料
        </el-button>
      </el-empty>

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
      label-width="110px"
      :loading="formLoading"
      @submit="handleSubmit"
      @cancel="resetForm"
    >
      <el-form-item label="物料编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入物料编码" :disabled="dialogType === 'edit'" />
      </el-form-item>
      <el-form-item label="物料名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入物料名称" />
      </el-form-item>
      <el-form-item label="规格">
        <el-input v-model="form.specification" placeholder="请输入规格" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="form.unit" placeholder="如：个、张、本" />
      </el-form-item>
      <el-form-item label="单价" prop="unit_price">
        <el-input-number v-model="form.unit_price" :min="0" :max="999999999.99" :precision="2" :step="0.01" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="库存数量" prop="stock_quantity">
        <el-input-number v-model="form.stock_quantity" :min="0" :precision="3" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="最小库存" prop="min_stock_quantity">
        <el-input-number v-model="form.min_stock_quantity" :min="0" :precision="3" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="采购周期（天）" prop="lead_time_days">
        <el-input-number v-model="form.lead_time_days" :min="0" :max="365" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="需要开料">
        <el-switch v-model="form.need_cutting" />
      </el-form-item>
      <el-form-item label="默认供应商">
        <el-select v-model="form.default_supplier" filterable clearable placeholder="请选择供应商" style="width: 100%;">
          <el-option v-for="supplier in supplierList" :key="supplier.id" :label="`${supplier.code} - ${supplier.name}`" :value="supplier.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { materialAPI, supplierAPI } from '@/api/modules'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { FormDialog } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

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
} = useCrudList(materialAPI.getList, {
  errorContext: '加载物料数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('material')

const crud = useCRUD(materialAPI, {
  onSuccess: () => { dialogVisible.value = false; loadData() },
})

const dialogVisible = ref(false)
const dialogType = ref('create')
const formLoading = ref(false)
const currentRow = ref(null)
const supplierList = ref([])
const formDialogRef = ref(null)

const formInitialValues = {
  code: '',
  name: '',
  specification: '',
  unit: '个',
  unit_price: 0,
  stock_quantity: 0,
  min_stock_quantity: 0,
  lead_time_days: 7,
  need_cutting: false,
  default_supplier: null,
  notes: ''
}

const form = reactive({ ...formInitialValues })

const rules = {
  code: [
    { required: true, message: '请输入物料编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]+$/, message: '物料编码只能包含字母、数字和连字符', trigger: 'blur' },
    { min: 2, max: 50, message: '物料编码长度必须在2-50个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入物料名称', trigger: 'blur' },
    { min: 1, max: 200, message: '物料名称不能超过200个字符', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' }
  ],
  unit_price: [
    { type: 'number', min: 0, max: 999999999.99, message: '单价必须在0-999999999.99之间', trigger: 'blur' }
  ],
  stock_quantity: [
    { type: 'number', min: 0, message: '库存数量不能为负数', trigger: 'blur' }
  ],
  min_stock_quantity: [
    { type: 'number', min: 0, message: '最小库存不能为负数', trigger: 'blur' }
  ],
  lead_time_days: [
    { type: 'number', min: 0, max: 365, message: '采购周期必须在0-365天之间', trigger: 'blur' }
  ]
}

const formTitle = computed(() => dialogType.value === 'edit' ? '编辑物料' : '新建物料')

const loadSuppliers = async () => {
  try {
    const response = await supplierAPI.getList({ page_size: 1000, status: 'active' })
    supplierList.value = response?.results || []
  } catch (error) {
    ErrorHandler.handle(error, 'MaterialList.loadSuppliers')
  }
}

const showCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
  dialogType.value = 'create'
  currentRow.value = null
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentRow.value = row
  Object.assign(form, {
    code: row.code || '',
    name: row.name || '',
    specification: row.specification || '',
    unit: row.unit || '个',
    unit_price: Number(row.unit_price || 0),
    stock_quantity: Number(row.stock_quantity || 0),
    min_stock_quantity: Number(row.min_stock_quantity || 0),
    lead_time_days: Number(row.lead_time_days ?? 7),
    need_cutting: !!row.need_cutting,
    default_supplier: row.default_supplier || null,
    notes: row.notes || ''
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, formInitialValues)
}

const handleSubmit = async () => {
  const valid = await formDialogRef.value.validate().catch(() => false)
  if (!valid) return

  formLoading.value = true
  if (dialogType.value === 'edit') {
    await crud.update(currentRow.value.id, form, '保存成功')
  } else {
    await crud.create(form, '创建成功')
  }
  formLoading.value = false
}

const handleDelete = async (row) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除物料"${row.name}"吗？此操作不可撤销。`)
    if (!confirmed) return
    await crud.remove(row.id, '删除成功')
  } catch (error) {
    ErrorHandler.showMessage(error, '删除')
  }
}

onMounted(() => {
  loadData()
  loadSuppliers()
})
</script>

<style lang="scss" scoped>
.material-list {
  padding: var(--ui-page-padding);
}
</style>
