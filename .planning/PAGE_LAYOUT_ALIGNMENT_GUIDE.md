# 页面布局与交互对齐指导标准

## 背景
为统一项目内的页面交互体验和代码结构，并向 `sub2api` 项目的 UI/UX 标准对齐，我们制定了本指南。以 `CustomerList.vue` 和 `DepartmentList.vue` 的重构过程为例，本指南详细说明了如何将原有的基于 `CrudPageLayout` 和原生表格/表单的页面重构为基于 `TablePageLayout`、`DataTable` 及规范表单布局的新模式。

---

## 核心变更点与强制规范

1. **外层布局**：强制使用 `TablePageLayout`，并严格遵守其 `#filters`、`#actions`、`#table`、`#pagination` 四个插槽划分。
2. **数据表格**：列表页主表、带筛选/分页/排序的数据表、需要桌面滚动与移动端卡片适配的数据表，**强制使用 `<DataTable>` 组件**。所有的列定义必须通过 `columns` prop 传入，且通过 `#cell-[key]` 插槽实现自定义渲染，以确保全站表格样式（如头部吸顶、骨架屏、空状态）的完全一致。
3. **表单排版设计**：新建/编辑表单**强制采用纵向堆叠布局 (`space-y-5`)**，直接使用基础组件（如 `Input`, `Select`, `InputNumber`）自带的 `label` 和 `hint` 属性。**禁止**手动使用 flex/grid 将 label 与输入框横向排列。
4. **表单弹窗组件**：简单 CRUD 新页面使用 `BaseDialog` 配合原生 HTML `<form>` 元素，表单底部操作区域放置在 `#footer` 插槽中。历史复杂业务弹窗可暂时保留业务 `FormDialog` 包装，但不得继续新增通用 `FormDialog` 依赖。
5. **确认操作**：从命令式的 `ErrorHandler.confirm()` 切换为声明式的 `ConfirmDialog` 视图组件，以提升代码的响应性和视图结构的一致性。
6. **操作按钮**：
   - 顶部操作栏按钮增加图标，并在加载时显示 `loading` 动画。
   - 表格行内的操作按钮改用“图标+文字”的纵向排列模式（`flex-col items-center gap-0.5`），增加 hover 反馈。
7. **状态管理**：显式声明并独立管理各种弹窗状态 (`showCreateModal`, `showEditModal`, `showDeleteDialog`, `submitting`)，杜绝使用字符串类型 (`dialogType = 'create'`) 共享同一个布尔值控制显示。

---

## 组件归属与例外边界

### 布局组件归属

当前项目的 `TablePageLayout` 暂时仍从 `@/components/common` 导出，以避免一次性改动大量页面 import。新代码应继续通过 barrel 导入：

```ts
import { TablePageLayout, DataTable, Pagination } from '@/components/common'
```

后续如迁移到 `components/layout`，必须保留 `components/common/index.ts` 的兼容导出，避免破坏现有页面。

### 原生 table 的允许场景

以下场景可以继续使用原生 `<table>`，但需要保持局部样式自洽：

- 打印模板，例如 `WorkOrderPrint.vue`。
- 详情弹窗中的只读明细、嵌套小表、成本拆解等非主列表内容。
- 仪表盘局部摘要表，且没有分页、排序、横向滚动、移动端卡片适配需求。
- 已经封装为虚拟滚动专用组件的底层实现，例如 `DataTable.vue`、`VirtualTable.vue`。

以下场景不允许继续使用原生 `<table>`：

- 路由级列表页主表。
- 有分页、筛选、排序、批量操作、行内操作的数据列表。
- 需要移动端自动转卡片的数据表。

### FormDialog 去留

- `BaseDialog + form` 是简单 CRUD 的 preferred 模式。
- `FormDialog` 是 legacy 模式，只允许在迁移前的历史页面中保留。
- 业务弹窗组件可以继续包装 `BaseDialog`，但必须显式声明 props/emits，不从内部直接修改父级状态。

---

## 重构步骤详解

### 1. 替换页面布局与引入 DataTable

**禁止使用原生的 table，所有列表必须使用 DataTable 承载。**

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

  <!-- 3. 表格内容：必须使用 DataTable -->
  <template #table>
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :row-key="(row) => row.id"
    >
      <template #cell-name="{ value }">
        <span class="font-medium text-gray-900">{{ value }}</span>
      </template>
      
      <template #empty>
        <EmptyState ... />
      </template>
    </DataTable>
  </template>

  <!-- 4. 分页器：必须放在 #pagination 插槽中 -->
  <template #pagination>
    <Pagination ... />
  </template>
</TablePageLayout>
```

### 2. 改造表单弹窗与对其表单布局

表单必须采用**单列垂直排版**，彻底移除原先的 `flex items-start label-w-28` 水平结构。利用组件自带的 `label` 和 `hint` 属性，保持代码极其简洁。

**修改前 (错误的做法)：**
```vue
<div class="flex items-start gap-3">
  <label class="w-28 text-sm">部门编码</label>
  <div class="flex-1">
    <Input v-model="form.code" />
    <div class="text-xs">建议使用英文小写</div>
  </div>
</div>
```

**修改后 (正确的标准做法)：**
```vue
<BaseDialog
  :show="showCreateModal || showEditModal"
  :title="showEditModal ? '编辑' : '新建'"
  width="normal"
  @close="closeModals"
>
  <!-- 原生 form 接管提交动作，class="space-y-5" 提供统一下边距 -->
  <form id="entity-form" @submit.prevent="handleSubmit" class="space-y-5">
    
    <!-- 推荐：直接使用自带属性 (适用于 Input, TextArea) -->
    <div>
      <Input 
        v-model="formData.code" 
        label="部门编码" 
        hint="建议使用英文小写"
        required 
      />
    </div>

    <!-- 注意：Select, InputNumber, CheckboxGroup, Toggle 等组件目前自身不支持 label/hint 属性！ 
         必须使用如下标准 DOM 结构手动组合包裹！ -->
    <div>
      <label class="input-label mb-1.5 block">上级部门</label>
      <Select 
        v-model="formData.parent" 
        :options="options"
      />
      <div class="input-hint mt-1.5 text-xs text-gray-400">选择上级部门可建立层级</div>
    </div>

  </form>
  
  <!-- 自定义底部操作栏 -->
  <template #footer>
    <div class="flex justify-end gap-3">
      <button @click="closeModals" type="button" class="btn btn-secondary">取消</button>
      <button form="entity-form" type="submit" :disabled="submitting" class="btn btn-primary">
        <svg v-if="submitting" class="-ml-1 mr-2 h-4 w-4 animate-spin" ...></svg>
        {{ submitting ? '保存中...' : (showEditModal ? '更新' : '创建') }}
      </button>
    </div>
  </template>
</BaseDialog>
```

### 3. 改造删除确认

使用声明式的 `ConfirmDialog` 替代原先的 JS 弹窗。

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

### 4. 规范表格行内操作按钮

为了更友好的 UI 和一致性，所有表格最后一列的“操作”按钮，应统一使用“图标上方、文字下方”的布局设计。

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

### 5. 健壮的 API 响应处理（避坑提示）

在渲染选项列表时，API 返回格式可能是 `[{...}]`、`{ data: [...] }` 或 `{ results: [...] }`。为了避免错误，请务必进行防御性解包：

```ts
const response: any = await someAPI.getList()
const list = Array.isArray(response) ? response : (response?.results || response?.data || [])
optionsList.value = list
```

---

## 结论
按照本标准执行迁移与重构，可以为项目带来：
- **更高的扩展性**：基于插槽与原生的处理，降低了组件库自身的强绑定副作用。
- **卓越的用户体验**：丰富的动画过渡、骨架屏 (`DataTable`) 和布局使页面显得更现代。
- **一致性**：所有的表格与表单展示将具有完全相同的视觉结构，用户无需重新适应新的操作区域。
