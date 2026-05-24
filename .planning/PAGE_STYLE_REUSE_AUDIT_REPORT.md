# 页面样式与组件复用剩余优化报告

> 更新日期：2026-05-24  
> 审查范围：`src/views/**/*.vue` 全量 127 个 Vue 文件  
> 报告口径：按当前代码实际状态重写，已完成的迁移不再作为待办展开  
> 基准方向：继续向 `/home/chenjiaxing/文档/sub2api/frontend` 的组件边界清晰、样式集中、页面结构一致、业务弹窗显式状态方向收敛

## 0. 本轮推进记录

### ✅ SummaryTable 六轮推进已全部完成（2026-05-24）

| 轮次 | 日期 | 内容 | 状态 |
|------|------|------|------|
| 第一轮 | 2026-05-24 | SummaryTable 首轮：新增组件 + 替换 RecentWorkOrders/MyTasks | ✅ 完成 |
| 第二轮 | 2026-05-24 | SummaryTable 第二轮：BusinessAnalysis/PendingPlateList | ✅ 完成 |
| 第三轮 | 2026-05-24 | SummaryTable 第三轮：Stats.vue 操作员统计表 | ✅ 完成 |
| 第四轮 | 2026-05-24 | SummaryTable 第四轮：SupervisorDashboard 统计表+统计卡 | ✅ 完成 |
| 第五轮 | 2026-05-24 | SummaryTable 第五轮：Cost.vue 成本构成表 | ✅ 完成 |
| 第六轮 | 2026-05-24 | SummaryTable 第六轮：工单详情四个子表 | ✅ 完成 |

### 2026-05-24：SummaryTable 首轮

已完成：

- 新增 `src/components/common/SummaryTable.vue`。
- 在 `src/components/common/index.ts` 导出 `SummaryTable`。
- 新增 `tests/unit/components/SummaryTable.spec.ts`。
- 替换首批 dashboard 只读摘要表：
  - `src/views/dashboard/components/RecentWorkOrders.vue`
  - `src/views/dashboard/components/MyTasks.vue`
- 上述两个组件已无原生 `<table>/<thead>/<tbody>`。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

### 2026-05-24：SummaryTable 第二轮

已完成：

- 继续替换 dashboard 只读摘要表：
  - `src/views/dashboard/components/BusinessAnalysis.vue`
  - `src/views/dashboard/components/PendingPlateList.vue`
- `BusinessAnalysis.vue` 中客户统计、产品统计两个原生 table 已替换为 `SummaryTable`。
- `PendingPlateList.vue` 的待确认版类列表已替换为 `SummaryTable`。
- 上述文件已无原生 `<table>/<thead>/<tbody>`。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

### 2026-05-24：SummaryTable 第三轮

已完成：

- 替换 `src/views/task/Stats.vue` 的操作员统计排行原生 table。
- `Stats.vue` 当前已无原生 `<table>/<thead>/<tbody>`。
- `src/views/**/*.vue` 原生 table 文件数从 34 降至 33。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

### 2026-05-24：SummaryTable 第四轮

已完成：

- 替换 `src/views/task/SupervisorDashboard.vue` 的两张统计原生 table。
- 将 `SupervisorDashboard.vue` 顶部四个手写统计卡替换为 `StatsCards`。
- 移除 `SupervisorDashboard.vue` 中统计卡内联背景色和告警提示内联间距。
- `SupervisorDashboard.vue` 当前已无原生 `<table>/<thead>/<tbody>`，也已无 `style=`。
- `src/views/**/*.vue` 原生 table 文件数从 33 降至 32，内联 `style=` 文件数从 11 降至 10。
- `SummaryTable` 增加 `width` / `minWidth` 列配置支持。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

### 2026-05-24：SummaryTable 第五轮

已完成：

- 替换 `src/views/finance/Cost.vue` 详情弹窗中的成本构成原生 table。
- 移除 `Cost.vue` 中该表格对应的局部 table 滚动样式。
- `Cost.vue` 当前已无原生 `<table>/<thead>/<tbody>`。
- `src/views/**/*.vue` 原生 table 文件数从 32 降至 31。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

### 2026-05-24：SummaryTable 第六轮

已完成：

- 替换工单详情中的四个只读/半只读子表：
  - `src/views/workorder/components/WorkOrderProducts.vue`
  - `src/views/workorder/components/WorkOrderMaterials.vue`
  - `src/views/workorder/components/WorkOrderProcurement.vue`
  - `src/views/workorder/components/WorkOrderProcessTasks.vue`
- 保留原有 `add-material`、`update-material`、`create-purchase`、`view-purchase`、`process-click` 等事件输出。
- 上述四个文件当前已无原生 `<table>/<thead>/<tbody>`。
- `src/views/**/*.vue` 原生 table 文件数从 31 降至 27。

验证：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

结果：全部通过。

## 1. 当前结论

前几轮已经完成以下基础收敛：

- 行操作基础组件：`RowActions`
- 筛选行容器：`FilterRow`
- 弹窗分区标题：`SectionDivider`
- 详情描述网格：`DescriptionGrid` / `DescriptionItem`
- 只读摘要表基础组件：`SummaryTable`

这些已经不再列入待优化内容。当前剩余问题主要集中在：

- 原生 table / 局部 table class 仍较多，尤其是 dashboard、task、workorder、purchase、inventory、finance。
- 复杂页面仍有手写行操作按钮，不能简单批量替换，需要按业务状态拆分。
- 14 个文件仍有 `<style>`，其中多为历史 card/stat/table 样式。
- 10 个文件仍有内联 `style=`，主要是拖拽列宽、颜色、提示间距、表格列宽。
- 部分路由页仍是旧结构，尚未完全进入 `TablePageLayout + DataTable + Pagination`。
- 复杂弹窗中的明细编辑表仍未组件化，`LineItemsTable` 仍是最高收益抽象之一。

## 2. 当前扫描摘要

扫描命令：

```bash
find src/views -name '*.vue' | wc -l
rg -l '<style' src/views -g '*.vue'
rg -l 'style=' src/views -g '*.vue'
rg -l '<table|<thead|<tbody' src/views -g '*.vue'
rg -l 'rounded-lg p-1\.5|btn-ghost btn-sm|btn-danger btn-sm|btn-circle' src/views -g '*.vue'
rg -n 'descriptions-grid|description-item|description-label|description-value|style="--col"' src/views -g '*.vue'
```

当前结果：

| 类型 | 数量 | 状态 |
| --- | ---: | --- |
| Vue 文件总数 | 127 | 全量范围 |
| `<style>` 文件 | 14 | 待继续清理 |
| 内联 `style=` 文件 | 10 | 待继续清理 |
| 原生 table 文件 | 27 | 待分批替换 |
| 重复小按钮/行操作文件 | 29 | 待按业务复杂度替换 |
| `descriptions-grid` / `style="--col"` | 0 | 已完成 |

## 3. P0：仍明显旧结构的路由页

### `src/views/Notification.vue`

现状：

- 顶层仍是 `card`。
- 使用原生 table。
- 筛选/操作区仍是手写 `flex flex-wrap`。
- 行操作仍是 `btn btn-ghost btn-sm`。

建议：

- 迁移为 `TablePageLayout + DataTable + Pagination/EmptyState`。
- 筛选区使用 `FilterRow`。
- 行操作使用 `RowActions`。
- 顶部按钮后续可接入 `PageActions`。

### `src/views/task/AssignmentHistory.vue`

现状：

- 顶层统计卡仍是旧 `card stat-card`。
- 使用原生 table。
- 存在 scoped style。
- 统计图标颜色仍使用内联 `style="background-color: ..."`。

建议：

- 列表迁移到 `TablePageLayout + DataTable`。
- 统计卡改用 `StatsCards` 或统一的统计卡配置。
- 移除 scoped style 和内联颜色。

### `src/views/task/SupervisorDashboard.vue`

现状：

- 顶层旧 `card/card-header/card-body`。
- 存在全局/页面级 `<style lang="scss">`。
- 统计卡和统计表已分别改为 `StatsCards` / `SummaryTable`。
- 当前已无原生 table 和 `style=`。

建议：

- 后续集中处理顶层旧 `card/card-header/card-body` 和页面级 `<style lang="scss">`。
- 如迁入统一页面布局，再判断是否能彻底删除页面 style。

### `src/views/task/AssignmentRule.vue`

现状：

- 仍有原生 table。
- 顶部操作区仍是手写 flex。
- 弹窗状态和表单结构仍偏旧。

建议：

- 迁移为 `TablePageLayout + DataTable`。
- 筛选/操作区接入通用组件。
- 后续将弹窗状态继续显式化。

## 4. P1：组件抽象仍缺口

### 4.1 `SummaryTable` 扩面

用途：只读摘要表、dashboard 表、统计排行表、详情小表。

当前报告中明确列出的第一批 `SummaryTable` 迁移已完成。后续如在其他复杂页面发现纯展示型小表，可继续按同样边界迁移：

- 只处理只读表格布局、表头、空态、横向滚动。
- 不处理行内编辑。
- 不替代完整业务列表页的 `DataTable`。

### 4.2 `LineItemsTable`

用途：弹窗/表单内“添加明细 + 表格编辑 + 删除行”。

优先替换：

- `src/views/purchase/components/PurchaseFormDialog.vue`
- `src/views/inventory/components/DeliveryFormDialog.vue`
- `src/views/sales/SalesForm.vue`
- `src/views/product/components/ProductFormDialog.vue`
- `src/views/artwork/components/ArtworkFormDialog.vue`
- `src/views/components/PlateFormDialog.vue`
- `src/views/workorder/components/SplitTaskDialog.vue`
- `src/views/task/components/SplitTaskDialog.vue`

边界：

- 第一版只抽布局、表头、滚动容器、空态、删除按钮槽位。
- 不抽业务校验和 API 提交。
- 对每个业务弹窗保留现有 form/model 数据结构。

### 4.3 `PageActions`

用途：统一页面顶部刷新、新增、导出、预警、批量操作按钮。

优先替换：

- `Notification.vue`
- `AuditLogList.vue`
- `Payment.vue`
- `Invoice.vue`
- `Statement.vue`
- `WorkOrderList.vue`
- `TaskList.vue`

边界：

- 先提供插槽/配置混合 API。
- 保留复杂按钮的业务处理函数在页面内。

### 4.4 `PanelSection` / `FormSection`

用途：替换复杂表单和详情页中的历史 `card` section。

优先替换：

- `src/views/workorder/WorkOrderForm.vue`
- `src/views/workorder/WorkOrderDetail.vue`
- `src/views/workorder/components/*Approval*.vue`
- `src/views/task/OperatorCenter.vue`
- `src/views/DashboardMobile.vue`

## 5. P1：复杂行操作待收敛

已完成基础 CRUD 页和部分简单多动作页的 `RowActions`。剩余页面包含审批、发货、收货、提交、下载、计算等状态动作，不能只按 edit/delete 批量替换。

优先处理：

- `src/views/inventory/Delivery.vue`
- `src/views/inventory/Quality.vue`
- `src/views/finance/Payment.vue`
- `src/views/finance/Invoice.vue`
- `src/views/finance/Cost.vue`
- `src/views/finance/Statement.vue`
- `src/views/purchase/PurchaseList.vue`
- `src/views/workorder/WorkOrderList.vue`
- `src/views/task/TaskList.vue`
- `src/views/audit/AuditLogList.vue`

建议策略：

- 先为 `RowActions` 增加更明确的 `loading` / `disabled` / `title` 使用约定。
- 每个复杂页面单独写 `getRowActions(row)`，避免模板里继续堆数组。
- 审批/发货/收货类动作保留原业务函数，只统一展示层。

## 6. P1：筛选区残留

已完成 14 个简单列表页的 `FilterRow`。当前仍有旧筛选容器的页面：

- `src/views/workorder/WorkOrderList.vue`
- `src/views/inventory/Quality.vue`
- `src/views/finance/Payment.vue`
- `src/views/finance/Invoice.vue`
- `src/views/finance/Statement.vue`
- `src/views/audit/AuditLogList.vue`
- `src/views/task/TaskList.vue`
- `src/views/task/Board.vue`
- `src/views/task/AssignmentRule.vue`
- `src/views/sales/SalesForm.vue`
- `src/views/sales/SalesDetail.vue`
- 多个 workorder/task 子组件中的操作条

建议：

- 普通筛选区直接替换为 `FilterRow`。
- 操作条/批量操作条不强行用 `FilterRow`，后续可归到 `PageActions` 或 `ActionBar`。

## 7. P1：原生 table 分布

当前仍有 27 个文件包含原生 table。建议按用途拆分，而不是一次性替换。

### 只读摘要表，走 `SummaryTable`

- 当前明确列出的 dashboard、task、finance、workorder 只读摘要表已完成。剩余原生 table 需要重新按页面语义判断是主列表、明细编辑表、打印表还是专项复杂表。

### 表单明细编辑表，走 `LineItemsTable`

- `PurchaseFormDialog.vue`
- `DeliveryFormDialog.vue`
- `SalesForm.vue`
- `ProductFormDialog.vue`
- `ArtworkFormDialog.vue`
- `PlateFormDialog.vue`
- `SplitTaskDialog.vue`

### 路由主表，优先迁 `DataTable`

- `Notification.vue`
- `AssignmentHistory.vue`
- `AssignmentRule.vue`

### 保留或最后处理

- `WorkOrderPrint.vue` 是打印视图，表格和 scoped 打印样式可保留到最后。

## 8. P2：`<style>` 残留文件

当前仍有 `<style>` 的 14 个文件：

- `src/views/workorder/WorkOrderList.vue`
- `src/views/workorder/components/WorkOrderPrint.vue`
- `src/views/DashboardMobile.vue`
- `src/views/finance/Statement.vue`
- `src/views/finance/Cost.vue`
- `src/views/finance/Invoice.vue`
- `src/views/finance/Payment.vue`
- `src/views/audit/AuditLogList.vue`
- `src/views/task/OperatorCenter.vue`
- `src/views/workorder/WorkOrderForm.vue`
- `src/views/task/AssignmentHistory.vue`
- `src/views/task/SupervisorDashboard.vue`
- `src/views/inventory/Quality.vue`
- `src/views/inventory/Delivery.vue`

处理建议：

- `WorkOrderPrint.vue` 暂缓，打印样式特殊。
- `Payment.vue`、`Invoice.vue`：优先清理 `.card/.data-table` 旧样式，结合 `RowActions`。
- `Cost.vue`：成本构成表已迁移，后续重点是行操作和剩余 scoped style。
- `Delivery.vue`、`Quality.vue`：先替换行操作和筛选区，再判断 scoped style 是否仍被引用。
- `AssignmentHistory.vue`：迁移表格和统计卡后再删样式。
- `SupervisorDashboard.vue`：表格和统计卡已迁移，下一步可单独评估是否迁入统一页面布局并删除页面 style。
- `AuditLogList.vue`：已移除描述网格，下一步处理统计卡和导出记录 table。

## 9. P2：内联 `style=` 残留文件

当前仍有内联 `style=` 的 10 个文件：

- `src/views/workorder/components/SyncTaskPrompt.vue`
- `src/views/audit/AuditLogList.vue`
- `src/views/workorder/components/ProcessManagement.vue`
- `src/views/workorder/WorkOrderList.vue`
- `src/views/task/components/TaskColumn.vue`
- `src/views/task/AssignmentHistory.vue`
- `src/views/task/components/TaskDragDropList.vue`
- `src/views/purchase/components/PurchaseFormDialog.vue`
- `src/views/inventory/components/DeliveryFormDialog.vue`
- `src/views/components/PlateFormDialog.vue`

处理建议：

- 固定列宽类内联样式：迁入 `LineItemsTable` 或列配置。
- 颜色内联样式：迁入 token/class 映射。
- 拖拽列宽：可保留到任务看板专项，但应改为 class 或 CSS 变量。
- 提示间距：改用 utility class。

## 10. 推荐推进顺序

### Phase 1：只读表格统一

- [x] 新增 `SummaryTable` 和测试。
- [x] 替换 `RecentWorkOrders.vue`、`MyTasks.vue`。
- [x] 替换 `BusinessAnalysis.vue` 两个表。
- [x] 替换 `PendingPlateList.vue`。
- [x] 替换 `Stats.vue` 统计表。
- [x] 替换 `SupervisorDashboard.vue` 的统计表和统计卡。
- [x] 替换 `Cost.vue` 成本构成表。
- [x] 替换工单详情四个子表：`WorkOrderProducts.vue`、`WorkOrderMaterials.vue`、`WorkOrderProcurement.vue`、`WorkOrderProcessTasks.vue`。

### Phase 2：旧路由页迁移

- [ ] `Notification.vue` 迁 `TablePageLayout + DataTable + FilterRow + RowActions`。
- [ ] `AssignmentHistory.vue` 迁 `TablePageLayout + DataTable`，统计卡改组件化。
- [ ] `AssignmentRule.vue` 迁 `TablePageLayout + DataTable`，状态/弹窗继续显式化。

### Phase 3：复杂行操作收敛

- [ ] `Payment.vue` / `Invoice.vue` / `Cost.vue` 使用 `RowActions`。
- [ ] `Delivery.vue` / `Quality.vue` 使用 `RowActions`。
- [ ] `PurchaseList.vue` / `WorkOrderList.vue` / `TaskList.vue` 单独评估后迁移。

### Phase 4：明细编辑表统一

- [ ] 新增 `LineItemsTable` 和测试。
- [ ] 替换 `PurchaseFormDialog.vue`。
- [ ] 替换 `DeliveryFormDialog.vue`。
- [ ] 替换 `ProductFormDialog.vue`、`ArtworkFormDialog.vue`、`PlateFormDialog.vue`。
- [ ] 替换 `SalesForm.vue`。

### Phase 5：样式残留收尾

- [ ] 清理 finance/inventory/task/workorder 中仍可删除的 scoped style。
- [ ] 清理内联 `style=`。
- [ ] `WorkOrderPrint.vue` 最后单独评估。

## 11. 验收标准

每一轮至少执行：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

新增组件时补测试：

- `SummaryTable.spec.ts`：已新增
- `LineItemsTable.spec.ts`
- 后续如新增 `PageActions` / `ActionBar`，补对应测试

## 12. 当前已完成但不再展开的内容

以下内容已完成，后续报告不再作为待办重复展开：

- `RowActions`：基础列表页和部分多动作页已接入。
- `FilterRow`：14 个简单列表页已接入。
- `SectionDivider`：采购、产品、图稿、版类弹窗中的分区标题已接入。
- `DescriptionGrid` / `DescriptionItem`：`src/views/**/*.vue` 中旧描述网格已全量替换，`descriptions-grid` / `description-*` / `style="--col"` 已清零。
