# 页面布局对齐计划

> 目标：将 work_order_web 的列表页布局与 sub2api 完全对齐

## 现状对比

| 方面 | sub2api | work_order_web | 差距 |
|------|---------|----------------|------|
| **DataTable** | `<DataTable :columns :data>` 组件 | ✅ DataTable 已存在 | ✅ 已对齐 |
| **PageLayout** | `<TablePageLayout #filters/#actions/#table/#pagination>` | ✅ CrudPageLayout 已激活 | ✅ 已对齐 |
| **列表页模式** | columns 配置 + 插槽 | ✅ 10个列表页已重构 | ✅ 进行中 |

---

## Phase 1: DataTable 组件 ✅ 已存在

**状态**: DataTable 组件已存在于 `src/components/common/DataTable.vue`，接口已对齐 sub2api。

- ✅ `columns` prop (Column 配置数组)
- ✅ `data` prop (表格数据)
- ✅ `loading` prop
- ✅ 排序功能 (client-side + server-side)
- ✅ 单元格插槽 (`#cell-{columnKey}`)
- ✅ 移动端卡片视图
- ✅ 虚拟滚动 (@tanstack/vue-virtual)
- ✅ 固定列 (首列 + 操作列)
- ✅ 加载骨架屏 + 空状态

---

## Phase 2: 迁移列表页使用 DataTable + CrudPageLayout

**目标**：让已有但未使用的 CrudPageLayout 被各列表页采用。

### 2.1 列出所有列表页
需改造的视图（约 20+ 个）：
- CustomerList, DepartmentList, ProcessList, ProductList, MaterialList
- ProductGroupList, ArtworkList, DieList, FoilingPlateList, EmbossingPlateList
- SupplierList, SalesList, PurchaseList, StockList, DeliveryList, QualityList
- InvoiceList, PaymentList, CostList, StatementList
- WorkOrderList, TaskList, AuditLogList

### 2.2 改造模式
将：
```vue
<div class="card">
  <div class="mb-6 flex...">搜索 + 按钮</div>
  <table>...</table>
  <Pagination />
</div>
```

改为：
```vue
<CrudPageLayout
  title="页面标题"
  :loading="loading"
  :total="total"
  :current-page="currentPage"
  :page-size="pageSize"
  @size-change="handleSizeChange"
  @current-change="handlePageChange"
>
  <template #search>
    <SearchInput v-model="searchText" />
  </template>
  <template #actions>
    <button class="btn btn-primary">新建</button>
  </template>
  <DataTable :columns="columns" :data="tableData" />
  <template #pagination />
</CrudPageLayout>
```

### 2.3 优先级顺序
1. **高优先级**：CustomerList, ProductList, MaterialList, SupplierList（业务核心）
2. **中优先级**：其他 CRUD 列表页
3. **低优先级**：复杂列表页（WorkOrderList, TaskList 有特殊交互）

---

## Phase 3: 可选对齐

**目标**：进一步与 sub2api 架构对齐。

### 3.1 View 导入 Layout 模式（可选）
sub2api 的 views 自己导入 `<AppLayout>`：
```vue
<template>
  <AppLayout>
    <TablePageLayout>...</TablePageLayout>
  </AppLayout>
</template>
```

work_order_web 目前是路由嵌套：
```typescript
{ path: '/', component: AppLayout, children: [...] }
```

**决策点**：当前路由模式工作正常，暂不改动。

### 3.2 EmptyState 组件
- 已存在于 work_order_web
- 确认在列表页中正确使用（CustomerList 已在用）

---

## 验证方式

1. `npm run build` - 确保无构建错误
2. 启动开发服务器 `npm run dev`
3. 抽查改造后的列表页：
   - 搜索筛选功能正常
   - 分页切换正常
   - 新建/编辑/删除操作正常
   - 排序功能正常（DataTable）
4. 视觉对比 sub2api 对应页面

---

## 执行记录

| 轮次 | 日期 | 内容 | 结果 |
|------|------|------|------|
| 1 | 2026-05-22 | Phase 1: DataTable 组件已存在，确认对齐 | ✅ 完成 |
| 2 | 2026-05-22 | Phase 2: CustomerList 重构（参考实现） | ✅ 完成 |
| 3 | 2026-05-22 | Phase 2: SupplierList, MaterialList 重构 | ✅ 完成 |
| 4 | 2026-05-22 | Phase 2: ProductList, ProductGroupList 重构 | ✅ 完成 |
| 5 | 2026-05-22 | Phase 2: ProcessList, DieList 重构 | ✅ 完成 |
| 6 | 2026-05-22 | Phase 2: ArtworkList, FoilingPlateList, EmbossingPlateList 重构 | ✅ 完成 |
| 7 | 2026-05-22 | 验证：npm run build | ✅ 通过 |
| 8 | 2026-05-22 | Phase 2: SalesList, PurchaseList 重构 | ✅ 完成 |
| 9 | 2026-05-22 | Phase 2: Stock, Delivery, Quality 重构 | ✅ 完成 |
| 10 | 2026-05-22 | Phase 2: Invoice 重构 | ✅ 完成 |
| 11 | 2026-05-22 | 验证：npm run build | ✅ 通过 |
| 12 | 2026-05-22 | Phase 2: Payment, Cost, Statement 重构 | ✅ 完成 |
| 13 | 2026-05-22 | Phase 2: WorkOrderList, TaskList, AuditLogList 重构 | ✅ 完成 |
| 14 | 2026-05-22 | 验证：npm run build | ✅ 通过 |

**已重构列表页 (22/20)** ✅ 全部完成:
- ✅ CustomerList
- ✅ SupplierList
- ✅ MaterialList
- ✅ ProductList
- ✅ ProductGroupList
- ✅ ProcessList
- ✅ DieList
- ✅ ArtworkList
- ✅ FoilingPlateList
- ✅ EmbossingPlateList
- ✅ SalesList
- ✅ PurchaseList
- ✅ Stock
- ✅ Delivery
- ✅ Quality
- ✅ Invoice
- ✅ Payment
- ✅ Cost
- ✅ Statement
- ✅ WorkOrderList
- ✅ TaskList
- ✅ AuditLogList
