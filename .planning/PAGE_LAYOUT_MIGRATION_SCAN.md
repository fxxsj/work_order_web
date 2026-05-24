# 页面迁移扫描清单

> 扫描日期：2026-05-24
> 范围：`src/views/**/*.vue`、`src/components/**/*.vue`

## 摘要

- `CrudPageLayout` 使用数：0
- `FormDialog` 相关使用文件数：10
- `ErrorHandler.confirm` 使用文件数：0
- 原生 `<table>` 使用文件数：42，其中包含 `DataTable`、虚拟表格、打印模板、详情弹窗和局部摘要表。

## 需要优先迁移的命令式确认

- [x] `src/views/sales/SalesDetail.vue`
- [x] `src/views/task/AssignmentRule.vue`

处理标准：替换为声明式 `ConfirmDialog`，父组件维护待确认动作与选中实体。

## FormDialog / 业务弹窗保留清单

- [x] `src/views/artwork/ArtworkList.vue`
- [x] `src/views/die/DieList.vue`
- [x] `src/views/die/components/DieFormDialog.vue` - 业务包装组件，后续随模块迁移评估
- [x] `src/views/embossing-plate/EmbossingPlateList.vue` - 已收敛 ConfirmDialog loading
- [x] `src/views/embossing-plate/components/EmbossingPlateFormDialog.vue` - 业务包装组件，后续随模块迁移评估
- [x] `src/views/foiling-plate/FoilingPlateList.vue` - 已收敛 ConfirmDialog loading
- [x] `src/views/foiling-plate/components/FoilingPlateFormDialog.vue` - 业务包装组件，后续随模块迁移评估
- [x] `src/views/inventory/Delivery.vue` - ConfirmDialog 已有 loading 状态
- [x] `src/views/inventory/Quality.vue` - ConfirmDialog 已有 loading 状态
- [x] `src/views/purchase/PurchaseList.vue` - 已收敛

处理标准：简单 CRUD 页面改为 `BaseDialog + form`；复杂业务弹窗可以先保留业务包装，但要显式 props/emits，后续随模块迁移处理。

**所有 FormDialog 业务组件已标记为"后续随模块迁移评估"**。

## 原生 table 分类

### 允许保留

- `src/components/common/DataTable.vue`：底层实现。
- `src/components/VirtualList.vue`、`src/components/VirtualTable.vue`：虚拟滚动底层实现。
- `src/views/workorder/components/WorkOrderPrint.vue`：打印模板。
- 详情/弹窗内只读明细表：如采购详情、库存预警、成本详情、工单内部明细。
- 仪表盘摘要表：如近期工单、我的任务、业务分析等。

### 后续评估迁移

- [x] `src/components/dispatch/DispatchPreviewTable.vue` - **保留**，预览性质无需 DataTable
- [x] `src/views/inventory/components/DeliveryTable.vue` - **保留**，详情局部表无主列表职责
- [x] `src/views/workorder/components/TaskManagement.vue` - **保留**，工序详情局部表
- [x] `src/views/workorder/components/WorkOrderProcessTasks.vue` - **保留**，工序列表局部表
- [x] `src/views/workorder/components/WorkOrderProducts.vue` - **保留**，产品列表局部表
- [x] `src/views/task/components/TaskListView.vue` - **保留**，任务列表但有 Pagination 集成，可评估迁移

处理标准：如果组件承担主列表、批量操作、排序、分页或移动端适配职责，应迁移到 `DataTable`；如果只是复杂详情局部表格，可保留原生 table 并在模块迁移时复核。

**结论**：以上 6 个组件均为复杂详情中的局部表格，不承担主列表职责。`TaskListView.vue` 有分页集成，但属于详情页内嵌，可延后评估。其余组件按当前标准可保留。
