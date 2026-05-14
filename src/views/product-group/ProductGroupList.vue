<template>
  <div class="product-group-list">
    <el-card>
      <div class="header-section">
        <el-input
          class="management-search-control"
          v-model="searchText"
          placeholder="搜索产品组编码、名称"
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
          @click="handleAdd"
        >
          新增产品组
        </el-button>
      </div>

      <el-empty
        v-if="!loading && tableData.length === 0"
        description="暂无产品组数据"
        :image-size="200"
        style="margin-top: 40px;"
      >
        <el-button v-if="canCreate" type="primary" @click="handleAdd">
          创建第一个产品组
        </el-button>
      </el-empty>

      <div
        v-else
        class="table-scroll"
      >
        <el-table
        v-loading="loading"
        :data="tableData"
        border
        class="data-table"
        >
        <el-table-column prop="code" label="编码" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="is_active" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'info'" size="small">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="items_count" label="子项数量" width="100" align="center">
          <template #default="scope">
            {{ scope.row.items ? scope.row.items.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="canEdit"
              size="mini"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDelete"
              size="mini"
              type="danger"
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="var(--ui-dialog-width-lg)"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.is_active" />
        </el-form-item>

        <el-divider content-position="left">
          子产品配置
        </el-divider>

        <el-form-item label="子产品列表">
          <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="addItem"
          >
            添加子产品
          </el-button>
          <div class="table-scroll">
            <el-table
              :data="form.items"
              border
              class="data-table"
            >
              <el-table-column label="产品" min-width="200">
                <template #default="scope">
                  <el-select
                    v-model="scope.row.product"
                    placeholder="请选择产品"
                    filterable
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="product in productList"
                      :key="product.id"
                      :label="`${product.name} (${product.code})`"
                      :value="product.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="子产品名称" min-width="180">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.item_name"
                    placeholder="如：天盒、地盒"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column label="排序" width="120" align="center">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.sort_order"
                    :min="0"
                    size="small"
                    style="width: 100%;"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    :disabled="form.items.length <= 1"
                    @click="removeItem(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Plus, Search, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { productGroupAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const userStore = useUserStore()

const searchText = ref('')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const dialogType = ref('create')
const dialogTitle = ref('新增产品组')
const formLoading = ref(false)
const currentRow = ref(null)
const formRef = ref(null)

const productList = ref([])

const getFormInitialValues = () => ({
  id: null,
  code: '',
  name: '',
  description: '',
  is_active: true,
  items: [
    {
      product: null,
      item_name: '',
      sort_order: 0
    }
  ]
})

const form = reactive(getFormInitialValues())

const rules = {
  code: [
    { required: true, message: '请输入编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ]
}

const canCreate = computed(() => userStore.hasPermission('workorder.add_productgroup'))
const canEdit = computed(() => userStore.hasPermission('workorder.change_productgroup'))
const canDelete = computed(() => userStore.hasPermission('workorder.delete_productgroup'))

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
      page_size: pageSize.value
    }
    if (searchText.value) {
      params.search = searchText.value
    }
    const response = await productGroupAPI.getList(params)
    tableData.value = response?.results || []
    total.value = response?.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadProductList = async () => {
  try {
    const response = await productAPI.getList({ page_size: 1000 })
    productList.value = response?.results || []
  } catch (error) {
    ErrorHandler.showMessage(error, '加载产品列表')
  }
}

const handleAdd = () => {
  dialogType.value = 'create'
  dialogTitle.value = '新增产品组'
  currentRow.value = null
  Object.assign(form, getFormInitialValues())
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑产品组'
  currentRow.value = row

  try {
    const detail = await productGroupAPI.getDetail(row.id)
    Object.assign(form, {
      id: detail.id,
      code: detail.code,
      name: detail.name,
      description: detail.description || '',
      is_active: detail.is_active,
      items: detail.items && detail.items.length > 0
        ? detail.items.map(item => ({
          id: item.id,
          product: item.product,
          item_name: item.item_name,
          sort_order: item.sort_order
        }))
        : [
          {
            product: null,
            item_name: '',
            sort_order: 0
          }
        ]
    })
    dialogVisible.value = true
  } catch (error) {
    ErrorHandler.showMessage(error, '加载详情')
  }
}

const handleDelete = async (row) => {
  const confirmed = await ErrorHandler.confirm(
    `确定要删除产品组"${row.name}"吗？此操作不可撤销。`
  )
  if (!confirmed) return

  try {
    await productGroupAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}

const addItem = () => {
  form.items.push({
    product: null,
    item_name: '',
    sort_order: form.items.length
  })
}

const removeItem = (index) => {
  form.items.splice(index, 1)
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (!form.items || form.items.length === 0) {
    ElMessage.warning('请至少添加一个子产品')
    return
  }

  for (let i = 0; i < form.items.length; i++) {
    const item = form.items[i]
    if (!item.product) {
      ElMessage.warning(`请选择第 ${i + 1} 个子产品的产品`)
      return
    }
    if (!item.item_name) {
      ElMessage.warning(`请输入第 ${i + 1} 个子产品的名称`)
      return
    }
  }

  formLoading.value = true
  try {
    const data = {
      code: form.code,
      name: form.name,
      description: form.description,
      is_active: form.is_active,
      items_write: form.items.map(item => ({
        product: item.product,
        item_name: item.item_name,
        sort_order: item.sort_order
      }))
    }

    if (form.id) {
      await productGroupAPI.update(form.id, data)
      ElMessage.success('更新成功')
    } else {
      await productGroupAPI.create(data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, form.id ? '更新失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, getFormInitialValues())
}

onMounted(() => {
  loadData()
  loadProductList()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.product-group-list {
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
