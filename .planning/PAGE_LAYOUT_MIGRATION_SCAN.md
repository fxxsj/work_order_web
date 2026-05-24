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
- [ ] `src/views/die/components/DieFormDialog.vue`
- [ ] `src/views/embossing-plate/EmbossingPlateList.vue`
- [ ] `src/views/embossing-plate/components/EmbossingPlateFormDialog.vue`
- [ ] `src/views/foiling-plate/FoilingPlateList.vue`
- [ ] `src/views/foiling-plate/components/FoilingPlateFormDialog.vue`
- [ ] `src/views/inventory/Delivery.vue`
- [ ] `src/views/inventory/Quality.vue`
- [ ] `src/views/purchase/PurchaseList.vue`

处理标准：简单 CRUD 页面改为 `BaseDialog + form`；复杂业务弹窗可以先保留业务包装，但要显式 props/emits，后续随模块迁移处理。

## 原生 table 分类

### 允许保留

- `src/components/common/DataTable.vue`：底层实现。
- `src/components/VirtualList.vue`、`src/components/VirtualTable.vue`：虚拟滚动底层实现。
- `src/views/workorder/components/WorkOrderPrint.vue`：打印模板。
- 详情/弹窗内只读明细表：如采购详情、库存预警、成本详情、工单内部明细。
- 仪表盘摘要表：如近期工单、我的任务、业务分析等。

### 后续评估迁移

- [ ] `src/components/dispatch/DispatchPreviewTable.vue`
- [ ] `src/views/inventory/components/DeliveryTable.vue`
- [ ] `src/views/workorder/components/TaskManagement.vue`
- [ ] `src/views/workorder/components/WorkOrderProcessTasks.vue`
- [ ] `src/views/workorder/components/WorkOrderProducts.vue`
- [ ] `src/views/task/components/TaskListView.vue`

处理标准：如果组件承担主列表、批量操作、排序、分页或移动端适配职责，应迁移到 `DataTable`；如果只是复杂详情局部表格，可保留原生 table 并在模块迁移时复核。
