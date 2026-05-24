# 页面布局对齐迁移计划

> 参考实现：`CustomerList.vue` + `SupplierList.vue`
> 目标：将 `CrudPageLayout + FormDialog + ErrorHandler.confirm` 重构为 `TablePageLayout + BaseDialog + ConfirmDialog`

---

## 迁移模式

### 旧模式
```vue
<CrudPageLayout title="...">
  <template #search>...</template>
  <template #actions><button>新增</button></template>
  <DataTable>...</DataTable>
</CrudPageLayout>
<FormDialog v-model="dialogVisible" :form-data="form" @submit="handleSubmit" />
```

### 新模式
```vue
<TablePageLayout>
  <template #filters>...</template>
  <template #actions>
    <button @click="loadData"><Icon name="refresh" /></button>
    <button @click="showCreateModal = true"><Icon name="plus" />新增</button>
  </template>
  <template #table><DataTable>...</DataTable></template>
  <template #pagination><Pagination ... /></template>
</TablePageLayout>

<BaseDialog :show="showCreateModal || showEditModal" @close="closeModals">
  <form @submit.prevent="handleSubmit">...</form>
</BaseDialog>

<ConfirmDialog :show="showDeleteDialog" @confirm="handleDelete" />
```

---

## 页面分类

### 第一批：简单 CRUD 页面（可并行处理）

| 页面 | 复杂度 | 表单字段 | 特殊组件 | 备注 |
|------|--------|----------|----------|------|
| `ProcessList.vue` | 低 | code, name, description, standard_duration, sort_order, is_active | 无 | ✅ 已完成 |
| `FoilingPlateList.vue` | 中 | code, name, foiling_type, size, material, thickness, products[] | FoilingPlateFormDialog → PlateFormDialog → BaseDialog | ✅ 已完成 |
| `EmbossingPlateList.vue` | 中 | code, name, size, material, thickness, products[] | EmbossingPlateFormDialog → PlateFormDialog → BaseDialog | ✅ 已完成 |

**说明**：采用务实方案，保留现有 FormDialog 组件（内部已使用 BaseDialog），仅迁移列表页布局为 `TablePageLayout`，将 `ErrorHandler.confirm` 替换为 `ConfirmDialog`，升级操作按钮为图标+文字样式。

### 第二批：中等复杂度页面

| 页面 | 复杂度 | 表单字段 | 特殊组件 | 备注 |
|------|--------|----------|----------|------|
| `DieList.vue` | 中 | code, name, die_type, size, material, thickness, notes, products | DieFormDialog | 需要内联产品选择 |
| `MaterialList.vue` | 中 | code, name, specification, unit, unit_price, stock, supplier 等 | 无 | 有 supplier 下拉 |
| `ProductGroupList.vue` | 中 | code, name, description, is_active, items[] | 无 | items 是嵌套数组 |

### 第三批：复杂/特殊页面（暂不迁移）

| 页面 | 原因 |
|------|------|
| `WorkOrderList.vue` | 复杂业务逻辑 |
| `TaskList.vue` | 复杂业务逻辑 |
| `PurchaseList.vue` | 多状态流转、多个 Dialog |
| `SalesList.vue` | 复杂业务逻辑 |
| `Invoice.vue / Cost.vue / Payment.vue / Statement.vue` | 财务模块复杂 |
| `Stock.vue / Quality.vue / Delivery.vue` | 库存模块复杂 |
| `DepartmentList.vue` | 自定义 table（非 DataTable）、层级结构 |
| `ArtworkList.vue` | ArtworkFormDialog 复杂、有关联操作 |

---

## 迁移检查清单

对于每个页面，确认以下变更：

### 1. 布局替换
- [ ] `CrudPageLayout` → `TablePageLayout`
- [ ] `#search` → `#filters`
- [ ] DataTable 放入 `#table` 插槽
- [ ] 分页放入 `#pagination` 插槽

### 2. 操作按钮
- [ ] 新增刷新按钮（带 loading 动画）
- [ ] 新增按钮带 `<Icon name="plus" />`

### 3. 行内操作
- [ ] 编辑/删除按钮改为图标+文字纵向排列
- [ ] 使用 `ConfirmDialog` 替代 `ErrorHandler.confirm`

### 4. 表单 Dialog
- [ ] `FormDialog` → `BaseDialog` + `<form>`
- [ ] 使用 `form="xxx-form"` 的提交按钮
- [ ] 添加 `submitting` 状态和加载动画

### 5. 状态管理
- [ ] `dialogVisible + dialogType` → `showCreateModal + showEditModal`
- [ ] `formLoading` → `submitting`
- [ ] 显式表单数据声明

### 6. 验证逻辑
- [ ] 必填字段在 `handleSubmit` 中手动验证
- [ ] 删除调试用 `console.log`

---

## 已完成页面

| 页面 | 完成日期 | 备注 |
|------|----------|------|
| `CustomerList.vue` | 2026-05-23 | 参考实现 |
| `SupplierList.vue` | 2026-05-23 | 首批完成 |
| `ProcessList.vue` | 2026-05-23 | 首批完成 |
| `FoilingPlateList.vue` | 2026-05-23 | 第二批完成 |
| `EmbossingPlateList.vue` | 2026-05-23 | 第二批完成 |

---

**最后更新**: 2026-05-23
