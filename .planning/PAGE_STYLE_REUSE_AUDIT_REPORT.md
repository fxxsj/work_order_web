# 页面样式与组件复用剩余优化报告

> 更新日期：2026-05-25  
> 审查范围：`src/views/**/*.vue` 全量 127 个 Vue 文件  
> 报告口径：按当前代码实际状态重写；已完成的迁移不再列入待办  
> 基准方向：继续向 `/home/chenjiaxing/文档/sub2api/frontend` 的组件边界清晰、样式集中、页面结构一致、业务弹窗显式状态方向收敛

## 1. 当前基线

当前已具备并可继续复用的组件能力：

- `RowActions`：已支持 `tone`、`visible`、`disabled`、`loading`、`loadingLabel`、`title`，适合继续收敛行内复杂操作。
- `DataTable`：已作为主列表表格基础，当前代码还增强了移动端卡片视图、虚拟滚动和固定列相关能力。
- `FilterRow`：筛选区容器已存在。
- `SectionDivider`：弹窗分区标题已存在。
- `DescriptionGrid` / `DescriptionItem`：旧描述网格已清零。
- `SummaryTable`：只读摘要表组件已存在，已覆盖 dashboard、task、finance、workorder 详情第一批表格。
- `LineItemsTable`：已新增并导出，当前已覆盖采购、发货、销售、产品、图稿、版类、工单拆分、任务拆分等明细编辑表。

最近一轮已完成的关键收敛：

- `LineItemsTable` 扩面已完成：`ProductFormDialog.vue`、`ArtworkFormDialog.vue`、`PlateFormDialog.vue`、`workorder/components/SplitTaskDialog.vue`、`task/components/SplitTaskDialog.vue` 均已不再出现在原生 table 清单中。
- `PlateFormDialog.vue` 已不再出现在内联 `style=` 清单中。
- Phase 2 只读/记录表已全部完成：`ArtworkAndDieInfo.vue` → `LineItemsTable`、`DashboardMobile.vue` → `SummaryTable`、`AuditLogList.vue` 导出记录表 → `DataTable + RowActions`。
- Phase 3 专项业务表已全部完成：`TaskListView.vue` → `DataTable + RowActions`、`DeliveryTable.vue` → `DataTable + RowActions`、`TaskManagement.vue` / `MaterialManagement.vue` / `DraftTaskManagement.vue` → `SummaryTable`。
- 原生 table 文件数从上一版 9 降至 1（仅剩 `WorkOrderPrint.vue` 打印视图）。
- 内联 `style=` 文件数从上一版 5 降至 5。
- 重复小按钮/行操作命中文件数从上一版 12 降至 10。

当前剩余问题集中在：

- 1 个 `src/views` 文件仍包含原生 `<table>/<thead>/<tbody>`（仅 `WorkOrderPrint.vue` 打印视图）。
- 6 个 `src/views` 文件仍包含页面级 `<style>`。
- 5 个 `src/views` 文件仍包含内联 `style=`。
- 10 个 `src/views` 文件仍命中重复小按钮/行操作样式。

## 2. 当前扫描摘要

扫描命令：

```bash
find src/views -name '*.vue' | wc -l
rg -l '<style' src/views -g '*.vue' | sort | wc -l
rg -l 'style=' src/views -g '*.vue' | sort | wc -l
rg -l '<table|<thead|<tbody' src/views -g '*.vue' | sort | wc -l
rg -l 'rounded-lg p-1\.5|btn-ghost btn-sm|btn-danger btn-sm|btn-circle' src/views -g '*.vue' | sort | wc -l
rg -n 'descriptions-grid|description-item|description-label|description-value|style="--col"' src/views -g '*.vue'
```

当前结果：

| 类型 | 数量 | 处理状态 |
| --- | ---: | --- |
| Vue 文件总数 | 127 | 全量范围 |
| `<style>` 文件 | 6 | 待清理 |
| 内联 `style=` 文件 | 5 | 待清理 |
| 原生 table 文件 | 1 | 仅 WorkOrderPrint.vue（打印视图暂缓） |
| 重复小按钮/行操作文件 | 10 | 待按业务复杂度迁移 |
| `descriptions-grid` / `style="--col"` | 0 | 已完成 |

## 3. P0：下一轮最值得处理的文件

> Phase 2-3 已全部完成，原生 table 仅剩 WorkOrderPrint.vue（打印视图暂缓）。
> 下一轮 P0 应聚焦 Phase 4：行操作和样式收尾。

### `src/views/audit/AuditLogList.vue`

✅ 已完成：导出记录表已迁 `DataTable + RowActions`，已清理 `.table-scroll` / `.audit-table` 样式。

### `src/views/DashboardMobile.vue`

✅ 已完成：表格已迁 `SummaryTable`，页面 `<style>` 保留（移动端卡片布局需要）。

### `src/views/workorder/components/ArtworkAndDieInfo.vue`

✅ 已完成：已迁 `LineItemsTable`（有条件删除语义）。

### `src/views/inventory/components/DeliveryTable.vue`

✅ 已完成：已迁 `DataTable + RowActions`。

## 4. P1：原生 table 剩余清单

当前仍有原生 table 的 1 个文件：

```text
src/views/workorder/components/WorkOrderPrint.vue
```

### 4.1 已完成

- ✅ `src/views/workorder/components/ArtworkAndDieInfo.vue` → `LineItemsTable`
- ✅ `src/views/DashboardMobile.vue` → `SummaryTable`
- ✅ `src/views/audit/AuditLogList.vue` → `DataTable + RowActions`
- ✅ `src/views/task/components/TaskListView.vue` → `DataTable + RowActions`
- ✅ `src/views/inventory/components/DeliveryTable.vue` → `DataTable + RowActions`
- ✅ `src/views/workorder/components/TaskManagement.vue` → `SummaryTable`
- ✅ `src/views/workorder/components/MaterialManagement.vue` → `SummaryTable`
- ✅ `src/views/workorder/components/DraftTaskManagement.vue` → `SummaryTable`

### 4.2 暂缓

- `src/views/workorder/components/WorkOrderPrint.vue`

打印视图对 table 和打印样式有天然需求，最后单独评估。

## 5. P1：重复行操作和小按钮

当前命中重复按钮模式的 10 个文件：

```text
src/views/artwork/components/ArtworkFormDialog.vue
src/views/dashboard/components/MyTasks.vue
src/views/dashboard/components/NotificationAlerts.vue
src/views/dashboard/components/PendingPlateList.vue
src/views/dashboard/components/RecentWorkOrders.vue
src/views/task/TaskList.vue
src/views/task/components/BatchActionBar.vue
src/views/workorder/components/ProductListEditor.vue
src/views/workorder/components/WorkOrderMaterials.vue
src/views/workorder/components/WorkOrderProcessTasks.vue
```

处理策略：

- 表格行内查看/编辑/删除：继续迁 `RowActions`。
- dashboard/workorder 已迁 `SummaryTable` 的组件若只剩少量 `btn-ghost btn-sm`，可顺手改为 `RowActions` 或统一按钮样式。
- `ArtworkFormDialog.vue` 已迁 `LineItemsTable`，当前命中大概率来自弹窗局部按钮，可单独替换按钮样式或改用已有删除槽。
- `BatchActionBar.vue` 属于批量操作条，不建议强行使用 `RowActions`，后续可抽 `ActionBar`。

## 6. P1：`<style>` 残留

当前仍有页面级 `<style>` 的 6 个文件：

```text
src/views/DashboardMobile.vue
src/views/audit/AuditLogList.vue
src/views/task/OperatorCenter.vue
src/views/task/SupervisorDashboard.vue
src/views/workorder/WorkOrderForm.vue
src/views/workorder/components/WorkOrderPrint.vue
```

处理建议：

- `AuditLogList.vue`：同时存在 table、style、重复按钮命中，建议作为样式收尾优先项。
- `DashboardMobile.vue`：同时存在 table 和 style，建议在表格迁移后再统一清理。
- `SupervisorDashboard.vue`：表格和统计卡已迁完，剩余 style 主要围绕顶层布局，可单独评估能否改为 utility class。
- `OperatorCenter.vue`、`WorkOrderForm.vue`：复杂页面，建议在表单/面板结构专项处理时清理。
- `WorkOrderPrint.vue`：打印样式暂缓。

## 7. P1：内联 `style=` 残留

当前仍有内联 `style=` 的 5 个文件：

```text
src/views/task/components/TaskColumn.vue
src/views/task/components/TaskDragDropList.vue
src/views/workorder/WorkOrderList.vue
src/views/workorder/components/ProcessManagement.vue
src/views/workorder/components/SyncTaskPrompt.vue
```

处理建议：

- `TaskColumn.vue`、`TaskDragDropList.vue`：任务看板拖拽宽度可保留语义，但应改为 class 或 CSS 变量。
- `WorkOrderList.vue`：结合页面操作区和复杂行操作收敛处理。
- `ProcessManagement.vue`、`SyncTaskPrompt.vue`：提示间距/局部视觉样式改为 utility class 或 token class。

## 8. P2：筛选区和页面操作区

当前建议继续关注：

- `src/views/audit/AuditLogList.vue`
- `src/views/task/TaskList.vue`
- `src/views/workorder/WorkOrderList.vue`
- `src/views/DashboardMobile.vue`

处理策略：

- 普通查询条件使用 `FilterRow`。
- 页面右上角刷新、新增、导出、批量操作后续抽 `PageActions`。
- 表格上方的局部批量条抽 `ActionBar`，不要和筛选容器混用。

## 9. 推荐推进顺序

### Phase 1：`LineItemsTable` 扩面

- [x] 新增 `LineItemsTable` 并导出。
- [x] 替换 `PurchaseFormDialog.vue`。
- [x] 替换 `DeliveryFormDialog.vue`。
- [x] 替换 `SalesForm.vue`。
- [x] 替换 `ProductFormDialog.vue`。
- [x] 替换 `ArtworkFormDialog.vue`。
- [x] 替换 `PlateFormDialog.vue`。
- [x] 替换 `workorder/components/SplitTaskDialog.vue`。
- [x] 替换 `task/components/SplitTaskDialog.vue`。

### Phase 2：只读/记录表收尾

- [x] `ArtworkAndDieInfo.vue` 迁 `LineItemsTable`（有条件删除语义）。
- [x] `DashboardMobile.vue` 移动端表格迁 `SummaryTable`，页面 style 保留（移动端卡片布局）。
- [x] `AuditLogList.vue` 剩余 table 迁 `DataTable + RowActions`，并清理相关 style（`.table-scroll`、`.audit-table`）。

### Phase 3：专项业务表

- [x] `TaskListView.vue` 迁 `DataTable + RowActions`。
- [x] `DeliveryTable.vue` 迁 `DataTable + RowActions`。
- [x] `TaskManagement.vue` 迁 `SummaryTable`（含 slots 用于计算字段、ProgressBar、StatusTag）。
- [x] `MaterialManagement.vue` 迁 `SummaryTable`（含 action slot）。
- [x] `DraftTaskManagement.vue` 迁 `SummaryTable`（纯只读）。

### Phase 4：行操作和样式收尾

- [ ] 清理剩余 10 个重复按钮命中文件。
- [ ] 清理剩余 5 个 `style=` 文件。
- [ ] 清理可删除的 6 个 `<style>` 文件。
- [ ] `WorkOrderPrint.vue` 最后单独评估。

## 10. 每轮验收标准

每一轮至少执行：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run -- tests/unit/components/RowActions.spec.ts tests/unit/components/FilterRow.spec.ts tests/unit/components/SectionDivider.spec.ts tests/unit/components/DescriptionGrid.spec.ts tests/unit/components/SummaryTable.spec.ts
npm run build
```

如果本轮涉及 `LineItemsTable`，还应补充或执行对应单测：

```bash
npm run test:run -- tests/unit/components/LineItemsTable.spec.ts
```

每轮完成后更新本报告：

- 更新扫描计数。
- 从待办列表移除已完成文件。
- 在对应 Phase 下勾选已完成项。
- 如迁移过程中发现页面语义与本报告分类不一致，以实际代码为准调整分类。
