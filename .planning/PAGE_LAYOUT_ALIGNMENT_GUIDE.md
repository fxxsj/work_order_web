# 页面布局与交互对齐指导标准

## 背景
为统一项目内的页面交互体验和代码结构，并向 `sub2api` 项目的 UI/UX 标准对齐，我们制定了本指南。以 `CustomerList.vue` 的重构过程为例，本指南详细说明了如何将原有的基于 `CrudPageLayout` 的页面重构为基于 `TablePageLayout` 的新模式。

---

## 核心变更点

1. **外层布局**：从内置了标题和分页的 `CrudPageLayout`，切换为更灵活的基于插槽的 `TablePageLayout`。
2. **表单弹窗**：从高度封装的 `FormDialog` 切换为更加原生的 `BaseDialog` 配合 `<form>` 元素，以便于处理更复杂的验证和自定义底部操作。
3. **确认操作**：从命令式的 `ErrorHandler.confirm()` 切换为声明式的 `ConfirmDialog` 视图组件，以提升代码的响应性和视图结构的一致性。
4. **操作按钮**：
   - 顶部操作栏按钮增加图标，并在加载时显示 `loading` 动画。
   - 表格行内的操作按钮改用“图标+文字”的纵向排列模式，增加 hover 反馈。
5. **状态管理**：显式声明并管理各种弹窗状态 (`showCreateModal`, `showEditModal`, `showDeleteDialog`, `submitting`)，取代原本通过单个 `dialogVisible` 与 `dialogType` 组合的方式。

---

## 重构步骤详解

### 1. 替换页面布局组件

将原有的 `CrudPageLayout` 替换为 `TablePageLayout`，并调整内部的插槽结构。

**修改前：**
```vue
<CrudPageLayout title="客户管理">
  <template #search>
    <SearchInput ... />
  </template>
  <template #actions>
    <button class="btn btn-primary" @click="showCreateDialog">新建</button>
  </template>
  
  <!-- DataTable 直接放在 default 插槽 -->
  <DataTable ... />
</CrudPageLayout>
```

**修改后：**
```vue
<TablePageLayout>
  <!-- 1. 搜索与筛选区域：插槽名称变为 #filters -->
  <template #filters>
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <SearchInput ... class="w-full sm:w-64" />
      </div>
    </div>
  </template>

  <!-- 2. 操作按钮：增加刷新按钮，统一样式与间距 -->
  <template #actions>
    <div class="flex justify-end gap-3">
      <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
        <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
      </button>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
        <Icon name="plus" size="md" class="mr-2" />
        新建
      </button>
    </div>
  </template>

  <!-- 3. 表格内容：必须放在 #table 插槽中 -->
  <template #table>
    <DataTable ...>
      <template #empty>
        <EmptyState ... />
      </template>
    </DataTable>
  </template>

  <!-- 4. 分页器：必须放在 #pagination 插槽中 -->
  <template #pagination>
    <Pagination
      v-if="total > 0"
      :page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:page="handlePageChange"
      @update:page-size="handleSizeChange"
    />
  </template>
</TablePageLayout>
```

### 2. 改造表单弹窗

移除对 `FormDialog` 组件的依赖，使用 `BaseDialog` 搭配原生 HTML `<form>`。这样可以直接利用浏览器自带的 validation 或更灵活的按需定制。

**修改前：**
```vue
<FormDialog
  v-model="dialogVisible"
  :title="formTitle"
  :form-data="form"
  :rules="rules"
  :loading="formLoading"
  @submit="handleSubmit"
  @cancel="resetForm"
>
  <!-- 表单项 -->
</FormDialog>
```

**修改后：**
```vue
<BaseDialog
  :show="showCreateModal || showEditModal"
  :title="showEditModal ? '编辑' : '新建'"
  width="normal"
  @close="closeModals"
>
  <!-- 原生 form 接管提交动作 (阻止默认提交) -->
  <form id="entity-form" @submit.prevent="handleSubmit" class="space-y-5">
    <div>
      <Input v-model="formData.name" label="名称" required />
    </div>
    <!-- 其它表单项 -->
  </form>
  
  <!-- 自定义底部操作栏 -->
  <template #footer>
    <div class="flex justify-end gap-3">
      <button @click="closeModals" type="button" class="btn btn-secondary">取消</button>
      <button form="entity-form" type="submit" :disabled="submitting" class="btn btn-primary">
        <!-- 提交中的 SVG 动画 -->
        <svg v-if="submitting" class="-ml-1 mr-2 h-4 w-4 animate-spin" ...></svg>
        {{ submitting ? '保存中...' : (showEditModal ? '更新' : '创建') }}
      </button>
    </div>
  </template>
</BaseDialog>
```

### 3. 改造删除确认

使用声明式的 `ConfirmDialog` 替代原先的 JS 弹窗。

**修改前：**
```ts
const handleDelete = async (row) => {
  const confirmed = await ErrorHandler.confirm(`确定要删除"${row.name}"吗？`)
  if (!confirmed) return
  // 执行删除...
}
```

**修改后：**
```vue
<!-- 模板部分 -->
<ConfirmDialog
  :show="showDeleteDialog"
  title="删除确认"
  :message="`确定要删除「${selectedRow?.name}」吗？此操作不可撤销。`"
  confirm-text="删除"
  cancel-text="取消"
  :danger="true"
  @confirm="handleDelete"
  @cancel="showDeleteDialog = false"
/>
```
```ts
// 脚本部分
const confirmDelete = (row: any) => {
  selectedRow.value = row
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await crud.remove(selectedRow.value.id, '删除成功')
    showDeleteDialog.value = false
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  }
}
```

### 4. 规范表格行内操作按钮

为了更友好的 UI 和一致性，所有表格最后一列的“操作”按钮，应统一使用“图标上方、文字下方”的布局设计，并附带平滑的过渡反馈。

```vue
<template #cell-actions="{ row }">
  <div class="flex items-center gap-1">
    <!-- 编辑按钮 -->
    <button
      v-if="canEdit"
      @click="editRow(row)"
      class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400"
    >
      <Icon name="edit" size="sm" />
      <span class="text-xs">编辑</span>
    </button>
    
    <!-- 删除按钮 -->
    <button
      v-if="canDelete"
      @click="confirmDelete(row)"
      class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
    >
      <Icon name="trash" size="sm" />
      <span class="text-xs">删除</span>
    </button>
  </div>
</template>
```

### 5. 脚本层状态管理优化

去除基于字符串判断类型的模式 (如 `dialogType.value = 'create'`)，通过分离布尔值显式管理状态。

```ts
// --- 明确的状态 ---
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<any>(null)

// --- 统一表单数据与重置 ---
const formInitialValues = { name: '', ... }
const formData = reactive({ ...formInitialValues })

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  Object.assign(formData, formInitialValues) // 关闭时自动重置
}

const editRow = (row: any) => {
  selectedRow.value = row
  Object.assign(formData, { ...row }) // 数据回显
  showEditModal.value = true
}
```

### 6. 健壮的 API 响应处理（避坑提示）

在渲染选项列表时，API 返回格式可能是 `[{...}]`、`{ data: [...] }` 或 `{ results: [...] }`。为了避免诸如 `.map is not a function` 的错误，请务必进行防御性解包：

```ts
const loadOptions = async () => {
  try {
    const response: any = await someAPI.getList()
    // 防御性解包处理分页和非分页的响应结果
    const list = Array.isArray(response) ? response : (response?.results || response?.data || [])
    optionsList.value = list
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载选项失败')
  }
}
```

---

## 结论
按照本标准执行迁移与重构，可以为项目带来：
- **更高的扩展性**：基于插槽与原生的处理，降低了组件库自身的强绑定副作用。
- **卓越的用户体验**：丰富的动画过渡和布局使页面显得更现代。
- **可读性更好的代码**：明确的状态定义取代了隐式的组件黑盒。
