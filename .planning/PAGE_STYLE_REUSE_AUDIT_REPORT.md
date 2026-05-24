# 页面样式与组件复用彻底审查报告

> 审查日期：2026-05-24  
> 审查范围：`src/views/**/*.vue` 全量 127 个 Vue 文件  
> 基准方向：继续向 `/home/chenjiaxing/文档/sub2api/frontend` 的“组件边界清晰、样式集中、页面结构一致、业务弹窗显式状态”方向收敛  
> 报告性质：全量扫描 + 按模块复核 + 后续优化计划，不包含本轮代码修改

## 0. 实施进度

### 2026-05-24 第一轮

已完成：

- 新增 `src/components/common/RowActions.vue`。
- 在 `src/components/common/index.ts` 导出 `RowActions`。
- 新增 `tests/unit/components/RowActions.spec.ts`，覆盖可见性、点击事件、danger 样式、disabled/loading 行为。
- 替换以下 3 个简单列表页的行操作按钮：
  - `src/views/customer/CustomerList.vue`
  - `src/views/department/DepartmentList.vue`
  - `src/views/material/MaterialList.vue`

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 继续扩大 `RowActions` 到 `SupplierList.vue`、`ProcessList.vue`、`ProductGroupList.vue`、`ProductList.vue`。
- 或按原计划新增 `FilterRow`，先替换 `PurchaseList.vue`、`Delivery.vue`、`SalesList.vue` 的筛选区。

### 2026-05-24 第二轮

已完成：

- 继续扩大 `RowActions` 的落地范围，替换以下 4 个列表页的重复行操作按钮：
  - `src/views/supplier/SupplierList.vue`
  - `src/views/process/ProcessList.vue`
  - `src/views/product-group/ProductGroupList.vue`
  - `src/views/product/ProductList.vue`
- 每个页面保留原有业务入口，只将 `edit/delete` 按钮结构收敛到 `RowActions`，通过本地 `handleRowAction` 分发到原有编辑/删除函数。
- 当前已完成 `RowActions` 替换的页面合计 7 个：`CustomerList.vue`、`DepartmentList.vue`、`MaterialList.vue`、`SupplierList.vue`、`ProcessList.vue`、`ProductGroupList.vue`、`ProductList.vue`。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 继续处理仍是简单 actions 插槽的 `SalesList.vue`、`ArtworkList.vue`、`DieList.vue`、`EmbossingPlateList.vue`、`FoilingPlateList.vue`。
- 对 `PurchaseList.vue`、`Delivery.vue`、`Quality.vue`、`Stock.vue`、`TaskList.vue`、`WorkOrderList.vue` 先复核操作按钮是否包含更多业务状态，避免把复杂逻辑硬塞进 `RowActions`。
- 并行准备 `FilterRow`，开始收敛 `PurchaseList.vue`、`Delivery.vue`、`SalesList.vue` 的筛选区重复布局。

### 2026-05-24 第三轮

已完成：

- 继续替换 5 个列表页的行操作按钮：
  - `src/views/sales/SalesList.vue`
  - `src/views/artwork/ArtworkList.vue`
  - `src/views/die/DieList.vue`
  - `src/views/embossing-plate/EmbossingPlateList.vue`
  - `src/views/foiling-plate/FoilingPlateList.vue`
- `SalesList.vue` 包含编辑、转换、提交、审核、拒绝、查看等多动作组合，已通过 `RowActions` 的 `visible/tone` 保留原业务显隐规则。
- 图稿、刀模、压凸版、烫金版页面保留原有弹窗和 API 逻辑，仅统一 actions 插槽结构。
- 当前已完成 `RowActions` 替换的页面合计 12 个：`CustomerList.vue`、`DepartmentList.vue`、`MaterialList.vue`、`SupplierList.vue`、`ProcessList.vue`、`ProductGroupList.vue`、`ProductList.vue`、`SalesList.vue`、`ArtworkList.vue`、`DieList.vue`、`EmbossingPlateList.vue`、`FoilingPlateList.vue`。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 暂缓继续扩大 `RowActions` 到复杂页面，先复核 `PurchaseList.vue`、`Delivery.vue`、`Quality.vue`、`Stock.vue`、`TaskList.vue`、`WorkOrderList.vue` 的动作是否有行级 loading、禁用、审批状态或批量操作联动。
- 开始抽 `FilterRow`，优先处理已经暴露重复筛选容器的 `SalesList.vue`、`PurchaseList.vue`、`Delivery.vue`，减少页面级 `flex flex-col/flex-wrap` 样式复制。

### 2026-05-24 第四轮

已完成：

- 新增 `src/components/common/FilterRow.vue`，作为插槽型筛选行容器，统一 `flex-col + flex-wrap + gap` 的筛选区结构。
- 在 `src/components/common/index.ts` 导出 `FilterRow`。
- 新增 `tests/unit/components/FilterRow.spec.ts`，覆盖默认筛选槽和第二行 `extra` 槽。
- 替换以下 3 个页面的重复筛选容器：
  - `src/views/sales/SalesList.vue`
  - `src/views/purchase/PurchaseList.vue`
  - `src/views/inventory/Delivery.vue`
- 本轮只收敛容器样式，不改变筛选字段、搜索触发、重置逻辑和页面数据流。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 继续扩大 `FilterRow` 到 `ArtworkList.vue`、`DieList.vue`、`FoilingPlateList.vue`、`EmbossingPlateList.vue`、`ProductList.vue` 等已迁移 `TablePageLayout` 的简单列表页。
- 复杂动作页可继续评估 `PurchaseList.vue`、`Delivery.vue` 的行操作是否能局部使用 `RowActions`，但应优先保留状态下拉、行级确认等业务行为。

### 2026-05-24 第五轮

已完成：

- 继续扩大 `FilterRow` 到 11 个已迁移 `TablePageLayout` 的简单列表页：
  - `src/views/customer/CustomerList.vue`
  - `src/views/department/DepartmentList.vue`
  - `src/views/material/MaterialList.vue`
  - `src/views/process/ProcessList.vue`
  - `src/views/supplier/SupplierList.vue`
  - `src/views/product-group/ProductGroupList.vue`
  - `src/views/product/ProductList.vue`
  - `src/views/artwork/ArtworkList.vue`
  - `src/views/die/DieList.vue`
  - `src/views/embossing-plate/EmbossingPlateList.vue`
  - `src/views/foiling-plate/FoilingPlateList.vue`
- 当前已完成 `FilterRow` 替换的页面合计 14 个：以上 11 个页面，加上第四轮的 `SalesList.vue`、`PurchaseList.vue`、`Delivery.vue`。
- 本轮完成后，上述 14 个页面中已无重复的 `flex flex-col gap-3` + `flex flex-wrap items-center gap-3` 筛选容器。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 进入复杂页面组件化：优先新增 `SectionDivider` 或 `SummaryTable`。`SectionDivider` 适合弹窗表单，风险较低；`SummaryTable` 能处理 dashboard/task/workorder 中仍大量存在的只读原生 table。
- 若继续处理 `RowActions`，应先单独审查 `PurchaseList.vue`、`Delivery.vue`、`Quality.vue`、`Stock.vue` 的行操作状态，避免破坏审批/收货/发货等流程。

### 2026-05-24 第六轮

已完成：

- 新增 `src/components/common/SectionDivider.vue`，统一弹窗/表单中的“分区标题 + 横线”结构。
- 在 `src/components/common/index.ts` 导出 `SectionDivider`。
- 新增 `tests/unit/components/SectionDivider.spec.ts`，覆盖标题渲染和分隔线渲染。
- 替换以下 5 个文件中的 6 处重复分区标题结构：
  - `src/views/purchase/components/PurchaseFormDialog.vue`
  - `src/views/purchase/components/PurchaseDetailDialog.vue`
  - `src/views/product/components/ProductFormDialog.vue`
  - `src/views/artwork/components/ArtworkFormDialog.vue`
  - `src/views/components/PlateFormDialog.vue`
- 本轮只收敛展示结构，不改变弹窗显隐、表单状态、明细表编辑、提交和删除逻辑。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 开始 `SummaryTable`，优先替换 dashboard/task/workorder 中只读摘要表，减少原生 table 和页面级 table class。
- 或继续处理 `DescriptionGrid`，先替换 `PurchaseDetailDialog.vue` 的 `descriptions-grid` 与 `style="--col: 2"` 内联样式。

### 2026-05-24 第七轮

已完成：

- 新增 `src/components/common/DescriptionGrid.vue`，统一详情描述网格的列数、边框和响应式容器。
- 新增 `src/components/common/DescriptionItem.vue`，统一描述项的 label/value 布局和跨列能力。
- 在 `src/components/common/index.ts` 导出 `DescriptionGrid`、`DescriptionItem`。
- 新增 `tests/unit/components/DescriptionGrid.spec.ts`，覆盖描述项渲染、列数 class、跨列 class。
- 将 `src/views/purchase/components/PurchaseDetailDialog.vue` 的 `descriptions-grid`、`description-*` 结构迁移到 `DescriptionGrid + DescriptionItem`，同时移除该处 `style="--col: 2"` 内联样式。
- 本轮作为详情网格样板，不批量迁移复杂页面，避免一次性触碰库存、财务、工单详情的较大模板。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 扩大 `DescriptionGrid` 到 `DeliveryDetailDialog.vue`、`QualityDetailDialog.vue`、`Stock.vue` 的详情弹窗。
- 然后处理财务详情 `Payment.vue`、`Invoice.vue`、`Cost.vue` 中的描述网格，逐步减少 `<style>` 和内联 `style=`。

### 2026-05-24 第八轮

已完成：

- 继续扩大 `DescriptionGrid + DescriptionItem` 到库存模块详情区域：
  - `src/views/inventory/components/DeliveryDetailDialog.vue`
  - `src/views/inventory/components/QualityDetailDialog.vue`
  - `src/views/inventory/Stock.vue`
- 移除上述文件中的 `descriptions-grid`、`description-*` 结构和 `style="--col: 2"` 内联样式。
- 当前 `src/views/inventory` 与 `src/views/purchase/components/PurchaseDetailDialog.vue` 范围内已无 `descriptions-grid` / `style="--col"` 残留。
- 本轮仍只处理只读详情展示，不触碰库存调整、发货、质检等业务流程。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 继续迁移财务模块 `Payment.vue`、`Invoice.vue`、`Cost.vue` 的描述网格。
- 然后处理 `SalesDetail.vue`、`AuditLogList.vue` 和工单详情组件中的描述网格；这些页面有更多本地 `<style>`，应单独验证视觉等价。

### 2026-05-24 第九轮

已完成：

- 继续扩大 `DescriptionGrid + DescriptionItem` 到财务模块详情区域：
  - `src/views/finance/Payment.vue`
  - `src/views/finance/Invoice.vue`
  - `src/views/finance/Cost.vue`
- 移除上述文件中的 `descriptions-grid`、`description-*` 结构和 `style="--col: 2"` 内联样式。
- 当前 `src/views/finance` 范围内已无 `descriptions-grid` / `style="--col"` 残留。
- 本轮只替换只读详情展示，不改变收款、发票、成本的创建/编辑/删除/确认逻辑。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 继续迁移 `SalesDetail.vue`、`AuditLogList.vue` 的描述网格，并评估能否删除页面级 `.descriptions-grid/.description-*` scoped style。
- 工单详情组件 `WorkOrderBasicInfo.vue`、`WorkOrderArtworkDie.vue`、`WorkOrderNotes.vue` 可以作为下一批，但涉及更密集的展示内容，建议单独一轮处理。

### 2026-05-24 第十轮

已完成：

- 继续扩大 `DescriptionGrid + DescriptionItem` 到：
  - `src/views/audit/AuditLogList.vue`
  - `src/views/sales/SalesDetail.vue`
- 移除 `AuditLogList.vue` 中变更详情弹窗的 `descriptions-grid`、`description-*` 与 `style="--col: 2; font-size: 14px;"`。
- 移除 `SalesDetail.vue` 中订单信息的 `descriptions-grid`、`description-*` 与 `style="--col: 3"`。
- 删除 `SalesDetail.vue` 页面级 `.descriptions-grid/.description-*` scoped style，减少页面自定义样式残留。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 处理工单详情组件 `WorkOrderBasicInfo.vue`、`WorkOrderArtworkDie.vue`、`WorkOrderNotes.vue` 的描述网格。
- 处理采购收货弹窗 `ReceiveDialog.vue` 的描述网格。

### 2026-05-24 第十一轮

已完成：

- 完成最后一批 `DescriptionGrid + DescriptionItem` 迁移：
  - `src/views/workorder/components/WorkOrderBasicInfo.vue`
  - `src/views/workorder/components/WorkOrderArtworkDie.vue`
  - `src/views/workorder/components/WorkOrderNotes.vue`
  - `src/views/purchase/components/ReceiveDialog.vue`
- 移除上述文件中的 `descriptions-grid`、`description-*` 结构和 `style="--col"` 内联样式。
- 当前 `src/views/**/*.vue` 范围内已无 `descriptions-grid`、`description-item`、`description-label`、`description-value`、`style="--col"` 残留。
- 这意味着报告中 `DescriptionGrid` 对应的旧描述网格专项已经完成全量替换。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts
npm run build
```

结果：全部通过。

下一轮建议：

- 开始 `SummaryTable`，处理 dashboard/task/workorder 中的只读摘要表。
- 或进入 `LineItemsTable`，统一采购、发货、销售、产品、图稿、版类弹窗中的明细编辑表。

## 1. 审查口径

本报告不是抽样结果。已对 `src/views` 下 127 个 Vue 文件逐一扫描以下特征：

- 页面布局：是否使用 `TablePageLayout`、`DataTable`、`Pagination`。
- 表格实现：是否存在原生 `<table>`、`<thead>`、`<tbody>`。
- 样式残留：是否存在 `<style>` 块、`style=` 内联样式、页面级 `.card/.data-table/.stat-card`。
- 弹窗与状态：是否存在 `dialogVisible`、`formDialogVisible = ref`、`dialogType`、`formLoading`、`show*DialogFlag`、`isEdit/isEditMode` 等旧状态。
- 组件复用：是否重复手写行操作按钮、顶部操作按钮、筛选区 flex 结构、弹窗分区标题、弹窗明细表。
- 表单契约：是否仍手写 `<label>` / `input-label` 包裹，而不是使用 `Input/Select/InputNumber/Toggle/CheckboxGroup` 的 `label/hint/error` props。

扫描命令核心模式：

```bash
find src/views -name '*.vue'
rg '<style|style=|<table|<thead|<tbody'
rg 'dialogVisible|dialogType|formLoading|show.*DialogFlag|isEditMode|isEdit = ref|formDialogVisible = ref'
rg 'rounded-lg p-1\.5|btn-(ghost|danger|primary|secondary|warning|success) btn-(sm|xs)|btn-circle'
```

## 2. 总体结论

路由级主列表页大部分已经完成 `TablePageLayout + DataTable` 对齐；当前主要问题已经转移到“页面内局部结构”和“复杂业务组件复用”：

- **主列表层面**：大多数核心列表已迁移，`Notification.vue`、`AssignmentHistory.vue`、`Stats.vue`、`SupervisorDashboard.vue`、`AssignmentRule.vue` 是仍明显旧结构的重点。
- **局部表格层面**：原生 table 仍分布在 38 个文件，很多是详情/弹窗/仪表盘摘要，不能简单全部替换为 `DataTable`，应抽 `SummaryTable`、`DialogTable`、`LineItemsTable`。
- **样式层面**：15 个文件有 `<style>`，23 个文件有内联 `style=`，其中不少是历史布局残留、表格列宽、详情描述网格、统计卡片。
- **按钮层面**：55 个文件出现重复小按钮或行操作按钮 class，是当前最适合先抽通用组件的地方。
- **状态层面**：复杂模块仍存在旧式弹窗状态，尤其是财务、版类、任务、工单、库存质检等模块。

## 3. 模块级风险矩阵

| 模块 | Vue 文件数 | `<style>` 文件 | 内联 style 文件 | 原生 table 文件 | 旧状态/弹窗文件 | 重复按钮文件 | 结论 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `artwork` | 2 | 0 | 0 | 1 | 2 | 2 | 列表已收敛，表单弹窗明细表仍需统一 |
| `audit` | 1 | 1 | 1 | 1 | 0 | 1 | 主列表已迁移，但导出/详情弹窗样式重 |
| `components` | 1 | 0 | 1 | 1 | 1 | 1 | `PlateFormDialog` 是跨版类历史核心组件 |
| `customer` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `dashboard` | 8 | 0 | 0 | 4 | 0 | 5 | 摘要表和卡片重复，适合 `SummaryTable` |
| `department` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `die` | 2 | 0 | 0 | 0 | 2 | 1 | 父页达标，业务弹窗依赖 `PlateFormDialog` |
| `embossing-plate` | 2 | 0 | 0 | 0 | 2 | 1 | 父页仍有旧状态，子弹窗依赖 `PlateFormDialog` |
| `finance` | 8 | 4 | 3 | 1 | 2 | 4 | 样式和状态残留集中，需要专项收敛 |
| `foiling-plate` | 2 | 0 | 0 | 0 | 2 | 1 | 父页仍有旧状态，子弹窗依赖 `PlateFormDialog` |
| `inventory` | 15 | 2 | 4 | 3 | 5 | 5 | 质检/库存/发货弹窗和详情表格需统一 |
| `material` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `process` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `product` | 2 | 0 | 0 | 1 | 2 | 2 | 列表基本达标，产品弹窗明细表需统一 |
| `product-group` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `purchase` | 6 | 0 | 3 | 4 | 6 | 3 | 弹窗明细表和详情表格是重点 |
| `sales` | 3 | 1 | 1 | 2 | 0 | 2 | 销售表单/详情仍用局部表格 |
| `supplier` | 1 | 0 | 0 | 0 | 0 | 1 | 基本达标，仅行操作可组件化 |
| `task` | 28 | 3 | 4 | 7 | 10 | 10 | 旧页面、看板、任务弹窗较多，需分批 |
| `workorder` | 35 | 3 | 6 | 11 | 10 | 9 | 最大复杂模块，适合先抽组件再替换 |

## 4. P0 页面：仍明显停留在旧结构

这些文件应作为下一轮优先处理对象。

### `src/views/Notification.vue`

问题：

- 顶层仍是 `card`。
- 使用原生 table。
- 使用 `btn-ghost btn-sm`。
- 没有 `TablePageLayout/DataTable/Pagination` 结构。

建议：

- 迁移为 `TablePageLayout + DataTable + EmptyState`。
- 行操作替换为 `RowActions`。
- 顶部“全部已读/刷新”替换为 `PageActions`。

### `src/views/task/AssignmentHistory.vue`

问题：

- 使用原生 table。
- 有 `<style>` 与多个内联 style。
- `Pagination` prop 命名有历史痕迹：`pageSize` / `@update:pageSize`。
- 表格结构和主列表规范不一致。

建议：

- 迁移到 `TablePageLayout + DataTable`。
- 修正 `Pagination` 为 `page-size` / `@update:page-size`。
- 去掉页面 scoped style，表格列通过 `columns` 管理。

### `src/views/task/Stats.vue`

问题：

- 使用 `card + 原生 table`。
- 统计页没有统一摘要表组件。

建议：

- 不必迁为 `DataTable`。
- 先抽 `SummaryTable`，替换统计表。

### `src/views/task/SupervisorDashboard.vue`

问题：

- 两个原生统计表。
- 有 `<style>` 和 5 处内联 style。
- 统计布局和 dashboard 组件重复。

建议：

- 使用 `SummaryTable` 统一两个统计表。
- 与 `dashboard/components/BusinessAnalysis.vue` 共享同一只读表格组件。

### `src/views/task/AssignmentRule.vue`

问题：

- 顶层仍有 `card` 外层。
- 使用 `dialogVisible`、`isEdit` 旧状态。
- 表单内仍手写 label 布局。
- 存在原生 table。

建议：

- 改为 `TablePageLayout` 或轻量 `PanelPageLayout`。
- 状态改为 `showCreateModal/showEditModal/showDeleteDialog/submitting/deleting`。
- 表单控件直接使用 label/hint props。

### `src/views/workorder/WorkOrderForm.vue`

问题：

- 多个 `card shadow-sm ring...` 表单分区。
- 固定底部操作栏手写。
- 有 `<style scoped>`。
- 保存/提交 loading 图标手写 span。

建议：

- 抽 `FormSection` 和 `StickyFormActions`。
- loading 图标统一使用 `Icon name="refresh"` 或 LoadingSpinner。
- 表单分区风格不要散落在页面。

### `src/views/sales/SalesForm.vue`

问题：

- 销售明细使用原生 `data-table`。
- 表格内 Select/InputNumber/Input/Button 组合与采购、发货、产品弹窗重复。

建议：

- 与采购/发货/产品/图稿共用 `LineItemsTable` 或 `EditableLineItemsTable`。
- 删除按钮统一 `IconButton` 或 `RowActionButton`。

## 5. P1 模块：复杂页面内可统一的局部结构

### 财务模块

涉及：

- `src/views/finance/Cost.vue`
- `src/views/finance/Invoice.vue`
- `src/views/finance/Payment.vue`
- `src/views/finance/Statement.vue`

问题：

- `Cost.vue` 有 `<style>`、内联 style、原生 table、`showCalculateDialogFlag`。
- `Invoice.vue` 有 `<style>`、`formDialogVisible`、`isEdit`、`showSubmitDialogFlag`。
- `Payment.vue` 有 `<style>`，表单控件仍多处手写 label。
- `Statement.vue` 有 `<style>`，生成对账单表单还可进一步用控件契约收敛。

建议：

- 先抽 `FinanceStatsSection` 或复用已有 `finance/components/*Stats.vue`。
- 抽 `SummaryTable` 处理成本明细。
- `Invoice.vue` 先做状态显式化和确认 loading。
- 财务表单的 Select/InputNumber 统一使用 `label` prop。

### 库存模块

涉及：

- `src/views/inventory/Stock.vue`
- `src/views/inventory/Quality.vue`
- `src/views/inventory/Delivery.vue`
- `src/views/inventory/components/DeliveryFormDialog.vue`
- `src/views/inventory/components/DeliveryDetailDialog.vue`
- `src/views/inventory/components/QualityDetailDialog.vue`

问题：

- `Stock.vue` 有 6 组原生 table 和内联 `style="--col"`。
- `Quality.vue` 仍有 `formDialogVisible = ref(false)` 单布尔状态。
- `DeliveryFormDialog.vue` 有 7 处内联 style，多数是 table 列宽。
- `DeliveryDetailDialog.vue`、`QualityDetailDialog.vue` 使用详情描述布局但未组件化。

建议：

- `Stock.vue` 抽 `DescriptionGrid`、`SummaryTable`。
- `Quality.vue` 做与 `Delivery.vue` 一致的 create/inspect/delete 状态收敛。
- `DeliveryFormDialog.vue` 使用 `LineItemsTable`，列宽进入 columns 配置。

### 采购模块

涉及：

- `src/views/purchase/PurchaseList.vue`
- `src/views/purchase/components/PurchaseFormDialog.vue`
- `src/views/purchase/components/PurchaseDetailDialog.vue`
- `src/views/purchase/components/InspectionDialog.vue`
- `src/views/purchase/components/ReceiveDialog.vue`
- `src/views/purchase/components/LowStockAlertDialog.vue`

问题：

- `PurchaseList.vue` 第一轮状态已收敛，但子弹窗仍有旧 `dialogVisible` computed，这是业务弹窗内部正常 v-model 适配，可接受。
- `PurchaseFormDialog.vue` 明细 table 和 Select label 手写。
- `PurchaseDetailDialog.vue`、`InspectionDialog.vue`、`LowStockAlertDialog.vue` 原生 table 分散。

建议：

- 采购明细抽 `LineItemsTable`。
- 详情/预警/质检表格用 `DialogTable` 或 `SummaryTable`。
- Select 控件使用 `label` prop。

### 工单模块

涉及文件最多，建议分层处理。

旧样式/表格重点：

- `src/views/workorder/components/WorkOrderProcurement.vue`
- `src/views/workorder/components/WorkOrderProducts.vue`
- `src/views/workorder/components/WorkOrderMaterials.vue`
- `src/views/workorder/components/TaskManagement.vue`
- `src/views/workorder/components/TaskSection.vue`
- `src/views/workorder/components/DraftTaskManagement.vue`
- `src/views/workorder/components/ArtworkAndDieInfo.vue`
- `src/views/workorder/components/WorkOrderProcessTasks.vue`
- `src/views/workorder/components/WorkOrderPrint.vue`

结论：

- `WorkOrderPrint.vue` 是打印模板，允许保留原生 table。
- 其他多数是工单详情内嵌小表，不建议直接改成 `DataTable`。
- 应先统一 `SummaryTable/DialogTable`，再逐步替换。

额外问题：

- `WorkOrderForm.vue` 是自定义表单布局重灾区，应抽 `FormSection`。
- 多个工单弹窗仍用 `dialogVisible` computed，这是子组件 v-model 适配，可接受，但内部按钮和表单 label 可统一。

### 任务模块

重点文件：

- `src/views/task/AssignmentHistory.vue`
- `src/views/task/AssignmentRule.vue`
- `src/views/task/Stats.vue`
- `src/views/task/SupervisorDashboard.vue`
- `src/views/task/components/TaskListView.vue`
- `src/views/task/components/TaskLogs.vue`
- `src/views/task/components/SplitTaskDialog.vue`
- `src/views/task/components/CompleteTaskDialog.vue`
- `src/views/task/components/OperatorTaskUpdateDialog.vue`

问题：

- 任务模块 28 个 Vue 文件中，7 个有原生 table，10 个有旧状态/弹窗模式，10 个有重复按钮。
- 看板类组件有内联 style，用于拖拽颜色和布局，这部分可保留但要限制范围。

建议：

- 先处理路由页：`AssignmentHistory.vue`、`AssignmentRule.vue`、`Stats.vue`、`SupervisorDashboard.vue`。
- 再处理弹窗：统一 `BaseDialog` footer、loading、label props。
- `TaskListView.vue` 是否迁 `DataTable` 需要单独评估，因为它可能是嵌入式列表。

### 版类模块

涉及：

- `src/views/die/DieList.vue`
- `src/views/embossing-plate/EmbossingPlateList.vue`
- `src/views/foiling-plate/FoilingPlateList.vue`
- `src/views/components/PlateFormDialog.vue`
- `src/views/die/components/DieFormDialog.vue`
- `src/views/embossing-plate/components/EmbossingPlateFormDialog.vue`
- `src/views/foiling-plate/components/FoilingPlateFormDialog.vue`

问题：

- `DieList.vue` 父页已用 computed adapter 收敛，可接受。
- `EmbossingPlateList.vue`、`FoilingPlateList.vue` 仍有 `dialogVisible/dialogType/formLoading`。
- `PlateFormDialog.vue` 有内联 style、原生 table、手写分区标题和产品明细表。

建议：

- 先把 `EmbossingPlateList.vue`、`FoilingPlateList.vue` 父页状态改成 `showCreateModal/showEditModal/submitting`。
- `PlateFormDialog.vue` 暂不拆业务，但把内部“包含产品及数量”表格换成 `LineItemsTable` 或至少 `DialogTable`。

## 6. 全量问题清单

### 6.1 含 `<style>` 的文件

共 15 个：

- `src/views/finance/Statement.vue`
- `src/views/workorder/components/WorkOrderPrint.vue`
- `src/views/finance/Payment.vue`
- `src/views/workorder/WorkOrderList.vue`
- `src/views/finance/Cost.vue`
- `src/views/finance/Invoice.vue`
- `src/views/workorder/WorkOrderForm.vue`
- `src/views/DashboardMobile.vue`
- `src/views/task/SupervisorDashboard.vue`
- `src/views/task/OperatorCenter.vue`
- `src/views/sales/SalesDetail.vue`
- `src/views/task/AssignmentHistory.vue`
- `src/views/audit/AuditLogList.vue`
- `src/views/inventory/Delivery.vue`
- `src/views/inventory/Quality.vue`

处理规则：

- 打印模板可保留。
- 页面级列表页中的旧 SCSS 优先检查是否已无引用，未引用直接删除。
- 统计页和财务页的 scoped style 应迁到 `SummaryTable`、`StatsCards`、`FormSection`。

### 6.2 含内联 `style=` 的文件

共 23 个，重点如下：

- `src/views/components/PlateFormDialog.vue`
- `src/views/inventory/components/DeliveryFormDialog.vue`
- `src/views/inventory/Stock.vue`
- `src/views/task/SupervisorDashboard.vue`
- `src/views/audit/AuditLogList.vue`
- `src/views/workorder/WorkOrderList.vue`
- `src/views/workorder/components/ProcessManagement.vue`
- `src/views/workorder/components/WorkOrderArtworkDie.vue`
- `src/views/workorder/components/WorkOrderBasicInfo.vue`
- `src/views/purchase/components/PurchaseFormDialog.vue`
- `src/views/purchase/components/PurchaseDetailDialog.vue`
- `src/views/finance/Cost.vue`
- `src/views/finance/Invoice.vue`
- `src/views/finance/Payment.vue`

处理规则：

- 表格列宽：迁入 columns 配置或 `DialogTable` column schema。
- 详情列数：改为 `DescriptionGrid :columns`。
- 动态颜色：如果是状态色，尽量转为 `StatusTag` 或 CSS class；确实动态色可保留。

### 6.3 含原生 table 的文件

共 38 个，分三类：

应迁主结构：

- `src/views/Notification.vue`
- `src/views/task/AssignmentHistory.vue`
- `src/views/task/Stats.vue`
- `src/views/task/SupervisorDashboard.vue`
- `src/views/DashboardMobile.vue`

应封装为弹窗/摘要表：

- `src/views/purchase/components/PurchaseFormDialog.vue`
- `src/views/purchase/components/PurchaseDetailDialog.vue`
- `src/views/purchase/components/InspectionDialog.vue`
- `src/views/purchase/components/LowStockAlertDialog.vue`
- `src/views/inventory/components/DeliveryFormDialog.vue`
- `src/views/inventory/components/DeliveryTable.vue`
- `src/views/inventory/Stock.vue`
- `src/views/finance/Cost.vue`
- `src/views/product/components/ProductFormDialog.vue`
- `src/views/artwork/components/ArtworkFormDialog.vue`
- `src/views/components/PlateFormDialog.vue`
- `src/views/sales/SalesForm.vue`
- `src/views/sales/SalesDetail.vue`

可保留但统一样式：

- `src/views/workorder/components/WorkOrderPrint.vue`
- `src/views/dashboard/components/RecentWorkOrders.vue`
- `src/views/dashboard/components/MyTasks.vue`
- `src/views/dashboard/components/BusinessAnalysis.vue`
- `src/views/dashboard/components/PendingPlateList.vue`
- `src/views/workorder/components/WorkOrderProducts.vue`
- `src/views/workorder/components/WorkOrderProcurement.vue`
- `src/views/workorder/components/TaskManagement.vue`
- `src/views/workorder/components/TaskSection.vue`
- `src/views/workorder/components/DraftTaskManagement.vue`
- `src/views/workorder/components/WorkOrderMaterials.vue`
- `src/views/workorder/components/WorkOrderProcessTasks.vue`

### 6.4 重复行操作/小按钮文件

共 55 个文件存在重复按钮样式。高收益替换对象：

- `CustomerList.vue`
- `DepartmentList.vue`
- `MaterialList.vue`
- `ProductGroupList.vue`
- `ProductList.vue`
- `SupplierList.vue`
- `ProcessList.vue`
- `ArtworkList.vue`
- `DieList.vue`
- `EmbossingPlateList.vue`
- `FoilingPlateList.vue`
- `SalesList.vue`
- `PurchaseList.vue`
- `Delivery.vue`
- `Quality.vue`
- `Stock.vue`
- `TaskList.vue`
- `WorkOrderList.vue`
- `Finance/*`

建议先抽 `RowActions`，用简单页验证后再批量替换；目前已完成 12 个列表页，下一步应在复杂页面复核动作状态后再继续覆盖采购、库存、任务和工单模块。

## 7. 建议新增或强化的组件

### 7.1 `RowActions`

用途：统一 DataTable actions 插槽中的图标 + 文本按钮。

最小 API：

```ts
type RowAction = {
  key: string
  label: string
  icon: string
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  visible?: boolean
  disabled?: boolean
  loading?: boolean
}
```

收益：

- 消除 55 个文件中的重复按钮 class。
- 统一危险按钮、确认按钮、查看按钮的 hover 和 disabled。
- 后续可以统一 tooltip、权限、移动端紧凑模式。

### 7.2 `PageActions`

用途：统一顶部刷新、新增、导出、预警等按钮。

适用：

- 所有 `TablePageLayout #actions`。
- `Notification.vue`、dashboard 组件中的“查看全部/刷新”按钮。

### 7.3 `FilterRow`

用途：统一筛选区的 flex-wrap、间距、移动端宽度。

替换重复结构：

```vue
<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-3">
```

### 7.4 `SummaryTable`

用途：只读摘要表、仪表盘表、详情小表。

适用：

- dashboard 摘要表。
- 任务统计表。
- 成本拆解表。
- 工单详情中的产品/物料/采购小表。

### 7.5 `DialogTable`

用途：弹窗内只读或轻交互表格。

适用：

- 采购详情、质检、库存预警、发货详情。
- 与 `SummaryTable` 可以共用底层样式。

### 7.6 `LineItemsTable`

用途：表单内“添加明细 + 表格编辑 + 删除行”。

适用：

- `PurchaseFormDialog.vue`
- `DeliveryFormDialog.vue`
- `SalesForm.vue`
- `ProductFormDialog.vue`
- `ArtworkFormDialog.vue`
- `PlateFormDialog.vue`

注意：

- 第一版不要强行抽业务逻辑。
- 只抽布局、表头、滚动容器、空态、删除按钮槽位。

### 7.7 `FormSection`

用途：替换 `WorkOrderForm.vue` 等页面中的重复 card section。

适用：

- 工单表单。
- 财务复杂表单。
- 采购/销售复杂表单。

### 7.8 `DescriptionGrid`

用途：替换 `descriptions-grid` 和 `style="--col: 2"`。

适用：

- 库存详情。
- 质检详情。
- 发货详情。
- 工单基础信息。

实施状态：

- 已新增 `DescriptionGrid` 与 `DescriptionItem`。
- 已全量替换 `src/views/**/*.vue` 中旧 `descriptions-grid` / `description-*` / `style="--col"` 描述网格。

### 7.9 `SectionDivider`

用途：替换弹窗中大量：

```vue
<div class="flex items-center my-4">
  <span>...</span>
  <hr />
</div>
```

适用：

- `PurchaseFormDialog.vue`
- `ProductFormDialog.vue`
- `ArtworkFormDialog.vue`
- `PlateFormDialog.vue`
- `DeliveryFormDialog.vue`

## 8. 推荐推进顺序

### Phase 1：先做通用组件，避免继续复制 class

- [x] 新增 `RowActions`，已替换 `CustomerList.vue`、`DepartmentList.vue`、`MaterialList.vue`、`SupplierList.vue`、`ProcessList.vue`、`ProductGroupList.vue`、`ProductList.vue`、`SalesList.vue`、`ArtworkList.vue`、`DieList.vue`、`EmbossingPlateList.vue`、`FoilingPlateList.vue`。
- [x] 新增 `FilterRow`，已替换 `PurchaseList.vue`、`Delivery.vue`、`SalesList.vue`、`CustomerList.vue`、`DepartmentList.vue`、`MaterialList.vue`、`ProcessList.vue`、`SupplierList.vue`、`ProductGroupList.vue`、`ProductList.vue`、`ArtworkList.vue`、`DieList.vue`、`EmbossingPlateList.vue`、`FoilingPlateList.vue`。
- [x] 新增 `SectionDivider`，已替换 `PurchaseFormDialog.vue`、`PurchaseDetailDialog.vue`、`ProductFormDialog.vue`、`ArtworkFormDialog.vue`、`PlateFormDialog.vue`。
- [x] 新增 `DescriptionGrid` / `DescriptionItem`，已全量替换 `src/views/**/*.vue` 中旧描述网格。
- [ ] 新增 `SummaryTable`，先替换 dashboard 的 `RecentWorkOrders.vue`、`MyTasks.vue`。

### Phase 2：处理仍旧结构路由页

- [ ] `Notification.vue` 迁 `TablePageLayout + DataTable`。
- [ ] `AssignmentHistory.vue` 迁 `TablePageLayout + DataTable`。
- [ ] `Stats.vue` 使用 `SummaryTable`。
- [ ] `SupervisorDashboard.vue` 使用 `SummaryTable`。
- [ ] `AssignmentRule.vue` 状态显式化并去掉顶层 `card` 旧布局。

### Phase 3：处理弹窗明细表

- [ ] `PurchaseFormDialog.vue` 使用 `LineItemsTable`。
- [ ] `DeliveryFormDialog.vue` 使用 `LineItemsTable` 并移除内联 width style。
- [ ] `SalesForm.vue` 使用 `LineItemsTable`。
- [ ] `ProductFormDialog.vue`、`ArtworkFormDialog.vue`、`PlateFormDialog.vue` 统一明细表样式。

### Phase 4：复杂模块状态继续收敛

- [ ] `Quality.vue`
- [ ] `Invoice.vue`
- [ ] `Cost.vue`
- [ ] `EmbossingPlateList.vue`
- [ ] `FoilingPlateList.vue`
- [ ] `ProductList.vue`

### Phase 5：删除无效 scoped style

- [ ] 检查 `Delivery.vue`、`Quality.vue` 中旧 SCSS 是否仍被模板引用。
- [ ] 检查 `Payment.vue`、`Cost.vue`、`Invoice.vue` 中 `.card`、`.detail-*`、`.stats-*` 是否可迁组件。
- [ ] 保留 `WorkOrderPrint.vue` 的打印样式。

## 9. 验收标准

每个批次完成后至少执行：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/ConfirmDialog.spec.ts tests/unit/components/FormControls.spec.ts
npm run build
```

新增通用组件时补对应组件测试：

- `RowActions.spec.ts`：已新增
- `FilterRow.spec.ts`：已新增
- `DescriptionGrid.spec.ts`：已新增
- `SummaryTable.spec.ts`
- `SectionDivider.spec.ts`：已新增

## 10. 最终判断

当前项目不是“没有对齐”，而是已经完成主列表基建对齐，但还没有完成页面内部 UI 结构的系统化。真正阻碍继续统一的不是某一个页面，而是缺少以下共享抽象：

- 行操作：`RowActions`
- 筛选行：`FilterRow`
- 摘要/详情表：`SummaryTable`、`DialogTable`
- 弹窗明细编辑表：`LineItemsTable`
- 复杂表单分区：`FormSection`
- 描述网格：`DescriptionGrid`

下一步应先做这些低耦合组件，再批量替换页面。这样比继续逐页手动调整 class 更稳，也更接近 sub2api/frontend 的组件化边界。
